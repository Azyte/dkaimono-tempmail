'use client';

import React from 'react';
import { Mail, Inbox, ShieldAlert, Star, Activity, ShieldCheck, Zap } from 'lucide-react';

export type FolderType = 'all' | 'inbox' | 'spam' | 'starred' | 'logs' | 'am_accounts';

interface FolderSidebarProps {
  currentFolder: FolderType;
  onSelectFolder: (folder: FolderType) => void;
  onOpenPowerStudio?: () => void;
  counts: {
    all: number;
    inbox: number;
    spam: number;
    starred: number;
    logs: number;
    amAccounts?: number;
  };
  isPro?: boolean;
}

export function FolderSidebar({
  currentFolder,
  onSelectFolder,
  onOpenPowerStudio,
  counts,
  isPro,
}: FolderSidebarProps) {
  const navItems = [
    {
      id: 'all' as FolderType,
      label: 'Semua Pesan',
      sublabel: 'Catch-All Inbound',
      icon: Mail,
      count: counts.all,
      color: 'text-indigo-400',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'inbox' as FolderType,
      label: 'Kotak Masuk',
      sublabel: 'Email Bersih',
      icon: Inbox,
      count: counts.inbox,
      color: 'text-sky-400',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'spam' as FolderType,
      label: 'Spam & Terfilter',
      sublabel: 'Tetap Disimpan',
      icon: ShieldAlert,
      count: counts.spam,
      color: 'text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'starred' as FolderType,
      label: 'Favorit',
      sublabel: 'Pesan Berbintang',
      icon: Star,
      count: counts.starred,
      color: 'text-yellow-400',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    {
      id: 'logs' as FolderType,
      label: 'Log Aktivitas',
      sublabel: 'Audit Masuk',
      icon: Activity,
      count: counts.logs,
      color: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  if (isPro) {
    navItems.push({
      id: 'am_accounts' as FolderType,
      label: '⚡ Auto Pro Hub',
      sublabel: 'AM, Canva, ElevenLabs, Cursor',
      icon: Zap,
      count: counts.amAccounts || 0,
      color: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    });
  } else {
    navItems.push({
      id: 'am_accounts' as FolderType,
      label: '⚡ Auto Pro Hub',
      sublabel: 'Generator Akun (PRO)',
      icon: Zap,
      count: 0,
      color: 'text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    });
  }

  return (
    <div className="flex flex-col justify-between h-full space-y-4 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/80 p-3.5 sm:p-4 shadow-xl backdrop-blur-xl">
      {/* Navigation Folder List */}
      <div className="space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Folder Mailbox
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentFolder === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectFolder(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${item.color}`} />
                <div className="text-left truncate">
                  <div className={`truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className={`ml-2 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${item.badgeColor}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cyber Power Studio Quick Launch Banner */}
      {onOpenPowerStudio && (
        <div
          onClick={onOpenPowerStudio}
          className="rounded-2xl border border-indigo-500/40 bg-gradient-to-tr from-indigo-950/60 via-purple-950/40 to-slate-900/80 p-3.5 shadow-lg hover:border-indigo-400 cursor-pointer active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">⚡</span>
            <span>Cyber Power Studio</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Burn Secret, Webhooks, DNS, DevTools, FLAC Music, QR, Anti-Detect.
          </p>
          <div className="mt-2 text-[10px] font-bold text-indigo-400 group-hover:text-white transition-colors flex items-center gap-1">
            <span>Buka 8 Perkakas</span>
            <span>➔</span>
          </div>
        </div>
      )}

      {/* Catch-All Feature Callout */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Catch-All Auto Inbound</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Semua pesan yang dikirim ke domain Anda akan ditangkap dan ditampilkan tanpa terlewat.
        </p>
      </div>
    </div>
  );
}
