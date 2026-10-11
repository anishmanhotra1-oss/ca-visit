'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Subject, Question, SessionMode } from '@/lib/types';
import { LocalAppStore } from '@/lib/store';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Zap,
  HelpCircle,
} from 'lucide-react';

function QuizSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSmartMode = searchParams.get('mode') === 'smart';
  const prefilteredTopic = searchParams.get('topic') || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Step 2 Preferences
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [customCountInput, setCustomCountInput] = useState<string>('');
  const [mode, setMode] = useState<SessionMode>('practice');
  const [unseenOnly, setUnseenOnly] = useState<boolean>(!isSmartMode);

  useEffect(() => {
    const subs = LocalAppStore.getSubjects();
    const qList = LocalAppStore.getQuestions();
    setSubjects(subs);
    setAllQuestions(qList);

    // Default select all subjects
    setSelectedSubjectIds(subs.map((s) => s.id));
  }, [isSmartMode]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjectIds.length === subjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(subjects.map((s) => s.id));
    }
  };

  const matchingQuestions = isSmartMode
    ? LocalAppStore.selectSmartQuizQuestions({
        subjectIds: selectedSubjectIds,
        count: 999,
        topicFilter: prefilteredTopic || undefined,
      })
    : LocalAppStore.selectQuizQuestions({
        subjectIds: selectedSubjectIds,
        count: 999,
        unseenOnly,
        topicFilter: prefilteredTopic || undefined,
      });

  const availableCount = matchingQuestions.length;
  const targetCount = customCountInput
    ? Math.max(1, parseInt(customCountInput) || 10)
    : questionCount;
  const actualCount = Math.min(targetCount, availableCount);

  const handleStartQuiz = () => {
    if (actualCount === 0) return;

    const quizQuestions = isSmartMode
      ? LocalAppStore.selectSmartQuizQuestions({
          subjectIds: selectedSubjectIds,
          count: actualCount,
          topicFilter: prefilteredTopic || undefined,
        })
      : LocalAppStore.selectQuizQuestions({
          subjectIds: selectedSubjectIds,
          count: actualCount,
          unseenOnly,
          topicFilter: prefilteredTopic || undefined,
        });

    if (quizQuestions.length === 0) return;

    const session = LocalAppStore.saveSession({
      kind: isSmartMode ? 'smart' : 'quiz',
      mode,
      subject_ids: selectedSubjectIds,
      question_count: quizQuestions.length,
      started_at: new Date().toISOString(),
      correct: 0,
      incorrect: 0,
      skipped: 0,
      time_taken_sec: 0,
    });

    sessionStorage.setItem(
      `active_quiz_${session.id}`,
      JSON.stringify({
        session,
        questions: quizQuestions,
        currentIndex: 0,
        answers: {},
        startTime: Date.now(),
      })
    );

    router.push(`/quiz/${session.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* STEP INDICATOR HEADER */}
      <div className="card-burgundy p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                isSmartMode ? 'bg-amber-600 text-white' : 'bg-primary text-white'
              }`}
            >
              {isSmartMode ? <Zap className="h-4 w-4" /> : step}
            </span>
            <h1 className="font-serif-display text-lg font-bold text-foreground">
              {isSmartMode ? 'Smart Mistake Quiz Setup' : `Quiz Setup · Step ${step} of 2`}
            </h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-border/40 text-muted">
            {step === 1 ? 'Subject Selection' : 'Preferences'}
          </span>
        </div>

        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isSmartMode ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* STEP 1: SUBJECT SELECTION */}
      {step === 1 && (
        <div className="card-burgundy p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-serif-display text-base font-bold text-foreground">
                Select Subjects
              </h2>
              <p className="text-xs text-muted">
                {selectedSubjectIds.length} of {subjects.length} subjects selected
              </p>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {selectedSubjectIds.length === subjects.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((sub) => {
              const count = allQuestions.filter(
                (q) => q.subject_id === sub.id
              ).length;
              const isSelected = selectedSubjectIds.includes(sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-tint/30 shadow-xs'
                      : 'border-border bg-surface hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-border/60 text-muted'
                      }`}
                    >
                      {sub.code}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        {sub.name}
                      </h3>
                      <span className="text-[11px] text-muted">
                        {count} Question{count === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:bg-border/40 text-center transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={selectedSubjectIds.length === 0}
              onClick={() => setStep(2)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors disabled:opacity-40 shadow-sm text-center"
            >
              Next: Preferences
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PREFERENCES */}
      {step === 2 && (
        <div className="card-burgundy p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setQuestionCount(num);
                    setCustomCountInput('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    questionCount === num && !customCountInput
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-foreground hover:bg-border/30'
                  }`}
                >
                  {num}
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                value={customCountInput}
                onChange={(e) => setCustomCountInput(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all focus:outline-none ${
                  customCountInput
                    ? 'border-primary bg-primary-tint text-primary'
                    : 'border-border bg-surface text-foreground'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground">
              Quiz Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode('practice')}
                className={`p-4 rounded-xl border cursor-pointer space-y-1 transition-all ${
                  mode === 'practice'
                    ? 'border-primary bg-primary-tint/30'
                    : 'border-border bg-surface hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Practice Mode
                  </span>
                  {mode === 'practice' && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Lock option on click, highlight correct/wrong, and show instant explanation.
                </p>
              </div>

              <div
                onClick={() => setMode('exam')}
                className={`p-4 rounded-xl border cursor-pointer space-y-1 transition-all ${
                  mode === 'exam'
                    ? 'border-primary bg-primary-tint/30'
                    : 'border-border bg-surface hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Exam Mode
                  </span>
                  {mode === 'exam' && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Real test environment. Answers changeable, nothing revealed until final submit.
                </p>
              </div>
            </div>
          </div>

          {!isSmartMode && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Unseen Questions Only
                </span>
                <p className="text-[11px] text-muted">
                  Prioritize fresh questions you have never attempted before.
                </p>
              </div>
              <input
                type="checkbox"
                checked={unseenOnly}
                onChange={(e) => setUnseenOnly(e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-border/40 text-xs text-foreground flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted shrink-0" />
            {availableCount >= targetCount ? (
              <span>
                <strong>{availableCount}</strong> matching question
                {availableCount === 1 ? '' : 's'} available. Quiz will start with{' '}
                <strong>{actualCount}</strong>.
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-300">
                Only <strong>{availableCount}</strong> matching question
                {availableCount === 1 ? '' : 's'} available. We&apos;ll start with{' '}
                <strong>{availableCount}</strong>.
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:bg-border/40 text-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <button
              disabled={actualCount === 0}
              onClick={handleStartQuiz}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-40 shadow-sm text-center ${
                isSmartMode
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              Start Quiz ({actualCount})
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizSetupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted animate-pulse">Loading setup...</div>}>
      <QuizSetupContent />
    </Suspense>
  );
}
