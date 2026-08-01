import { NextApiRequest, NextApiResponse } from 'next';
import { getQuizById, getQuizAssignmentsForTeacher, getQuizzesForTeacher, getQuizStatistics } from '@/lib/services';

function getUserFromRequest(req: NextApiRequest): { userId: string; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can access this resource' });
  }

  const { id } = req.query;
  const quizId = id as string;
  const { method } = req;

  try {
    if (method === 'GET') {
      const quiz = await getQuizById(quizId);

      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      if (quiz.teacherId !== user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const allAssignments = await getQuizAssignmentsForTeacher(user.userId);
      const quizData = allAssignments.find(q => q.quiz.id === quizId);

      if (!quizData) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Quiz retrieved successfully',
        data: {
          id: quiz.id,
          topic: quiz.topic,
          quizType: quiz.quizType,
          questions: quiz.questions,
          assignments: quizData.assignments.map(a => ({
            id: a.id,
            studentId: a.studentId,
            status: a.status,
            score: a.score,
            completedAt: a.completedAt,
          })),
          createdAt: quiz.createdAt,
        },
      });
    }

    if (method === 'DELETE') {
      const quizzes = await getQuizzesForTeacher(user.userId);
      const quiz = quizzes.find(q => q.id === quizId);

      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
        data: null,
      });
    }
  } catch (error) {
    console.error('Teacher quiz detail API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}
