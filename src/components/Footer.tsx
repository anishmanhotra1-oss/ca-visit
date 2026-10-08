'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, BookOpen, BarChart3, AlertTriangle, User, PlusCircle } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#F0D5DD] bg-white text-[#1A0A0F] pt-12 pb-16 md:pb-12 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 space-y-10">
        {/* TOP SECTION: BRANDING & NAVIGATION COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* COLUMN 1: BRANDING & DESCRIPTION (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Logo className="h-10 w-10" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif-display text-xl font-extrabold tracking-tight text-[#800020]">
                    CA-VISIT
                  </span>
                  <span className="rounded-full bg-[#FDF0F3] border border-[#F0D5DD] px-2.5 py-0.5 text-[10px] font-bold text-[#800020]">
                    UPSC
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#6E535C]">
                  By SAANKALP
                </p>
              </div>
            </Link>

            <p className="text-xs text-[#6E535C] leading-relaxed max-w-sm font-medium">
              Next-generation UPSC &amp; State PCS Current Affairs &amp; MCQ revision platform. Track memory retention heatmaps, log mistakes, and import notes automatically with AI.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF0F3] border border-[#F0D5DD] px-3 py-1 text-[11px] font-bold text-[#800020]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#800020]" />
              <span>Offline Ready PWA + Local &amp; Cloud Sync</span>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#6E535C]">
              <li>
                <Link href="/" className="hover:text-[#800020] transition-colors flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#800020]" /> Practice Dashboard
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-[#800020] transition-colors flex items-center gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5 text-[#800020]" /> AI MCQ Bulk Import
                </Link>
              </li>
              <li>
                <Link href="/heatmap" className="hover:text-[#800020] transition-colors flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-[#800020]" /> Retention Heatmap
                </Link>
              </li>
              <li>
                <Link href="/notebook" className="hover:text-[#800020] transition-colors flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#800020]" /> Mistakes Notebook
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#800020] transition-colors flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#800020]" /> Aspirant Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: ACCOUNT & EXAM TARGETS (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
              Aspirant Account
            </h4>
            <p className="text-xs text-[#6E535C] leading-relaxed font-medium">
              Create an account to personalize your target year (2025, 2026, 2027) and optional subject (PSIR, Sociology, Geography, History).
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl border border-[#F0D5DD] bg-white hover:bg-[#FDF0F3] text-[#800020] text-xs font-bold transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold transition-all shadow-xs"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT & CREDITS */}
        <div className="pt-6 border-t border-[#F0D5DD] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6E535C]">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-[#800020] font-bold">SAANKALP CA-VISIT</span>. Built for UPSC &amp; State PCS Aspirants.
          </p>

          <p className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="h-3.5 w-3.5 fill-[#800020] text-[#800020]" /> for Civil Services Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
