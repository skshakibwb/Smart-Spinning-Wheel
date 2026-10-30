/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  GraduationCap,
  History,
  Layers,
  RefreshCw,
  RotateCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  initializeDatabase,
  subscribeQuestions,
  subscribeSelectionHistory,
  subscribeStudents,
  subscribeTeachers,
} from '../../lib/db';
import { CLASSES_DATA } from '../../lib/seedData';
import { Question, SelectionHistoryItem, Student, TeacherUser } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<SelectionHistoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      await initializeDatabase();
      setSyncSuccessMsg('Auto-sync complete: All teachers & classes verified!');
      setTimeout(() => setSyncSuccessMsg(''), 4000);
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const unsubT = subscribeTeachers(setTeachers);
    const unsubS = subscribeStudents(setStudents);
    const unsubQ = subscribeQuestions(setQuestions);
    const unsubH = subscribeSelectionHistory(setHistory);
    return () => {
      unsubT();
      unsubS();
      unsubQ();
      unsubH();
    };
  }, []);

  // Compute total classes & sections
  const totalClasses = CLASSES_DATA.length; // 10
  const totalSections = CLASSES_DATA.reduce((acc, c) => acc + c.sections.length, 0); // 6 (Classes 1-3 have A & B)

  // Today's selections
  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedToday = history.filter((h) => h.timestamp.startsWith(todayStr));

  // Correct answer accuracy
  const totalGraded = history.filter((h) => h.answerStatus !== 'none');
  const totalCorrect = history.filter((h) => h.answerStatus === 'correct').length;
  const accuracyPercent =
    totalGraded.length > 0 ? Math.round((totalCorrect / totalGraded.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-900/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Smart Classroom Overview
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time telemetry and management across all 10 grades, active teacher assignments,
            and question selection performance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            title="Auto-sync all teachers, students, and classes with Firestore database"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Auto-Syncing...' : 'Sync Database'}</span>
          </button>

          <button
            onClick={() => onNavigate('wheel')}
            className="px-5 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            <RotateCw className="w-4 h-4" />
            <span>Launch Spinning Wheel</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid (8 key metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {students.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Enrolled across 10 classes</div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Teachers</span>
            <UserCheck className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {teachers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {teachers.filter((t) => t.status === 'active').length} active educators
          </div>
        </div>

        {/* Total Classes */}
        <div
          onClick={() => onNavigate('classes')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Classes</span>
            <Layers className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalClasses}
          </div>
          <div className="text-xs text-slate-500 mt-1">Class 1 to Class 10</div>
        </div>

        {/* Total Sections */}
        <div
          onClick={() => onNavigate('classes')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sections</span>
            <Layers className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalSections}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sec A & B for Classes 1–3</div>
        </div>

        {/* Total Questions */}
        <div
          onClick={() => onNavigate('questions')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Question Bank</span>
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {questions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Categorized oral questions</div>
        </div>

        {/* Total Wheel Spins */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spins</span>
            <RotateCw className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {history.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">All-time classroom spins</div>
        </div>

        {/* Selected Today */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Selected Today</span>
            <Calendar className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {selectedToday.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Students questioned today</div>
        </div>

        {/* Accuracy Rate */}
        <div
          onClick={() => onNavigate('reports')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
            {accuracyPercent}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{totalCorrect} correct answers</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Activities & Teacher Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activities Feed (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Selection Activities
              </h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All ({history.length}) →
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No classroom selections logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {history.slice(0, 6).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.studentName}
                    </div>
                    <div className="text-slate-500">
                      Roll #{item.rollNo} · {item.classSectionKey} · Teacher: {item.teacherName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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

        {/* Teacher Class Assignments Snapshot (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Teacher Assignments
              </h3>
            </div>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            {teachers.slice(0, 5).map((teacher) => (
              <div
                key={teacher.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{teacher.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        teacher.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    @{teacher.username} · {teacher.assignedClasses?.length || 0} classes
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
                  {(teacher.assignedClasses || []).slice(0, 3).map((cls) => (
                    <span
                      key={cls}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px] font-semibold border border-slate-200 dark:border-slate-600"
                    >
                      {cls}
                    </span>
                  ))}
                  {(teacher.assignedClasses?.length || 0) > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{teacher.assignedClasses!.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
