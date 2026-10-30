/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Layers,
  RotateCw,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { subscribeStudents, subscribeTeachers } from '../../lib/db';
import { CLASSES_DATA } from '../../lib/seedData';
import { Student, TeacherUser } from '../../types';

interface ClassManagementProps {
  onNavigateToStudents: (classId: string, section?: string) => void;
  onNavigateToWheel: (classId: string, section?: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  onNavigateToStudents,
  onNavigateToWheel,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);

  useEffect(() => {
    const unsubS = subscribeStudents(setStudents);
    const unsubT = subscribeTeachers(setTeachers);
    return () => {
      unsubS();
      unsubT();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-500" />
          <span>Class & Section Architecture</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Exactly 10 classes. Classes 1–3 contain separate Sections A and B. Classes 4–10 operate as unified single sections.
        </p>
      </div>

      {/* 10 Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CLASSES_DATA.map((cls) => {
          // Find teachers assigned to this class
          const assignedTeachers = teachers.filter((t) => {
            const list = t.assignedClasses || [];
            if (cls.hasSections) {
              return list.includes(`${cls.classNumber}-A`) || list.includes(`${cls.classNumber}-B`);
            }
            return list.includes(`${cls.classNumber}`);
          });

          return (
            <div
              key={cls.classNumber}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-black text-sm flex items-center justify-center font-mono">
                    {cls.classNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {cls.name}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      {cls.hasSections ? '2 Sections (A & B)' : 'No Sections (Unified)'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToWheel(String(cls.classNumber))}
                  className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                  title="Launch wheel for this class"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Sections Breakdown */}
              {cls.hasSections ? (
                <div className="grid grid-cols-2 gap-3">
                  {cls.sections.map((sec) => {
                    const secKey = `${cls.classNumber}-${sec}`;
                    const secStudents = students.filter((s) => s.classSectionKey === secKey);

                    return (
                      <div
                        key={sec}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Section {sec}
                          </span>
                          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                            {secStudents.length}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mb-2">Students</div>
                        <button
                          onClick={() => onNavigateToStudents(String(cls.classNumber), sec)}
                          className="w-full py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer"
                        >
                          View Roster →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Unified Class Roster
                    </span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                      {students.filter((s) => s.classSectionKey === String(cls.classNumber)).length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">Enrolled students</div>
                  <button
                    onClick={() => onNavigateToStudents(String(cls.classNumber))}
                    className="py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View Roster →
                  </button>
                </div>
              )}

              {/* Assigned Teachers */}
              <div className="pt-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Assigned Teachers ({assignedTeachers.length})
                </span>
                {assignedTeachers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {assignedTeachers.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">No teachers assigned yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
