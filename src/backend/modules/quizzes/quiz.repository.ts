import { Quiz, QuizAssignment, StudentBasicInfo, QuizQuestion, PaginatedQuizzes, PaginatedAssignments } from './quiz.types';

export interface CreateQuizData {
  teacherId: string;
  topic: string;
  quizType: 'OVERALL' | 'CUSTOMIZED';
  questions: QuizQuestion[];
  numberOfQuestions: number;
}

export interface CreateAssignmentData {
  quizId: string;
  studentId: string;
  teacherId: string;
}

export interface IQuizRepository {
  create(data: CreateQuizData): Promise<Quiz>;
  findById(id: string): Promise<Quiz | null>;
  findByTeacherId(teacherId: string, page: number, limit: number): Promise<PaginatedQuizzes>;
  findByTeacherIdAndId(teacherId: string, quizId: string): Promise<Quiz | null>;
  delete(id: string, teacherId: string): Promise<void>;
  getAssignedStudents(quizId: string): Promise<StudentBasicInfo[]>;
}

export interface IQuizAssignmentRepository {
  createBulk(data: CreateAssignmentData[]): Promise<QuizAssignment[]>;
  findByQuizId(quizId: string, page: number, limit: number): Promise<PaginatedAssignments>;
  findByStudentId(studentId: string, page: number, limit: number): Promise<PaginatedAssignments>;
  findByQuizIdAndStudentId(quizId: string, studentId: string): Promise<QuizAssignment | null>;
  updateStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<QuizAssignment | null>;
  submitAnswers(
    id: string, 
    answers: { questionIndex: number; selectedOption: number }[],
    score: number,
    totalQuestions: number
  ): Promise<QuizAssignment | null>;
  findById(id: string): Promise<QuizAssignment | null>;
  countByQuizId(quizId: string): Promise<number>;
  countByStudentId(studentId: string): Promise<number>;
}
