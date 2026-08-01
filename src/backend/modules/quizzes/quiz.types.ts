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
  numberOfQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAssignment {
  id: string;
  quizId: string;
  studentId: string;
  teacherId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  totalQuestions: number | null;
  answers: QuizAnswer[] | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedOption: number;
}

export interface QuizWithAssignment extends Quiz {
  assignment?: QuizAssignment;
}

export interface QuizWithStudents extends Quiz {
  assignedStudents: StudentBasicInfo[];
}

export interface StudentBasicInfo {
  id: string;
  name: string;
  email: string;
  grade?: string;
}

export interface QuizResult {
  assignmentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: AnswerResult[];
}

export interface AnswerResult {
  questionIndex: number;
  question: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
}

export interface PaginatedQuizzes {
  quizzes: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedAssignments {
  assignments: QuizAssignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
