export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid';
}

export interface Student extends BaseEntity {
  email: string;
  name: string;
  role: 'student';
  grade: string;
  teacherId: string;
  fees?: Fee[];
}

export interface Teacher extends BaseEntity {
  email: string;
  name: string;
  role: 'teacher';
}

export interface Course extends BaseEntity {
  title: string;
  description: string;
  modules: string[];
  teacherId: string;
  liveClass?: {
    url: string;
    dateTime: string;
  };
}

export interface AttendanceRecord extends BaseEntity {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface QuizResultRecord extends BaseEntity {
  studentId: string;
  courseId: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}
