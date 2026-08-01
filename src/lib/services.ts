// Mock data services. No database connection needed.

import type { GenerateQuizQuestionsOutput } from "./actions";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Paid' | 'Unpaid';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
  grade: string;
  teacherId: string;
  fees?: Fee[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: string[];
  teacherId: string;
  liveClass?: {
    url: string;
    dateTime: string;
  }
}

export interface AttendanceRecord {
    studentId: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'Late';
}

export interface QuizResultRecord {
    studentId: string;
    courseId: string;
    score: number;
    total: number;
    takenAt: string; // ISO Date string
}


// Default Mock Database
const defaultTeachers: Teacher[] = [
  { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com', password: 'password123' },
  { id: 't2', name: 'John Smith', email: 'john.smith@school.com', password: 'password123' },
];

const defaultStudents: Student[] = [
  { 
    id: 's1', 
    name: 'Alex Doe', 
    grade: '10th Grade', 
    teacherId: 't1', 
    email: 'alex.doe@school.com', 
    password: 'password123',
    fees: [
        { id: 'f1', name: 'Annual Tuition Fee', amount: 1200.00, dueDate: '2024-08-01', status: 'Unpaid' },
        { id: 'f2', name: 'Library Fee', amount: 50.00, dueDate: '2024-08-01', status: 'Unpaid' },
    ]
  },
  { id: 's2', name: 'Sam Wilson', grade: '10th Grade', teacherId: 't1', email: 'sam.wilson@school.com', password: 'password123' },
  { 
    id: 's3', 
    name: 'Maria Hill', 
    grade: '11th Grade', 
    teacherId: 't2', 
    email: 'maria.hill@school.com', 
    password: 'password123',
    fees: [
        { id: 'f3', name: 'Annual Tuition Fee', amount: 1350.00, dueDate: '2024-08-01', status: 'Paid' },
    ]
  },
];

const defaultCourses: Course[] = [
  { 
    id: 'c1', 
    title: 'Introduction to Algebra', 
    description: 'Learn the fundamentals of algebraic expressions and equations.', 
    modules: ['Variables and Expressions', 'Solving Equations', 'Functions and Graphs'], 
    teacherId: 't1',
    liveClass: {
      url: 'https://meet.google.com/lookup/example',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    }
  },
  { 
    id: 'c2', 
    title: 'World History: Ancient Civilizations', 
    description: 'Explore the history of early human societies from Mesopotamia to Rome.', 
    modules: ['The Fertile Crescent', 'Ancient Egypt', 'Greece and Rome'], 
    teacherId: 't2' 
  },
];

const defaultAttendance: AttendanceRecord[] = [
    { studentId: 's1', date: '2024-07-22', status: 'Present' },
    { studentId: 's1', date: '2024-07-21', status: 'Present' },
    { studentId: 's1', date: '2024-07-20', status: 'Absent' },
    { studentId: 's1', date: '2024-07-19', status: 'Present' },
    { studentId: 's1', date: '2024-07-18', status: 'Late' },
];

const defaultQuizResults: QuizResultRecord[] = [];

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
  status: 'PENDING' | 'COMPLETED';
  score: number | null;
  completedAt: string | null;
  createdAt: string;
}

const defaultQuizzes: Quiz[] = [];
const defaultQuizAssignments: QuizAssignment[] = [];


const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        try {
            return JSON.parse(storedValue);
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    }
    // If nothing is in storage, set the default value
    saveToStorage(key, defaultValue);
    return defaultValue;
}

const saveToStorage = <T>(key: string, value: T) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

let mockTeachers: Teacher[] = getFromStorage('mock_teachers', defaultTeachers);
let mockStudents: Student[] = getFromStorage('mock_students', defaultStudents);
let mockCourses: Course[] = getFromStorage('mock_courses', defaultCourses);
let mockAttendance: AttendanceRecord[] = getFromStorage('mock_attendance', defaultAttendance);
let mockQuizResults: QuizResultRecord[] = getFromStorage('mock_quiz_results', defaultQuizResults);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Teacher Services
export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
  await delay(300);
  mockTeachers = getFromStorage('mock_teachers', defaultTeachers);
  const newTeacher: Teacher = { ...teacher, id: generateId('t') };
  mockTeachers.push(newTeacher);
  saveToStorage('mock_teachers', mockTeachers);
  return newTeacher;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  await delay(300);
  return [...getFromStorage('mock_teachers', defaultTeachers)];
};

