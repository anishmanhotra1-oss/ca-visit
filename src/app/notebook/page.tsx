'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalAppStore } from '@/lib/store';
import { Question, Subject, QuestionState } from '@/lib/types';
import {
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
  RotateCcw,
} from 'lucide-react';

export default function MistakesNotebookPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [states, setStates] = useState<Record<string, QuestionState>>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(LocalAppStore.getQuestions());
    setSubjects(LocalAppStore.getSubjects());
    setStates(LocalAppStore.getQuestionStates());
  }, []);

  // Filter questions that are currently in_mistakes = true
  const mistakeQuestions = questions.filter((q) => {
    const st = states[q.id];
    return st && st.in_mistakes;
  });

  const filteredMistakes =
    selectedSubjectId === 'ALL'
      ? mistakeQuestions
      : mistakeQuestions.filter((q) => q.subject_id === selectedSubjectId);

  // Group mistakes by subject
  const subjectMistakeCounts: Record<string, number> = {};
  mistakeQuestions.forEach((q) => {
    subjectMistakeCounts[q.subject_id] = (subjectMistakeCounts[q.subject_id] || 0) + 1;
  });

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto pb-12">
      {/* HEADER HERO */}
      <div className="card-burgundy p-6 sm:p-8 bg-gradient-to-br from-rose-900 via-burgundy-700 to-burgundy-900 text-white space-y-4 shadow-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
              <span>Targeted Weak Area Revision</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight">
              Personal Mistakes Notebook
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Questions you answer wrong stay here until cleared via a Smart Quiz.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            {mistakeQuestions.length === 0 ? (
              <button
                disabled
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 text-white/50 text-xs font-bold cursor-not-allowed border border-white/10 text-center"
              >
                No active mistakes! 🎉
              </button>
            ) : (
              <Link
                href="/quiz/setup?mode=smart"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105 text-center"
              >
                <Zap className="h-4 w-4 fill-white" />
                Start Smart Quiz ({mistakeQuestions.length})
              </Link>
            )}
          </div>
        </div>

        {/* RULE BANNER */}
        <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white/90 flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-300" />
          <span>
            <strong>Mistake Clearing Rule:</strong> Answering a mistake correctly in a normal practice session will <em>not</em> remove it from this notebook. It is removed ONLY when you answer it correctly during a <strong>Smart Quiz</strong>.
          </span>
        </div>
      </div>

      {/* SUBJECT FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubjectId('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedSubjectId === 'ALL'
              ? 'border-primary bg-primary text-white shadow-xs'
              : 'border-border bg-surface text-foreground hover:bg-border/40'
          }`}
        >
          All Mistakes ({mistakeQuestions.length})
        </button>

        {subjects.map((sub) => {
          const count = subjectMistakeCounts[sub.id] || 0;
          if (count === 0) return null;

          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedSubjectId === sub.id
                  ? 'border-primary bg-primary text-white shadow-xs'
                  : 'border-border bg-surface text-foreground hover:bg-border/40'
              }`}
            >
              <span>{sub.name}</span>
              <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUBJECT CARDS GRID */}
      {selectedSubjectId === 'ALL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const count = subjectMistakeCounts[sub.id] || 0;
            const isExpanded = expandedSubjectId === sub.id;

            return (
              <div
                key={sub.id}
                className={`card-burgundy p-5 space-y-4 transition-all ${
                  count > 0
                    ? 'border-rose-200 dark:border-rose-900 hover:shadow-md'
                    : 'opacity-60 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                      count > 0
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-border/50 text-muted'
                    }`}
                  >
                    {sub.code}
                  </span>
                  <span
                    className={`text-xl font-bold font-serif-display ${
                      count > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-display font-bold text-sm text-foreground">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {count === 0
                      ? 'No active mistakes'
                      : `${count} question${count === 1 ? '' : 's'} to fix`}
                  </p>
                </div>

                <div className="pt-2">
                  {count === 0 ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-border/40 text-muted text-xs font-semibold cursor-not-allowed"
                    >
                      No Mistakes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/quiz/setup?mode=smart`}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                      >
                        <Zap className="h-3.5 w-3.5" /> Smart Quiz
                      </Link>
                      <button
                        onClick={() =>
                          setExpandedSubjectId(isExpanded ? null : sub.id)
                        }
                        className="p-2 rounded-xl border border-border hover:bg-border/40 text-muted"
                        title="Toggle mistake list"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED MISTAKE QUESTION LIST */}
      <div className="space-y-4 pt-4">
        <h2 className="font-serif-display text-lg font-bold text-foreground">
          {selectedSubjectId === 'ALL'
            ? 'All Logged Mistakes'
            : `${
                subjects.find((s) => s.id === selectedSubjectId)?.name
              } Mistakes`}
        </h2>

        {filteredMistakes.length === 0 ? (
          <div className="card-burgundy p-12 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              No mistakes in this section!
            </h3>
            <p className="text-xs text-muted">
              Great job! Take a new quiz to discover areas to improve.
            </p>
          </div>
        ) : (
          filteredMistakes.map((q, idx) => {
            const sub = subjects.find((s) => s.id === q.subject_id);
            const st = states[q.id];

            return (
              <div
                key={q.id}
                className="card-burgundy p-5 space-y-4 border-l-4 border-l-rose-500"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
                      {sub?.code || 'SUB'}
                    </span>
                    <span className="text-xs font-semibold text-foreground bg-border/40 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-md">
                      P{q.priority}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    Failed {st?.times_wrong || 1} time
                    {st?.times_wrong === 1 ? '' : 's'}
                  </span>
                </div>

                {/* QUESTION TEXT */}
                <p className="text-sm font-medium text-foreground question-text-display">
                  {q.question_text}
                </p>

                {/* CORRECT ANSWER HIGHLIGHT */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Correct Answer: ({String.fromCharCode(97 + q.correct_index)}){' '}
                      {q.options[q.correct_index]}
                    </span>
                  </div>
                  {q.explanation && (
                    <p className="text-emerald-900 dark:text-emerald-200/90 leading-relaxed text-[11px] pt-1 border-t border-emerald-200/50">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
