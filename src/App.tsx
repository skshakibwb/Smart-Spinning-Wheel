/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BookOpen,
  History,
  Home,
  RotateCw,
} from 'lucide-react';
import React, { useState } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClassManagement } from './components/admin/ClassManagement';
import { QuestionBank } from './components/admin/QuestionBank';
import { ReportsView } from './components/admin/ReportsView';
import { SelectionHistoryView } from './components/admin/SelectionHistoryView';
import { SettingsView } from './components/admin/SettingsView';
import { StudentManagement } from './components/admin/StudentManagement';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { FirstRunAdminSetup } from './components/auth/FirstRunAdminSetup';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { AdminTab, Sidebar } from './components/layout/Sidebar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { WheelView } from './components/wheel/WheelView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TeacherUser } from './types';

type TeacherTab = 'dashboard' | 'wheel' | 'questions' | 'history';

function MainApp() {
  const { currentUser, role, isAuthenticated, mustChangePassword, hasAdminConfigured, isLoading } =
    useAuth();

  // Admin Navigation Tab
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Teacher Navigation Tab
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse shadow-xl shadow-blue-500/20">
          <RotateCw className="w-6 h-6 animate-spin text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold">Smart Classroom – Spin & Learn</h2>
          <p className="text-xs text-slate-400 mt-1">Connecting to Firestore Database...</p>
        </div>
      </div>
    );
  }

  // 1. Initial First-Run Setup: No admin exists yet
  if (!hasAdminConfigured) {
    return <FirstRunAdminSetup />;
  }

  // 2. Not logged in -> Show Login View
  if (!isAuthenticated || !currentUser || !role) {
    return <LoginView />;
  }

  // 3. Authenticated: Render Admin or Teacher interface
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onNavigateHome={() => (role === 'admin' ? setAdminTab('dashboard') : setTeacherTab('dashboard'))} />

      {/* Force Password Change Modal for Teachers on first login */}
      {mustChangePassword && <ForcePasswordChangeModal />}

      {/* ADMIN INTERFACE */}
      {role === 'admin' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Admin Sidebar with 10 required items */}
          <Sidebar currentTab={adminTab} onTabChange={setAdminTab} />

          {/* Admin Main Content Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {adminTab === 'dashboard' && <AdminDashboard onNavigate={(tab) => setAdminTab(tab as AdminTab)} />}
              {adminTab === 'teachers' && <TeacherManagement />}
              {adminTab === 'students' && <StudentManagement />}
              {adminTab === 'classes' && (
                <ClassManagement
                  onNavigateToStudents={() => setAdminTab('students')}
                  onNavigateToWheel={() => setAdminTab('wheel')}
                />
              )}
              {adminTab === 'wheel' && (
                <WheelView
                  teacherId={currentUser.id}
                  teacherName={currentUser.name}
                  permittedClasses={undefined} // Admin has full access to all 10 classes
                />
              )}
              {adminTab === 'questions' && <QuestionBank isAdmin={true} />}
              {adminTab === 'history' && <SelectionHistoryView isAdmin={true} />}
              {adminTab === 'reports' && <ReportsView />}
              {adminTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>
      )}

      {/* TEACHER INTERFACE */}
      {role === 'teacher' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Teacher Navigation Strip */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setTeacherTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    teacherTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setTeacherTab('wheel')}
                  className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    teacherTab === 'wheel'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Spinning Wheel</span>
                </button>

                <button
                  onClick={() => setTeacherTab('questions')}
                  className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    teacherTab === 'questions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Question Bank</span>
                </button>

                <button
                  onClick={() => setTeacherTab('history')}
                  className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    teacherTab === 'history'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>My History</span>
                </button>
              </div>

              <div className="hidden sm:block text-xs font-mono text-slate-500">
                Assigned: {(currentUser as TeacherUser).assignedClasses?.join(', ') || 'None'}
              </div>
            </div>
          </div>

          {/* Teacher Main Content Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {teacherTab === 'dashboard' && (
                <TeacherDashboard
                  teacher={currentUser as TeacherUser}
                  onNavigate={(tab) => setTeacherTab(tab)}
                />
              )}
              {teacherTab === 'wheel' && (
                <WheelView
                  teacherId={currentUser.id}
                  teacherName={currentUser.name}
                  permittedClasses={(currentUser as TeacherUser).assignedClasses}
                />
              )}
              {teacherTab === 'questions' && (
                <QuestionBank
                  isAdmin={false}
                  permittedClasses={(currentUser as TeacherUser).assignedClasses}
                />
              )}
              {teacherTab === 'history' && (
                <SelectionHistoryView
                  currentTeacherId={currentUser.id}
                  isAdmin={false}
                />
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
