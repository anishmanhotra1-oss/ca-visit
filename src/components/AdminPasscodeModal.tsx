'use client';

import React, { useState } from 'react';
import { verifyAdminCode, setAdminUnlocked } from '@/lib/adminAuth';
import { KeyRound, AlertCircle, Lock, ArrowRight } from 'lucide-react';

interface AdminPasscodeModalProps {
  onSuccess: () => void;
}

export default function AdminPasscodeModal({
  onSuccess,
}: AdminPasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passcode.trim()) {
      setErrorMsg('Please enter the Admin Security Code.');
      return;
    }

    setLoading(true);

    try {
      const isValid = await verifyAdminCode(passcode);
      if (isValid) {
        setAdminUnlocked(true);
        onSuccess();
      } else {
        setErrorMsg('Invalid Admin Code. Access denied.');
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card-burgundy p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl border-primary/40 animate-fadeIn">
        {/* HEADER ICON & TITLE */}
        <div className="text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mx-auto shadow-glow">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif-display text-2xl font-bold tracking-tight text-foreground">
              Admin Passcode Required
            </h2>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Adding new questions or importing study materials requires admin security authorization.
            </p>
          </div>
        </div>

        {/* ERROR TOAST */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PASSCODE FORM */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Enter Admin Security Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="password"
                placeholder="Enter 8-digit passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Hash...</span>
            ) : (
              <>
                Unlock Question Bank Editor <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border/60">
          <span className="text-[11px] text-muted">
            Protected by Cryptographic SHA-256 Hash Verification
          </span>
        </div>
      </div>
    </div>
  );
}
