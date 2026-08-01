import { logger } from '../../core/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '../../core/errors/app-errors';
import { IQuizRepository, IQuizAssignmentRepository, CreateQuizData, CreateAssignmentData } from './quiz.repository';
import { getQuizGenerator } from './quiz-ai-provider';
import { Quiz, QuizAssignment, QuizWithStudents, QuizResult, AnswerResult, StudentBasicInfo } from './quiz.types';
import { CreateQuizDto, QuizStatus } from './quiz.dto';

export class QuizService {
  constructor(
    private quizRepository: IQuizRepository,
    private assignmentRepository: IQuizAssignmentRepository,
    private studentRepository: {
      findByIds(studentIds: string[]): Promise<StudentBasicInfo[]>;
      findByTeacherId(teacherId: string): Promise<StudentBasicInfo[]>;
    }
  ) {}

  async createQuiz(teacherId: string, dto: CreateQuizDto): Promise<QuizWithStudents> {
    logger.info('Creating quiz', { teacherId, topic: dto.topic, quizType: dto.quizType });

    let studentIds: string[] = [];

    if (dto.quizType === 'CUSTOMIZED') {
      if (!dto.studentIds || dto.studentIds.length === 0) {
        throw new ValidationError('Student IDs are required for CUSTOMIZED quiz');
      }

      const validStudents = await this.studentRepository.findByIds(dto.studentIds);
      
      if (validStudents.length !== dto.studentIds.length) {
        const foundIds = validStudents.map(s => s.id);
        const invalidIds = dto.studentIds.filter(id => !foundIds.includes(id));
        throw new ValidationError(`Invalid student IDs: ${invalidIds.join(', ')}`);
      }

      const studentsNotInTeacherClass = validStudents.filter(s => {
        return true;
      });

      if (studentsNotInTeacherClass.length > 0) {
        throw new ValidationError('Selected students do not belong to your class');
      }

      studentIds = dto.studentIds;
    } else if (dto.quizType === 'OVERALL') {
      const allStudents = await this.studentRepository.findByTeacherId(teacherId);
      studentIds = allStudents.map(s => s.id);
    }

    const questions = await getQuizGenerator().generateQuiz({
      topic: dto.topic,
      numberOfQuestions: dto.numberOfQuestions,
      difficulty: dto.difficulty || 'medium',
    });

    const quizData: CreateQuizData = {
      teacherId,
      topic: dto.topic,
      quizType: dto.quizType,
      questions,
      numberOfQuestions: dto.numberOfQuestions,
    };

    const quiz = await this.quizRepository.create(quizData);

    if (studentIds.length > 0) {
      const assignments: CreateAssignmentData[] = studentIds.map(studentId => ({
        quizId: quiz.id,
        studentId,
        teacherId,
      }));

      await this.assignmentRepository.createBulk(assignments);
    }

    const assignedStudents = await this.quizRepository.getAssignedStudents(quiz.id);

    logger.info('Quiz created successfully', { quizId: quiz.id, studentCount: studentIds.length });

    return {
      ...quiz,
      assignedStudents,
    };
  }

  async getTeacherQuizzes(teacherId: string, page: number, limit: number) {
    return this.quizRepository.findByTeacherId(teacherId, page, limit);
  }

  async getTeacherQuizById(teacherId: string, quizId: string): Promise<QuizWithStudents> {
    const quiz = await this.quizRepository.findByTeacherIdAndId(teacherId, quizId);
    
    if (!quiz) {
      throw new NotFoundError('Quiz');
    }

    const assignedStudents = await this.quizRepository.getAssignedStudents(quizId);

    return {
      ...quiz,
      assignedStudents,
    };
  }

  async deleteQuiz(teacherId: string, quizId: string): Promise<void> {
    const quiz = await this.quizRepository.findByTeacherIdAndId(teacherId, quizId);
    
    if (!quiz) {
      throw new NotFoundError('Quiz');
    }

    await this.quizRepository.delete(quizId, teacherId);
    
    logger.info('Quiz deleted', { quizId, teacherId });
  }

  async getStudentQuizzes(studentId: string, page: number, limit: number) {
    return this.assignmentRepository.findByStudentId(studentId, page, limit);
  }

  async getStudentQuizById(studentId: string, quizId: string): Promise<{ quiz: Quiz; assignment: QuizAssignment }> {
    const quiz = await this.quizRepository.findById(quizId);
    
    if (!quiz) {
      throw new NotFoundError('Quiz');
    }

    const assignment = await this.assignmentRepository.findByQuizIdAndStudentId(quizId, studentId);
    
    if (!assignment) {
      throw new ForbiddenError('You are not assigned to this quiz');
    }

    return { quiz, assignment };
  }

  async startQuiz(studentId: string, quizId: string): Promise<QuizAssignment> {
    const { assignment } = await this.getStudentQuizById(studentId, quizId);

    if (assignment.status === 'COMPLETED') {
      throw new ValidationError('Quiz already completed');
    }

    const updated = await this.assignmentRepository.updateStatus(assignment.id, 'IN_PROGRESS');
    
    if (!updated) {
      throw new NotFoundError('Assignment');
    }

    logger.info('Quiz started', { quizId, studentId, assignmentId: assignment.id });
    
    return updated;
  }

  async submitQuiz(
    studentId: string, 
    quizId: string, 
    answers: { questionIndex: number; selectedOption: number }[]
  ): Promise<QuizResult> {
    const { quiz, assignment } = await this.getStudentQuizById(studentId, quizId);

    if (assignment.status === 'COMPLETED') {
      throw new ValidationError('Quiz already completed');
    }

    const answerResults: AnswerResult[] = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = quiz.questions[answer.questionIndex];
      
      if (!question) {
        continue;
      }

      const correctOptionIndex = question.options.indexOf(question.correctAnswer);
      const isCorrect = answer.selectedOption === correctOptionIndex;

      if (isCorrect) {
        correctCount++;
      }

      answerResults.push({
        questionIndex: answer.questionIndex,
        question: question.question,
        selectedOption: answer.selectedOption,
        correctOption: correctOptionIndex,
        isCorrect,
      });
    }

    const score = correctCount;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    await this.assignmentRepository.submitAnswers(
      assignment.id,
      answers,
      score,
      totalQuestions
    );

    logger.info('Quiz submitted', { 
      quizId, 
      studentId, 
      score, 
      totalQuestions,
      percentage 
    });

    return {
      assignmentId: assignment.id,
      score,
      totalQuestions,
      percentage,
      answers: answerResults,
    };
  }

  async getQuizResults(teacherId: string, quizId: string, page: number, limit: number) {
    const quiz = await this.quizRepository.findByTeacherIdAndId(teacherId, quizId);
    
    if (!quiz) {
      throw new NotFoundError('Quiz');
    }

    return this.assignmentRepository.findByQuizId(quizId, page, limit);
  }
}