export const getTeacherByName = async (name: string): Promise<Teacher | null> => {
    await delay(100);
    return getFromStorage('mock_teachers', defaultTeachers).find(t => t.name === name) || null;
}

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
    await delay(100);
    return getFromStorage('mock_teachers', defaultTeachers).find(t => t.id === id) || null;
}

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
  await delay(300);
  mockTeachers = getFromStorage('mock_teachers', defaultTeachers);
  const teacherIndex = mockTeachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return null;
  mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...updates };
  saveToStorage('mock_teachers', mockTeachers);
  return mockTeachers[teacherIndex];
}

export const deleteTeacher = async (id: string): Promise<void> => {
  await delay(300);
  mockTeachers = getFromStorage('mock_teachers', defaultTeachers);
  mockStudents = getFromStorage('mock_students', defaultStudents);
  mockCourses = getFromStorage('mock_courses', defaultCourses);

  mockTeachers = mockTeachers.filter(t => t.id !== id);
  // Unassign students and courses from the deleted teacher
  mockStudents = mockStudents.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  mockCourses = mockCourses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
  
  saveToStorage('mock_teachers', mockTeachers);
  saveToStorage('mock_students', mockStudents);
  saveToStorage('mock_courses', mockCourses);
};

export const getTeacherByEmail = async (email: string): Promise<Teacher | null> => {
  await delay(100);
  return getFromStorage('mock_teachers', defaultTeachers).find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
}

// Student Services
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  await delay(300);
  mockStudents = getFromStorage('mock_students', defaultStudents);
  const newStudent: Student = { ...student, id: generateId('s') };
  mockStudents.push(newStudent);
  saveToStorage('mock_students', mockStudents);
  return newStudent;
};

export const getStudents = async (): Promise<Student[]> => {
  await delay(300);
  return [...getFromStorage('mock_students', defaultStudents)];
};

export const getStudentByName = async (name: string): Promise<Student | null> => {
    await delay(100);
    return getFromStorage('mock_students', defaultStudents).find(s => s.name === name) || null;
}

export const getStudentByEmail = async (email: string): Promise<Student | null> => {
  await delay(100);
  return getFromStorage('mock_students', defaultStudents).find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export const getStudentsForTeacher = async (teacherId: string): Promise<Student[]> => {
    await delay(200);
    return getFromStorage('mock_students', defaultStudents).filter(s => s.teacherId === teacherId);
}

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student | null> => {
  await delay(300);
  mockStudents = getFromStorage('mock_students', defaultStudents);
  const studentIndex = mockStudents.findIndex(s => s.id === id);
  if (studentIndex === -1) return null;
  mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updates };
  saveToStorage('mock_students', mockStudents);
  return mockStudents[studentIndex];
}

export const deleteStudent = async (id: string): Promise<void> => {
  await delay(300);
  mockStudents = getFromStorage('mock_students', defaultStudents);
  mockStudents = mockStudents.filter(s => s.id !== id);
  saveToStorage('mock_students', mockStudents);
};

// Course Services
export const addCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
  await delay(300);
  mockCourses = getFromStorage('mock_courses', defaultCourses);
  const newCourse: Course = { ...course, id: generateId('c') };
  mockCourses.push(newCourse);
  saveToStorage('mock_courses', mockCourses);
  return newCourse;
};

export const getCourses = async (): Promise<Course[]> => {
  await delay(300);
  return [...getFromStorage('mock_courses', defaultCourses)];
};

export const getCoursesForTeacher = async (teacherId: string): Promise<Course[]> => {
    await delay(200);
    return getFromStorage('mock_courses', defaultCourses).filter(c => c.teacherId === teacherId);
}

export const getCoursesForStudent = async (studentId: string): Promise<Course[]> => {
    await delay(200);
    const students = getFromStorage('mock_students', defaultStudents);
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    return getFromStorage('mock_courses', defaultCourses).filter(c => c.teacherId === student.teacherId);
}

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course | null> => {
  await delay(300);
  mockCourses = getFromStorage('mock_courses', defaultCourses);
  const courseIndex = mockCourses.findIndex(c => c.id === id);
  if (courseIndex === -1) return null;
  mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updates };
  saveToStorage('mock_courses', mockCourses);
  return mockCourses[courseIndex];
}

