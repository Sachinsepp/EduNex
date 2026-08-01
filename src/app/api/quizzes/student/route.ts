import { NextApiRequest, NextApiResponse } from 'next';
import { getQuizzesForStudent, getStudentQuiz, submitQuiz } from '@/lib/services';

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

  if (user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can access this resource' });
  }

  const { method } = req;

  try {
    if (method === 'GET') {
      const quizzes = await getQuizzesForStudent(user.userId);

      return res.status(200).json({
        success: true,
        message: 'Quizzes retrieved successfully',
        data: {
          quizzes: quizzes.map(({ quiz, assignment }) => ({
            id: quiz.id,
            topic: quiz.topic,
            quizType: quiz.quizType,
            status: assignment.status,
            score: assignment.score,
            createdAt: quiz.createdAt,
          })),
        },
      });
    }
  } catch (error) {
    console.error('Student quizzes API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}
