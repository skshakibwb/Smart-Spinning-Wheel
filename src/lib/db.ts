/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  AdminUser,
  ClassDefinition,
  ClassroomSettings,
  Question,
  SelectionHistoryItem,
  SpinningRoundState,
  Student,
  TeacherUser,
} from '../types';
import { hashPassword } from './crypto';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CLASSES_DATA, INITIAL_QUESTIONS, INITIAL_SETTINGS, INITIAL_STUDENTS, INITIAL_TEACHERS } from './seedData';

// Collection paths
export const COL = {
  ADMINS: 'admins',
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  CLASSES: 'classes',
  QUESTIONS: 'questions',
  SELECTION_HISTORY: 'selectionHistory',
  SPINNING_ROUNDS: 'spinningRounds',
  SETTINGS: 'classroomSettings',
};

/**
 * Checks if the system has been bootstrapped; seeds initial classes, students, questions,
 * and sample teachers if the database is brand new.
 */
export async function initializeDatabase(): Promise<{ hasAdmin: boolean }> {
  try {
    // 1. Auto-sync Master Administrator
    const adminPassHash = await hashPassword('afu0798');
    const defaultAdmin: AdminUser = {
      id: 'admin_master_01',
      username: 'admin',
      name: 'Master Administrator',
      email: 'admin@smartclassroom.edu',
      role: 'admin',
      passwordHash: adminPassHash,
      createdAt: new Date().toISOString(),
    };

    try {
      const adminsSnap = await getDocs(collection(db, COL.ADMINS));
      if (adminsSnap.empty) {
        await setDoc(doc(db, COL.ADMINS, defaultAdmin.id), defaultAdmin);
      } else {
        // Sync admin password to afu0798
        for (const d of adminsSnap.docs) {
          const data = d.data() as AdminUser;
          if (data.username && data.username.toLowerCase() === 'admin') {
            await setDoc(doc(db, COL.ADMINS, d.id), { passwordHash: adminPassHash }, { merge: true });
          }
        }
      }
    } catch (e) {
      console.warn('Admins collection auto-sync notice:', e);
    }

    // 2. Auto-sync Teachers Collection
    try {
      const defaultTeacherPassHash = await hashPassword('Teacher@123');
      for (const tch of INITIAL_TEACHERS) {
        const teacherData: TeacherUser = {
          ...tch,
          passwordHash: defaultTeacherPassHash,
          mustChangePassword: false,
          status: 'active',
        };
        await setDoc(doc(db, COL.TEACHERS, tch.id), teacherData, { merge: true });
      }
    } catch (e) {
      console.warn('Teachers collection auto-sync notice:', e);
    }

    // 3. Auto-sync Classes Collection
    try {
      const classesSnap = await getDocs(collection(db, COL.CLASSES));
      if (classesSnap.empty) {
        for (const cls of CLASSES_DATA) {
          await setDoc(doc(db, COL.CLASSES, `class_${cls.classNumber}`), cls, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Classes collection auto-sync notice:', e);
    }

    // 4. Auto-sync Students Collection
    try {
      const studentsSnap = await getDocs(collection(db, COL.STUDENTS));
      if (studentsSnap.empty) {
        for (const student of INITIAL_STUDENTS) {
          await setDoc(doc(db, COL.STUDENTS, student.id), student, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Students collection auto-sync notice:', e);
    }

    // 5. Auto-sync Questions Collection
    try {
      const questionsSnap = await getDocs(collection(db, COL.QUESTIONS));
      if (questionsSnap.empty) {
        for (const question of INITIAL_QUESTIONS) {
          await setDoc(doc(db, COL.QUESTIONS, question.id), question, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Questions collection auto-sync notice:', e);
    }

    // 6. Auto-sync Settings
    try {
      await setDoc(doc(db, COL.SETTINGS, INITIAL_SETTINGS.id), INITIAL_SETTINGS, { merge: true });
    } catch (e) {
      console.warn('Settings auto-sync notice:', e);
    }

    return { hasAdmin: true };
  } catch (error) {
    console.warn('Database auto-sync error:', error);
    return { hasAdmin: true };
  }
}

// ================= ADMIN FUNCTIONS =================

export async function createAdminAccount(admin: Omit<AdminUser, 'id'>): Promise<AdminUser> {
  const id = `admin_${Date.now()}`;
  const adminData: AdminUser = { ...admin, id };
  try {
    await setDoc(doc(db, COL.ADMINS, id), adminData);
    return adminData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.ADMINS}/${id}`);
  }
}

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  try {
    const snap = await getDocs(collection(db, COL.ADMINS));
    for (const d of snap.docs) {
      const data = d.data() as AdminUser;
      if (data.username && data.username.toLowerCase() === username.toLowerCase()) {
        return { ...data, id: d.id };
      }
    }
  } catch (error) {
    console.warn('Could not query admin collection from server:', error);
  }

  // Resilient fallback for default master admin
  if (username.trim().toLowerCase() === 'admin') {
    const defaultHash = await hashPassword('afu0798');
    return {
      id: 'admin_master_01',
      username: 'admin',
      name: 'Master Administrator',
      email: 'admin@smartclassroom.edu',
      role: 'admin',
      passwordHash: defaultHash,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function updateAdminProfile(id: string, updates: Partial<AdminUser>): Promise<void> {
  try {
    await setDoc(doc(db, COL.ADMINS, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COL.ADMINS}/${id}`);
  }
}

// ================= TEACHER FUNCTIONS =================

export async function getTeacherByUsername(username: string): Promise<TeacherUser | null> {
  const cleanUsername = username.trim().toLowerCase();
  try {
    const snap = await getDocs(collection(db, COL.TEACHERS));
    for (const d of snap.docs) {
      const data = d.data() as TeacherUser;
      if (data.username && data.username.toLowerCase() === cleanUsername) {
        return { ...data, id: d.id };
      }
    }
  } catch (error) {
    console.warn('Could not query teachers collection from server:', error);
  }

  // Resilient fallback for seeded initial teachers
  const foundSeed = INITIAL_TEACHERS.find(
    (t) => t.username.toLowerCase() === cleanUsername
  );
  if (foundSeed) {
    const defaultHash = await hashPassword('Teacher@123');
    return {
      ...foundSeed,
      passwordHash: defaultHash,
      mustChangePassword: false,
      status: 'active',
    };
  }

  return null;
}

export async function createTeacher(teacher: Omit<TeacherUser, 'id'>): Promise<TeacherUser> {
  const id = `tch_${Date.now()}`;
  const teacherData: TeacherUser = { ...teacher, id };
  try {
    await setDoc(doc(db, COL.TEACHERS, id), teacherData);
    return teacherData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.TEACHERS}/${id}`);
  }
}

export async function updateTeacher(id: string, updates: Partial<TeacherUser>): Promise<void> {
  try {
    await setDoc(doc(db, COL.TEACHERS, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COL.TEACHERS}/${id}`);
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL.TEACHERS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COL.TEACHERS}/${id}`);
  }
}

export function subscribeTeachers(callback: (teachers: TeacherUser[]) => void): () => void {
  const q = collection(db, COL.TEACHERS);
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as TeacherUser));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.GET, COL.TEACHERS)
  );
}

// ================= STUDENT FUNCTIONS =================

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const id = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const studentData: Student = { ...student, id };
  try {
    await setDoc(doc(db, COL.STUDENTS, id), studentData);
    return studentData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.STUDENTS}/${id}`);
  }
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  try {
    await setDoc(doc(db, COL.STUDENTS, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COL.STUDENTS}/${id}`);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL.STUDENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COL.STUDENTS}/${id}`);
  }
}

export function subscribeStudents(callback: (students: Student[]) => void): () => void {
  const q = collection(db, COL.STUDENTS);
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Student));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.GET, COL.STUDENTS)
  );
}

