'use client';

import React, { useState, useEffect } from 'react';
import { Subject, PriorityLevel, DifficultyLevel, Question } from '@/lib/types';
import { LocalAppStore } from '@/lib/store';
import { CheckCircle2, Plus, AlertCircle, Save } from 'lucide-react';

interface AddQuestionFormProps {
  onSuccess?: (newQ: Question) => void;
  editQuestion?: Question;
}

export default function AddQuestionForm({
  onSuccess,
  editQuestion,
}: AddQuestionFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [sourceDate, setSourceDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(2);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const subs = LocalAppStore.getSubjects();
    setSubjects(subs);
    if (subs.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subs[0].id);
    }

    if (editQuestion) {
      setSelectedSubjectId(editQuestion.subject_id);
      setTopic(editQuestion.topic);
      setQuestionText(editQuestion.question_text);
      setOptions(editQuestion.options);
      setCorrectIndex(editQuestion.correct_index);
      setExplanation(editQuestion.explanation || '');
      setTags(editQuestion.tags ? editQuestion.tags.join(', ') : '');
      setSource(editQuestion.source || '');
      setSourceDate(editQuestion.source_date || '');
      setPriority(editQuestion.priority);
      setDifficulty(editQuestion.difficulty || 2);
    }
  }, [editQuestion]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;
    const created = LocalAppStore.addSubject(
      newSubjectName.trim(),
      newSubjectCode.trim()
    );
    setSubjects(LocalAppStore.getSubjects());
    setSelectedSubjectId(created.id);
    setNewSubjectName('');
    setNewSubjectCode('');
    setShowAddSubjectModal(false);
  };

  const handleSubmit = (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!selectedSubjectId) {
      setErrorMsg('Please select a subject.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('Please specify a topic (e.g. "Fiscal Policy").');
      return;
    }
    if (!questionText.trim()) {
      setErrorMsg('Please enter the question text.');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setErrorMsg('All 4 options must be filled out.');
      return;
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const questionData = {
      subject_id: selectedSubjectId,
      topic: topic.trim(),
      question_text: questionText.trim(),
      options: options.map((opt) => opt.trim()) as [
        string,
        string,
        string,
        string
      ],
      correct_index: correctIndex,
      explanation: explanation.trim() || undefined,
      tags: tagList,
      source: source.trim() || undefined,
      source_date: sourceDate || undefined,
      priority,
      difficulty,
    };

    if (editQuestion) {
      const updated = LocalAppStore.updateQuestion(editQuestion.id, questionData);
      if (updated && onSuccess) onSuccess(updated);
      setSuccessMsg('Question updated successfully!');
    } else {
      const created = LocalAppStore.addQuestion(questionData);
      setSuccessMsg('Question saved to your private bank!');
      if (onSuccess) onSuccess(created);

      if (addAnother) {
        setQuestionText('');
        setOptions(['', '', '', '']);
        setExplanation('');
        // Keep subject, topic, tags, source intact for quick batch creation!
      }
    }
  };

  return (
    <div className="card-burgundy p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="font-serif-display text-xl font-bold text-foreground">
            {editQuestion ? 'Edit Question' : 'Add Single Question'}
          </h2>
          <p className="text-xs text-muted">
            Every question you add is PRIVATE to your personal bank.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-error-tint p-4 text-xs font-semibold text-error border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-success-tint p-4 text-xs font-semibold text-success border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* SUBJECT & TOPIC ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subject *
              </label>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Custom Subject
              </button>
            </div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Major Crops, Fiscal Policy, ECI"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* QUESTION TEXT */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Question Text * (Preserves statement line breaks)
          </label>
          <textarea
            rows={4}
            placeholder={`Consider the following statements:\n1. Statement one...\n2. Statement two...\nWhich of the statements given above is/are correct?`}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 question-text-display"
          />
        </div>

        {/* 4 OPTIONS WITH CORRECT OPTION RADIO */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-foreground">
            Options & Correct Answer Selection *
          </label>
          {['A', 'B', 'C', 'D'].map((letter, idx) => (
            <div
              key={letter}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                correctIndex === idx
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-border bg-surface'
              }`}
            >
              <input
                type="radio"
                name="correctOption"
                checked={correctIndex === idx}
                onChange={() => setCorrectIndex(idx)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="option-badge bg-border/60 text-foreground">
                {letter}
              </span>
              <input
                type="text"
                placeholder={`Option (${letter}) text`}
                value={options[idx]}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
              />
              {correctIndex === idx && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  CORRECT ANSWER
                </span>
              )}
            </div>
          ))}
        </div>

        {/* EXPLANATION */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Explanation / Solution Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Detailed reasoning why the correct option is right..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* METADATA: PRIORITY, TAGS, SOURCE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as PriorityLevel)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={1}>High Priority (1)</option>
              <option value={2}>Mid Priority (2)</option>
              <option value={3}>Low Priority (3)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Budget 2026, Prelims"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Source & Date
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="The Hindu / PIB"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                className="rounded-xl border border-border bg-surface px-2 py-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
          {!editQuestion && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2.5 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary-tint transition-colors"
            >
              Save & Add Another
            </button>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            {editQuestion ? 'Update Question' : 'Save Question'}
          </button>
        </div>
      </form>

      {/* CUSTOM SUBJECT MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="card-burgundy p-6 w-full max-w-md space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-foreground">
              Add Custom Subject
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Governance & Ethics"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Short Code (2–4 chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GOV"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-border/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSubject}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
