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
  Flame,
  Radio,
  Gamepad2,
  Coins,
  Joystick,
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
      <header className="sticky top-0 z-40 w-full border-b-2 border-cyan-400/40 bg-slate-950/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,240,255,0.15)]">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Retro Arcade Marquee Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-400 p-0.5 shadow-[2px_2px_0px_#00F0FF] shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-slate-950 text-cyan-400">
                <Gamepad2 className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm sm:text-base md:text-lg font-black tracking-widest text-cyan-400 uppercase arcade-text">
                  DK-ARCADE<span className="text-fuchsia-400">.8BIT</span>
                </span>
                <span className="rounded-md bg-fuchsia-500/20 border border-fuchsia-400/60 px-1.5 py-0.2 font-mono text-[8px] sm:text-[9px] font-black uppercase text-fuchsia-300">
                  1P READY
                </span>
              </div>
              <p className="hidden md:block font-mono text-[9px] text-slate-400 tracking-wider">
                STAGE 1 // DISPOSABLE TEMPMAIL CONSOLE
              </p>
            </div>
          </div>

          {/* Center: Arcade Status Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-slate-900/90 px-3 py-1 text-cyan-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">SERVER: ONLINE</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-slate-900/90 px-3 py-1 text-amber-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold">COINS: 99</span>
            </div>
          </div>

          {/* Right Action Arcade Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle Button */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Matikan Suara SFX' : 'Aktifkan Suara SFX'}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 active:scale-95 transition-all shadow-[2px_2px_0px_#000000]"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Theme Selector Button */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                title="Ganti Tema Game"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border-2 border-slate-700 bg-slate-900 px-3 font-mono text-xs font-bold text-slate-300 hover:border-fuchsia-400 hover:text-fuchsia-300 active:scale-95 transition-all shadow-[2px_2px_0px_#000000]"
              >
                <Palette className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>THEME</span>
              </button>
            )}

            {/* INSERT COIN / VIP UPGRADE BUTTON */}
            <button
              onClick={handleInsertCoin}
              className="flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-400 px-3 font-mono text-xs font-black text-black hover:from-amber-400 hover:to-yellow-300 active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0px_#000000]"
            >
              <Coins className="h-3.5 w-3.5 fill-black" />
              <span className="truncate uppercase font-black">INSERT COIN</span>
            </button>

            {/* Settings Config Gear */}
            <button
              onClick={() => onOpenSettings()}
              title="Konfigurasi Pengaturan"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 active:scale-95 transition-all shadow-[2px_2px_0px_#000000]"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Hamburger Button (Mobile Drawer) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 border-cyan-400 bg-slate-900 text-cyan-400 active:scale-95 transition-all shadow-[2px_2px_0px_#00F0FF]"
              aria-label="Buka Menu Arcade"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Retro Arcade Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-slate-950 border-l-2 border-cyan-400/60 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-2xl">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-cyan-400/30 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6 text-cyan-400" />
                  <span className="font-mono text-base font-black tracking-widest text-white uppercase">
                    ARCADE MENU
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 font-mono text-xs">
                <button
                  onClick={() => handleAction(onOpenGarapanModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-indigo-500/40 bg-indigo-950/40 text-indigo-300 font-bold hover:bg-indigo-900/50 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>⚡ POWER STUDIO (8 IN 1)</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenVideoStudio)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-rose-500/40 bg-rose-950/40 text-rose-300 font-bold hover:bg-rose-900/50 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="h-4 w-4 text-rose-400" />
                    <span>✂️ VIRAL VIDEO STUDIO</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenAmPremiumModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-bold hover:bg-emerald-900/50 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>⚡ AUTO PRO GENERATOR</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenQrisModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-amber-500/40 bg-amber-950/40 text-amber-300 font-bold hover:bg-amber-900/50 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>👑 UPGRADE VIP PRO</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(onOpenThemeModal)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-850 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-cyan-400" />
                    <span>🎨 GANTI TEMA TAMPILAN</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleAction(() => onOpenSettings())}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-slate-800 bg-slate-900 text-slate-300 font-bold hover:bg-slate-850 shadow-[2px_2px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>⚙️ PENGATURAN &amp; DNS</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t-2 border-cyan-400/30 pt-4 text-center font-mono text-[10px] text-slate-400">
              <span>DK-ARCADE EDITION v2.0 • 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
