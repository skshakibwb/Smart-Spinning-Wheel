/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from 'canvas-confetti';
import { Award, CheckCircle, HelpCircle, RotateCcw, UserMinus, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { getAvatarColor, getInitials } from '../../lib/imageUtils';
import { Student } from '../../types';

interface WinnerModalProps {
  winner: Student | null;
  onClose: () => void;
  onAskQuestion: (student: Student) => void;
  onSpinAgain: () => void;
  onRemoveFromRound: (student: Student) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  onClose,
  onAskQuestion,
  onSpinAgain,
  onRemoveFromRound,
}) => {
  useEffect(() => {
    if (winner) {
      // Trigger festive celebration confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
        });
      } catch {
        // ignore
      }
    }
  }, [winner]);

  if (!winner) return null;

  const [bg1, bg2] = getAvatarColor(winner.name);
  const classDisplay = winner.section
    ? `Class ${winner.classId} – Section ${winner.section}`
    : `Class ${winner.classId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center transform transition-all animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Award className="w-4 h-4" />
          <span>Selected Winner</span>
        </div>

        {/* Large Circular Student Photo */}
        <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-xl mb-4">
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
            {winner.photoUrl ? (
              <img
                src={winner.photoUrl}
                alt={winner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}
                className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold"
              >
                {getInitials(winner.name)}
              </div>
            )}
          </div>
          <div className="absolute bottom-1 right-2 p-1.5 bg-emerald-500 text-white rounded-full shadow-md">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Celebratory Announcement */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-snug">
          CONGRATULATIONS!
          <br />
          <span className="text-blue-600 dark:text-blue-400">YOU HAVE BEEN SELECTED!</span>
        </h2>

        {/* Student Information Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left">
          <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700/60 mb-2">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {winner.name}
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {classDisplay}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold block">
                Roll Number
              </span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                {winner.rollNo}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold block">
                Student ID
              </span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                {winner.studentId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => onAskQuestion(winner)}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
            <span>ASK QUESTION</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onSpinAgain}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <span>SPIN AGAIN</span>
            </button>

            <button
              onClick={() => onRemoveFromRound(winner)}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserMinus className="w-4 h-4" />
              <span>EXCLUDE ROUND</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
