'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService, AuthUser } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  ShieldCheck,
} from 'lucide-react';

import Logo from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [optionalSubject, setOptionalSubject] = useState<string>('PSIR');
  const [phone, setPhone] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const isCloudSynced = isSupabaseConfigured();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'signup') {
        setMode('signup');
      }
    }
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

        const user = await AuthService.register({
          fullName,
          email,
          password,
          targetYear,
          optionalSubject,
          phone,
        });

        setSuccessMsg(`Welcome to SAANKALP CA-VISIT, ${user.name}! Your aspirant profile has been created.`);
        setTimeout(() => {
          router.push('/');
        }, 1200);
      } else {
        if (!email.trim()) throw new Error('Please enter your email.');
        if (!password) throw new Error('Please enter your password.');

        const user = await AuthService.login(email, password);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* LOGO & BRANDING */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 group">
            <Logo className="h-12 w-12 rounded-2xl" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-display text-2xl font-bold tracking-tight text-primary">
                  CA-VISIT
                </span>
                <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  UPSC
                </span>
              </div>
              <p className="text-xs font-medium text-muted">By SAANKALP</p>
            </div>
          </Link>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Personalized Aspirant Account for Syncing Question Bank, Heatmaps & Mistakes Notebook.
          </p>
        </div>

        {/* ALREADY LOGGED IN CARD */}
        {currentUser && currentUser.email !== 'aspirant@upsc-visit.local' && (
          <div className="card-burgundy p-5 space-y-3 bg-gradient-to-r from-emerald-50/50 to-surface border-emerald-300 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-foreground">{currentUser.name}</h3>
                  <p className="text-[11px] text-muted">{currentUser.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                Target {currentUser.targetYear}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
              >
                Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* AUTH CARD */}
        <div className="card-burgundy p-6 sm:p-8 space-y-6 shadow-glow">

          {/* TAB SWITCHER */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-border/40 border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ALERT MESSAGES */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/80 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AUTH FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-burgundy pl-9 text-xs py-2.5 w-full"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="aspirant@upsc-prep.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-burgundy pl-9 text-xs py-2.5 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-burgundy pl-9 pr-9 text-xs py-2.5 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Target UPSC Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="input-burgundy text-xs py-2.5 w-full"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Optional Subject
                  </label>
                  <select
                    value={optionalSubject}
                    onChange={(e) => setOptionalSubject(e.target.value)}
                    className="input-burgundy text-xs py-2.5 w-full"
                  >
                    <option value="PSIR">PSIR</option>
                    <option value="Sociology">Sociology</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="Public Administration">Pub Administration</option>
                    <option value="Anthropology">Anthropology</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Economics">Economics</option>
                    <option value="Commerce">Commerce & Accountancy</option>
                    <option value="Law">Law</option>
                    <option value="Other">Other / Not Decided</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-3 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signup' ? (
                <>
                  Create Aspirant Account <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* DEMO / GUEST FOOTER LINK */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted hover:text-foreground font-medium underline"
          >
            Continue as Guest / Explore App Dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
