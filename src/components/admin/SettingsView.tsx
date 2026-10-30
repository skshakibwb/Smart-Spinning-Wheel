/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Check,
  Database,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
  Sparkles,
  Volume2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { initializeDatabase, subscribeSettings, updateSystemSettings } from '../../lib/db';
import { ClassroomSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ClassroomSettings | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeSettings((s) => {
      setSettings(s);
      setSchoolName(s.schoolName);
      setAcademicYear(s.academicYear);
      setSoundEnabled(s.soundEnabled);
      setConfettiEnabled(s.confettiEnabled);
      setTimerSeconds(s.timerSeconds || 45);
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSaved(false);

    try {
      await updateSystemSettings({
        schoolName: schoolName.trim(),
        academicYear: academicYear.trim(),
        soundEnabled,
        confettiEnabled,
        timerSeconds: Number(timerSeconds),
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          <span>System Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure institutional identity, classroom defaults, and audiovisual preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* School Branding */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-slate-400">
            Institution Information
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                School / Institution Name
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Smart International Academy"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Academic Session / Year
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2026 – 2027"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Wheel & Animation Defaults */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-slate-400">
            Wheel & Audio Defaults
          </h3>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Enable Sound Effects
                  </div>
                  <div className="text-slate-500">
                    Play ticker sounds and winner celebration fanfares.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Celebration Confetti
                  </div>
                  <div className="text-slate-500">
                    Trigger animated confetti shower when student is selected.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={confettiEnabled}
                onChange={(e) => setConfettiEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Oral Quiz Timer (Seconds)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-40 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          {isSaved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">Updates sync in real-time.</span>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Cloud Database Auto-Sync & Verification Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cloud Firestore Auto-Sync
              </h3>
              <p className="text-xs text-slate-500">
                Guarantees all 10 classes, default teachers (rahman01, farhana02, karim03), and question banks are synchronized.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await initializeDatabase();
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Syncing...' : 'Run Auto-Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
