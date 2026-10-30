/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher';

export type SubjectCategory =
  | 'English'
  | 'Mathematics'
  | 'Science'
  | 'General Knowledge'
  | 'History'
  | 'Geography'
  | 'Arabic'
  | 'Urdu'
  | 'Other';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type AnswerStatus = 'correct' | 'incorrect' | 'skipped' | 'none';

export type AttendanceStatus = 'present' | 'absent';

export interface AdminUser {
  id: string;
  uid?: string;
  username: string;
  name: string;
  email?: string;
  role: 'admin';
  passwordHash: string;
  createdAt: string;
}

export interface TeacherUser {
  id: string;
  uid?: string;
  username: string;
  name: string;
  passwordHash: string;
  photoUrl?: string;
  assignedClasses: string[]; // Keys like "1-A", "2-B", "5", "7"
  status: 'active' | 'inactive';
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-1001"
  name: string;
  rollNo: string;
  classId: string; // "1" to "10"
  section?: string | null; // "A" or "B" for classes 1-3, null for classes 4-10
  classSectionKey: string; // e.g. "1-A", "2-B", "4"
  photoUrl?: string;
  gender?: 'male' | 'female' | 'other';
  attendanceStatus: AttendanceStatus;
  totalSelections: number;
  createdAt: string;
}

export interface ClassDefinition {
  classNumber: number; // 1 to 10
  name: string; // "Class 1", "Class 2", etc.
  hasSections: boolean;
  sections: string[]; // ["A", "B"] or []
}

export interface Question {
  id: string;
  text: string;
  subject: SubjectCategory;
  classId: string; // "1" to "10" or "All"
  difficulty: QuestionDifficulty;
  answer?: string;
  createdAt: string;
}

export interface SelectionHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  section?: string | null;
  classSectionKey: string;
  teacherId: string;
  teacherName: string;
  questionId?: string | null;
  questionText?: string | null;
  subject?: string | null;
  answerStatus: AnswerStatus;
  timestamp: string;
}

export interface SpinningRoundState {
  id: string;
  classSectionKey: string;
  teacherId: string;
  completedStudentIds: string[];
  roundNumber: number;
  status: 'in_progress' | 'completed';
  updatedAt: string;
}

export interface ClassroomSettings {
  id: string;
  schoolName: string;
  academicYear: string;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  timerSeconds: number;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    photoUrl?: string;
    assignedClasses?: string[];
    mustChangePassword?: boolean;
  };
  token: string;
}
