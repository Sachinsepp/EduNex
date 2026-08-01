import { NextApiRequest, NextApiResponse } from 'next';
import { Router } from '../../core/router';
import { QuizController } from './quiz.controller';
import { authenticate, requireRole } from '../../core/middleware/auth';

function withAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      authenticate(req, res, (user) => {
        (req as any).user = user;
        resolve(handler(req, res));
      });
    });
  };
}

function withTeacherRole(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    if (user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Only teachers can access this resource',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }
    await handler(req, res);
  });
}

function withStudentRole(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    if (user.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Only students can access this resource',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }
    await handler(req, res);
  });
}

export function createQuizRoutes(router: Router, controller: QuizController): void {
  router.post('/teacher/quizzes', withTeacherRole(controller.createQuiz.bind(controller)));
  router.get('/teacher/quizzes', withTeacherRole(controller.getTeacherQuizzes.bind(controller)));
  router.get('/teacher/quizzes/:id', withTeacherRole(controller.getTeacherQuizById.bind(controller)));
  router.delete('/teacher/quizzes/:id', withTeacherRole(controller.deleteQuiz.bind(controller)));
  router.get('/teacher/quizzes/:id/results', withTeacherRole(controller.getQuizResults.bind(controller)));

  router.get('/student/quizzes', withStudentRole(controller.getStudentQuizzes.bind(controller)));
  router.get('/student/quizzes/:id', withStudentRole(controller.getStudentQuizById.bind(controller)));
  router.post('/student/quizzes/:id/start', withStudentRole(controller.startQuiz.bind(controller)));
  router.post('/student/quizzes/:id/submit', withStudentRole(controller.submitQuiz.bind(controller)));
}
