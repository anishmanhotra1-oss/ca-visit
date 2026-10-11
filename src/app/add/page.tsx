'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Sparkles, ListFilter, Lock, ShieldCheck } from 'lucide-react';
import AddQuestionForm from '@/components/AddQuestionForm';
import ManageQuestions from '@/components/ManageQuestions';
import BulkImportPipeline from '@/components/BulkImportPipeline';
import AdminPasscodeModal from '@/components/AdminPasscodeModal';
import { isAdminUnlocked, setAdminUnlocked } from '@/lib/adminAuth';

export default function AddQuestionsPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'bulk' | 'manage'>('add');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setIsUnlocked(isAdminUnlocked());
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return (
      <div className="p-12 text-center text-muted animate-pulse">
        Checking Admin Authorization...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto">
      {/* ADMIN SECURITY LOCK MODAL */}
      {!isUnlocked && (
        <AdminPasscodeModal onSuccess={() => setIsUnlocked(true)} />
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif-display text-xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Question Bank & Add Questions
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Admin Unlocked
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Questions added are private to your personal bank and never shared with other users.
          </p>
        </div>

        <button
          onClick={() => {
            setAdminUnlocked(false);
            setIsUnlocked(false);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:text-foreground hover:bg-border/40 shrink-0 text-center transition-colors"
        >
          <Lock className="h-3.5 w-3.5" /> Lock Admin Session
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-border pb-1 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('add')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'add'
              ? 'border-primary text-primary bg-primary-tint/40 font-bold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          Add Single Question
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'bulk'
              ? 'border-primary text-primary bg-primary-tint/40 font-bold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Bulk Import & Material Generator
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'manage'
              ? 'border-primary text-primary bg-primary-tint/40 font-bold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <ListFilter className="h-4 w-4" />
          Manage Question Bank
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'add' && <AddQuestionForm />}
      {activeTab === 'bulk' && <BulkImportPipeline />}
      {activeTab === 'manage' && <ManageQuestions />}
    </div>
  );
}
