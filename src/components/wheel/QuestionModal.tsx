/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Shuffle,
  SkipForward,
  X,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../../lib/audio';
import { recordSelectionHistory } from '../../lib/db';
import { AnswerStatus, Question, Student, SubjectCategory } from '../../types';

interface QuestionModalProps {
  student: Student;
  questions: Question[];
  teacherId: string;
  teacherName: string;
  onClose: () => void;
  onQuestionCompleted: (status: AnswerStatus) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  student,
  questions,
  teacherId,
  teacherName,
  onClose,
  onQuestionCompleted,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() => {
    return questions.length > 0 ? questions[0] : null;
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [evaluatedStatus, setEvaluatedStatus] = useState<AnswerStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter questions for this class or general ("All")
  const eligibleQuestions = questions.filter((q) => {
    const classMatch = q.classId === 'All' || q.classId === student.classId;
    const subjectMatch = selectedSubject === 'All' || q.subject === selectedSubject;
    return classMatch && subjectMatch;
  });

  const handlePickRandom = () => {
    if (eligibleQuestions.length === 0) return;
    const idx = Math.floor(Math.random() * eligibleQuestions.length);
    setCurrentQuestion(eligibleQuestions[idx]);
    setShowAnswer(false);
    setEvaluatedStatus(null);
  };

  const handleGrade = async (status: AnswerStatus) => {
    if (!currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    sound.playAnswerSound(status);
    setEvaluatedStatus(status);

    try {
      await recordSelectionHistory({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        classId: student.classId,
        section: student.section || null,
        classSectionKey: student.classSectionKey,
        teacherId,
        teacherName,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        subject: currentQuestion.subject,
        answerStatus: status,
      });

      onQuestionCompleted(status);
    } catch (err) {
      console.error('Failed to log question result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsList: (SubjectCategory | 'All')[] = [
    'All',
    'Science',
    'Mathematics',
    'English',
    'General Knowledge',
    'History',
    'Geography',
    'Arabic',
    'Urdu',
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 ${
        isFullScreen ? 'p-0' : 'p-4'
      }`}
    >
      <div
        className={`relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen
            ? 'h-full max-w-none rounded-none'
            : 'max-w-2xl max-h-[90vh] rounded-3xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Oral Question for {student.name}
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Roll #{student.rollNo} · {student.classSectionKey} · Student ID: {student.studentId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullScreen ? 'Exit full screen' : 'Full screen presentation'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Deck: Subject Filters & Random Picker */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {subjectsList.map((subj) => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  const filtered = questions.filter(
                    (q) =>
                      (q.classId === 'All' || q.classId === student.classId) &&
                      (subj === 'All' || q.subject === subj)
                  );
                  if (filtered.length > 0) setCurrentQuestion(filtered[0]);
                  setShowAnswer(false);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePickRandom}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Question</span>
            </button>
          </div>
        </div>

        {/* Question Display Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center">
          {currentQuestion ? (
            <div className="space-y-6 max-w-xl mx-auto w-full text-center">
              {/* Question Metadata */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentQuestion.subject}
                </span>
                <span>·</span>
                <span>Difficulty: {currentQuestion.difficulty}</span>
                <span>·</span>
                <span>Target: {currentQuestion.classId === 'All' ? 'All Classes' : `Class ${currentQuestion.classId}`}</span>
              </div>

              {/* Question Body */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                  "{currentQuestion.text}"
                </p>

                {/* Optional Answer Peek for Teacher */}
                {currentQuestion.answer && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showAnswer ? 'Hide Expected Answer' : 'Reveal Expected Answer'}</span>
                    </button>
                    {showAnswer && (
                      <div className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                        Answer: {currentQuestion.answer}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Announcement if graded */}
              {evaluatedStatus && (
                <div
                  className={`p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 ${
                    evaluatedStatus === 'correct'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                      : evaluatedStatus === 'incorrect'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                  }`}
                >
                  {evaluatedStatus === 'correct' && <CheckCircle2 className="w-5 h-5" />}
                  {evaluatedStatus === 'incorrect' && <XCircle className="w-5 h-5" />}
                  {evaluatedStatus === 'skipped' && <AlertCircle className="w-5 h-5" />}
                  <span>
                    Answer recorded as {evaluatedStatus.toUpperCase()}!
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No questions found matching this filter.</p>
              <button
                onClick={() => setSelectedSubject('All')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Reset Filter to All
              </button>
            </div>
          )}
        </div>

        {/* Footer: Evaluation Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {eligibleQuestions.length} questions available
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGrade('correct')}
              disabled={!currentQuestion || isSubmitting}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct (+1)</span>
            </button>

            <button
              onClick={() => handleGrade('incorrect')}
              disabled={!currentQuestion || isSubmitting}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Incorrect (0)</span>
            </button>

            <button
              onClick={() => handleGrade('skipped')}
              disabled={!currentQuestion || isSubmitting}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </button>

            {evaluatedStatus && (
              <button
                onClick={handlePickRandom}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
