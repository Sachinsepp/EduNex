import { NextApiRequest, NextApiResponse } from 'next';
import { createQuiz, getQuizzesForTeacher, getQuizAssignmentsForTeacher, getQuizStatistics, CreateQuizInput } from '@/lib/services';
import { generateQuizQuestions, GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';

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

  const { method } = req;

  try {
    if (method === 'POST') {
      const input: CreateQuizInput = req.body;
      
      if (!input.topic || !input.numberOfQuestions || !input.quizType) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      if (input.quizType === 'CUSTOMIZED' && (!input.studentIds || input.studentIds.length === 0)) {
        return res.status(400).json({ success: false, message: 'Student IDs required for CUSTOMIZED quiz' });
      }

      const aiResult: GenerateQuizQuestionsOutput = await generateQuizQuestions({
        topic: input.topic,
        numQuestions: input.numberOfQuestions,
      });

      const questions = aiResult.questions.map((q, index) => ({
        id: `q${index + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      const result = await createQuiz(user.userId, input, questions);

      return res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: {
          quiz: {
            id: result.quiz.id,
            topic: result.quiz.topic,
            quizType: result.quiz.quizType,
            questionsCount: result.quiz.questions.length,
            createdAt: result.quiz.createdAt,
          },
          assignedCount: result.assignedCount,
        },
      });
    }

    if (method === 'GET') {
      const quizzes = await getQuizAssignmentsForTeacher(user.userId);

      return res.status(200).json({
        success: true,
        message: 'Quizzes retrieved successfully',
        data: {
          quizzes: quizzes.map(({ quiz, assignments }) => ({
            id: quiz.id,
            topic: quiz.topic,
            quizType: quiz.quizType,
            questionsCount: quiz.questions.length,
            assignedStudentsCount: assignments.length,
            completedCount: assignments.filter(a => a.status === 'COMPLETED').length,
            createdAt: quiz.createdAt,
          })),
        },
      });
    }
  } catch (error) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}
