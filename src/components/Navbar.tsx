'use client';

import React from 'react';
import {
  Mail,
  Settings,
  Volume2,
  VolumeX,
  Globe,
  Crown,
  User as UserIcon,
  LogIn,
  Zap,
  Palette,
  Scissors,
  Gift,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { AppSettings, User } from '@/types';

interface NavbarProps {
  settings: AppSettings | null;
  currentUser: User | null;
  onOpenSettings: (tab?: string) => void;
  onOpenAuthModal: () => void;
  onOpenAmPremiumModal: () => void;
  onOpenThemeModal?: () => void;
  onOpenQrisModal?: () => void;
  onOpenReferralModal?: () => void;
  onOpenVideoStudio?: () => void;
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
  onOpenThemeModal,
  onOpenQrisModal,
  onOpenReferralModal,
  onOpenVideoStudio,
  soundEnabled,
  onToggleSound,
  activeDomain,
  totalEmails,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Title (Clear, Never Cut Off) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-0.5 shadow-md shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white whitespace-nowrap">
                DKaimono<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Studio</span>
              </span>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-cyan-300 shrink-0">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400">TempMail Realtime &amp; Viral Monetization Suite</p>
          </div>
        </div>

        {/* Center: Live Domain & Server Status (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Domain:</span>
            <span className="font-semibold text-slate-200">@{activeDomain || 'loginptn.xyz'}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-300 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-live-pulse" />
            <span>8 Server Cluster Online</span>
          </div>
        </div>

        {/* Right: Action Controls (Responsive & Optimized for Mobile Screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Viral Video Studio Direct Button (Desktop/Tablet) */}
          {onOpenVideoStudio && (
            <button
              onClick={onOpenVideoStudio}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-600/30 to-pink-500/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:from-rose-600/40 hover:to-pink-500/40 active:scale-95 transition-all shadow-sm"
              title="Buka Studio Edit Video 9:16"
            >
              <Scissors className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span>✂️ Video Studio</span>
            </button>
          )}

          {/* Generator PRO Button (Desktop/Tablet) */}
          <button
            onClick={onOpenAmPremiumModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/30 to-teal-500/30 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:from-emerald-600/40 hover:to-teal-500/40 active:scale-95 transition-all shadow-sm"
            title="Auto Pro & Trial Generator"
          >
            <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
            <span className="text-xs">⚡ Generator</span>
          </button>

          {/* QRIS / PRO Upgrade Button (Desktop/Tablet) */}
          <button
            onClick={() => (onOpenQrisModal ? onOpenQrisModal() : onOpenSettings('pro'))}
            className={`hidden sm:flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              currentUser?.isPro
                ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm'
                : 'border border-amber-500/40 bg-gradient-to-r from-amber-600/25 to-amber-500/25 text-amber-300 hover:from-amber-600/35 hover:to-amber-500/35'
            }`}
            title="Upgrade Akun PRO via QRIS Otomatis"
          >
            <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-xs">{currentUser?.isPro ? 'VIP' : 'QRIS PRO'}</span>
          </button>

          {/* Referral Bonus Chip (Desktop) */}
          {onOpenReferralModal && (
            <button
              onClick={onOpenReferralModal}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 px-2.5 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-900/40 active:scale-95 transition-all"
              title="Program Referral & Bonus Hadiah"
            >
              <Gift className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Referral</span>
            </button>
          )}

          {/* Theme Switcher Button (Desktop/Tablet) */}
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-800 active:scale-95 transition-all"
              title="Ganti Tema Tampilan"
            >
              <Palette className="h-4 w-4" />
            </button>
          )}

          {/* User Account Button (Visible on all devices) */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800 active:scale-95 transition-all"
            title={currentUser ? `Akun: @${currentUser.alias || currentUser.username}` : 'Masuk / Daftar'}
          >
            {currentUser ? (
              <>
                <UserIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="hidden xs:inline max-w-[80px] sm:max-w-[100px] truncate text-xs font-semibold">
                  @{currentUser.alias || currentUser.username}
                </span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="text-xs">Masuk</span>
              </>
            )}
          </button>

          {/* Sound Toggle (Tablet/Desktop) */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
            className={`hidden md:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </button>

          {/* Settings Button (Visible on all devices) */}
          <button
            onClick={() => onOpenSettings()}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95 transition-all shrink-0"
            title="Pengaturan Domain &amp; API"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
