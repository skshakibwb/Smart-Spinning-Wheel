/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  RotateCw,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { subscribeSelectionHistory, subscribeStudents } from '../../lib/db';
import { getAvatarColor, getInitials } from '../../lib/imageUtils';
import { SelectionHistoryItem, Student, TeacherUser } from '../../types';

interface TeacherDashboardProps {
  teacher: TeacherUser;
  onNavigate: (tab: 'wheel' | 'questions' | 'history') => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<SelectionHistoryItem[]>([]);

  useEffect(() => {
    const unsubStudents = subscribeStudents(setStudents);
    const unsubHistory = subscribeSelectionHistory(setHistory);
    return () => {
      unsubStudents();
      unsubHistory();
    };
  }, []);

  // Filter students belonging to teacher's assigned classes
  const assignedKeys = teacher.assignedClasses || [];
  const teacherStudents = students.filter((s) => assignedKeys.includes(s.classSectionKey));

  // Filter teacher's own history
  const teacherHistory = history.filter((h) => h.teacherId === teacher.id);

  // Filter today's selections
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySelections = teacherHistory.filter((h) => h.timestamp.startsWith(todayStr));

  // Correct answers today
  const correctToday = todaySelections.filter((h) => h.answerStatus === 'correct').length;

  const [bg1, bg2] = getAvatarColor(teacher.name);

  return (
    <div className="space-y-6">
      {/* Teacher Profile & Welcome Hero */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                {teacher.photoUrl ? (
                  <img
                    src={teacher.photoUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                  >
                    {getInitials(teacher.name)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Teacher Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {teacher.name}!
              </h1>
              <div className="text-xs text-blue-200 mt-1 flex flex-wrap items-center gap-3">
                <span>Username: @{teacher.username}</span>
                <span>·</span>
                <span>Assigned: {assignedKeys.join(', ') || 'No classes assigned yet'}</span>
              </div>
            </div>
          </div>

          {/* Big Launch Spin Button */}
          <button
            onClick={() => onNavigate('wheel')}
            className="px-6 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <RotateCw className="w-5 h-5" />
            <span>START SPINNING</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">My Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {teacherStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {assignedKeys.length} assigned classes
          </div>
        </div>

        {/* Today's Selections */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Spins</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {todaySelections.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Students questioned today</div>
        </div>

        {/* Correct Answers Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Correct Answers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {correctToday}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {todaySelections.length > 0
              ? `${Math.round((correctToday / todaySelections.length) * 100)}% accuracy today`
              : 'No quizzes today'}
          </div>
        </div>

        {/* Total Historical Spins */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">All-Time Spins</span>
            <History className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {teacherHistory.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Recorded classroom turns</div>
        </div>
      </div>

      {/* Main Teacher Quick Access Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('wheel')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all text-left shadow-sm group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <RotateCw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Spinning Wheel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Launch animated student selector for your assigned classes.
          </p>
        </button>

        <button
          onClick={() => onNavigate('questions')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all text-left shadow-sm group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Question Bank
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse oral test questions categorized by subject and class level.
          </p>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/60 dark:hover:border-purple-500/60 transition-all text-left shadow-sm group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            My Selection History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View your classroom selection audit trail and student answers.
          </p>
        </button>
      </div>

      {/* Recent Selections Activity Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View Full History →
          </button>
        </div>

        {teacherHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">No classroom spins recorded yet.</p>
            <p className="text-xs mt-1">Launch the wheel to begin selecting students!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {teacherHistory.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.answerStatus === 'correct'
                        ? 'bg-emerald-500'
                        : item.answerStatus === 'incorrect'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.studentName}
                    </div>
                    <div className="text-slate-500">
                      Roll #{item.rollNo} · {item.classSectionKey}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {item.questionText ? `"${item.questionText}"` : 'Wheel Selection'}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      item.answerStatus === 'correct'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : item.answerStatus === 'incorrect'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {item.answerStatus}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
