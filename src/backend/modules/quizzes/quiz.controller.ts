import { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from './quiz.service';
import { CreateQuizDto, SubmitQuizAnswerDto, QuizFilterDto, validateDto } from './quiz.dto';
import { successResponse, paginatedResponse } from '../../core/types/response';
import { errorHandler } from '../../core/errors/error-handler';
import { AuthenticatedRequest } from '../../core/middleware/auth';
import { ValidationError } from '../../core/errors/app-errors';

export class QuizController {
  constructor(private quizService: QuizService) {}

  async createQuiz(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'teacher') {
        throw new ValidationError('Only teachers can create quizzes');
      }

      const dto = validateDto(CreateQuizDto, req.body);
      const quiz = await this.quizService.createQuiz(req.user.userId, {
        ...dto,
        difficulty: dto.difficulty || 'medium',
      });

      res.status(201).json(successResponse(quiz, 'Quiz created successfully'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async getTeacherQuizzes(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'teacher') {
        throw new ValidationError('Only teachers can view quizzes');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.quizService.getTeacherQuizzes(req.user.userId, page, limit);

      res.status(200).json(paginatedResponse(result.quizzes, page, limit, result.pagination.total));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async getTeacherQuizById(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'teacher') {
        throw new ValidationError('Only teachers can view quiz details');
      }

      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      const quiz = await this.quizService.getTeacherQuizById(req.user.userId, id);

      res.status(200).json(successResponse(quiz, 'Success'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async deleteQuiz(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'teacher') {
        throw new ValidationError('Only teachers can delete quizzes');
      }

      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      await this.quizService.deleteQuiz(req.user.userId, id);

      res.status(200).json(successResponse(null, 'Quiz deleted successfully'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async getStudentQuizzes(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'student') {
        throw new ValidationError('Only students can view their quizzes');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.quizService.getStudentQuizzes(req.user.userId, page, limit);

      res.status(200).json(paginatedResponse(result.assignments, page, limit, result.pagination.total));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async getStudentQuizById(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'student') {
        throw new ValidationError('Only students can view their quizzes');
      }

      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      const { quiz, assignment } = await this.quizService.getStudentQuizById(req.user.userId, id);

      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      };

      res.status(200).json(successResponse({ quiz: sanitizedQuiz, assignment }, 'Success'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async startQuiz(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'student') {
        throw new ValidationError('Only students can start quizzes');
      }

      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      const assignment = await this.quizService.startQuiz(req.user.userId, id);

      res.status(200).json(successResponse(assignment, 'Quiz started'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async submitQuiz(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'student') {
        throw new ValidationError('Only students can submit quizzes');
      }

      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      const dto = validateDto(SubmitQuizAnswerDto, req.body);
      const result = await this.quizService.submitQuiz(req.user.userId, id, dto.answers);

      res.status(200).json(successResponse(result, 'Quiz submitted successfully'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async getQuizResults(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }

      if (req.user.role !== 'teacher') {
        throw new ValidationError('Only teachers can view quiz results');
      }

      const { id } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Quiz ID is required');
      }

      const result = await this.quizService.getQuizResults(req.user.userId, id, page, limit);

      res.status(200).json(paginatedResponse(result.assignments, page, limit, result.pagination.total));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }
}
