'use client';

import React from 'react';
import {
  Inbox,
  Zap,
  Scissors,
  QrCode,
  Palette,
  Gift,
  Share2,
  Award,
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
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden">
      <div className="flex items-center justify-around rounded-2xl border border-slate-700/80 bg-slate-950/90 px-2 py-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        {/* 1. TempMail Inbox */}
        <button
          type="button"
          onClick={() => onSelectFolder('inbox')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-95 ${
            currentFolder === 'inbox' || currentFolder === 'all'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Inbox className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Inbox</span>
        </button>

        {/* 2. Generator PRO */}
        <button
          type="button"
          onClick={() => {
            onSelectFolder('am_accounts');
            onOpenAmPremiumModal();
          }}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-95 ${
            currentFolder === 'am_accounts'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
            <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[10px]">Generator</span>
        </button>

        {/* 3. Center Highlight: Video Studio */}
        <button
          type="button"
          onClick={onOpenVideoStudio}
          className="flex flex-col items-center justify-center -mt-5 h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-rose-600/40 active:scale-95 transition-all border-2 border-slate-900"
          title="Viral Video Clipper Studio"
        >
          <Scissors className="h-6 w-6" />
        </button>

        {/* 4. Garapan App Prem */}
        {onOpenGarapanModal && (
          <button
            type="button"
            onClick={onOpenGarapanModal}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-indigo-400 transition-all active:scale-95"
          >
            <Award className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] text-indigo-300 font-bold">Garapan</span>
          </button>
        )}

        {/* 5. QRIS Upgrade */}
        <button
          type="button"
          onClick={onOpenQrisModal}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-amber-400 transition-all active:scale-95"
        >
          <QrCode className="h-5 w-5 text-amber-400" />
          <span className="text-[10px]">QRIS</span>
        </button>
      </div>
    </div>
  );
}
