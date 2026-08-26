'use client';

import React from 'react';
import { Mail, ShieldCheck, Settings, Volume2, VolumeX, Sparkles, Server, Globe } from 'lucide-react';
import { AppSettings } from '@/types';

interface NavbarProps {
  settings: AppSettings | null;
  onOpenSettings: (tab?: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeDomain: string;
  totalEmails: number;
}

export function Navbar({
  settings,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  activeDomain,
  totalEmails,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Mail className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                Temp<span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Mail</span>
              </span>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                PRO MAX
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Catch-All Custom Domain & Spam Safe Inbound</p>
          </div>
        </div>

        {/* Status & Stats Pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-400">Domain:</span>
            <span className="font-semibold text-slate-200">{activeDomain || 'default'}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Bypass Spam:</span>
            <span className="font-semibold text-emerald-400">Aktif (Tangkap Semua)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              soundEnabled
                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Quick DNS / MX Setup Hub Button */}
          <button
            onClick={() => onOpenSettings('dns')}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <Server className="h-3.5 w-3.5 text-sky-400" />
            <span>Setting MX</span>
          </button>

          {/* Settings Dashboard Button */}
          <button
            onClick={() => onOpenSettings()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/30 active:scale-95"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden xs:inline">Dashboard & Setting</span>
          </button>
        </div>
      </div>
    </header>
  );
}
