import { NextApiRequest, NextApiResponse } from 'next';
import { getStudentQuiz, submitQuiz } from '@/lib/services';

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

  const { id } = req.query;
  const quizId = id as string;
  const { method } = req;

  try {
    if (method === 'GET') {
      const result = await getStudentQuiz(user.userId, quizId);

      if (!result) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      const { quiz, assignment } = result;

      return res.status(200).json({
        success: true,
        message: 'Quiz retrieved successfully',
        data: {
          id: quiz.id,
          topic: quiz.topic,
          quizType: quiz.quizType,
          questions: assignment.status === 'PENDING' 
            ? quiz.questions.map(({ correctAnswer, ...q }) => q)
            : quiz.questions,
          status: assignment.status,
          score: assignment.score,
          completedAt: assignment.completedAt,
        },
      });
    }

    if (method === 'POST') {
      const { answers } = req.body;

      if (!Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Answers must be an array' });
      }

      for (const answer of answers) {
        if (!answer.questionId || !answer.answer) {
          return res.status(400).json({ success: false, message: 'Each answer must have questionId and answer' });
        }
      }

      const result = await submitQuiz(user.userId, quizId, answers);

      return res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: result,
      });
    }
  } catch (error: any) {
    console.error('Student quiz detail API error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Internal server error' });
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}
