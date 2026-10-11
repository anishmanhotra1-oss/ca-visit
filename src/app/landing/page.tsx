'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  BarChart3,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Target,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  // Demo Sample Quiz State for Interactive Hero Component
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const demoQuestion = {
    question: "With reference to the Indian Economy, which of the following best describes the 'Liquidity Adjustment Facility' (LAF)?",
    options: [
      "A tool used by SEBI to regulate stock market volatility",
      "A facility used by RBI to inject or absorb liquidity from the banking system",
      "A scheme provided by NABARD for rural agricultural credit",
      "A mechanism for foreign direct investment approval"
    ],
    correctIndex: 1,
    explanation: "The Liquidity Adjustment Facility (LAF) is a tool used by the Reserve Bank of India (RBI) that allows banks to borrow money through repurchase agreements (repos) or to lend to the RBI using reverse repo agreements."
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 sm:space-y-16 pb-12 text-[#1A0A0F]">
      {/* 1. ULTRA-PROFESSIONAL HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800020] via-[#6B0D25] to-[#4A0518] p-6 sm:p-10 md:p-12 text-white shadow-2xl border border-rose-900/30">
        {/* Decorative Lighting */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: HEADLINE, DESCRIPTION & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md text-white shadow-xs">
              <Logo className="h-5 w-5 rounded-full bg-white/20 p-0.5" />
              <span>By SAANKALP &bull; UPSC &amp; State PCS Prep Platform</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Master UPSC Current Affairs &amp; MCQs with{' '}
              <span className="bg-gradient-to-r from-amber-200 via-rose-100 to-amber-300 bg-clip-text text-transparent">
                AI-Powered Precision
              </span>
            </h1>

            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed max-w-xl">
              Import PDFs &amp; notes into structured MCQs automatically, track memory retention heatmaps, and clear active mistakes with targeted Smart Revision.
            </p>

            {/* CTAs WITH HIGH CONTRAST */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-rose-50 px-6 py-3.5 text-sm font-bold text-[#800020] transition-all shadow-lg shadow-black/10 hover:scale-105 text-center"
              >
                Get Started Free <ArrowRight className="h-4 w-4 text-[#800020]" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-5 py-3.5 text-sm font-semibold text-white border border-white/25 backdrop-blur-md transition-all shadow-xs text-center"
              >
                Sign In to Account
              </Link>

              <Link
                href="/?guest=true"
                className="inline-flex items-center justify-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-bold underline py-2 sm:ml-1"
              >
                Explore Practice &rarr;
              </Link>
            </div>

            {/* STATS CARDS */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t border-white/20">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-1">
                <span className="block font-serif-display text-lg sm:text-xl font-bold text-white">
                  100% Free
                </span>
                <span className="text-[11px] sm:text-xs text-rose-100/80 block font-medium">
                  No subscription needed
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-1">
                <span className="block font-serif-display text-lg sm:text-xl font-bold text-amber-300">
                  Offline PWA
                </span>
                <span className="text-[11px] sm:text-xs text-rose-100/80 block font-medium">
                  Local storage backup
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-1">
                <span className="block font-serif-display text-lg sm:text-xl font-bold text-rose-200">
                  AI MCQ Import
                </span>
                <span className="text-[11px] sm:text-xs text-rose-100/80 block font-medium">
                  PDF, DOCX &amp; Images
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WHITE GLASS ANALYTICS SHOWCASE */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 rounded-3xl bg-white text-[#1A0A0F] border border-[#F0D5DD] shadow-2xl space-y-5 relative overflow-hidden">
              {/* TOP HEADER */}
              <div className="flex items-center justify-between border-b border-[#F0D5DD] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Live Aspirant Analytics
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0F3] border border-[#F0D5DD] text-[10px] font-bold text-[#800020]">
                  Target 2026
                </span>
              </div>

              {/* RETENTION HEATMAP MINI PREVIEW */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#800020]">Topic Retention Heatmap</span>
                  <span className="text-[11px] text-emerald-700 font-bold">84% Accuracy</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                    <span className="font-semibold text-emerald-950">Indian Polity &amp; Govt</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                      88% Strong
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                    <span className="font-semibold text-amber-950">Indian Economy &amp; Banking</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[10px]">
                      74% Average
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
                    <span className="font-semibold text-rose-950">Environment &amp; Bio</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px]">
                      42% Weak &bull; Target
                    </span>
                  </div>
                </div>
              </div>

              {/* AI IMPORT TOAST */}
              <div className="p-3 rounded-2xl bg-[#FDF0F3] border border-[#F0D5DD] space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#800020] font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> AI Auto-Extraction
                  </span>
                  <span className="text-emerald-700 font-bold">Completed</span>
                </div>
                <p className="text-[11px] text-[#6E535C] font-medium truncate">
                  Vision_IAS_Sept2025.pdf &rarr; 35 Structured MCQs generated
                </p>
              </div>

              {/* REVISION STREAK */}
              <div className="flex items-center justify-between pt-1 text-xs border-t border-[#F0D5DD]">
                <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                  🔥 14-Day Revision Streak
                </span>
                <span className="text-[10px] text-[#6E535C] font-medium">UPSC Prelims Countdown</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO QUIZ ENGINE */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F0D5DD] shadow-lg shadow-rose-950/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0D5DD] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FDF0F3] text-[#800020] border border-[#F0D5DD] font-bold">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-[#800020]">
                Experience Interactive Quiz Engine
              </h2>
              <p className="text-xs text-[#6E535C]">
                Instant feedback with UPSC negative marking (-0.67) and explanatory notes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FDF0F3] border border-[#F0D5DD] text-[#800020] text-xs font-bold shrink-0">
            Live Interactive Demo
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#F0D5DD] bg-[#FAFAFA] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#800020] uppercase tracking-wider">
              Economy &bull; Question Demo
            </span>
            <h3 className="font-bold text-sm text-[#1A0A0F] leading-relaxed">
              {demoQuestion.question}
            </h3>
          </div>

          <div className="space-y-2">
            {demoQuestion.options.map((opt, idx) => {
              let btnStyle = 'border-[#F0D5DD] bg-white hover:bg-[#FDF0F3] text-[#1A0A0F] hover:border-[#800020]/40';
              if (isAnswered) {
                if (idx === demoQuestion.correctIndex) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (selectedOpt === idx) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedOpt(idx);
                    setIsAnswered(true);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-xl bg-[#FDF0F3] border border-[#F0D5DD] space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-[#800020]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Explanatory Solution</span>
              </div>
              <p className="text-[#3A1D26] leading-relaxed font-medium">
                {demoQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. FOUR CORE PILLARS */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#800020]">
            Built Specifically for UPSC Aspirants
          </h2>
          <p className="text-xs sm:text-sm text-[#6E535C] font-medium">
            Eliminate generic notes. Focus on high-yield retention and targeted revision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#F0D5DD] space-y-3 hover:border-[#800020]/40 transition-all shadow-sm hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F3] text-[#800020] border border-[#F0D5DD] font-bold">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#800020]">
              1. AI Bulk MCQ Extraction
            </h3>
            <p className="text-xs text-[#6E535C] leading-relaxed font-medium">
              Upload PDF monthly magazines, newspaper clippings, DOCX notes or images. Gemini AI extracts structured questions, option choices, and detailed solution notes automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#F0D5DD] space-y-3 hover:border-[#800020]/40 transition-all shadow-sm hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#800020]">
              2. Memory Heatmap Matrix
            </h3>
            <p className="text-xs text-[#6E535C] leading-relaxed font-medium">
              Visual topic retention grid dynamically color-coded by accuracy (&ge; 70% Strong, 50&ndash;69% Average, &lt; 50% Weak) to instantly spot your vulnerable subject areas.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#F0D5DD] space-y-3 hover:border-[#800020]/40 transition-all shadow-sm hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#800020]">
              3. Smart Revision &amp; Errors Notebook
            </h3>
            <p className="text-xs text-[#6E535C] leading-relaxed font-medium">
              Every missed question is logged in your Mistakes Notebook. Smart Quiz mode automatically pulls wrong answers prioritized by difficulty and recency until resolved.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white border border-[#F0D5DD] space-y-3 hover:border-[#800020]/40 transition-all shadow-sm hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#800020] border border-rose-200 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#800020]">
              4. Aspirant Accounts &amp; Cloud Backup
            </h3>
            <p className="text-xs text-[#6E535C] leading-relaxed font-medium">
              Personalized for your Target UPSC Year (2025, 2026, 2027) &amp; Optional Subject (PSIR, Sociology, Geography, etc.) with local offline storage + Supabase cloud database sync.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#800020] via-[#6B0D25] to-[#800020] p-8 sm:p-12 text-center text-white border border-rose-900/30 shadow-xl shadow-rose-950/15 space-y-5">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold max-w-xl mx-auto text-white">
          Start Optimizing Your UPSC Revision Strategy Today
        </h2>
        <p className="text-xs sm:text-sm text-rose-100 max-w-lg mx-auto font-medium">
          Join aspirants using SAANKALP CA-VISIT to turn passive reading into active retention.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 relative z-10 max-w-md mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-rose-50 px-6 py-3.5 text-xs font-bold text-[#800020] transition-all shadow-lg hover:scale-105 text-center"
          >
            Create Aspirant Account <ArrowRight className="h-4 w-4 text-[#800020]" />
          </Link>
          <Link
            href="/?guest=true"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-xs font-semibold text-white backdrop-blur-md transition-colors text-center"
          >
            Open Practice Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
