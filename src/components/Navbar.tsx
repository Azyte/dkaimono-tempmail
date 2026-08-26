'use client';

import React from 'react';
import { Mail, Settings, Volume2, VolumeX, Globe, Crown, User as UserIcon, LogIn, Zap } from 'lucide-react';
import { AppSettings, User } from '@/types';

interface NavbarProps {
  settings: AppSettings | null;
  currentUser: User | null;
  onOpenSettings: (tab?: string) => void;
  onOpenAuthModal: () => void;
  onOpenAmPremiumModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeDomain: string;
  totalEmails: number;
}

export function Navbar({
  settings,
  currentUser,
  onOpenSettings,
  onOpenAuthModal,
  onOpenAmPremiumModal,
  soundEnabled,
  onToggleSound,
  activeDomain,
  totalEmails,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-lg font-black tracking-tight text-white truncate">
                Temp<span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Mail</span>
              </span>
              <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1 py-0.2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-indigo-300">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400">Catch-All Realtime Temporary Email</p>
          </div>
        </div>

        {/* Center: Status Pills (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-400">Domain:</span>
            <span className="font-semibold text-slate-200">@{activeDomain || 'loginptn.xyz'}</span>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Auto AM Premium Button */}
          <button
            onClick={onOpenAmPremiumModal}
            className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/25 to-cyan-500/25 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-emerald-300 hover:from-emerald-600/35 hover:to-cyan-500/35 active:scale-95 transition-all shadow-sm"
            title="Auto Alight Motion Premium Creator"
          >
            <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">AM Prem</span>
          </button>

          {/* PRO Badge / Upgrade Button */}
          <button
            onClick={() => onOpenSettings('pro')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-all active:scale-95 ${
              currentUser?.isPro
                ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm'
                : 'border border-amber-500/40 bg-gradient-to-r from-amber-600/25 to-amber-500/25 text-amber-300 hover:from-amber-600/35 hover:to-amber-500/35'
            }`}
          >
            <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">{currentUser?.isPro ? 'VIP' : 'PRO'}</span>
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800 active:scale-95 transition-all"
            title={currentUser ? `Akun: @${currentUser.username}` : 'Masuk / Daftar'}
          >
            {currentUser ? (
              <>
                <UserIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px] sm:text-xs font-semibold">
                  @{currentUser.username}
                </span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="hidden sm:inline text-xs">Masuk</span>
              </>
            )}
          </button>

          {/* Sound Toggle (Tablet/Desktop) */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onOpenSettings()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-2 sm:px-3.5 sm:py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-95"
            title="Pengaturan"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
