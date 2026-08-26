'use client';

import React from 'react';
import { Mail, ShieldCheck, Settings, Volume2, VolumeX, Globe, Crown, User as UserIcon, LogIn } from 'lucide-react';
import { AppSettings, User } from '@/types';

interface NavbarProps {
  settings: AppSettings | null;
  currentUser: User | null;
  onOpenSettings: (tab?: string) => void;
  onOpenAuthModal: () => void;
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
  soundEnabled,
  onToggleSound,
  activeDomain,
  totalEmails,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Temp<span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Mail</span>
              </span>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400">Catch-All Inbound &amp; Realtime Telegram Bot</p>
          </div>
        </div>

        {/* Status Pills (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 shadow-inner">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-400">Domain:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[140px]">@{activeDomain || 'default'}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 shadow-inner">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Catch-All:</span>
            <span className="font-semibold text-emerald-400">Aktif</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* VIP / PRO Upgrade Button */}
          <button
            onClick={() => onOpenSettings('pro')}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
              currentUser?.isPro
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm hover:bg-amber-500/25'
                : 'border-amber-500/50 bg-gradient-to-r from-amber-600/20 to-amber-500/30 text-amber-300 hover:from-amber-600/30 hover:to-amber-500/40'
            }`}
          >
            <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{currentUser?.isPro ? 'PRO VIP' : 'Upgrade PRO'}</span>
          </button>

          {/* User Profile / Login Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            {currentUser ? (
              <>
                <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-semibold text-white max-w-[90px] truncate">@{currentUser.username}</span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-sky-400" />
                <span>Masuk / Daftar</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Settings Dashboard Button */}
          <button
            onClick={() => onOpenSettings()}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-95"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
