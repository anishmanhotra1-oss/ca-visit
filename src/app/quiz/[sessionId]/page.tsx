'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, Session, Subject, QuestionState } from '@/lib/types';
import { LocalAppStore } from '@/lib/store';
import {
  Bookmark as BookmarkIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  ChevronUp,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface QuizAnswerState {
  selectedIndex: number | null;
  status: 'correct' | 'incorrect' | 'skipped' | 'unanswered';
  timeSpentSec: number;
}

export default function QuizExecutionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerState>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [paletteOpenMobile, setPaletteOpenMobile] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  // Initialize active quiz from sessionStorage or store
  useEffect(() => {
    const raw = sessionStorage.getItem(`active_quiz_${sessionId}`);
    const subs = LocalAppStore.getSubjects();
    const qStates = LocalAppStore.getQuestionStates();
    const bMarks = LocalAppStore.getBookmarks().map((b) => b.question_id);

    setSubjects(subs);
    setQuestionStates(qStates);
    setBookmarkedIds(bMarks);

    if (raw) {
      const parsed = JSON.parse(raw);
      setSession(parsed.session);
      setQuestions(parsed.questions);
      setAnswers(parsed.answers || {});
      setCurrentIndex(parsed.currentIndex || 0);
    } else {
      // Fallback redirect if session lost
      router.push('/quiz/setup');
    }
  }, [sessionId, router]);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentSubject = currentQuestion
    ? subjects.find((s) => s.id === currentQuestion.subject_id)
    : null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isBookmarked = currentQuestion ? bookmarkedIds.includes(currentQuestion.id) : false;
  const previousAttemptState = currentQuestion ? questionStates[currentQuestion.id] : null;

  // Handle Option Click
  const handleSelectOption = (idx: number) => {
    if (!currentQuestion || !session) return;

    // Practice mode locks option after selection
    if (session.mode === 'practice' && currentAnswer && currentAnswer.selectedIndex !== null) {
      return;
    }

    const isCorrect = idx === currentQuestion.correct_index;
    const newAnswer: QuizAnswerState = {
      selectedIndex: idx,
      status: isCorrect ? 'correct' : 'incorrect',
      timeSpentSec: (currentAnswer?.timeSpentSec || 0) + 5,
    };

    const updatedAnswers = { ...answers, [currentQuestion.id]: newAnswer };
    setAnswers(updatedAnswers);

    // Sync to sessionStorage
    sessionStorage.setItem(
      `active_quiz_${sessionId}`,
      JSON.stringify({
        session,
        questions,
        currentIndex,
        answers: updatedAnswers,
      })
    );
  };

  // Handle Skip
  const handleSkip = () => {
    if (!currentQuestion || !session) return;
    const newAnswer: QuizAnswerState = {
      selectedIndex: null,
      status: 'skipped',
      timeSpentSec: (currentAnswer?.timeSpentSec || 0) + 2,
    };

    const updatedAnswers = { ...answers, [currentQuestion.id]: newAnswer };
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    const active = LocalAppStore.toggleBookmark(currentQuestion.id);
    if (active) {
      setBookmarkedIds((prev) => [...prev, currentQuestion.id]);
    } else {
      setBookmarkedIds((prev) => prev.filter((id) => id !== currentQuestion.id));
    }
  };

  // Final Submit Handler
  const handleSubmitQuiz = useCallback(() => {
    if (!session || questions.length === 0) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans || ans.selectedIndex === null || ans.status === 'skipped') {
        skippedCount++;
        LocalAppStore.recordAttempt(q.id, session.id, null, 'skipped', ans?.timeSpentSec || 0, session.kind);
      } else if (ans.selectedIndex === q.correct_index) {
        correctCount++;
        LocalAppStore.recordAttempt(q.id, session.id, ans.selectedIndex, 'correct', ans.timeSpentSec, session.kind);
      } else {
        incorrectCount++;
        LocalAppStore.recordAttempt(q.id, session.id, ans.selectedIndex, 'incorrect', ans.timeSpentSec, session.kind);
      }
    });

    // UPSC Score Formula: +2 per correct, -0.67 per incorrect
    const score = Number((correctCount * 2 - incorrectCount * 0.67).toFixed(2));

    // Save final session
    LocalAppStore.saveSession({
      kind: session.kind,
      mode: session.mode,
      subject_ids: session.subject_ids,
      question_count: questions.length,
      started_at: session.started_at,
      finished_at: new Date().toISOString(),
      score,
      correct: correctCount,
      incorrect: incorrectCount,
      skipped: skippedCount,
      time_taken_sec: elapsedSec,
    });

    // Clean active sessionStorage
    sessionStorage.removeItem(`active_quiz_${sessionId}`);

    // Navigate to summary
    router.push(`/quiz/summary/${sessionId}?score=${score}&c=${correctCount}&i=${incorrectCount}&s=${skippedCount}&t=${elapsedSec}`);
  }, [answers, elapsedSec, questions, router, session, sessionId]);

  // Desktop Keyboard Shortcuts (1-4/A-D, N, S, B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['1', 'a'].includes(key)) handleSelectOption(0);
      else if (['2', 'b'].includes(key)) handleSelectOption(1);
      else if (['3', 'c'].includes(key)) handleSelectOption(2);
      else if (['4', 'd'].includes(key)) handleSelectOption(3);
      else if (key === 'n' && currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
      else if (key === 's') handleSkip();
      else if (key === 'b') handleToggleBookmark();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length, handleSkip]);

  if (!currentQuestion || !session) {
    return (
      <div className="p-12 text-center text-muted animate-pulse">
        Loading quiz session...
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* TOP QUIZ HEADER */}
      <div className="card-burgundy p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-base font-bold text-foreground">
              {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-tint text-primary">
              {session.kind === 'smart' ? 'Smart Quiz' : 'Quiz'} ·{' '}
              {currentSubject?.name || 'Subject'} · {session.mode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* TIMER */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-muted bg-border/40 px-2 sm:px-2.5 py-1 rounded-lg">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {Math.floor(elapsedSec / 60)}:
                {String(elapsedSec % 60).padStart(2, '0')}
              </span>
            </div>

            {/* QUICK SUBMIT ON MOBILE */}
            <button
              onClick={handleSubmitQuiz}
              className="lg:hidden px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Submit
            </button>

            {/* EXIT BUTTON */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-xs font-semibold text-muted hover:text-error px-2 py-1 rounded-lg hover:bg-error-tint transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* THIN PROGRESS BAR */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: QUESTION CARD + PALETTE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* MAIN QUESTION DISPLAY (3 COLS) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-burgundy p-6 sm:p-8 space-y-6 relative">
            {/* BADGES & BOOKMARK ROW */}
            <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-primary-tint px-2.5 py-1 text-xs font-bold text-primary">
                  Q{currentIndex + 1}
                </span>
                <span className="rounded-md bg-border/40 px-2.5 py-1 text-xs font-semibold text-foreground">
                  {currentQuestion.topic}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    currentQuestion.priority === 1
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  P{currentQuestion.priority}
                </span>
              </div>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl transition-all ${
                  isBookmarked
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 fill-sky-600'
                    : 'text-muted hover:text-foreground hover:bg-border/40'
                }`}
                title="Toggle Bookmark"
              >
                <BookmarkIcon className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* QUESTION TEXT (STATEMENT PRESERVATION) */}
            <div className="space-y-3">
              <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed question-text-display">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* 4 OPTIONS LIST */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((optionText, idx) => {
                const letter = String.fromCharCode(97 + idx);
                const isSelected = currentAnswer?.selectedIndex === idx;
                const isCorrectIndex = idx === currentQuestion.correct_index;

                let optionStyle =
                  'border-border bg-surface hover:border-primary/50 text-foreground';

                if (session.mode === 'practice' && currentAnswer?.selectedIndex !== undefined) {
                  if (isCorrectIndex) {
                    optionStyle =
                      'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrectIndex) {
                    optionStyle =
                      'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/50 dark:text-rose-200 font-semibold';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'border-primary bg-primary-tint/40 text-primary font-semibold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="option-badge bg-border/50 text-foreground">
                        {letter}
                      </span>
                      <span className="text-sm">{optionText}</span>
                    </div>

                    {session.mode === 'practice' && currentAnswer?.selectedIndex !== undefined && (
                      <div>
                        {isCorrectIndex && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        )}
                        {isSelected && !isCorrectIndex && (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* PRACTICE MODE SOLUTION PANEL */}
            {session.mode === 'practice' && currentAnswer?.selectedIndex !== undefined && (
              <div className="mt-6 p-5 rounded-2xl bg-primary-tint/40 border border-primary/20 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-display text-sm font-bold text-primary flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" /> Solution & Explanation
                  </h3>
                  {currentQuestion.source && (
                    <span className="text-[11px] font-medium text-muted">
                      Source: {currentQuestion.source} ({currentQuestion.source_date || 'Recent'})
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {currentQuestion.explanation ||
                    `Correct option is (${String.fromCharCode(
                      97 + currentQuestion.correct_index
                    )}).`}
                </p>

                {previousAttemptState && previousAttemptState.times_seen > 0 && (
                  <div className="pt-2 text-[11px] font-medium text-muted border-t border-primary/10">
                    Last time attempted:{' '}
                    <span className="font-bold text-foreground">
                      {previousAttemptState.last_status?.toUpperCase()}
                    </span>{' '}
                    (Seen {previousAttemptState.times_seen} time
                    {previousAttemptState.times_seen === 1 ? '' : 's'})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 card-burgundy p-3.5 sm:p-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground border border-border hover:bg-border/40 disabled:opacity-40 transition-colors text-center"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSkip}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-muted border border-border hover:bg-border/40 text-center transition-colors"
              >
                Skip Question
              </button>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-40 shadow-sm text-center"
              >
                Save & Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* QUESTION PALETTE SIDEBAR (DESKTOP + MOBILE COLLAPSIBLE) */}
        <div className="lg:col-span-1 card-burgundy p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-sm font-bold text-foreground">
              Question Palette
            </h3>
            <span className="text-xs font-semibold text-muted">
              {answeredCount}/{questions.length}
            </span>
          </div>

          {/* PALETTE GRID */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isCurrent = idx === currentIndex;

              let btnStyle = 'border-border text-foreground bg-surface';
              if (session.mode === 'practice' && ans) {
                if (ans.status === 'correct') {
                  btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                } else if (ans.status === 'incorrect') {
                  btnStyle = 'border-rose-500 bg-rose-500 text-white font-bold';
                } else if (ans.status === 'skipped') {
                  btnStyle = 'border-dashed border-amber-500 text-amber-600 bg-amber-50/50';
                }
              } else if (session.mode === 'exam' && ans) {
                if (ans.selectedIndex !== null) {
                  btnStyle = 'border-sky-500 bg-sky-500 text-white font-bold';
                } else if (ans.status === 'skipped') {
                  btnStyle = 'border-dashed border-amber-500 text-amber-600';
                }
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${btnStyle} ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* PALETTE LEGEND */}
          <div className="space-y-1.5 pt-3 border-t border-border text-[11px] text-muted">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Correct
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" /> Incorrect
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-dashed border-amber-500" /> Skipped
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3">
            <button
              onClick={handleSubmitQuiz}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Submit Quiz Now
            </button>
          </div>
        </div>
      </div>

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="card-burgundy p-6 w-full max-w-sm space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              Exit Quiz?
            </h3>
            <p className="text-xs text-muted">
              Your answered questions will be recorded up to this point. Are you sure you want to quit?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-border/40"
              >
                Resume Quiz
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Submit & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
