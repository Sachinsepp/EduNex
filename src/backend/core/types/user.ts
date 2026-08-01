export type UserRole = 'student' | 'teacher' | 'admin';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
}

export interface Student extends User {
  role: 'student';
  grade: string;
  teacherId: string;
}

export interface Teacher extends User {
  role: 'teacher';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}
