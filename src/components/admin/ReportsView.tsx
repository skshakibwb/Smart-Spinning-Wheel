/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  subscribeQuestions,
  subscribeSelectionHistory,
  subscribeStudents,
  subscribeTeachers,
} from '../../lib/db';
import { CLASSES_DATA } from '../../lib/seedData';
import { Question, SelectionHistoryItem, Student, TeacherUser } from '../../types';

export const ReportsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<SelectionHistoryItem[]>([]);
  const [activeReportTab, setActiveReportTab] = useState<
    'equity' | 'teachers' | 'questions' | 'daily'
  >('equity');

  useEffect(() => {
    const unsubS = subscribeStudents(setStudents);
    const unsubT = subscribeTeachers(setTeachers);
    const unsubQ = subscribeQuestions(setQuestions);
    const unsubH = subscribeSelectionHistory(setHistory);
    return () => {
      unsubS();
      unsubT();
      unsubQ();
      unsubH();
    };
  }, []);

  // Compute stats
  const totalCorrect = history.filter((h) => h.answerStatus === 'correct').length;
  const totalIncorrect = history.filter((h) => h.answerStatus === 'incorrect').length;
  const totalSkipped = history.filter((h) => h.answerStatus === 'skipped').length;
  const totalTurns = history.length;

  // Student selection frequency (sorted by most / least selected)
  const studentsWithSpins = [...students].sort(
    (a, b) => (b.totalSelections || 0) - (a.totalSelections || 0)
  );

  // Teacher activity aggregation
  const teacherStats = teachers.map((t) => {
    const tHistory = history.filter((h) => h.teacherId === t.id);
    const correct = tHistory.filter((h) => h.answerStatus === 'correct').length;
    return {
      teacher: t,
      totalSpins: tHistory.length,
      correctCount: correct,
      accuracy: tHistory.length > 0 ? Math.round((correct / tHistory.length) * 100) : 0,
    };
  });

  // Daily Breakdown (last 7 active days)
  const dailyMap: { [date: string]: { spins: number; correct: number } } = {};
  history.forEach((h) => {
    const dateStr = h.timestamp.slice(0, 10);
    if (!dailyMap[dateStr]) dailyMap[dateStr] = { spins: 0, correct: 0 };
    dailyMap[dateStr].spins += 1;
    if (h.answerStatus === 'correct') dailyMap[dateStr].correct += 1;
  });

  const dailyList = Object.entries(dailyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 10);

  // Generic CSV Downloader
  const downloadReportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            <span>Academic Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Equity analysis, teacher activity metrics, and answer performance charts.
          </p>
        </div>

        {/* Export Current View */}
        <button
          onClick={() => {
            if (activeReportTab === 'equity') {
              downloadReportCsv(
                'student_selection_equity',
                ['Student ID', 'Full Name', 'Class', 'Roll', 'Total Selections', 'Attendance'],
                studentsWithSpins.map((s) => [
                  s.studentId,
                  `"${s.name}"`,
                  s.classSectionKey,
                  s.rollNo,
                  s.totalSelections || 0,
                  s.attendanceStatus,
                ])
              );
            } else if (activeReportTab === 'teachers') {
              downloadReportCsv(
                'teacher_activity_report',
                ['Teacher Name', 'Username', 'Total Spins', 'Correct Answers', 'Accuracy %'],
                teacherStats.map((t) => [
                  `"${t.teacher.name}"`,
                  t.teacher.username,
                  t.totalSpins,
                  t.correctCount,
                  `${t.accuracy}%`,
                ])
              );
            } else {
              downloadReportCsv(
                'daily_activity_report',
                ['Date', 'Spins Count', 'Correct Answers', 'Accuracy %'],
                dailyList.map(([d, stat]) => [
                  d,
                  stat.spins,
                  stat.correct,
                  `${stat.spins > 0 ? Math.round((stat.correct / stat.spins) * 100) : 0}%`,
                ])
              );
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report</span>
        </button>
      </div>

      {/* Answer Performance Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Turns
          </span>
          <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
            {totalTurns}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Correct Answers
          </span>
          <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
            {totalCorrect}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
            Incorrect Answers
          </span>
          <span className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400">
            {totalIncorrect}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Skipped
          </span>
          <span className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
            {totalSkipped}
          </span>
        </div>
      </div>

      {/* Report View Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveReportTab('equity')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeReportTab === 'equity'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Student Selection Frequency (Equity)
        </button>
        <button
          onClick={() => setActiveReportTab('teachers')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeReportTab === 'teachers'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Teacher Activity
        </button>
        <button
          onClick={() => setActiveReportTab('daily')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeReportTab === 'daily'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Daily Timeline
        </button>
      </div>

      {/* Report Content Panels */}
      {activeReportTab === 'equity' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Student Participation Equity Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Identifies which students have been selected most frequently vs. those who have not yet had a turn.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Roll</th>
                  <th className="py-2.5 px-3">Selections</th>
                  <th className="py-2.5 px-3">Equity Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentsWithSpins.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3">{s.classSectionKey}</td>
                    <td className="py-2.5 px-3 font-mono">{s.rollNo}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{s.totalSelections || 0}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 max-w-xs">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (s.totalSelections || 0) === 0
                                ? 'bg-amber-400 w-1'
                                : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(100, (s.totalSelections || 0) * 20)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(s.totalSelections || 0) === 0 ? 'Not yet picked' : `${s.totalSelections} turns`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'teachers' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Teacher Activity Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Assigned Classes</th>
                  <th className="py-2.5 px-3 text-center">Spins Recorded</th>
                  <th className="py-2.5 px-3 text-center">Correct Answers</th>
                  <th className="py-2.5 px-3 text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teacherStats.map((t) => (
                  <tr key={t.teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {t.teacher.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      @{t.teacher.username}
                    </td>
                    <td className="py-2.5 px-3">
                      {(t.teacher.assignedClasses || []).join(', ') || 'None'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {t.totalSpins}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">
                      {t.correctCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {t.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'daily' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Daily Activity Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Total Classroom Spins</th>
                  <th className="py-2.5 px-3 text-center">Correct Answers</th>
                  <th className="py-2.5 px-3 text-center">Accuracy %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailyList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No daily records recorded yet.
                    </td>
                  </tr>
                ) : (
                  dailyList.map(([date, stat]) => (
                    <tr key={date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {date}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {stat.spins}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">
                        {stat.correct}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {stat.spins > 0 ? Math.round((stat.correct / stat.spins) * 100) : 0}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
