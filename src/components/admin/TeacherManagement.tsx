/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Check,
  Edit2,
  KeyRound,
  Plus,
  Power,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { hashPassword } from '../../lib/crypto';
import {
  createTeacher,
  deleteTeacher,
  subscribeTeachers,
  updateTeacher,
} from '../../lib/db';
import { compressImageToDataUri, getAvatarColor, getInitials } from '../../lib/imageUtils';
import { CLASSES_DATA } from '../../lib/seedData';
import { TeacherUser } from '../../types';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);
  const [resetTeacher, setResetTeacher] = useState<TeacherUser | null>(null);
  const [deleteTeacherTarget, setDeleteTeacherTarget] = useState<TeacherUser | null>(null);

  // Form Fields for Add / Edit
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporary password generator for Reset
  const [tempPassword, setTempPassword] = useState('Pass@2026!');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeTeachers(setTeachers);
    return () => unsub();
  }, []);

  // All possible class options
  const allClassOptions: { label: string; key: string }[] = [];
  CLASSES_DATA.forEach((cls) => {
    if (cls.hasSections) {
      cls.sections.forEach((sec) => {
        allClassOptions.push({
          label: `Class ${cls.classNumber} – Sec ${sec}`,
          key: `${cls.classNumber}-${sec}`,
        });
      });
    } else {
      allClassOptions.push({
        label: `Class ${cls.classNumber}`,
        key: `${cls.classNumber}`,
      });
    }
  });

  const openAddModal = () => {
    setFullName('');
    setUsername('');
    setPassword('Teacher@123');
    setPhotoUrl('');
    setAssignedClasses(['1-A']);
    setStatus('active');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (teacher: TeacherUser) => {
    setEditingTeacher(teacher);
    setFullName(teacher.name);
    setUsername(teacher.username);
    setPassword('');
    setPhotoUrl(teacher.photoUrl || '');
    setAssignedClasses(teacher.assignedClasses || []);
    setStatus(teacher.status);
    setErrorMsg('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUri = await compressImageToDataUri(file, 160, 160, 0.85);
      setPhotoUrl(dataUri);
    } catch {
      setErrorMsg('Failed to process image.');
    }
  };

  const toggleClassAssignment = (key: string) => {
    if (assignedClasses.includes(key)) {
      setAssignedClasses(assignedClasses.filter((k) => k !== key));
    } else {
      setAssignedClasses([...assignedClasses, key]);
    }
  };

  const handleSaveNewTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setErrorMsg('Full Name, Username, and Password are required.');
      return;
    }

    // Check duplicate username
    if (teachers.some((t) => t.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrorMsg('Username is already taken. Please choose another.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const passwordHash = await hashPassword(password);
      await createTeacher({
        name: fullName.trim(),
        username: username.trim().toLowerCase(),
        passwordHash,
        photoUrl: photoUrl || undefined,
        assignedClasses,
        status,
        mustChangePassword: true, // Forces password change on first teacher login
        createdAt: new Date().toISOString(),
      });

      setIsAddModalOpen(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !fullName.trim() || !username.trim()) {
      setErrorMsg('Full Name and Username are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const updates: Partial<TeacherUser> = {
        name: fullName.trim(),
        username: username.trim().toLowerCase(),
        photoUrl: photoUrl || undefined,
        assignedClasses,
        status,
      };

      if (password.trim()) {
        updates.passwordHash = await hashPassword(password);
        updates.mustChangePassword = true;
      }

      await updateTeacher(editingTeacher.id, updates);
      setEditingTeacher(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update teacher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (teacher: TeacherUser) => {
    const nextStatus = teacher.status === 'active' ? 'inactive' : 'active';
    await updateTeacher(teacher.id, { status: nextStatus });
  };

  const handleResetPassword = async () => {
    if (!resetTeacher || !tempPassword.trim()) return;
    setIsSubmitting(true);
    try {
      const passwordHash = await hashPassword(tempPassword);
      await updateTeacher(resetTeacher.id, {
        passwordHash,
        mustChangePassword: true,
      });
      setResetSuccessMsg(`Password successfully reset! Provide temporary password: ${tempPassword}`);
    } catch (err) {
      setErrorMsg('Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTeacherTarget) return;
    try {
      await deleteTeacher(deleteTeacherTarget.id);
      setDeleteTeacherTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    const query = searchTerm.toLowerCase();
    const nameMatch = t.name.toLowerCase().includes(query);
    const userMatch = t.username.toLowerCase().includes(query);
    const classMatch = (t.assignedClasses || []).some((c) => c.toLowerCase().includes(query));
    return nameMatch || userMatch || classMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-500" />
            <span>Teacher Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create teacher credentials, assign class sections, and manage active accounts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search teachers by name, username, or assigned class..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Teacher List Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => {
          const [bg1, bg2] = getAvatarColor(teacher.name);

          return (
            <div
              key={teacher.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Profile Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}
                        className="w-full h-full flex items-center justify-center text-white text-base font-bold"
                      >
                        {getInitials(teacher.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {teacher.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono">
                      @{teacher.username}
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleStatus(teacher)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                    teacher.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                  title="Click to toggle account activation status"
                >
                  <Power className="w-3 h-3" />
                  <span>{teacher.status}</span>
                </button>
              </div>

              {/* Assigned Classes */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Assigned Classes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(teacher.assignedClasses || []).length > 0 ? (
                    teacher.assignedClasses.map((clsKey) => (
                      <span
                        key={clsKey}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold border border-blue-200 dark:border-blue-800"
                      >
                        {clsKey.includes('-') ? `Class ${clsKey}` : `Class ${clsKey}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No classes assigned</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => openEditModal(teacher)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    setResetTeacher(teacher);
                    setTempPassword('TempPass@123');
                    setResetSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Pass</span>
                </button>

                <button
                  onClick={() => setDeleteTeacherTarget(teacher)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete teacher account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add New Teacher
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTeacher} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mr. Tariq Rahman"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahman01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Teacher@123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {/* Multi-Class Assignment */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign Classes & Sections (Multi-select)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-44 overflow-y-auto">
                  {allClassOptions.map((opt) => {
                    const isAssigned = assignedClasses.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleClassAssignment(opt.key)}
                        className={`p-2 rounded-xl text-left font-semibold text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isAssigned
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isAssigned && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="active">Active (Can log in)</option>
                  <option value="inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Teacher: {editingTeacher.name}
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {/* Multi-Class Assignment */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Classes (Multi-select)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-44 overflow-y-auto">
                  {allClassOptions.map((opt) => {
                    const isAssigned = assignedClasses.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleClassAssignment(opt.key)}
                        className={`p-2 rounded-xl text-left font-semibold text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isAssigned
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isAssigned && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Reset Teacher Password</span>
              </h3>
              <button
                onClick={() => setResetTeacher(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Generate a temporary password for <strong>{resetTeacher.name}</strong> (@{resetTeacher.username}). They will be required to change it on their next login.
              </p>

              {resetSuccessMsg ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                  {resetSuccessMsg}
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    New Temporary Password
                  </label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTeacher(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300"
                >
                  {resetSuccessMsg ? 'Done' : 'Cancel'}
                </button>
                {!resetSuccessMsg && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 shadow"
                  >
                    {isSubmitting ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTeacherTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Teacher Account?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to permanently delete <strong>{deleteTeacherTarget.name}</strong> (@{deleteTeacherTarget.username})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTeacherTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeacher}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
