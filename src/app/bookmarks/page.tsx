'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalAppStore } from '@/lib/store';
import { Question, Subject } from '@/lib/types';
import {
  Bookmark as BookmarkIcon,
  Search,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const reloadData = () => {
    const allQ = LocalAppStore.getQuestions();
    const subs = LocalAppStore.getSubjects();
    const bMarks = LocalAppStore.getBookmarks();
    const bIds = bMarks.map((b) => b.question_id);

    const bookmarked = allQ.filter((q) => bIds.includes(q.id));
    setBookmarkedQuestions(bookmarked);
    setSubjects(subs);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleRemoveBookmark = (id: string) => {
    LocalAppStore.toggleBookmark(id);
    reloadData();
  };

  const filteredBookmarks = bookmarkedQuestions.filter(
    (q) =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER HERO */}
      <div className="card-burgundy p-6 sm:p-8 bg-gradient-to-br from-sky-900 via-primary to-burgundy-900 text-white space-y-4 shadow-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <BookmarkIcon className="h-3.5 w-3.5 fill-sky-300 text-sky-300" />
              <span>Saved Revision Cards</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight">
              Bookmarks Hub
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Questions you starred during quizzes for quick reference and practice.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            {bookmarkedQuestions.length > 0 && (
              <Link
                href="/quiz/setup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105 text-center"
              >
                <Play className="h-4 w-4 fill-white" />
                Practice Bookmarks ({bookmarkedQuestions.length})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="card-burgundy p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search bookmarked questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* BOOKMARKED QUESTIONS LIST */}
      <div className="space-y-4">
        {filteredBookmarks.length === 0 ? (
          <div className="card-burgundy p-12 text-center space-y-3">
            <BookmarkIcon className="h-10 w-10 text-muted mx-auto" />
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              {bookmarkedQuestions.length === 0
                ? 'No bookmarks saved yet'
                : 'No matching bookmarks found'}
            </h3>
            <p className="text-xs text-muted">
              {bookmarkedQuestions.length === 0
                ? 'Tap the bookmark star icon on any question during a quiz to save it here.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : (
          filteredBookmarks.map((q) => {
            const sub = subjects.find((s) => s.id === q.subject_id);

            return (
              <div
                key={q.id}
                className="card-burgundy p-5 space-y-4 relative group"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2.5 py-0.5 text-xs font-bold">
                      {sub?.code || 'SUB'}
                    </span>
                    <span className="text-xs font-semibold text-foreground bg-border/40 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveBookmark(q.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* QUESTION TEXT */}
                <p className="text-sm font-medium text-foreground question-text-display">
                  {q.question_text}
                </p>

                {/* SOLUTION BOX */}
                <div className="p-3.5 rounded-xl bg-primary-tint/30 border border-primary/20 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Correct Answer: ({String.fromCharCode(97 + q.correct_index)}){' '}
                      {q.options[q.correct_index]}
                    </span>
                  </div>
                  {q.explanation && (
                    <p className="text-foreground/90 leading-relaxed text-[11px] pt-1">
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
