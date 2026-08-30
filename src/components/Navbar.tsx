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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Title */}
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

          {/* Right: Action Controls (Responsive Desktop Toolbar + Mobile Hamburger) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Direct Tool Buttons */}
            {onOpenGarapanModal && (
              <button
                onClick={onOpenGarapanModal}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:from-indigo-600/40 hover:to-pink-500/40 active:scale-95 transition-all shadow-md"
                title="Cyber Power Studio & DevTools Hub"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs">⚡ Power Studio</span>
              </button>
            )}

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

            <button
              onClick={onOpenAmPremiumModal}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/30 to-teal-500/30 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:from-emerald-600/40 hover:to-teal-500/40 active:scale-95 transition-all shadow-sm"
              title="Auto Pro & Trial Generator"
            >
              <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
              <span className="text-xs">⚡ Generator</span>
            </button>

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

            {/* User Account Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800 active:scale-95 transition-all"
              title={currentUser ? `Akun: @${currentUser.alias || currentUser.username}` : 'Masuk / Daftar'}
            >
              {currentUser ? (
                <>
                  <UserIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs font-semibold">
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

            {/* Settings Button */}
            <button
              onClick={() => onOpenSettings()}
              className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95 transition-all shrink-0"
              title="Pengaturan Domain &amp; API"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* ☰ HAMBURGER MENU BUTTON (Always Available on Mobile & Tablet) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 hover:text-white active:scale-95 transition-all shrink-0"
              title="Buka Menu Navigasi & Perkakas"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-rose-400" /> : <Menu className="h-5 w-5 text-indigo-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* 📱 SLIDE-OVER MOBILE DRAWER NAVIGATION MODAL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm h-full flex flex-col bg-slate-950 border-l border-slate-800/80 shadow-2xl p-4 sm:p-5 overflow-y-auto custom-scrollbar">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black">
                  DK
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Menu &amp; Perkakas Lengkap</h3>
                  <p className="text-[10px] text-slate-400">TempMail &amp; Cyber Power Suite</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                ⚡ Perkakas Utama
              </div>

              {/* 1. Cyber Power Studio */}
              {onOpenGarapanModal && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenGarapanModal)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/40 text-left hover:border-indigo-400 transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                        ⚡ Cyber Power Studio (8 In 1)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Burn Secret, Webhooks, DNS, FLAC Music, QR
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-400" />
                </button>
              )}

              {/* 2. Viral Video Studio */}
              {onOpenVideoStudio && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenVideoStudio)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <Scissors className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-rose-300">
                        ✂️ Viral Video Studio 9:16
                      </div>
                      <div className="text-[10px] text-slate-400">Editor Shorts, FYP &amp; Subtitle</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              )}

              {/* 3. Auto Pro & Trial Generator */}
              <button
                type="button"
                onClick={() => handleAction(onOpenAmPremiumModal)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Zap className="h-4 w-4 fill-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      ⚡ Auto Pro Generator Hub
                    </div>
                    <div className="text-[10px] text-slate-400">Alight Motion, Canva, ElevenLabs, Cursor</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              {/* 4. Upgrade VIP PRO */}
              <button
                type="button"
                onClick={() => handleAction(onOpenQrisModal ? onOpenQrisModal : () => onOpenSettings('pro'))}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 hover:bg-slate-850 border border-amber-500/40 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Crown className="h-4 w-4 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      👑 Upgrade Akun VIP PRO
                    </div>
                    <div className="text-[10px] text-slate-400">QRIS Instan Otomatis &amp; Tanpa Batas</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </button>

              <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                ⚙️ Pengaturan &amp; Opsi
              </div>

              {/* 5. Referral Modal */}
              {onOpenReferralModal && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenReferralModal)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <Gift className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-slate-200">Program Referral &amp; Hadiah</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}

              {/* 6. Theme Modal */}
              {onOpenThemeModal && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenThemeModal)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs text-slate-200">Ganti Tema Tampilan</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}

              {/* 7. Sound Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                  <span className="text-xs text-slate-200">Suara Notifikasi Email</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${soundEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                  {soundEnabled ? 'AKTIF' : 'HENING'}
                </span>
              </button>

              {/* 8. Settings */}
              <button
                type="button"
                onClick={() => handleAction(onOpenSettings)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-200">Pengaturan Domain &amp; API</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            {/* Footer Drawer */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Domain Aktif:</span>
                <span className="font-mono font-bold text-cyan-300">@{activeDomain || 'loginptn.xyz'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Server Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
