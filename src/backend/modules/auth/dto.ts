import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginDto = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'teacher']),
  grade: z.string().optional(),
  teacherId: z.string().optional(),
});

export type RegisterDto = z.infer<typeof RegisterDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>;

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
