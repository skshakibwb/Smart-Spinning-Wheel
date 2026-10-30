/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GraduationCap,
  LogOut,
  Moon,
  RotateCw,
  Sun,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../lib/audio';

interface NavbarProps {
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const { currentUser, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(() => sound.isMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <RotateCw className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            Smart Classroom <span className="text-blue-600 dark:text-blue-400">· Spin & Learn</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links / Contextual Scopes */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-[11px]">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>10 Classes Active</span>
          </span>
          <span className="text-slate-400">·</span>
          <span>Impartial Random Selection</span>
          <span className="text-slate-400">·</span>
          <span>Fair Non-Repeat Engine</span>
        </nav>

        {/* Zone 3: Primary Actions (Audio, Theme, User Role, Logout) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle sound"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Info & Role Pill */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  {role === 'admin' ? 'Administrator' : 'Teacher'}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.name.slice(0, 2)}
              </div>
            </div>
          )}

          {/* Logout */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Log out of account"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
