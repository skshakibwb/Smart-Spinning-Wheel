/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClassDefinition, ClassroomSettings, Question, Student, TeacherUser } from '../types';

export const CLASSES_DATA: ClassDefinition[] = [
  { classNumber: 1, name: 'Class 1', hasSections: true, sections: ['A', 'B'] },
  { classNumber: 2, name: 'Class 2', hasSections: true, sections: ['A', 'B'] },
  { classNumber: 3, name: 'Class 3', hasSections: true, sections: ['A', 'B'] },
  { classNumber: 4, name: 'Class 4', hasSections: false, sections: [] },
  { classNumber: 5, name: 'Class 5', hasSections: false, sections: [] },
  { classNumber: 6, name: 'Class 6', hasSections: false, sections: [] },
  { classNumber: 7, name: 'Class 7', hasSections: false, sections: [] },
  { classNumber: 8, name: 'Class 8', hasSections: false, sections: [] },
  { classNumber: 9, name: 'Class 9', hasSections: false, sections: [] },
  { classNumber: 10, name: 'Class 10', hasSections: false, sections: [] },
];

export const INITIAL_SETTINGS: ClassroomSettings = {
  id: 'global_settings',
  schoolName: 'Smart Academy of Excellence',
  academicYear: '2026 – 2027',
  soundEnabled: true,
  confettiEnabled: true,
  timerSeconds: 45,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_STUDENTS: Student[] = [
  // Class 1 - Section A
  { id: 'stu_1a_01', studentId: 'STU-1A-01', name: 'Aarav Sharma', rollNo: '01', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_02', studentId: 'STU-1A-02', name: 'Zoya Khan', rollNo: '02', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_03', studentId: 'STU-1A-03', name: 'Bilal Ahmed', rollNo: '03', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_04', studentId: 'STU-1A-04', name: 'Fatima Noor', rollNo: '04', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_05', studentId: 'STU-1A-05', name: 'Rohan Verma', rollNo: '05', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_06', studentId: 'STU-1A-06', name: 'Ananya Sen', rollNo: '06', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_07', studentId: 'STU-1A-07', name: 'Yusuf Tariq', rollNo: '07', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1a_08', studentId: 'STU-1A-08', name: 'Diya Patel', rollNo: '08', classId: '1', section: 'A', classSectionKey: '1-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 1 - Section B
  { id: 'stu_1b_01', studentId: 'STU-1B-01', name: 'Hamza Malik', rollNo: '01', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1b_02', studentId: 'STU-1B-02', name: 'Kavya Nair', rollNo: '02', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1b_03', studentId: 'STU-1B-03', name: 'Rayyan Siddiqui', rollNo: '03', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1b_04', studentId: 'STU-1B-04', name: 'Ishita Gupta', rollNo: '04', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1b_05', studentId: 'STU-1B-05', name: 'Omar Farooq', rollNo: '05', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_1b_06', studentId: 'STU-1B-06', name: 'Pooja Iyer', rollNo: '06', classId: '1', section: 'B', classSectionKey: '1-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 2 - Section A
  { id: 'stu_2a_01', studentId: 'STU-2A-01', name: 'Aditya Roy', rollNo: '01', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2a_02', studentId: 'STU-2A-02', name: 'Mariam Begum', rollNo: '02', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2a_03', studentId: 'STU-2A-03', name: 'Kabir Joshi', rollNo: '03', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2a_04', studentId: 'STU-2A-04', name: 'Sana Sheikh', rollNo: '04', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2a_05', studentId: 'STU-2A-05', name: 'Tariq Hussain', rollNo: '05', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2a_06', studentId: 'STU-2A-06', name: 'Riya Das', rollNo: '06', classId: '2', section: 'A', classSectionKey: '2-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 2 - Section B
  { id: 'stu_2b_01', studentId: 'STU-2B-01', name: 'Farhan Zaidi', rollNo: '01', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2b_02', studentId: 'STU-2B-02', name: 'Meera Nambiar', rollNo: '02', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2b_03', studentId: 'STU-2B-03', name: 'Zayn Qureshi', rollNo: '03', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2b_04', studentId: 'STU-2B-04', name: 'Tanvi Saxena', rollNo: '04', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2b_05', studentId: 'STU-2B-05', name: 'Ibrahim Ali', rollNo: '05', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_2b_06', studentId: 'STU-2B-06', name: 'Tara Menon', rollNo: '06', classId: '2', section: 'B', classSectionKey: '2-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 3 - Section A
  { id: 'stu_3a_01', studentId: 'STU-3A-01', name: 'Devansh Pandey', rollNo: '01', classId: '3', section: 'A', classSectionKey: '3-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3a_02', studentId: 'STU-3A-02', name: 'Ayesha Siddiqua', rollNo: '02', classId: '3', section: 'A', classSectionKey: '3-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3a_03', studentId: 'STU-3A-03', name: 'Pranav Kulkarni', rollNo: '03', classId: '3', section: 'A', classSectionKey: '3-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3a_04', studentId: 'STU-3A-04', name: 'Hafsa Choudhury', rollNo: '04', classId: '3', section: 'A', classSectionKey: '3-A', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3a_05', studentId: 'STU-3A-05', name: 'Samar Singhania', rollNo: '05', classId: '3', section: 'A', classSectionKey: '3-A', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 3 - Section B
  { id: 'stu_3b_01', studentId: 'STU-3B-01', name: 'Mustafa Kamal', rollNo: '01', classId: '3', section: 'B', classSectionKey: '3-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3b_02', studentId: 'STU-3B-02', name: 'Bhavna Reddy', rollNo: '02', classId: '3', section: 'B', classSectionKey: '3-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3b_03', studentId: 'STU-3B-03', name: 'Kunal Kapoor', rollNo: '03', classId: '3', section: 'B', classSectionKey: '3-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3b_04', studentId: 'STU-3B-04', name: 'Nadia Parveen', rollNo: '04', classId: '3', section: 'B', classSectionKey: '3-B', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_3b_05', studentId: 'STU-3B-05', name: 'Ashwin Nair', rollNo: '05', classId: '3', section: 'B', classSectionKey: '3-B', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 4 (No sections)
  { id: 'stu_4_01', studentId: 'STU-04-01', name: 'Arjun Mehra', rollNo: '01', classId: '4', section: null, classSectionKey: '4', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_4_02', studentId: 'STU-04-02', name: 'Khadija Rahman', rollNo: '02', classId: '4', section: null, classSectionKey: '4', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_4_03', studentId: 'STU-04-03', name: 'Siddharth Bose', rollNo: '03', classId: '4', section: null, classSectionKey: '4', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_4_04', studentId: 'STU-04-04', name: 'Zara Sayed', rollNo: '04', classId: '4', section: null, classSectionKey: '4', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_4_05', studentId: 'STU-04-05', name: 'Varun Dhawan', rollNo: '05', classId: '4', section: null, classSectionKey: '4', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_4_06', studentId: 'STU-04-06', name: 'Sneha Mitra', rollNo: '06', classId: '4', section: null, classSectionKey: '4', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 5 (No sections)
  { id: 'stu_5_01', studentId: 'STU-05-01', name: 'Arman Qazi', rollNo: '01', classId: '5', section: null, classSectionKey: '5', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_5_02', studentId: 'STU-05-02', name: 'Priyanka Chopra', rollNo: '02', classId: '5', section: null, classSectionKey: '5', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_5_03', studentId: 'STU-05-03', name: 'Danish Khan', rollNo: '03', classId: '5', section: null, classSectionKey: '5', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_5_04', studentId: 'STU-05-04', name: 'Lavanya Swaminathan', rollNo: '04', classId: '5', section: null, classSectionKey: '5', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_5_05', studentId: 'STU-05-05', name: 'Faizan Merchant', rollNo: '05', classId: '5', section: null, classSectionKey: '5', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 6 (No sections)
  { id: 'stu_6_01', studentId: 'STU-06-01', name: 'Ehsan Haque', rollNo: '01', classId: '6', section: null, classSectionKey: '6', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_6_02', studentId: 'STU-06-02', name: 'Deepika Rao', rollNo: '02', classId: '6', section: null, classSectionKey: '6', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_6_03', studentId: 'STU-06-03', name: 'Shaheer Sheikh', rollNo: '03', classId: '6', section: null, classSectionKey: '6', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_6_04', studentId: 'STU-06-04', name: 'Kareena Sen', rollNo: '04', classId: '6', section: null, classSectionKey: '6', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 7 (No sections)
  { id: 'stu_7_01', studentId: 'STU-07-01', name: 'Rizwan Ahmed', rollNo: '01', classId: '7', section: null, classSectionKey: '7', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_7_02', studentId: 'STU-07-02', name: 'Alia Bhatt', rollNo: '02', classId: '7', section: null, classSectionKey: '7', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_7_03', studentId: 'STU-07-03', name: 'Shoaib Akhtar', rollNo: '03', classId: '7', section: null, classSectionKey: '7', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_7_04', studentId: 'STU-07-04', name: 'Simran Walia', rollNo: '04', classId: '7', section: null, classSectionKey: '7', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 8 (No sections)
  { id: 'stu_8_01', studentId: 'STU-08-01', name: 'Nikhil Kashyap', rollNo: '01', classId: '8', section: null, classSectionKey: '8', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_8_02', studentId: 'STU-08-02', name: 'Bushra Ansari', rollNo: '02', classId: '8', section: null, classSectionKey: '8', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_8_03', studentId: 'STU-08-03', name: 'Tanmay Bhattacharya', rollNo: '03', classId: '8', section: null, classSectionKey: '8', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 9 (No sections)
  { id: 'stu_9_01', studentId: 'STU-09-01', name: 'Zubair Mansoori', rollNo: '01', classId: '9', section: null, classSectionKey: '9', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_9_02', studentId: 'STU-09-02', name: 'Shreya Ghoshal', rollNo: '02', classId: '9', section: null, classSectionKey: '9', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_9_03', studentId: 'STU-09-03', name: 'Haris Rauf', rollNo: '03', classId: '9', section: null, classSectionKey: '9', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },

  // Class 10 (No sections)
  { id: 'stu_10_01', studentId: 'STU-10-01', name: 'Taimoor Baig', rollNo: '01', classId: '10', section: null, classSectionKey: '10', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_10_02', studentId: 'STU-10-02', name: 'Anushka Sharma', rollNo: '02', classId: '10', section: null, classSectionKey: '10', gender: 'female', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
  { id: 'stu_10_03', studentId: 'STU-10-03', name: 'Saad Ur Rehman', rollNo: '03', classId: '10', section: null, classSectionKey: '10', gender: 'male', attendanceStatus: 'present', totalSelections: 0, createdAt: new Date().toISOString() },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Science
  { id: 'q_sci_01', text: 'Which planet is known as the Red Planet in our Solar System?', subject: 'Science', classId: 'All', difficulty: 'Easy', answer: 'Mars', createdAt: new Date().toISOString() },
  { id: 'q_sci_02', text: 'What is the chemical symbol for Gold on the periodic table?', subject: 'Science', classId: 'All', difficulty: 'Medium', answer: 'Au', createdAt: new Date().toISOString() },
  { id: 'q_sci_03', text: 'What gas do plants absorb from the atmosphere for photosynthesis?', subject: 'Science', classId: 'All', difficulty: 'Easy', answer: 'Carbon Dioxide (CO2)', createdAt: new Date().toISOString() },
  { id: 'q_sci_04', text: 'What is the powerhouse organelle of an animal cell?', subject: 'Science', classId: 'All', difficulty: 'Medium', answer: 'Mitochondria', createdAt: new Date().toISOString() },

  // Mathematics
  { id: 'q_math_01', text: 'What is 15 multiplied by 8?', subject: 'Mathematics', classId: 'All', difficulty: 'Easy', answer: '120', createdAt: new Date().toISOString() },
  { id: 'q_math_02', text: 'What is the perimeter of a rectangle with length 12cm and width 8cm?', subject: 'Mathematics', classId: 'All', difficulty: 'Medium', answer: '40 cm', createdAt: new Date().toISOString() },
  { id: 'q_math_03', text: 'What is the square root of 144?', subject: 'Mathematics', classId: 'All', difficulty: 'Easy', answer: '12', createdAt: new Date().toISOString() },
  { id: 'q_math_04', text: 'If 3x + 9 = 24, what is the value of x?', subject: 'Mathematics', classId: 'All', difficulty: 'Hard', answer: 'x = 5', createdAt: new Date().toISOString() },

  // English
  { id: 'q_eng_01', text: 'What is the synonym of the word "Courageous"?', subject: 'English', classId: 'All', difficulty: 'Easy', answer: 'Brave / Valiant', createdAt: new Date().toISOString() },
  { id: 'q_eng_02', text: 'Identify the adverb in the sentence: "The cheetah ran swiftly across the savannah."', subject: 'English', classId: 'All', difficulty: 'Medium', answer: 'swiftly', createdAt: new Date().toISOString() },
  { id: 'q_eng_03', text: 'What do you call a word that is spelled the same backward and forward?', subject: 'English', classId: 'All', difficulty: 'Hard', answer: 'A palindrome (e.g., radar, level)', createdAt: new Date().toISOString() },

  // General Knowledge
  { id: 'q_gk_01', text: 'Which is the largest ocean on Earth?', subject: 'General Knowledge', classId: 'All', difficulty: 'Easy', answer: 'The Pacific Ocean', createdAt: new Date().toISOString() },
  { id: 'q_gk_02', text: 'In which year did humans first set foot on the Moon?', subject: 'General Knowledge', classId: 'All', difficulty: 'Medium', answer: '1969 (Apollo 11)', createdAt: new Date().toISOString() },
  { id: 'q_gk_03', text: 'What is the capital city of Japan?', subject: 'General Knowledge', classId: 'All', difficulty: 'Easy', answer: 'Tokyo', createdAt: new Date().toISOString() },

  // History
  { id: 'q_his_01', text: 'Who was the first President of the United States?', subject: 'History', classId: 'All', difficulty: 'Easy', answer: 'George Washington', createdAt: new Date().toISOString() },
  { id: 'q_his_02', text: 'Which ancient wonder was built as a tomb for Pharaoh Khufu?', subject: 'History', classId: 'All', difficulty: 'Medium', answer: 'The Great Pyramid of Giza', createdAt: new Date().toISOString() },

  // Geography
  { id: 'q_geo_01', text: 'Which is the longest river in the world?', subject: 'Geography', classId: 'All', difficulty: 'Easy', answer: 'The Nile River', createdAt: new Date().toISOString() },
  { id: 'q_geo_02', text: 'Mount Everest is situated in which mountain range?', subject: 'Geography', classId: 'All', difficulty: 'Easy', answer: 'The Himalayas', createdAt: new Date().toISOString() },

  // Arabic
  { id: 'q_ara_01', text: 'What does the common greeting "Marhaban" (مرحباً) mean in English?', subject: 'Arabic', classId: 'All', difficulty: 'Easy', answer: 'Hello / Welcome', createdAt: new Date().toISOString() },
  { id: 'q_ara_02', text: 'What is the Arabic word for "Book"?', subject: 'Arabic', classId: 'All', difficulty: 'Easy', answer: 'Kitab (كتاب)', createdAt: new Date().toISOString() },

  // Urdu
  { id: 'q_urdu_01', text: 'What does the Urdu word "Kitab" (کتاب) mean in English?', subject: 'Urdu', classId: 'All', difficulty: 'Easy', answer: 'Book', createdAt: new Date().toISOString() },
  { id: 'q_urdu_02', text: 'Who is recognized as the National Poet of Pakistan?', subject: 'Urdu', classId: 'All', difficulty: 'Medium', answer: 'Allama Muhammad Iqbal', createdAt: new Date().toISOString() },
];

export const INITIAL_TEACHERS: Omit<TeacherUser, 'passwordHash'>[] = [
  {
    id: 'tch_01',
    username: 'rahman01',
    name: 'Mr. Rahman',
    assignedClasses: ['1-A', '2-B', '5', '7'],
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tch_02',
    username: 'farhana02',
    name: 'Ms. Farhana',
    assignedClasses: ['1-B', '3-A', '4', '6'],
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tch_03',
    username: 'karim03',
    name: 'Mr. Karim',
    assignedClasses: ['2-A', '3-B', '8', '9', '10'],
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  },
];
