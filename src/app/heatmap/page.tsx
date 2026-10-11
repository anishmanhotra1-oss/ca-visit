'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalAppStore } from '@/lib/store';
import { Question, Subject, QuestionState } from '@/lib/types';
import {
  BarChart3,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Layers,
  Users,
  Search,
  Filter,
} from 'lucide-react';

interface TopicMetric {
  topic: string;
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  status: 'strong' | 'average' | 'weak' | 'unattempted';
  questionsCount: number;
}

interface SubjectMetric {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  status: 'strong' | 'average' | 'weak' | 'unattempted';
  topicsCount: number;
  questionsCount: number;
}

export default function MemoryHeatmapPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [states, setStates] = useState<Record<string, QuestionState>>({});
  const [groupBy, setGroupBy] = useState<'topic' | 'subject'>('topic');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUnattempted, setShowUnattempted] = useState(true);

  useEffect(() => {
    setQuestions(LocalAppStore.getQuestions());
    setSubjects(LocalAppStore.getSubjects());
    setStates(LocalAppStore.getQuestionStates());
  }, []);

  // Compute metrics per topic
  const topicMap: Record<
    string,
    { topic: string; subjectId: string; seen: number; correct: number; questionsCount: number }
  > = {};

  questions.forEach((q) => {
    const key = q.topic.trim();
    const st = states[q.id];
    if (!topicMap[key]) {
      topicMap[key] = {
        topic: key,
        subjectId: q.subject_id,
        seen: 0,
        correct: 0,
        questionsCount: 0,
      };
    }
    topicMap[key].questionsCount++;
    if (st && st.times_seen > 0) {
      topicMap[key].seen += st.times_seen;
      topicMap[key].correct += st.times_correct;
    }
  });

  const topicMetrics: TopicMetric[] = Object.values(topicMap).map((item) => {
    const sub = subjects.find((s) => s.id === item.subjectId);
    const accuracy = item.seen > 0 ? Math.round((item.correct / item.seen) * 100) : 0;

    let status: 'strong' | 'average' | 'weak' | 'unattempted' = 'unattempted';
    if (item.seen > 0) {
      if (accuracy >= 70) status = 'strong';
      else if (accuracy >= 50) status = 'average';
      else status = 'weak';
    }

    return {
      topic: item.topic,
      subjectId: item.subjectId,
      subjectName: sub ? sub.name : 'General',
      totalAttempts: item.seen,
      correctAttempts: item.correct,
      accuracy,
      status,
      questionsCount: item.questionsCount,
    };
  });

  // Compute metrics per subject
  const subjectMap: Record<
    string,
    { subjectId: string; subjectName: string; seen: number; correct: number; questionsCount: number; topics: Set<string> }
  > = {};

  subjects.forEach((sub) => {
    subjectMap[sub.id] = {
      subjectId: sub.id,
      subjectName: sub.name,
      seen: 0,
      correct: 0,
      questionsCount: 0,
      topics: new Set(),
    };
  });

  questions.forEach((q) => {
    const st = states[q.id];
    if (!subjectMap[q.subject_id]) {
      const sub = subjects.find((s) => s.id === q.subject_id);
      subjectMap[q.subject_id] = {
        subjectId: q.subject_id,
        subjectName: sub ? sub.name : 'General',
        seen: 0,
        correct: 0,
        questionsCount: 0,
        topics: new Set(),
      };
    }
    subjectMap[q.subject_id].questionsCount++;
    if (q.topic) subjectMap[q.subject_id].topics.add(q.topic.trim());

    if (st && st.times_seen > 0) {
      subjectMap[q.subject_id].seen += st.times_seen;
      subjectMap[q.subject_id].correct += st.times_correct;
    }
  });

  const subjectMetrics: SubjectMetric[] = Object.values(subjectMap).map((item) => {
    const accuracy = item.seen > 0 ? Math.round((item.correct / item.seen) * 100) : 0;
    let status: 'strong' | 'average' | 'weak' | 'unattempted' = 'unattempted';
    if (item.seen > 0) {
      if (accuracy >= 70) status = 'strong';
      else if (accuracy >= 50) status = 'average';
      else status = 'weak';
    }
    return {
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      totalAttempts: item.seen,
      correctAttempts: item.correct,
      accuracy,
      status,
      topicsCount: item.topics.size,
      questionsCount: item.questionsCount,
    };
  });

  // Calculate overall metrics for attempted items
  const attemptedTopicMetrics = topicMetrics.filter((t) => t.totalAttempts > 0);
  const strongCount = attemptedTopicMetrics.filter((t) => t.status === 'strong').length;
  const averageCount = attemptedTopicMetrics.filter((t) => t.status === 'average').length;
  const weakCount = attemptedTopicMetrics.filter((t) => t.status === 'weak').length;

  // Weakest topics for "Focus Next" cards
  const focusNextTopics = [...attemptedTopicMetrics]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Filter topics for the grid
  const filteredTopicMetrics = topicMetrics.filter((item) => {
    if (!showUnattempted && item.totalAttempts === 0) return false;
    if (selectedSubjectId !== 'all' && item.subjectId !== selectedSubjectId) return false;
    if (
      searchQuery.trim() !== '' &&
      !item.topic.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter subjects for grid
  const filteredSubjectMetrics = subjectMetrics.filter((item) => {
    if (!showUnattempted && item.totalAttempts === 0) return false;
    if (selectedSubjectId !== 'all' && item.subjectId !== selectedSubjectId) return false;
    if (
      searchQuery.trim() !== '' &&
      !item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto pb-12">
      {/* HEADER HERO */}
      <div className="card-burgundy p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-burgundy-900 to-burgundy-950 text-white space-y-4 shadow-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-300" />
              <span>Retention & Mastery Analytics</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight">
              Memory Heatmap
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Visual retention matrix color-coded dynamically by topic accuracy result.
            </p>
          </div>

          <div className="flex items-center justify-around w-full sm:w-auto gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 text-xs shrink-0">
            <div>
              <span className="text-emerald-300 font-bold text-lg">{strongCount}</span>
              <p className="text-[10px] text-white/70">Strong (&ge;70%)</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <span className="text-amber-300 font-bold text-lg">{averageCount}</span>
              <p className="text-[10px] text-white/70">Average (50-69%)</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <span className="text-rose-300 font-bold text-lg">{weakCount}</span>
              <p className="text-[10px] text-white/70">Weak (&lt;50%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOCUS NEXT RECOMMENDATION CARDS */}
      <div className="card-burgundy p-6 space-y-4 bg-gradient-to-r from-surface to-rose-50/20 dark:to-rose-950/20 border-rose-200/60 dark:border-rose-900/60">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <h2 className="font-serif-display text-lg font-bold text-foreground">
            Focus Next: Priority Target Topics
          </h2>
        </div>
        <p className="text-xs text-muted">
          One-tap Smart Quiz links targeting your weakest topics with low accuracy.
        </p>

        {focusNextTopics.length === 0 ? (
          <div className="p-4 rounded-xl bg-border/40 text-xs text-muted">
            Take a few more quizzes to unlock personalized topic recommendations!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {focusNextTopics.map((item) => (
              <div
                key={item.topic}
                className="p-4 rounded-xl border border-rose-200 bg-surface dark:bg-surface dark:border-rose-900 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                      {item.subjectName}
                    </span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {item.accuracy}%
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-foreground mt-1">
                    {item.topic}
                  </h3>
                  <p className="text-[10px] text-muted mt-0.5">
                    {item.correctAttempts}/{item.totalAttempts} correct answers
                  </p>
                </div>

                <Link
                  href={`/quiz/setup?mode=smart&topic=${encodeURIComponent(item.topic)}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                >
                  <Zap className="h-3 w-3 fill-white" /> Smart Quiz ({item.topic})
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HEATMAP MATRIX & TOGGLES */}
      <div className="card-burgundy p-6 space-y-6">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              {groupBy === 'topic' ? 'Topic Strength Matrix' : 'Subject Strength Matrix'}
            </h2>
            <p className="text-xs text-muted">
              Color coding reflects accuracy results for all attempted items.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Group Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-border/40 border border-border text-xs font-medium">
              <button
                type="button"
                onClick={() => setGroupBy('topic')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  groupBy === 'topic'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                By Topic
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('subject')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  groupBy === 'subject'
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                By Subject
              </button>
            </div>

            {/* Subject Filter */}
            {groupBy === 'topic' && (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="input-burgundy text-xs py-1.5 px-2.5 max-w-[150px]"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}

            {/* Show Unattempted Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={showUnattempted}
                onChange={(e) => setShowUnattempted(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-muted">Show Unattempted</span>
            </label>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder={groupBy === 'topic' ? "Search topic or subject..." : "Search subject..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-burgundy pl-9 text-xs py-2 w-full"
          />
        </div>

        {/* HEATMAP GRID MATRIX - TOPIC VIEW */}
        {groupBy === 'topic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTopicMetrics.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-muted bg-border/20 rounded-xl">
                No topic metrics matching your search or filters.
              </div>
            ) : (
              filteredTopicMetrics.map((item) => {
                let cardStyle =
                  'border-dashed border-border bg-border/20 text-muted';
                let statusLabel = 'Unattempted';
                let badgeStyle = 'bg-border/40 text-muted';

                if (item.status === 'strong') {
                  cardStyle =
                    'border-emerald-300/80 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/30 text-emerald-950 dark:text-emerald-100 shadow-xs';
                  statusLabel = 'Strong';
                  badgeStyle = 'bg-emerald-600 text-white dark:bg-emerald-500';
                } else if (item.status === 'average') {
                  cardStyle =
                    'border-amber-300/80 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 text-amber-950 dark:text-amber-100 shadow-xs';
                  statusLabel = 'Average';
                  badgeStyle = 'bg-amber-600 text-white dark:bg-amber-500';
                } else if (item.status === 'weak') {
                  cardStyle =
                    'border-rose-300/80 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-rose-100/60 dark:from-rose-950/40 dark:to-rose-900/30 text-rose-950 dark:text-rose-100 shadow-xs';
                  statusLabel = 'Weak';
                  badgeStyle = 'bg-rose-600 text-white dark:bg-rose-500';
                }

                return (
                  <div
                    key={item.topic}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] ${cardStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 truncate">
                          {item.subjectName}
                        </span>
                        {item.totalAttempts > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}
                          >
                            {item.accuracy}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs truncate mt-1 leading-snug">
                        {item.topic}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-[10px] opacity-80">
                        {item.totalAttempts === 0
                          ? `${item.questionsCount} question${item.questionsCount === 1 ? '' : 's'}`
                          : `${item.correctAttempts}/${item.totalAttempts} correct`}
                      </span>
                      <span className="font-bold text-[11px]">
                        {item.totalAttempts === 0 ? '0 Attempts' : statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* HEATMAP GRID MATRIX - SUBJECT VIEW */}
        {groupBy === 'subject' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSubjectMetrics.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-muted bg-border/20 rounded-xl">
                No subject metrics matching your search or filters.
              </div>
            ) : (
              filteredSubjectMetrics.map((item) => {
                let cardStyle =
                  'border-dashed border-border bg-border/20 text-muted';
                let statusLabel = 'Unattempted';
                let badgeStyle = 'bg-border/40 text-muted';

                if (item.status === 'strong') {
                  cardStyle =
                    'border-emerald-300/80 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/30 text-emerald-950 dark:text-emerald-100 shadow-xs';
                  statusLabel = 'Strong';
                  badgeStyle = 'bg-emerald-600 text-white dark:bg-emerald-500';
                } else if (item.status === 'average') {
                  cardStyle =
                    'border-amber-300/80 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 text-amber-950 dark:text-amber-100 shadow-xs';
                  statusLabel = 'Average';
                  badgeStyle = 'bg-amber-600 text-white dark:bg-amber-500';
                } else if (item.status === 'weak') {
                  cardStyle =
                    'border-rose-300/80 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-rose-100/60 dark:from-rose-950/40 dark:to-rose-900/30 text-rose-950 dark:text-rose-100 shadow-xs';
                  statusLabel = 'Weak';
                  badgeStyle = 'bg-rose-600 text-white dark:bg-rose-500';
                }

                return (
                  <div
                    key={item.subjectId}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] ${cardStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {item.topicsCount} Topics
                        </span>
                        {item.totalAttempts > 0 && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeStyle}`}
                          >
                            {item.accuracy}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm truncate mt-1">
                        {item.subjectName}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs">
                      <span className="font-medium opacity-80">
                        {item.totalAttempts === 0
                          ? `${item.questionsCount} total questions`
                          : `${item.correctAttempts}/${item.totalAttempts} correct`}
                      </span>
                      <span className="font-bold">{statusLabel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* LEGEND */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-emerald-500" />
            <span>Strong (&ge; 70% Accuracy)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-amber-500" />
            <span>Average (50–69% Accuracy)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-rose-500" />
            <span>Weak (&lt; 50% Accuracy)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-dashed border-border bg-border/20" />
            <span>Unattempted (0 Attempts)</span>
          </div>
        </div>
      </div>

      {/* PEER COMPARISON PLACEHOLDER BANNER */}
      <div className="card-burgundy p-5 bg-border/20 border-border text-xs text-muted flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Peer Comparison (&quot;Questions that impacted your score&quot;)</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-border text-foreground font-semibold">
          Needs more data
        </span>
      </div>
    </div>
  );
}

