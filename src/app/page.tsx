'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Zap,
  AlertTriangle,
  Bookmark as BookmarkIcon,
  BarChart3,
  PlusCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { LocalAppStore } from '@/lib/store';
import { Question, QuestionState } from '@/lib/types';
import { AuthService, AuthUser } from '@/lib/auth';
import LandingPage from './landing/page';

export default function RootPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const u = AuthService.getCurrentUser();
    setUser(u);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsGuestMode(params.get('guest') === 'true');
    }
    setCheckedAuth(true);
  }, []);

  if (!checkedAuth) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-surface rounded-2xl border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-surface rounded-2xl border border-border" />
          <div className="h-44 bg-surface rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  const isLoggedIn = user && user.email !== 'aspirant@upsc-visit.local';

  // If visitor is NOT logged in and not in explicit guest preview mode, show Landing Page
  if (!isLoggedIn && !isGuestMode) {
    return <LandingPage />;
  }

  return <PracticeHomePage />;
}

function PracticeHomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [states, setStates] = useState<Record<string, QuestionState>>({});
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const qList = LocalAppStore.getQuestions();
    const qStates = LocalAppStore.getQuestionStates();
    const bMarks = LocalAppStore.getBookmarks();

    setQuestions(qList);
    setStates(qStates);
    setBookmarksCount(bMarks.length);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-surface rounded-2xl border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-surface rounded-2xl border border-border" />
          <div className="h-44 bg-surface rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  // Calculated Metrics
  const totalQuestions = questions.length;
  const mistakeCount = Object.values(states).filter(
    (st) => st.in_mistakes
  ).length;

  const attemptedQuestions = Object.values(states).filter(
    (st) => st.times_seen > 0
  );
  const totalCorrect = attemptedQuestions.reduce(
    (acc, st) => acc + st.times_correct,
    0
  );
  const totalSeen = attemptedQuestions.reduce(
    (acc, st) => acc + st.times_seen,
    0
  );
  const overallAccuracy =
    totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto">
      {/* WELCOME HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-burgundy-500 to-burgundy-700 p-6 sm:p-8 text-white shadow-glow">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Personal Question Bank</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight">
            Targeted UPSC & Current Affairs Revision
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Practice questions, review subject-wise mistakes, and clear weak topics with smart re-testing.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-white/90">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-amber-300">
                {totalQuestions}
              </span>
              <span>Total Questions</span>
            </div>
            <div className="w-px h-4 bg-white/20 self-center" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-rose-300">
                {mistakeCount}
              </span>
              <span>Active Mistakes</span>
            </div>
            <div className="w-px h-4 bg-white/20 self-center" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-emerald-300">
                {overallAccuracy}%
              </span>
              <span>Accuracy</span>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Backdrop Circle */}
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* CORE ACTION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. TAKE QUIZ CARD */}
        <div className="card-burgundy p-6 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-tint text-primary font-bold">
                <Play className="h-5 w-5 fill-primary" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-border/40 text-muted">
                {totalQuestions} Questions Available
              </span>
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-foreground">
                Take Quiz
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Filter by subject, choose practice or exam mode, and test unseen questions.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/quiz/setup"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-sm"
            >
              Start New Quiz
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 2. SMART QUIZ CARD */}
        <div className="card-burgundy p-6 flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                <Zap className="h-5 w-5 fill-amber-500" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Priority & Mistake Target
              </span>
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-foreground">
                Smart Quiz
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {mistakeCount === 0
                  ? 'Unlocks once you get a question wrong in a quiz session.'
                  : `Target your ${mistakeCount} active mistake${
                      mistakeCount === 1 ? '' : 's'
                    } prioritized by difficulty & recency.`}
              </p>
            </div>
          </div>

          <div className="pt-6">
            {mistakeCount === 0 ? (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-border/60 px-4 py-3 text-sm font-semibold text-muted cursor-not-allowed"
              >
                <Zap className="h-4 w-4 opacity-50" />
                Unlocks when mistakes occur
              </button>
            ) : (
              <Link
                href="/quiz/setup?mode=smart"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition-colors shadow-sm"
              >
                Start Smart Revision ({mistakeCount})
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* SECONDARY FEATURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 3. MISTAKES NOTEBOOK */}
        <Link
          href="/notebook"
          className="card-burgundy p-5 space-y-3 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold font-serif-display text-rose-600 dark:text-rose-400">
              {mistakeCount}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              Mistakes Notebook
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Review and resolve logged errors
            </p>
          </div>
        </Link>

        {/* 4. BOOKMARKS */}
        <Link
          href="/bookmarks"
          className="card-burgundy p-5 space-y-3 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              <BookmarkIcon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold font-serif-display text-sky-600 dark:text-sky-400">
              {bookmarksCount}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              Bookmarks
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Saved questions & solutions
            </p>
          </div>
        </Link>

        {/* 5. MEMORY HEATMAP */}
        <Link
          href="/heatmap"
          className="card-burgundy p-5 space-y-3 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold font-serif-display text-emerald-600 dark:text-emerald-400">
              {overallAccuracy}%
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              Memory Heatmap
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Topic strength & weak area focus
            </p>
          </div>
        </Link>
      </div>

      {/* 6. ADD & MANAGE QUESTIONS PROMINENT BANNER */}
      <div className="card-burgundy p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-surface to-primary-tint/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              My Question Bank & AI Bulk Import
            </h3>
          </div>
          <p className="text-xs text-muted max-w-xl">
            Add single MCQs manually or paste text/upload PDFs, DOCX, CSV & images. Gemini AI extracts structured questions automatically.
          </p>
        </div>

        <Link
          href="/add"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-semibold text-white transition-colors shrink-0 shadow-sm text-center"
        >
          Manage / Add Questions
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
