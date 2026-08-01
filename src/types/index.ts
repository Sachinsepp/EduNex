// User Types
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Teacher extends BaseUser {
  role: 'teacher';
}

export interface Student extends BaseUser {
  role: 'student';
  grade: string;
  teacherId: string;
  fees?: Fee[];
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid';
}

// Session Types
export interface Session {
  user: Teacher | Student;
  role: 'teacher' | 'student';
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  modules: string[];
  teacherId: string;
  liveClass?: {
    url: string;
    dateTime: string;
  };
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  teacherId: string;
  topic: string;
  quizType: 'OVERALL' | 'CUSTOMIZED';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAssignment {
  id: string;
  quizId: string;
  studentId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  completedAt: string | null;
  createdAt: string;
}

// Attendance Types
export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

// Quiz Result Types
export interface QuizResultRecord {
  studentId: string;
  courseId: string;
  score: number;
  total: number;
  takenAt: string;
}

// Create Quiz Input
export interface CreateQuizInput {
  topic: string;
  numberOfQuestions: number;
  quizType: 'OVERALL' | 'CUSTOMIZED';
  studentIds?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
