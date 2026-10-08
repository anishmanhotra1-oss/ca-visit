'use client';

import React, { useState, useEffect } from 'react';
import { LocalAppStore, UserProfile } from '@/lib/store';
import { Question } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthService, AuthUser } from '@/lib/auth';
import {
  User,
  Settings,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Wifi,
  Moon,
  Sun,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(LocalAppStore.getUser());
  const [deletedQuestions, setDeletedQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'trash'>('settings');

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isCloudSynced = isSupabaseConfigured();

  const reloadTrash = () => {
    const allDeleted = LocalAppStore.getQuestions(true).filter((q) => q.deleted_at);
    setDeletedQuestions(allDeleted);
  };

  useEffect(() => {
    reloadTrash();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    LocalAppStore.updateUser(userProfile);
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = LocalAppStore.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca_visit_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = LocalAppStore.importAllData(content);
        if (success) {
          setMessage('Backup restored successfully!');
          reloadTrash();
        } else {
          setErrorMessage('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreQuestion = (id: string) => {
    LocalAppStore.restoreQuestion(id);
    reloadTrash();
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm('Permanently delete this question? This action cannot be undone.')) {
      LocalAppStore.permanentDeleteQuestion(id);
      reloadTrash();
    }
  };

  const handleEmptyTrash = () => {
    if (confirm('Permanently purge all items in Trash? This cannot be undone.')) {
      deletedQuestions.forEach((q) => LocalAppStore.permanentDeleteQuestion(q.id));
      reloadTrash();
    }
  };

  const [currentAspirant, setCurrentAspirant] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentAspirant(AuthService.getCurrentUser());
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentAspirant(null);
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto pb-12">
      {/* PROFILE HEADER */}
      <div className="card-burgundy p-6 sm:p-8 bg-gradient-to-br from-surface via-primary-tint/20 to-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white font-serif-display font-bold text-xl shadow-md">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-display text-2xl font-bold text-foreground">
                  {userProfile.name}
                </h1>
                {currentAspirant && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-tint text-primary text-[10px] font-bold">
                    Target {currentAspirant.targetYear} • {currentAspirant.optionalSubject}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isCloudSynced
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              <span>{isCloudSynced ? 'Cloud Synced' : 'Local Storage Mode'}</span>
            </div>

            {currentAspirant && currentAspirant.email !== 'aspirant@upsc-visit.local' ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Sign Out
              </button>
            ) : (
              <a
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-xs"
              >
                Login / Sign Up
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS / ERROR TOASTS */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'settings'
              ? 'border-primary text-primary bg-primary-tint/40'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" /> App Preferences & Data Sync
        </button>

        <button
          onClick={() => setActiveTab('trash')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'trash'
              ? 'border-primary text-primary bg-primary-tint/40'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Trash2 className="h-4 w-4" /> 30-Day Trash ({deletedQuestions.length})
        </button>
      </div>

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="card-burgundy p-6 space-y-6">
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              Quiz & Scoring Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Default Quiz Length
                </label>
                <select
                  value={userProfile.defaultQuizLength}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      defaultQuizLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
                >
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Default Quiz Mode
                </label>
                <select
                  value={userProfile.defaultMode}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      defaultMode: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
                >
                  <option value="practice">Practice Mode (Instant Solutions)</option>
                  <option value="exam">Exam Mode (Review on Submit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  UPSC Negative Marking Deduction
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={userProfile.negativeValue}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        negativeValue: parseFloat(e.target.value) || 0.67,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
                  />
                  <span className="text-xs font-bold text-muted">marks / wrong</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </form>

          {/* BACKUP EXPORT & RESTORE */}
          <div className="card-burgundy p-6 space-y-4">
            <h2 className="font-serif-display text-lg font-bold text-foreground">
              Data Backup & Full Export
            </h2>
            <p className="text-xs text-muted">
              Export your entire question bank, attempt history, bookmarks, and heatmap states to a JSON file, or restore from a previous backup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" /> Export All My Data (JSON)
              </button>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-border/40 text-foreground text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="h-4 w-4" /> Restore Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRASH */}
      {activeTab === 'trash' && (
        <div className="space-y-6">
          <div className="card-burgundy p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-display text-lg font-bold text-foreground">
                30-Day Soft-Delete Trash
              </h2>
              <p className="text-xs text-muted">
                Items in trash are never auto-deleted immediately. Restore them anytime.
              </p>
            </div>

            {deletedQuestions.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Purge Trash Completely
              </button>
            )}
          </div>

          <div className="space-y-3">
            {deletedQuestions.length === 0 ? (
              <div className="card-burgundy p-12 text-center text-xs text-muted">
                Trash is empty! No deleted questions.
              </div>
            ) : (
              deletedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="card-burgundy p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-primary">
                      {q.topic}
                    </span>
                    <p className="text-xs text-foreground line-clamp-2">
                      {q.question_text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRestoreQuestion(q.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-200"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(q.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Permanent Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