export const deleteCourse = async (id: string): Promise<void> => {
  await delay(300);
  mockCourses = getFromStorage('mock_courses', defaultCourses);
  mockCourses = mockCourses.filter(c => c.id !== id);
  saveToStorage('mock_courses', mockCourses);
};

// Quiz Services
export const saveQuizForCourse = async (courseId: string, quizData: GenerateQuizQuestionsOutput): Promise<void> => {
    await delay(100);
    const quizzes = getFromStorage<Record<string, GenerateQuizQuestionsOutput>>('mock_quizzes', {});
    quizzes[courseId] = quizData;
    saveToStorage('mock_quizzes', quizzes);
}

export const getQuizForCourse = async (courseId: string): Promise<GenerateQuizQuestionsOutput | null> => {
    await delay(100);
    const quizzes = getFromStorage<Record<string, GenerateQuizQuestionsOutput>>('mock_quizzes', {});
    return quizzes[courseId] || null;
}

export const saveQuizResult = async (result: QuizResultRecord): Promise<void> => {
    await delay(100);
    mockQuizResults = getFromStorage('mock_quiz_results', defaultQuizResults);
    // Remove previous result for the same student and course to only keep the latest
    const otherResults = mockQuizResults.filter(r => !(r.studentId === result.studentId && r.courseId === result.courseId));
    mockQuizResults = [...otherResults, result];
    saveToStorage('mock_quiz_results', mockQuizResults);
}

export const getQuizResultsForCourse = async (courseId: string): Promise<QuizResultRecord[]> => {
    await delay(200);
    mockQuizResults = getFromStorage('mock_quiz_results', defaultQuizResults);
    return mockQuizResults.filter(r => r.courseId === courseId);
}

export const getPendingReviewsForTeacher = async (teacherId: string): Promise<QuizResultRecord[]> => {
    await delay(200);
    const courses = getFromStorage('mock_courses', defaultCourses).filter(c => c.teacherId === teacherId);
    const courseIds = courses.map(c => c.id);
    mockQuizResults = getFromStorage('mock_quiz_results', defaultQuizResults);
    return mockQuizResults.filter(r => courseIds.includes(r.courseId));
}


// Attendance Services
export const saveAttendance = async (records: AttendanceRecord[]): Promise<void> => {
    await delay(200);
    mockAttendance = getFromStorage('mock_attendance', defaultAttendance);
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    
    // Remove any existing records for today for the given students to avoid duplicates
    const studentIds = records.map(r => r.studentId);
    const otherRecords = mockAttendance.filter(r => !(r.date === today && studentIds.includes(r.studentId)));
    
    // Add the new records
    mockAttendance = [...otherRecords, ...records];
    saveToStorage('mock_attendance', mockAttendance);
}

