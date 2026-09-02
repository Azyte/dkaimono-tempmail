'use client';

import React from 'react';
import {
  Inbox,
  Zap,
  Scissors,
  QrCode,
  Sparkles,
  Crown,
  Gamepad2,
} from 'lucide-react';
import { FolderType } from './FolderSidebar';
import { playNotificationSound } from '@/lib/sound';

interface MobileBottomNavProps {
  currentFolder: FolderType;
  onSelectFolder: (folder: FolderType) => void;
  onOpenAmPremiumModal: () => void;
  onOpenVideoStudio: () => void;
  onOpenGarapanModal?: () => void;
  onOpenQrisModal: () => void;
  onOpenThemeModal: () => void;
  onOpenReferralModal: () => void;
  unreadCount: number;
}

export function MobileBottomNav({
  currentFolder,
  onSelectFolder,
  onOpenAmPremiumModal,
  onOpenVideoStudio,
  onOpenGarapanModal,
  onOpenQrisModal,
  onOpenThemeModal,
  onOpenReferralModal,
  unreadCount,
}: MobileBottomNavProps) {
  const handleClick = (callback: () => void) => {
    playNotificationSound();
    callback();
  };

  return (
    <div className="fixed bottom-2.5 inset-x-2.5 z-40 md:hidden pointer-events-auto font-mono">
      <div className="flex items-center justify-around rounded-2xl border-2 border-cyan-400 bg-slate-950/95 px-2 py-1.5 shadow-[0_4px_20px_rgba(0,240,255,0.3),4px_4px_0px_#000000]">
        {/* 1. [A] INBOX */}
        <button
          type="button"
          onClick={() => handleClick(() => onSelectFolder('inbox'))}
          className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all active:scale-90 ${
            currentFolder === 'inbox' || currentFolder === 'all'
              ? 'text-cyan-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Inbox className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white shadow-md animate-ping">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-widest font-black">[A] INBOX</span>
        </button>

        {/* 2. [B] GENERATOR PRO */}
        <button
          type="button"
          onClick={() => {
            handleClick(() => {
              onSelectFolder('am_accounts');
              onOpenAmPremiumModal();
            });
          }}
          className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all active:scale-90 ${
            currentFolder === 'am_accounts'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
            <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[9px] tracking-widest font-black">[B] GEN</span>
        </button>

        {/* 3. [X] VIDEO CLIPPER STUDIO */}
        <button
          type="button"
          onClick={() => handleClick(onOpenVideoStudio)}
          className="flex flex-col items-center justify-center -mt-5 h-11 w-11 rounded-xl border-2 border-fuchsia-400 bg-gradient-to-tr from-fuchsia-600 to-rose-600 text-white shadow-[2px_2px_0px_#000000] active:scale-90 transition-all"
          title="Viral Video Studio"
        >
          <Scissors className="h-5 w-5" />
        </button>

        {/* 4. [Y] POWER STUDIO DEVTOOLS */}
        {onOpenGarapanModal && (
          <button
            type="button"
            onClick={() => handleClick(onOpenGarapanModal)}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-slate-400 hover:text-indigo-400 transition-all active:scale-90"
          >
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-[9px] text-indigo-300 font-black tracking-widest">[Y] TOOLS</span>
          </button>
        )}

        {/* 5. [START] VIP PRO */}
        <button
          type="button"
          onClick={() => handleClick(onOpenQrisModal)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-slate-400 hover:text-amber-400 transition-all active:scale-90"
        >
          <Crown className="h-5 w-5 text-amber-400" />
          <span className="text-[9px] text-amber-300 font-black tracking-widest">[VIP]</span>
        </button>
      </div>
    </div>
  );
}
