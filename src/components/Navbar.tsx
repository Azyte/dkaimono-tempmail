'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Gamepad2,
  Coins,
} from 'lucide-react';
import { AppSettings, User } from '@/types';
import { playNotificationSound } from '@/lib/sound';

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
  onOpenGarapanModal?: () => void;
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
  onOpenGarapanModal,
  soundEnabled,
  onToggleSound,
  activeDomain,
  totalEmails,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAction = (callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  const handleInsertCoin = () => {
    playNotificationSound();
    if (onOpenQrisModal) onOpenQrisModal();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/30 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-sm shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-cyan-400">
                <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap">
                  DKaimono<span className="text-cyan-400">Temp</span>
                </span>
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold text-cyan-300 shrink-0">
                  8-BIT
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Status (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">Server Online</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Matikan Suara SFX' : 'Aktifkan Suara SFX'}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 active:scale-95 transition-all"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Theme Selector */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                title="Ganti Tema Tampilan"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-semibold text-slate-300 hover:border-slate-700 active:scale-95 transition-all"
              >
                <Palette className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Tema</span>
              </button>
            )}

            {/* VIP Upgrade Button */}
            <button
              onClick={handleInsertCoin}
              className="flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 sm:px-3 text-xs font-black text-black hover:from-amber-400 hover:to-yellow-300 active:scale-95 transition-all shadow-sm"
            >
              <Coins className="h-3.5 w-3.5 fill-black shrink-0" />
              <span className="truncate uppercase font-bold text-[11px] sm:text-xs">VIP PRO</span>
            </button>

            {/* Settings Config Gear */}
            <button
              onClick={() => onOpenSettings()}
              title="Pengaturan"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 active:scale-95 transition-all"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Hamburger Button (Mobile Drawer) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 active:scale-95 transition-all"
              aria-label="Buka Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-2xl">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">
                    Menu &amp; Fitur
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => handleAction(onOpenGarapanModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 font-semibold hover:bg-indigo-900/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>⚡ Cyber Power Studio (8 IN 1)</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenVideoStudio)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 font-semibold hover:bg-rose-900/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="h-4 w-4 text-rose-400" />
                    <span>✂️ Viral Video Studio</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenAmPremiumModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 font-semibold hover:bg-emerald-900/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>⚡ Auto PRO Generator</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenQrisModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-300 font-semibold hover:bg-amber-900/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>👑 Upgrade VIP PRO</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenThemeModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-semibold hover:bg-slate-850"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-cyan-400" />
                    <span>🎨 Ganti Tema Tampilan</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(() => onOpenSettings())}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-semibold hover:bg-slate-850"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>⚙️ Pengaturan &amp; DNS</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-800 pt-4 text-center text-[10px] text-slate-500">
              <span>DKaimono Studio PRO v2.0 • 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