export const getAttendanceForStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
    await delay(200);
    mockAttendance = getFromStorage('mock_attendance', defaultAttendance);
    return mockAttendance
        .filter(r => r.studentId === studentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Fee Services
export const getFeesForStudent = async (studentId: string): Promise<Fee[]> => {
    await delay(200);
    mockStudents = getFromStorage('mock_students', defaultStudents);
    const student = mockStudents.find(s => s.id === studentId);
    return student?.fees || [];
};

export const payFee = async (studentId: string, feeId: string): Promise<void> => {
    await delay(200);
    mockStudents = getFromStorage('mock_students', defaultStudents);
    const studentIndex = mockStudents.findIndex(s => s.id === studentId);
    if (studentIndex > -1) {
        const feeIndex = mockStudents[studentIndex].fees?.findIndex(f => f.id === feeId);
        if (feeIndex !== undefined && feeIndex > -1) {
            mockStudents[studentIndex].fees![feeIndex].status = 'Paid';
            saveToStorage('mock_students', mockStudents);
        } else {
            throw new Error("Fee not found");
        }
    } else {
        throw new Error("Student not found");
    }
};


export const isFirebaseConfigured = true;

// New Quiz System Services

let mockQuizzes: Quiz[] = getFromStorage('mock_quizzes_v2', defaultQuizzes);
let mockQuizAssignments: QuizAssignment[] = getFromStorage('mock_quiz_assignments', defaultQuizAssignments);

export interface CreateQuizInput {
  topic: string;
  numberOfQuestions: number;
  quizType: 'OVERALL' | 'CUSTOMIZED';
  studentIds?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const createQuiz = async (
  teacherId: string,
  input: CreateQuizInput,
  questions: QuizQuestion[]
): Promise<{ quiz: Quiz; assignedCount: number }> => {
  await delay(300);
  mockQuizzes = getFromStorage('mock_quizzes_v2', defaultQuizzes);
  
  const quiz: Quiz = {
    id: generateId('q'),
    teacherId,
    topic: input.topic,
    quizType: input.quizType,
    questions,
    createdAt: new Date().toISOString(),
  };
  
  mockQuizzes.push(quiz);
  saveToStorage('mock_quizzes_v2', mockQuizzes);
  
  let assignedStudents: string[];
  if (input.quizType === 'OVERALL') {
    assignedStudents = getFromStorage('mock_students', defaultStudents)
      .filter(s => s.teacherId === teacherId)
      .map(s => s.id);
  } else {
    assignedStudents = input.studentIds || [];
  }
  
  mockQuizAssignments = getFromStorage('mock_quiz_assignments', defaultQuizAssignments);
  const assignments: QuizAssignment[] = assignedStudents.map(studentId => ({
    id: generateId('qa'),
    quizId: quiz.id,
    studentId,
    status: 'PENDING',
    score: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }));
  
  mockQuizAssignments = [...mockQuizAssignments, ...assignments];
  saveToStorage('mock_quiz_assignments', mockQuizAssignments);
  
  return { quiz, assignedCount: assignments.length };
};

export const getQuizzesForTeacher = async (teacherId: string): Promise<Quiz[]> => {
  await delay(200);
  return getFromStorage('mock_quizzes_v2', defaultQuizzes).filter(q => q.teacherId === teacherId);
};

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  await delay(100);
  return getFromStorage('mock_quizzes_v2', defaultQuizzes).find(q => q.id === quizId) || null;
};

export const getQuizAssignmentsForTeacher = async (teacherId: string): Promise<{ quiz: Quiz; assignments: QuizAssignment[] }[]> => {
  await delay(200);
  const quizzes = getFromStorage('mock_quizzes_v2', defaultQuizzes).filter(q => q.teacherId === teacherId);
  const assignments = getFromStorage('mock_quiz_assignments', defaultQuizAssignments);
  
  return quizzes.map(quiz => ({
    quiz,
    assignments: assignments.filter(a => a.quizId === quiz.id),
  }));
};

export const getQuizzesForStudent = async (studentId: string): Promise<{ quiz: Quiz; assignment: QuizAssignment }[]> => {
  await delay(200);
  const assignments = getFromStorage('mock_quiz_assignments', defaultQuizAssignments)
    .filter(a => a.studentId === studentId);
  const quizzes = getFromStorage('mock_quizzes_v2', defaultQuizzes);
  
  return assignments.map(assignment => ({
    quiz: quizzes.find(q => q.id === assignment.quizId)!,
    assignment,
  })).filter(item => item.quiz);
};

export const getStudentQuiz = async (studentId: string, quizId: string): Promise<{ quiz: Quiz; assignment: QuizAssignment } | null> => {
  await delay(100);
  const assignment = getFromStorage('mock_quiz_assignments', defaultQuizAssignments)
    .find(a => a.studentId === studentId && a.quizId === quizId);
  
  if (!assignment) return null;
  
  const quiz = getFromStorage('mock_quizzes_v2', defaultQuizzes).find(q => q.id === quizId);
  if (!quiz) return null;
  
  return { quiz, assignment };
};

export const submitQuiz = async (
  studentId: string,
  quizId: string,
  answers: { questionId: string; answer: string }[]
): Promise<{ score: number; total: number; percentage: number }> => {
  await delay(300);
  
  const quiz = getFromStorage('mock_quizzes_v2', defaultQuizzes).find(q => q.id === quizId);
  if (!quiz) throw new Error('Quiz not found');
  
  const assignments = getFromStorage('mock_quiz_assignments', defaultQuizAssignments);
  const assignmentIndex = assignments.findIndex(a => a.studentId === studentId && a.quizId === quizId);
  
  if (assignmentIndex === -1) throw new Error('Assignment not found');
  if (assignments[assignmentIndex].status === 'COMPLETED') throw new Error('Quiz already submitted');
  
  let correctCount = 0;
  const questionMap = new Map(quiz.questions.map(q => [q.id, q]));
  
  for (const { questionId, answer } of answers) {
    const question = questionMap.get(questionId);
    if (question && question.correctAnswer === answer) {
      correctCount++;
    }
  }
  
  const total = quiz.questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  
  assignments[assignmentIndex] = {
    ...assignments[assignmentIndex],
    status: 'COMPLETED',
    score: percentage,
    completedAt: new Date().toISOString(),
  };
  
  saveToStorage('mock_quiz_assignments', assignments);
  
  return { score: correctCount, total, percentage };
};

export const getQuizStatistics = async (teacherId: string): Promise<{
  totalQuizzes: number;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number | null;
}> => {
  await delay(200);
  const quizzes = getFromStorage('mock_quizzes_v2', defaultQuizzes).filter(q => q.teacherId === teacherId);
  const quizIds = quizzes.map(q => q.id);
  const assignments = getFromStorage('mock_quiz_assignments', defaultQuizAssignments)
    .filter(a => quizIds.includes(a.quizId));
  
  const completed = assignments.filter(a => a.status === 'COMPLETED');
  const scores = completed.map(a => a.score).filter((s): s is number => s !== null);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  
  return {
    totalQuizzes: quizzes.length,
    totalAssignments: assignments.length,
    completedAssignments: completed.length,
    averageScore,
  };
};

export interface TeacherTimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string; // e.g., "09:00 AM - 10:00 AM"
  subject: string;
  teacherId: string;
  teacherName?: string;
  classId?: string;
}

