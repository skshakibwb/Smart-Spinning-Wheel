/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  createStudent,
  deleteStudent,
  subscribeStudents,
  updateStudent,
} from '../../lib/db';
import { compressImageToDataUri, getAvatarColor, getInitials } from '../../lib/imageUtils';
import { CLASSES_DATA } from '../../lib/seedData';
import { Student } from '../../types';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [filterSection, setFilterSection] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [classId, setClassId] = useState('1');
  const [section, setSection] = useState('A');
  const [photoUrl, setPhotoUrl] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Import State
  const [csvContent, setCsvContent] = useState('');
  const [csvParsedCount, setCsvParsedCount] = useState<number | null>(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents);
    return () => unsub();
  }, []);

  const selectedClassDef = CLASSES_DATA.find((c) => c.classNumber === parseInt(classId, 10));

  const openAddModal = () => {
    setName('');
    const nextNum = students.length + 1;
    setStudentId(`STU-${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setRollNo(`${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setClassId('1');
    setSection('A');
    setPhotoUrl('');
    setGender('male');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setStudentId(student.studentId);
    setRollNo(student.rollNo);
    setClassId(student.classId);
    setSection(student.section || 'A');
    setPhotoUrl(student.photoUrl || '');
    setGender(student.gender || 'male');
    setErrorMsg('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUri = await compressImageToDataUri(file, 160, 160, 0.85);
      setPhotoUrl(dataUri);
    } catch {
      setErrorMsg('Failed to compress image.');
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !rollNo.trim()) {
      setErrorMsg('Name, Student ID, and Roll Number are required.');
      return;
    }

    const classDef = CLASSES_DATA.find((c) => c.classNumber === parseInt(classId, 10));
    const sec = classDef?.hasSections ? section : null;
    const classSectionKey = sec ? `${classId}-${sec}` : `${classId}`;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          name: name.trim(),
          studentId: studentId.trim(),
          rollNo: rollNo.trim(),
          classId,
          section: sec,
          classSectionKey,
          photoUrl: photoUrl || undefined,
          gender,
        });
        setEditingStudent(null);
      } else {
        await createStudent({
          studentId: studentId.trim(),
          name: name.trim(),
          rollNo: rollNo.trim(),
          classId,
          section: sec,
          classSectionKey,
          photoUrl: photoUrl || undefined,
          gender,
          attendanceStatus: 'present',
          totalSelections: 0,
          createdAt: new Date().toISOString(),
        });
        setIsAddModalOpen(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAttendance = async (student: Student) => {
    const nextStatus = student.attendanceStatus === 'present' ? 'absent' : 'present';
    await updateStudent(student.id, { attendanceStatus: nextStatus });
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Student ID', 'Full Name', 'Roll Number', 'Class', 'Section', 'Attendance', 'Total Spins'];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      `"${s.name.replace(/"/g, '""')}"`,
      s.rollNo,
      s.classId,
      s.section || 'N/A',
      s.attendanceStatus,
      s.totalSelections || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smart_classroom_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Bulk Import Parser
  const handleCsvImport = async () => {
    if (!csvContent.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = csvContent.trim().split('\n');
      let imported = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Ignore header if contains 'name'
        if (i === 0 && line.toLowerCase().includes('name')) continue;

        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          const sId = parts[0] || `STU-${Date.now().toString().slice(-4)}`;
          const sName = parts[1];
          const sRoll = parts[2];
          const sClass = parts[3] || '1';
          const sSec = parts[4] || (['1', '2', '3'].includes(sClass) ? 'A' : null);
          const classSecKey = sSec ? `${sClass}-${sSec}` : `${sClass}`;

          if (sName) {
            await createStudent({
              studentId: sId,
              name: sName,
              rollNo: sRoll || '01',
              classId: sClass,
              section: sSec,
              classSectionKey: classSecKey,
              attendanceStatus: 'present',
              totalSelections: 0,
              createdAt: new Date().toISOString(),
            });
            imported++;
          }
        }
      }

      setCsvParsedCount(imported);
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvContent('');
        setCsvParsedCount(null);
      }, 1500);
    } catch (err) {
      setErrorMsg('Failed to import CSV. Check format.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const query = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(query);
    const idMatch = s.studentId.toLowerCase().includes(query);
    const rollMatch = s.rollNo.includes(query);

    const classMatch = filterClass === 'All' || s.classId === filterClass;
    const secMatch = filterSection === 'All' || s.section === filterSection || (!s.section && filterSection === 'None');

    return (nameMatch || idMatch || rollMatch) && classMatch && secMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total {students.length} students enrolled across 10 classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll number, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter by Class */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Class:</span>
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              if (parseInt(e.target.value, 10) > 3) setFilterSection('All');
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer"
          >
            <option value="All">All Classes</option>
            {CLASSES_DATA.map((c) => (
              <option key={c.classNumber} value={String(c.classNumber)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Section (only relevant for Classes 1-3 or All) */}
        {['All', '1', '2', '3'].includes(filterClass) && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Section:</span>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
        )}
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Roll No</th>
              <th className="py-3.5 px-4">Class & Sec</th>
              <th className="py-3.5 px-4 text-center">Spins</th>
              <th className="py-3.5 px-4 text-center">Attendance</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const [bg1, bg2] = getAvatarColor(student.name);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setViewingStudent(student)}
                          className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                        >
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}
                              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                            >
                              {getInitials(student.name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            onClick={() => setViewingStudent(student)}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600"
                          >
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-400 capitalize">
                            {student.gender || 'student'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {student.studentId}
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {student.rollNo}
                    </td>

                    {/* Class & Section */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 text-[11px]">
                        {student.section
                          ? `Class ${student.classId} – ${student.section}`
                          : `Class ${student.classId}`}
                      </span>
                    </td>

                    {/* Total Spins */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {student.totalSelections || 0}
                    </td>

                    {/* Attendance Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAttendance(student)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          student.attendanceStatus === 'present'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                        title="Click to toggle attendance status"
                      >
                        {student.attendanceStatus === 'present' ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        <span>{student.attendanceStatus}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Add New Student'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zoya Khan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-102"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 05"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Class & Section Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Class (1–10) *
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      if (parseInt(e.target.value, 10) > 3) setSection('A');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {CLASSES_DATA.map((c) => (
                      <option key={c.classNumber} value={String(c.classNumber)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClassDef?.hasSections ? (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Section *
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center">
                    <span className="font-bold text-slate-400 block mb-1">Section</span>
                    <span className="text-xs text-slate-400 italic">
                      Classes 4–10 have no sections
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profile Picture (Auto-compressed thumbnail)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Student"
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gender
                </label>
                <div className="flex items-center gap-4">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Profile View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Circular Photo */}
            <div className="relative mx-auto w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {viewingStudent.photoUrl ? (
                  <img
                    src={viewingStudent.photoUrl}
                    alt={viewingStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${
                        getAvatarColor(viewingStudent.name)[0]
                      }, ${getAvatarColor(viewingStudent.name)[1]})`,
                    }}
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                  >
                    {getInitials(viewingStudent.name)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {viewingStudent.name}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {viewingStudent.section
                  ? `Class ${viewingStudent.classId} – Section ${viewingStudent.section}`
                  : `Class ${viewingStudent.classId}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Roll Number
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewingStudent.rollNo}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Student ID
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewingStudent.studentId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Attendance
                </span>
                <span
                  className={`font-bold capitalize ${
                    viewingStudent.attendanceStatus === 'present'
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                >
                  {viewingStudent.attendanceStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Selections
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewingStudent.totalSelections || 0} times
                </span>
              </div>
            </div>

            <button
              onClick={() => setViewingStudent(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Import Student Roster (CSV)</span>
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste CSV rows or headers in format:
              <br />
              <code className="text-[11px] bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono">
                StudentID, Full Name, RollNo, ClassNumber, Section
              </code>
            </p>

            {csvParsedCount !== null ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                Successfully imported {csvParsedCount} students!
              </div>
            ) : (
              <textarea
                rows={8}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={`STU-101, Zaid Khan, 01, 1, A\nSTU-102, Alina Sen, 02, 1, B\nSTU-401, Kabir Ali, 01, 4,`}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                disabled={isSubmitting || !csvContent.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow"
              >
                {isSubmitting ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Student?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.studentId}) from the student roster?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