// ================= QUESTIONS FUNCTIONS =================

export async function createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
  const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const questionData: Question = { ...question, id };
  try {
    await setDoc(doc(db, COL.QUESTIONS, id), questionData);
    return questionData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.QUESTIONS}/${id}`);
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<void> {
  try {
    await setDoc(doc(db, COL.QUESTIONS, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COL.QUESTIONS}/${id}`);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL.QUESTIONS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COL.QUESTIONS}/${id}`);
  }
}

export function subscribeQuestions(callback: (questions: Question[]) => void): () => void {
  const q = collection(db, COL.QUESTIONS);
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Question));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.GET, COL.QUESTIONS)
  );
}

// ================= SELECTION HISTORY FUNCTIONS =================

export async function recordSelectionHistory(
  item: Omit<SelectionHistoryItem, 'id' | 'timestamp'>
): Promise<SelectionHistoryItem> {
  const id = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const historyData: SelectionHistoryItem = {
    ...item,
    id,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COL.SELECTION_HISTORY, id), historyData);

    // Increment student's totalSelections count
    const studentRef = doc(db, COL.STUDENTS, item.studentId);
    const stuSnap = await getDoc(studentRef);
    if (stuSnap.exists()) {
      const current = (stuSnap.data() as Student).totalSelections || 0;
      await setDoc(studentRef, { totalSelections: current + 1 }, { merge: true });
    }

    return historyData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.SELECTION_HISTORY}/${id}`);
  }
}

export function subscribeSelectionHistory(
  callback: (history: SelectionHistoryItem[]) => void
): () => void {
  const q = query(collection(db, COL.SELECTION_HISTORY), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as SelectionHistoryItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.GET, COL.SELECTION_HISTORY)
  );
}

// ================= SPINNING ROUND STATE =================

export async function getSpinningRoundState(classSectionKey: string, teacherId: string): Promise<SpinningRoundState | null> {
  const roundDocId = `round_${classSectionKey}_${teacherId}`;
  try {
    const snap = await getDoc(doc(db, COL.SPINNING_ROUNDS, roundDocId));
    if (snap.exists()) {
      return snap.data() as SpinningRoundState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COL.SPINNING_ROUNDS}/${roundDocId}`);
  }
}

export async function saveSpinningRoundState(state: SpinningRoundState): Promise<void> {
  const roundDocId = `round_${state.classSectionKey}_${state.teacherId}`;
  try {
    await setDoc(doc(db, COL.SPINNING_ROUNDS, roundDocId), state);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COL.SPINNING_ROUNDS}/${roundDocId}`);
  }
}

// ================= SETTINGS =================

export function subscribeSettings(callback: (settings: ClassroomSettings) => void): () => void {
  const docRef = doc(db, COL.SETTINGS, INITIAL_SETTINGS.id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as ClassroomSettings);
      } else {
        callback(INITIAL_SETTINGS);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, COL.SETTINGS)
  );
}

export async function updateSystemSettings(updates: Partial<ClassroomSettings>): Promise<void> {
  const docRef = doc(db, COL.SETTINGS, INITIAL_SETTINGS.id);
  try {
    await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COL.SETTINGS}/${INITIAL_SETTINGS.id}`);
  }
}
