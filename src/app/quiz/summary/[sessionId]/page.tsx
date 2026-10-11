'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { LocalAppStore } from '@/lib/store';
import { Question, Subject, Session } from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  Zap,
} from 'lucide-react';

function SessionSummaryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;

  const score = parseFloat(searchParams.get('score') || '0');
  const correctCount = parseInt(searchParams.get('c') || '0');
  const incorrectCount = parseInt(searchParams.get('i') || '0');
  const skippedCount = parseInt(searchParams.get('s') || '0');
  const timeTakenSec = parseInt(searchParams.get('t') || '0');

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sessions = LocalAppStore.getSessions();
    const currentSess = sessions.find((s) => s.id === sessionId);

    if (currentSess) {
      setSession(currentSess);
    }
  }, [sessionId]);

  const totalQuestions = correctCount + incorrectCount + skippedCount || 1;
  const maxScore = totalQuestions * 2;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="card-burgundy p-6 sm:p-8 bg-gradient-to-br from-surface to-primary-tint/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="font-serif-display text-2xl font-bold tracking-tight text-foreground">
              Session Performance Summary
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-bold text-primary">
              {session?.kind === 'smart' ? 'Smart Quiz' : 'Standard Quiz'}
            </span>
            <span className="rounded-full bg-border/40 px-3 py-1 text-xs font-semibold text-muted">
              {session?.mode.toUpperCase()} MODE
            </span>
          </div>
        </div>

        {/* MISTAKES LOGGED BANNER */}
        {incorrectCount > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                <strong>{incorrectCount}</strong> incorrect question
                {incorrectCount === 1 ? '' : 's'} added to your{' '}
                <strong>Mistake Notebook</strong>. They will stay until you answer
                them correctly in a Smart Quiz.
              </span>
            </div>
            <Link
              href="/notebook"
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
            >
              Open Notebook
            </Link>
          </div>
        )}
      </div>

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* SCORE CARD */}
        <div className="card-burgundy p-5 border-l-4 border-l-primary space-y-1">
          <span className="text-xs font-semibold text-muted">UPSC Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-serif-display text-primary">
              {score}
            </span>
            <span className="text-xs text-muted">/ {maxScore}</span>
          </div>
        </div>

        {/* CORRECT CARD */}
        <div className="card-burgundy p-5 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-muted">Correct</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-serif-display text-emerald-600 dark:text-emerald-400">
              {correctCount}
            </span>
            <span className="text-xs text-muted">/ {totalQuestions}</span>
          </div>
        </div>

        {/* INCORRECT CARD */}
        <div className="card-burgundy p-5 border-l-4 border-l-rose-500 space-y-1">
          <span className="text-xs font-semibold text-muted">Incorrect</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-serif-display text-rose-600 dark:text-rose-400">
              {incorrectCount}
            </span>
            <span className="text-xs text-muted">/ {totalQuestions}</span>
          </div>
        </div>

        {/* ACCURACY & TIME CARD */}
        <div className="card-burgundy p-5 border-l-4 border-l-sky-500 space-y-1">
          <span className="text-xs font-semibold text-muted">Accuracy & Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif-display text-sky-600 dark:text-sky-400">
              {accuracy}%
            </span>
            <span className="text-xs font-mono text-muted">
              {Math.floor(timeTakenSec / 60)}m {timeTakenSec % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* PERFORMANCE WARNING IF ACCURACY < 50% */}
      {accuracy < 50 && (
        <div className="card-burgundy p-4 bg-amber-50/60 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Your performance in this quiz session needs improvement (&lt; 50% accuracy). Consider running a targeted <strong>Smart Quiz</strong> on weak topics!
          </span>
        </div>
      )}

      {/* BOTTOM NAVIGATION ACTIONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 card-burgundy p-4 sm:p-5">
        <Link
          href="/"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-border/40 transition-colors text-center"
        >
          Back to Practice Home
        </Link>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link
            href="/quiz/setup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-sm text-center"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Start Another Quiz
          </Link>

          {incorrectCount > 0 && (
            <Link
              href="/quiz/setup?mode=smart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm text-center"
            >
              <Zap className="h-3.5 w-3.5" /> Start Smart Revision
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SessionSummaryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted animate-pulse">Loading summary...</div>}>
      <SessionSummaryContent />
    </Suspense>
  );
}
