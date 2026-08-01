import { Student, Teacher, Fee } from './types';

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
}

export interface StudentWithPassword extends Student {
  password: string;
  fees?: Fee[];
}

export interface TeacherWithPassword extends Teacher {
  password: string;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  create(data: Omit<AuthUser, 'id'>): Promise<AuthUser>;
  updatePassword(id: string, password: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IStudentRepository {
  findById(id: string): Promise<StudentWithPassword | null>;
  findByEmail(email: string): Promise<StudentWithPassword | null>;
  findByTeacherId(teacherId: string): Promise<Student[]>;
  create(data: Omit<Student, 'id'> & { password: string }): Promise<StudentWithPassword>;
  update(id: string, data: Partial<Student>): Promise<Student | null>;
  delete(id: string): Promise<void>;
}

export interface ITeacherRepository {
  findById(id: string): Promise<TeacherWithPassword | null>;
  findByEmail(email: string): Promise<TeacherWithPassword | null>;
  findAll(): Promise<Teacher[]>;
  create(data: Omit<Teacher, 'id'> & { password: string }): Promise<TeacherWithPassword>;
  update(id: string, data: Partial<Teacher>): Promise<Teacher | null>;
  delete(id: string): Promise<void>;
}
