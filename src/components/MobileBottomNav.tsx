'use client';

import React from 'react';
import {
  Inbox,
  Zap,
  Scissors,
  QrCode,
  Sparkles,
  Crown,
} from 'lucide-react';
import { FolderType } from './FolderSidebar';

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
  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-auto">
      <div className="flex items-center justify-around rounded-3xl border border-slate-800/80 bg-slate-950/85 px-3 py-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        {/* 1. TempMail Inbox */}
        <button
          type="button"
          onClick={() => onSelectFolder('inbox')}
          className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all active:scale-95 ${
            currentFolder === 'inbox' || currentFolder === 'all'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Inbox className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Inbox</span>
        </button>

        {/* 2. Generator PRO */}
        <button
          type="button"
          onClick={() => {
            onSelectFolder('am_accounts');
            onOpenAmPremiumModal();
          }}
          className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all active:scale-95 ${
            currentFolder === 'am_accounts'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
            <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight">Generator</span>
        </button>

        {/* 3. Center Highlight: Video Studio */}
        <button
          type="button"
          onClick={onOpenVideoStudio}
          className="flex flex-col items-center justify-center -mt-6 h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 text-white shadow-xl shadow-rose-600/40 active:scale-90 transition-all border-2 border-slate-900"
          title="Viral Video Clipper Studio"
        >
          <Scissors className="h-5 w-5" />
        </button>

        {/* 4. Cyber Power Studio */}
        {onOpenGarapanModal && (
          <button
            type="button"
            onClick={onOpenGarapanModal}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl text-slate-400 hover:text-indigo-300 transition-all active:scale-95"
          >
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] text-indigo-300 font-bold tracking-tight">DevTools</span>
          </button>
        )}

        {/* 5. VIP Upgrade */}
        <button
          type="button"
          onClick={onOpenQrisModal}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl text-slate-400 hover:text-amber-300 transition-all active:scale-95"
        >
          <Crown className="h-5 w-5 text-amber-400" />
          <span className="text-[10px] text-amber-300 font-bold tracking-tight">VIP PRO</span>
        </button>
      </div>
    </div>
  );
}
