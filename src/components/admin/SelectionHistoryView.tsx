/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  RotateCw,
  Search,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { subscribeSelectionHistory } from '../../lib/db';
import { CLASSES_DATA } from '../../lib/seedData';
import { SelectionHistoryItem } from '../../types';

interface SelectionHistoryViewProps {
  currentTeacherId?: string; // if present, restrict to this teacher's logs
  isAdmin?: boolean;
}

export const SelectionHistoryView: React.FC<SelectionHistoryViewProps> = ({
  currentTeacherId,
  isAdmin = true,
}) => {
  const [history, setHistory] = useState<SelectionHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [filterSection, setFilterSection] = useState<string>('All');
  const [filterTeacher, setFilterTeacher] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSubject, setFilterSubject] = useState<string>('All');

  useEffect(() => {
    const unsub = subscribeSelectionHistory(setHistory);
    return () => unsub();
  }, []);

  // Filter list by role & controls
  const filteredHistory = history.filter((item) => {
    // Role filter: teacher can only see own history
    if (!isAdmin && currentTeacherId && item.teacherId !== currentTeacherId) {
      return false;
    }

    const query = searchTerm.toLowerCase();
    const studentMatch =
      item.studentName.toLowerCase().includes(query) ||
      item.studentId.toLowerCase().includes(query) ||
      item.rollNo.includes(query);
    const teacherMatch = item.teacherName.toLowerCase().includes(query);
    const questionMatch = item.questionText?.toLowerCase().includes(query) || false;

    const matchesSearch = studentMatch || teacherMatch || questionMatch;

    const matchesClass = filterClass === 'All' || item.classId === filterClass;
    const matchesSection = filterSection === 'All' || item.section === filterSection;
    const matchesTeacher = filterTeacher === 'All' || item.teacherName === filterTeacher;
    const matchesStatus = filterStatus === 'All' || item.answerStatus === filterStatus;
    const matchesSubject = filterSubject === 'All' || item.subject === filterSubject;

    return (
      matchesSearch &&
      matchesClass &&
      matchesSection &&
      matchesTeacher &&
      matchesStatus &&
      matchesSubject
    );
  });

  // Extract unique teachers and subjects for filter dropdowns
  const uniqueTeachers: string[] = Array.from(
    new Set(history.map((h) => h.teacherName).filter((t): t is string => Boolean(t)))
  );
  const uniqueSubjects: string[] = Array.from(
    new Set(history.map((h) => h.subject).filter((s): s is string => Boolean(s)))
  );

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Student Name',
      'Student ID',
      'Roll Number',
      'Class',
      'Section',
      'Teacher Name',
      'Subject',
      'Question',
      'Answer Status',
    ];

    const rows = filteredHistory.map((item) => [
      `"${new Date(item.timestamp).toLocaleString()}"`,
      `"${item.studentName.replace(/"/g, '""')}"`,
      item.studentId,
      item.rollNo,
      item.classId,
      item.section || 'N/A',
      `"${item.teacherName.replace(/"/g, '""')}"`,
      item.subject || 'N/A',
      `"${(item.questionText || '').replace(/"/g, '""')}"`,
      item.answerStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selection_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            <span>Selection History Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdmin
              ? `Complete institutional log of all ${history.length} classroom spins and question results.`
              : `Your personalized classroom questioning record (${filteredHistory.length} turns).`}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-purple-500" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Filter Matrix */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, teacher, roll number, or question..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Answer Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Result:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Results</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
              <option value="skipped">Skipped</option>
              <option value="none">Spun Only</option>
            </select>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Class:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="All">All</option>
              {CLASSES_DATA.map((c) => (
                <option key={c.classNumber} value={String(c.classNumber)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Section:</span>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="All">All</option>
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
            </select>
          </div>

          {/* Teacher Filter (Admin only) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">Teacher:</span>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="All">All Teachers</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Subject:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="All">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(filterClass !== 'All' ||
            filterSection !== 'All' ||
            filterTeacher !== 'All' ||
            filterStatus !== 'All' ||
            filterSubject !== 'All' ||
            searchTerm) && (
            <button
              onClick={() => {
                setFilterClass('All');
                setFilterSection('All');
                setFilterTeacher('All');
                setFilterStatus('All');
                setFilterSubject('All');
                setSearchTerm('');
              }}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Class</th>
              <th className="py-3.5 px-4">Teacher</th>
              <th className="py-3.5 px-4">Subject & Question</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No selection history matching your criteria.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* Student */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.studentName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Roll #{item.rollNo} · {item.studentId}
                    </div>
                  </td>

                  {/* Class */}
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {item.classSectionKey}
                  </td>

                  {/* Teacher */}
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {item.teacherName}
                  </td>

                  {/* Question */}
                  <td className="py-3 px-4 max-w-xs">
                    {item.questionText ? (
                      <div>
                        {item.subject && (
                          <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 mr-1.5">
                            [{item.subject}]
                          </span>
                        )}
                        <span className="text-slate-700 dark:text-slate-300 italic">
                          "{item.questionText}"
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Selected on Wheel</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        item.answerStatus === 'correct'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : item.answerStatus === 'incorrect'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : item.answerStatus === 'skipped'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.answerStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
