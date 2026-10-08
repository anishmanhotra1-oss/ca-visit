'use client';

import React, { useState, useEffect } from 'react';
import { Subject, Question } from '@/lib/types';
import { LocalAppStore } from '@/lib/store';
import {
  Upload,
  Sparkles,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ExtractedMCQ {
  tempId: string;
  topic: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation?: string;
  tags?: string[];
  priority: 1 | 2 | 3;
  subject_id: string;
  approved: boolean;
  isDuplicate: boolean;
}

export default function BulkImportPipeline() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [mode, setMode] = useState<'extract' | 'generate'>('extract');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [requestedCount, setRequestedCount] = useState<number>(5);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedList, setExtractedList] = useState<ExtractedMCQ[]>([]);

  useEffect(() => {
    const subs = LocalAppStore.getSubjects();
    setSubjects(subs);
    if (subs.length > 0) setSelectedSubjectId(subs[0].id);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const calculateTextHash = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!rawText.trim() && !selectedFile) {
      setErrorMsg('Please paste text or upload a document/image file.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('text', rawText);
      formData.append('count', requestedCount.toString());

      const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
      formData.append('subjectName', selectedSub?.name || 'Current Affairs');

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/ai/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to extract questions.');
      }

      // Check against existing question bank for duplicates
      const existingBank = LocalAppStore.getQuestions();
      const existingHashes = new Set(
        existingBank.map((q) => calculateTextHash(q.question_text))
      );

      const parsedItems: ExtractedMCQ[] = data.questions.map((q: any, idx: number) => {
        const hash = calculateTextHash(q.question_text);
        const isDuplicate = existingHashes.has(hash);

        return {
          tempId: `extracted-${Date.now()}-${idx}`,
          topic: q.topic || 'General Topic',
          question_text: q.question_text,
          options: q.options,
          correct_index: q.correct_index ?? 0,
          explanation: q.explanation || '',
          tags: q.tags || [],
          priority: q.priority || 2,
          subject_id: selectedSubjectId,
          approved: !isDuplicate, // Auto-approve non-duplicates
          isDuplicate,
        };
      });

      setExtractedList(parsedItems);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during AI extraction.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = (tempId: string) => {
    setExtractedList((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const handleDeleteItem = (tempId: string) => {
    setExtractedList((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleAddAllApproved = () => {
    const approvedItems = extractedList.filter((item) => item.approved);
    if (approvedItems.length === 0) return;

    approvedItems.forEach((item) => {
      LocalAppStore.addQuestion({
        subject_id: item.subject_id,
        topic: item.topic,
        question_text: item.question_text,
        options: item.options,
        correct_index: item.correct_index,
        explanation: item.explanation,
        tags: item.tags,
        priority: item.priority,
      });
    });

    LocalAppStore.addImportRecord(
      selectedFile ? selectedFile.name : 'Pasted Text Import',
      mode,
      approvedItems.length
    );

    alert(`Successfully added ${approvedItems.length} question(s) to your private bank!`);
    setExtractedList([]);
    setRawText('');
    setSelectedFile(null);
  };

  // CSV & JSON Template Downloads
  const downloadCsvTemplate = () => {
    const csvContent = `subject_code,topic,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,tags
ECO,Fiscal Policy,"With reference to expansionary fiscal policy, consider...",Increase spending,Cut taxes,Both 1 and 2,Neither,C,Detailed explanation...,UPSC,Economy`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ca_visit_question_template.csv';
    a.click();
  };

  const downloadJsonTemplate = () => {
    const jsonContent = JSON.stringify(
      [
        {
          subject_code: 'ECO',
          topic: 'Fiscal Policy',
          question_text: 'Consider the following statements...',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_index: 0,
          explanation: 'Detailed reasoning...',
          tags: ['UPSC', 'Economy'],
          priority: 2,
        },
      ],
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ca_visit_question_template.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TEMPLATE DOWNLOADS */}
      <div className="card-burgundy p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Bulk Import & Generation
          </h2>
          <p className="text-xs text-muted">
            Upload PDFs, DOCX, TXT, images or paste text. Gemini AI converts them into structured MCQs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:bg-border/40"
          >
            <Download className="h-3.5 w-3.5" /> CSV Template
          </button>
          <button
            onClick={downloadJsonTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:bg-border/40"
          >
            <Download className="h-3.5 w-3.5" /> JSON Template
          </button>
        </div>
      </div>

      {/* PIPELINE INPUT FORM */}
      {extractedList.length === 0 && (
        <form onSubmit={handleRunPipeline} className="card-burgundy p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* MODE SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setMode('extract')}
              className={`p-4 rounded-xl border cursor-pointer space-y-1 transition-all ${
                mode === 'extract'
                  ? 'border-primary bg-primary-tint/30'
                  : 'border-border bg-surface hover:border-border/80'
              }`}
            >
              <h3 className="font-bold text-xs text-foreground">
                (i) Extract Existing MCQs
              </h3>
              <p className="text-[11px] text-muted">
                Extracts test papers or documents that already contain MCQs, preserving exact wording.
              </p>
            </div>

            <div
              onClick={() => setMode('generate')}
              className={`p-4 rounded-xl border cursor-pointer space-y-1 transition-all ${
                mode === 'generate'
                  ? 'border-primary bg-primary-tint/30'
                  : 'border-border bg-surface hover:border-border/80'
              }`}
            >
              <h3 className="font-bold text-xs text-foreground">
                (ii) Generate MCQs from Notes
              </h3>
              <p className="text-[11px] text-muted">
                Generates fresh UPSC-style MCQs from raw articles, notes, or current affairs summaries.
              </p>
            </div>
          </div>

          {/* SUBJECT & COUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Default Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {mode === 'generate' && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Questions to Generate
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={requestedCount}
                  onChange={(e) => setRequestedCount(parseInt(e.target.value) || 5)}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground"
                />
              </div>
            )}
          </div>

          {/* FILE UPLOAD & PASTE AREA */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground">
              Upload Document / Image OR Paste Text Below
            </label>

            <div className="p-4 rounded-xl border-2 border-dashed border-border bg-surface/50 text-center space-y-2">
              <Upload className="h-8 w-8 text-muted mx-auto" />
              <div className="text-xs text-muted">
                {selectedFile ? (
                  <span className="font-bold text-primary">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                ) : (
                  <span>
                    Upload PDF, DOCX, TXT, CSV, JSON, or images (max 20 MB)
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.csv,.json,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-file-upload"
              />
              <label
                htmlFor="bulk-file-upload"
                className="inline-block px-4 py-2 rounded-xl bg-border/60 hover:bg-border text-xs font-semibold text-foreground cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>

            <textarea
              rows={5}
              placeholder="Or paste text material / test questions here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Processing with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run AI Extraction
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* REVIEW & APPROVAL SCREEN */}
      {extractedList.length > 0 && (
        <div className="space-y-6">
          <div className="card-burgundy p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-tint/30 border-primary/30">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-foreground">
                Review & Approve Questions ({extractedList.filter((i) => i.approved).length}/
                {extractedList.length} Approved)
              </h3>
              <p className="text-xs text-muted">
                Inspect, edit topic/options, or discard questions before appending to your bank.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExtractedList([])}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:bg-border/40"
              >
                Discard All
              </button>
              <button
                onClick={handleAddAllApproved}
                disabled={extractedList.filter((i) => i.approved).length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
              >
                <Check className="h-4 w-4 stroke-[3]" /> Add Approved to Bank
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {extractedList.map((item, idx) => (
              <div
                key={item.tempId}
                className={`card-burgundy p-5 space-y-3 transition-all ${
                  item.approved ? 'border-emerald-300' : 'opacity-60 border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleApproval(item.tempId)}
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                        item.approved
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-border bg-transparent'
                      }`}
                    >
                      {item.approved && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-xs font-bold text-foreground bg-border/40 px-2 py-0.5 rounded-md">
                      {item.topic}
                    </span>

                    {item.isDuplicate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                        <AlertTriangle className="h-3 w-3" /> Duplicate Warning
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.tempId)}
                    className="p-1 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-foreground question-text-display">
                  {item.question_text}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-lg border ${
                        item.correct_index === optIdx
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-border/60 text-muted'
                      }`}
                    >
                      ({String.fromCharCode(97 + optIdx)}) {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
