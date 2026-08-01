import { z } from 'zod';

export const QuizType = z.enum(['OVERALL', 'CUSTOMIZED']);
export type QuizType = z.infer<typeof QuizType>;

export const QuizStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
export type QuizStatus = z.infer<typeof QuizStatus>;

export const CreateQuizDto = z.object({
  topic: z.string()
    .min(1, 'Topic is required')
    .max(255, 'Topic must be less than 255 characters'),
  numberOfQuestions: z.number()
    .int('Number of questions must be an integer')
    .min(1, 'Minimum 1 question required')
    .max(20, 'Maximum 20 questions allowed'),
  quizType: QuizType,
  studentIds: z.array(z.string().uuid('Invalid student ID')).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
});

export type CreateQuizDto = z.infer<typeof CreateQuizDto>;

export const UpdateQuizDto = z.object({
  topic: z.string()
    .min(1, 'Topic is required')
    .max(255, 'Topic must be less than 255 characters'),
  numberOfQuestions: z.number()
    .int('Number of questions must be an integer')
    .min(1, 'Minimum 1 question required')
    .max(20, 'Maximum 20 questions allowed')
    .optional(),
});

export type UpdateQuizDto = z.infer<typeof UpdateQuizDto>;

export const SubmitQuizAnswerDto = z.object({
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    selectedOption: z.number().int().min(0).max(3),
  })),
});

export type SubmitQuizAnswerDto = z.infer<typeof SubmitQuizAnswerDto>;

export const QuizFilterDto = z.object({
  status: QuizStatus.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type QuizFilterDto = z.infer<typeof QuizFilterDto>;

export function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw new Error(JSON.stringify(errors));
  }
  
  return result.data;
}