// Student timetable uses the same entry structure from a single source of truth now
export type StudentTimetableEntry = TeacherTimetableEntry;

const defaultTeacherTimetable: TeacherTimetableEntry[] = [
  { id: 'tt1', day: 'Monday', timeSlot: '09:00 AM - 10:00 AM', subject: 'Mathematics', teacherId: 't1', teacherName: 'Jane Doe', classId: '10th Grade' },
  { id: 'tt2', day: 'Monday', timeSlot: '10:00 AM - 11:00 AM', subject: 'Physics', teacherId: 't2', teacherName: 'John Smith', classId: '10th Grade' },
];

export const getTeacherTimetable = async (teacherId?: string): Promise<TeacherTimetableEntry[]> => {
  await delay(200);
  const allEntries = getFromStorage<TeacherTimetableEntry[]>('mock_teacher_timetable', defaultTeacherTimetable);
  if (teacherId) {
     return allEntries.filter(entry => entry.teacherId === teacherId);
  }
  return allEntries;
};

export const saveTeacherTimetable = async (entries: TeacherTimetableEntry[]): Promise<void> => {
  await delay(200);
  saveToStorage('mock_teacher_timetable', entries);
};

export const assignTimetable = async (classId: string, subject: string, teacherId: string, teacherName: string, timeSlot: string, day: TeacherTimetableEntry['day']): Promise<void> => {
  await delay(200);
  const current = getFromStorage<TeacherTimetableEntry[]>('mock_teacher_timetable', defaultTeacherTimetable);
  const newEntry: TeacherTimetableEntry = {
    id: `tt${Date.now()}`,
    day,
    timeSlot,
    subject,
    teacherId,
    teacherName,
    classId
  };
  saveToStorage('mock_teacher_timetable', [...current, newEntry]);
};

export const getStudentTimetable = async (classId: string): Promise<TeacherTimetableEntry[]> => {
  await delay(200);
  const allEntries = getFromStorage<TeacherTimetableEntry[]>('mock_teacher_timetable', defaultTeacherTimetable);
  return allEntries.filter(entry => entry.classId === classId);
};

// Kept for backward compatibility if class assignment tab still used independently
export const saveStudentTimetable = async (entries: StudentTimetableEntry[]): Promise<void> => {
  await delay(200);
  saveToStorage('mock_teacher_timetable', entries);
};


