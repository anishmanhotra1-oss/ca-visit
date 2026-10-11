'use client';

import React, { useState, useEffect } from 'react';
import { Question, Subject, QuestionState } from '@/lib/types';
import { LocalAppStore } from '@/lib/store';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  FolderInput,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import AddQuestionForm from './AddQuestionForm';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [states, setStates] = useState<Record<string, QuestionState>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [targetMoveSubjectId, setTargetMoveSubjectId] = useState('');

  const reloadData = () => {
    setQuestions(LocalAppStore.getQuestions());
    setSubjects(LocalAppStore.getSubjects());
    setStates(LocalAppStore.getQuestionStates());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtering Logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesSubject =
      subjectFilter === 'ALL' || q.subject_id === subjectFilter;
    const matchesPriority =
      priorityFilter === 'ALL' || q.priority === Number(priorityFilter);

    return matchesSearch && matchesSubject && matchesPriority;
  });

  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkSoftDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      confirm(
        `Move ${selectedIds.length} question(s) to 30-day Trash? You can restore them anytime.`
      )
    ) {
      LocalAppStore.bulkSoftDelete(selectedIds);
      setSelectedIds([]);
      reloadData();
    }
  };

  const handleBulkMove = () => {
    if (selectedIds.length === 0 || !targetMoveSubjectId) return;
    LocalAppStore.bulkMoveSubject(selectedIds, targetMoveSubjectId);
    setSelectedIds([]);
    setShowBulkMoveModal(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTERS BAR */}
      <div className="card-burgundy p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SEARCH INPUT */}
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search question text, topic, tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* SUBJECT FILTER */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Subjects ({questions.length})</option>
              {subjects.map((sub) => {
                const count = questions.filter(
                  (q) => q.subject_id === sub.id
                ).length;
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* PRIORITY FILTER */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Priority Levels</option>
              <option value="1">High Priority (1)</option>
              <option value="2">Mid Priority (2)</option>
              <option value="3">Low Priority (3)</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-primary-tint border border-primary/20 text-xs text-primary font-medium animate-fadeIn">
            <span className="font-semibold">{selectedIds.length} question(s) selected</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowBulkMoveModal(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-primary/30 hover:bg-surface/80"
              >
                <FolderInput className="h-3.5 w-3.5" /> Move Subject
              </button>
              <button
                onClick={handleBulkSoftDelete}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Move to Trash
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QUESTIONS GRID / LIST */}
      {paginatedQuestions.length === 0 ? (
        <div className="card-burgundy p-12 text-center space-y-3">
          <Filter className="h-10 w-10 text-muted mx-auto" />
          <h3 className="font-serif-display text-lg font-bold text-foreground">
            No questions match your filter
          </h3>
          <p className="text-xs text-muted">
            Try adjusting your search query or subject filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedIds.length > 0 &&
                  selectedIds.length === paginatedQuestions.length
                }
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span>Select Page ({paginatedQuestions.length})</span>
            </div>
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)} of{' '}
              {filteredQuestions.length}
            </span>
          </div>

          {paginatedQuestions.map((q) => {
            const subject = subjects.find((s) => s.id === q.subject_id);
            const st = states[q.id];
            const isSelected = selectedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`card-burgundy p-4 sm:p-5 space-y-3 transition-all ${
                  isSelected ? 'border-primary bg-primary-tint/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(q.id)}
                      className="h-4 w-4 rounded text-primary focus:ring-primary mt-0.5"
                    />
                    <span className="rounded-md bg-primary-tint px-2 py-0.5 text-[11px] font-bold text-primary">
                      {subject ? subject.code : 'SUB'}
                    </span>
                    <span className="text-xs font-semibold text-foreground bg-border/40 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        q.priority === 1
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : q.priority === 2
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      P{q.priority}
                    </span>
                  </div>

                  {/* EDIT & DELETE BUTTONS */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary-tint transition-colors"
                      title="Edit question"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Move question to 30-day Trash? You can restore it later.'
                          )
                        ) {
                          LocalAppStore.softDeleteQuestion(q.id);
                          reloadData();
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error-tint transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* QUESTION TEXT */}
                <p className="text-sm text-foreground question-text-display font-medium line-clamp-3">
                  {q.question_text}
                </p>

                {/* OPTIONS PREVIEW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-xs truncate ${
                        q.correct_index === idx
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-border/60 text-muted'
                      }`}
                    >
                      <span className="font-bold mr-1.5">
                        ({String.fromCharCode(97 + idx)})
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>

                {/* STATS & TAGS FOOTER */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Seen: {st ? st.times_seen : 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Wrong: {st ? st.times_wrong : 0}</span>
                    </div>
                  </div>

                  {q.tags && q.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-3 w-3" />
                      <span>{q.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-border/40 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-border/40 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 relative">
            <button
              onClick={() => setEditingQuestion(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface text-muted hover:text-foreground border border-border"
            >
              <X className="h-4 w-4" />
            </button>
            <AddQuestionForm
              editQuestion={editingQuestion}
              onSuccess={() => {
                setEditingQuestion(null);
                reloadData();
              }}
            />
          </div>
        </div>
      )}

      {/* BULK MOVE MODAL */}
      {showBulkMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="card-burgundy p-6 w-full max-w-md space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              Move {selectedIds.length} Question(s) to Subject
            </h3>
            <select
              value={targetMoveSubjectId}
              onChange={(e) => setTargetMoveSubjectId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select target subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkMoveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-border/40"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkMove}
                disabled={!targetMoveSubjectId}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50"
              >
                Move Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
