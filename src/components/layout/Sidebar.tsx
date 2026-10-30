/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BarChart3,
  BookOpen,
  GraduationCap,
  History,
  Home,
  Layers,
  LogOut,
  RotateCw,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab =
  | 'dashboard'
  | 'teachers'
  | 'students'
  | 'classes'
  | 'wheel'
  | 'questions'
  | 'history'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { logout, currentUser } = useAuth();

  const navItems: { tab: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'dashboard', label: '1. Dashboard', icon: <Home className="w-4 h-4" /> },
    { tab: 'teachers', label: '2. Teacher Management', icon: <UserCheck className="w-4 h-4" /> },
    { tab: 'students', label: '3. Student Management', icon: <Users className="w-4 h-4" /> },
    { tab: 'classes', label: '4. Class Management', icon: <Layers className="w-4 h-4" /> },
    { tab: 'wheel', label: '5. Spinning Wheel', icon: <RotateCw className="w-4 h-4" />, badge: 'Live' },
    { tab: 'questions', label: '6. Question Bank', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'history', label: '7. Selection History', icon: <History className="w-4 h-4" /> },
    { tab: 'reports', label: '8. Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'settings', label: '9. Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 p-4 transition-colors">
      <div className="space-y-6">
        {/* Administrator Badge */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {currentUser?.name || 'Admin'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Master Administrator</div>
          </div>
        </div>

        {/* 9 Admin Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;

            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 10. Logout in Sidebar */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>10. Logout</span>
        </button>
      </div>
    </aside>
  );
};
