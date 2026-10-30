/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Award,
  CheckCircle,
  HelpCircle,
  Maximize,
  Minimize,
  RefreshCw,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { sound } from '../../lib/audio';
import {
  getSpinningRoundState,
  saveSpinningRoundState,
  subscribeQuestions,
  subscribeStudents,
} from '../../lib/db';
import { getAvatarColor, getInitials } from '../../lib/imageUtils';
import { CLASSES_DATA } from '../../lib/seedData';
import { Question, Student } from '../../types';
import { QuestionModal } from './QuestionModal';
import { SpinningWheelCanvas } from './SpinningWheelCanvas';
import { WinnerModal } from './WinnerModal';

interface WheelViewProps {
  teacherId: string;
  teacherName: string;
  permittedClasses?: string[]; // e.g. ["1-A", "2-B", "5", "7"] or undefined for admin
  onRecordHistory?: () => void;
}

export const WheelView: React.FC<WheelViewProps> = ({
  teacherId,
  teacherName,
  permittedClasses,
}) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Class Selection State
  const [selectedClassNum, setSelectedClassNum] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('A');

  // Round & Selection State
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>([]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [noRepeatMode, setNoRepeatMode] = useState<boolean>(true);

  // Modals & Projector
  const [winner, setWinner] = useState<Student | null>(null);
  const [questionStudent, setQuestionStudent] = useState<Student | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());

  // Subscribe to students and questions
  useEffect(() => {
    const unsubStudents = subscribeStudents(setAllStudents);
    const unsubQuestions = subscribeQuestions(setAllQuestions);
    return () => {
      unsubStudents();
      unsubQuestions();
    };
  }, []);

  // Compute active classSectionKey
  const currentClassDef = CLASSES_DATA.find((c) => c.classNumber === selectedClassNum);
  const classSectionKey = currentClassDef?.hasSections
    ? `${selectedClassNum}-${selectedSection}`
    : `${selectedClassNum}`;

  // Filter allowed classes if user is teacher
  const isClassPermitted = (key: string): boolean => {
    if (!permittedClasses) return true; // admin has access to all
    return permittedClasses.includes(key);
  };

  // If initial selection is not permitted, select first permitted class
  useEffect(() => {
    if (permittedClasses && permittedClasses.length > 0) {
      if (!isClassPermitted(classSectionKey)) {
        const first = permittedClasses[0];
        if (first.includes('-')) {
          const [c, s] = first.split('-');
          setSelectedClassNum(parseInt(c, 10));
          setSelectedSection(s);
        } else {
          setSelectedClassNum(parseInt(first, 10));
        }
      }
    }
  }, [permittedClasses]);

  // Load persistent round state from Firestore when classSectionKey changes
  useEffect(() => {
    let active = true;
    async function loadRound() {
      const state = await getSpinningRoundState(classSectionKey, teacherId);
      if (active && state) {
        setExcludedStudentIds(state.completedStudentIds || []);
        setRoundNumber(state.roundNumber || 1);
      } else if (active) {
        setExcludedStudentIds([]);
        setRoundNumber(1);
      }
    }
    loadRound();
    return () => {
      active = false;
    };
  }, [classSectionKey, teacherId]);

  // Save round state
  const syncRoundState = async (newExcluded: string[], newRoundNum: number) => {
    setExcludedStudentIds(newExcluded);
    setRoundNumber(newRoundNum);
    await saveSpinningRoundState({
      id: `round_${classSectionKey}_${teacherId}`,
      classSectionKey,
      teacherId,
      completedStudentIds: newExcluded,
      roundNumber: newRoundNum,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  };

  // Filter students for current class and section
  const currentClassStudents = allStudents.filter(
    (s) => s.classSectionKey === classSectionKey && s.attendanceStatus === 'present'
  );

  // Eligible students for the wheel (excluding already selected in noRepeatMode)
  const eligibleStudents = noRepeatMode
    ? currentClassStudents.filter((s) => !excludedStudentIds.includes(s.id))
    : currentClassStudents;

  // Selected students in this round
  const selectedStudents = currentClassStudents.filter((s) =>
    excludedStudentIds.includes(s.id)
  );

  const handleWinnerSelected = (student: Student) => {
    setWinner(student);
  };

  const handleAskQuestionFromWinner = (student: Student) => {
    setWinner(null);
    setQuestionStudent(student);
  };

  const handleExcludeWinner = (student: Student) => {
    if (!excludedStudentIds.includes(student.id)) {
      const updated = [...excludedStudentIds, student.id];
      syncRoundState(updated, roundNumber);
    }
    setWinner(null);
  };

  const handleResetRound = () => {
    syncRoundState([], 1);
  };

  const handleStartNewRound = () => {
    syncRoundState([], roundNumber + 1);
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  return (
    <div className={`space-y-6 ${isFullScreen ? 'bg-slate-950 p-6 min-h-screen text-white' : ''}`}>
      {/* Top Classroom Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Class and Section Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Class:</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            {CLASSES_DATA.map((cls) => {
              const hasAccess = cls.hasSections
                ? isClassPermitted(`${cls.classNumber}-A`) || isClassPermitted(`${cls.classNumber}-B`)
                : isClassPermitted(`${cls.classNumber}`);

              if (!hasAccess) return null;

              const isSelected = selectedClassNum === cls.classNumber;

              return (
                <button
                  key={cls.classNumber}
                  onClick={() => {
                    setSelectedClassNum(cls.classNumber);
                    if (cls.hasSections) {
                      // pick first permitted section
                      if (isClassPermitted(`${cls.classNumber}-A`)) setSelectedSection('A');
                      else setSelectedSection('B');
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>

          {/* Section A / B for Classes 1–3 */}
          {currentClassDef?.hasSections && (
            <div className="flex items-center gap-1 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
              {['A', 'B'].map((sec) => {
                const secPermitted = isClassPermitted(`${selectedClassNum}-${sec}`);
                if (!secPermitted) return null;

                const isSecActive = selectedSection === sec;

                return (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSecActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Sec {sec}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls: Sound, Fullscreen, Mode */}
        <div className="flex items-center gap-2">
          {/* No-Repeat Mode Toggle */}
          <button
            onClick={() => setNoRepeatMode(!noRepeatMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              noRepeatMode
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="When active, selected students are removed until the round is reset"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fair No-Repeat: {noRepeatMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Full Screen Mode */}
          <button
            onClick={toggleFullScreen}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
            title="Full Screen Classroom Mode"
          >
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Wheel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Wheel Stage (Center / Left - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Header Tag */}
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Classroom Spinning Wheel</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  {currentClassDef?.hasSections
                    ? `Class ${selectedClassNum} – Section ${selectedSection}`
                    : `Class ${selectedClassNum}`}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Round #{roundNumber} · {eligibleStudents.length} eligible students
              </p>
            </div>

            {eligibleStudents.length === 0 && currentClassStudents.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold animate-pulse">
                <CheckCircle className="w-4 h-4" />
                <span>All students selected!</span>
              </div>
            )}
          </div>

          {/* Spinning Wheel Canvas */}
          <div className="my-4">
            <SpinningWheelCanvas
              students={eligibleStudents}
              onWinnerSelected={handleWinnerSelected}
              disabled={eligibleStudents.length === 0}
            />
          </div>

          {/* Round completion prompt if all selected */}
          {eligibleStudents.length === 0 && currentClassStudents.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/60 text-center max-w-md w-full">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Round {roundNumber} Complete!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Every student in {classSectionKey} has had an opportunity to answer.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleStartNewRound}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Round #{roundNumber + 1}</span>
                </button>
                <button
                  onClick={handleResetRound}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset Current Round
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Round Progress Deck (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Round Statistics Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Round Progress
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Round #{roundNumber}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Participation Rate</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {currentClassStudents.length > 0
                    ? Math.round((selectedStudents.length / currentClassStudents.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                  style={{
                    width: `${
                      currentClassStudents.length > 0
                        ? (selectedStudents.length / currentClassStudents.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <span className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400 block">
                  {eligibleStudents.length}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Remaining
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block">
                  {selectedStudents.length}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Selected
                </span>
              </div>
            </div>

            {/* Round Reset Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetRound}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Round</span>
              </button>
              <button
                onClick={handleStartNewRound}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>New Round</span>
              </button>
            </div>
          </div>

          {/* Already Selected Student List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-h-80 overflow-hidden flex flex-col">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Selected Students ({selectedStudents.length})</span>
              {selectedStudents.length > 0 && (
                <span className="text-emerald-500 font-normal">Round in progress</span>
              )}
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {selectedStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No students selected yet in this round.
                  <br />
                  Click SPIN to make the first pick!
                </div>
              ) : (
                selectedStudents.map((stu) => {
                  const [bg1, bg2] = getAvatarColor(stu.name);
                  return (
                    <div
                      key={stu.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                        >
                          {getInitials(stu.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {stu.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Roll #{stu.rollNo}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setQuestionStudent(stu)}
                        className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Ask another question"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Question</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <WinnerModal
        winner={winner}
        onClose={() => setWinner(null)}
        onAskQuestion={handleAskQuestionFromWinner}
        onSpinAgain={() => {
          if (winner) handleExcludeWinner(winner);
        }}
        onRemoveFromRound={handleExcludeWinner}
      />

      {/* Question Modal */}
      {questionStudent && (
        <QuestionModal
          student={questionStudent}
          questions={allQuestions}
          teacherId={teacherId}
          teacherName={teacherName}
          onClose={() => setQuestionStudent(null)}
          onQuestionCompleted={(status) => {
            if (!excludedStudentIds.includes(questionStudent.id)) {
              syncRoundState([...excludedStudentIds, questionStudent.id], roundNumber);
            }
          }}
        />
      )}
    </div>
  );
};
