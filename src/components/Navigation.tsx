'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  PlusCircle,
  BarChart3,
  AlertTriangle,
  User,
  Sparkles,
  Wifi,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthService, AuthUser } from '@/lib/auth';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();
  const isCloudSynced = isSupabaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsGuestMode(params.get('guest') === 'true');
    }
  }, [pathname]);

  const isLoggedIn = user && user.email !== 'aspirant@upsc-visit.local';

  // WHEN LOGGED OUT -> SHOW LANDING NAVBAR WITH LOGO, LOGIN & CREATE ACCOUNT BUTTONS
  if (!isLoggedIn && !isGuestMode) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-[#F0D5DD] bg-white/95 backdrop-blur-md transition-colors shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2.5 group">
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#F0D5DD] bg-white hover:bg-[#FDF0F3] text-[#800020] text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5 text-[#800020]" />
              <span>Login</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold transition-all shadow-md shadow-rose-950/20 hover:shadow-rose-900/30"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const navItems = [
    { href: '/', label: 'Practice', icon: BookOpen },
    { href: '/add', label: 'Add Questions', icon: PlusCircle },
    { href: '/heatmap', label: 'Heatmap', icon: BarChart3 },
    { href: '/notebook', label: 'Notebook', icon: AlertTriangle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-[#F0D5DD] bg-white/95 backdrop-blur-md transition-colors shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="h-10 w-10" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-display text-xl font-extrabold tracking-tight text-[#800020]">
                  CA-VISIT
                </span>
                <span className="rounded-full bg-[#FDF0F3] border border-[#F0D5DD] px-2 py-0.5 text-[10px] font-bold text-[#800020]">
                  UPSC
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#6E535C]">
                By SAANKALP
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION MENU */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-sm shadow-rose-900/20'
                      : 'text-[#6E535C] hover:text-[#800020] hover:bg-[#FDF0F3]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* USER AUTH & CLOUD STATUS */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                isCloudSynced
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <Wifi className="h-3 w-3" />
              <span>{isCloudSynced ? 'Cloud Synced' : 'Local Storage'}</span>
            </div>

            {!isLoggedIn && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold transition-all shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-[#F0D5DD] bg-white/95 backdrop-blur-lg md:hidden">
        <div className="grid h-full w-full grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#800020] font-bold'
                    : 'text-[#6E535C] hover:text-[#800020]'
                }`}
              >
                <div
                  className={`p-1 rounded-full transition-all ${
                    isActive ? 'bg-[#FDF0F3] text-[#800020] scale-110' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate max-w-[50px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
