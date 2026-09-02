'use client';

import React, { useState } from 'react';
import {
  Search,
  Star,
  Trash2,
  Paperclip,
  ShieldAlert,
  Clock,
  Sparkles,
  Inbox,
  FlaskConical,
  X,
  Radio,
  ArrowRight,
  Shield,
  Zap,
  Gamepad2,
  Sword,
  Target,
} from 'lucide-react';
import { EmailMessage } from '@/types';
import { FolderType } from './FolderSidebar';
import { playNotificationSound } from '@/lib/sound';

interface EmailListProps {
  messages: EmailMessage[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onDeleteMessage: (id: string, e: React.MouseEvent) => void;
  onOpenTestEmail: () => void;
  onOpenPowerStudio?: () => void;
  currentFolder: FolderType;
  isLoading: boolean;
}

export function EmailList({
  messages,
  selectedMessageId,
  onSelectMessage,
  onToggleStar,
  onDeleteMessage,
  onOpenTestEmail,
  onOpenPowerStudio,
  currentFolder,
  isLoading,
}: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.subject.toLowerCase().includes(q) ||
      msg.from.name.toLowerCase().includes(q) ||
      msg.from.address.toLowerCase().includes(q) ||
      msg.text.toLowerCase().includes(q)
    );
  });

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-cyan-500 to-blue-600 border-cyan-400',
      'from-fuchsia-500 to-rose-600 border-fuchsia-400',
      'from-emerald-500 to-teal-600 border-emerald-400',
      'from-amber-500 to-orange-600 border-amber-400',
      'from-purple-500 to-indigo-600 border-purple-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);

      if (diffSec < 60) return 'JUST NOW';
      if (diffMin < 60) return `${diffMin}M AGO`;
      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-cyan-400/40 bg-slate-950 shadow-[4px_4px_0px_#00F0FF,6px_6px_0px_#000000] font-mono">
      {/* Search Header Bar */}
      <div className="border-b-2 border-cyan-400/30 p-3 bg-slate-900/70">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="[SEARCH QUEST LOG / SENDER / SUBJ]..."
            className="w-full rounded-lg border-2 border-slate-700 bg-black pl-9 pr-8 py-2 text-xs text-cyan-300 placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quest Log Counter HUD */}
        <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-black text-slate-400 tracking-wider">
          <span className="flex items-center gap-1 text-cyan-400">
            <Gamepad2 className="h-3 w-3" />
            {currentFolder === 'all' && 'QUEST LOG: ALL MESSAGES'}
            {currentFolder === 'inbox' && 'STAGE 1: CLEAN INBOX'}
            {currentFolder === 'spam' && 'DUNGEON: SPAM TRAPS'}
            {currentFolder === 'starred' && 'INVENTORY: STARRED'}
          </span>
          <span className="text-amber-400 font-black">
            TOTAL: {filteredMessages.length} ITEMS
          </span>
        </div>
      </div>

      {/* Email List Scrollable Container */}
      <div className="flex-1 divide-y-2 divide-slate-900 overflow-y-auto custom-scrollbar">
        {filteredMessages.length === 0 ? (
          /* Retro Empty State */
          <div className="flex h-full flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[340px] space-y-4">
            {/* Pulsing Arcade Ring */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-cyan-400/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-slate-900 text-cyan-400 shadow-[3px_3px_0px_#000000]">
                <Gamepad2 className="h-7 w-7" />
              </div>
            </div>

            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="text-xs sm:text-sm font-black text-cyan-300 tracking-widest uppercase">
                {searchQuery ? 'NO MATCHING LOGS' : 'NO INCOMING TRANSMISSION'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {searchQuery
                  ? 'Coba kata kunci pencarian yang lain.'
                  : 'Radar aktif mendengarkan... Kirim pesan untuk trigger event!'}
              </p>
            </div>

            {/* 1-Tap Trigger Test Action */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playNotificationSound();
                  onOpenTestEmail();
                }}
                className="flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-500 px-4 py-2.5 text-xs font-black text-black shadow-[3px_3px_0px_#000000] hover:bg-emerald-400 active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase"
              >
                <FlaskConical className="h-4 w-4 text-black" />
                <span>[START] TRIGGER TEST OTP</span>
              </button>
            </div>

            {/* 🎮 Retro Power-Ups Bento Grid */}
            {onOpenPowerStudio && (
              <div className="w-full max-w-md pt-3 border-t-2 border-cyan-400/20">
                <div className="flex items-center justify-between mb-2 px-1 text-[10px] font-black">
                  <span className="text-cyan-400 uppercase tracking-widest">
                    🕹️ 8-BIT CYBER POWER-UPS:
                  </span>
                  <button
                    onClick={onOpenPowerStudio}
                    className="text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-0.5"
                  >
                    <span>ALL TOOLS</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  {[
                    { label: '🔐 Burn Secret', desc: '1x Self-Destruct' },
                    { label: '🤖 Webhook Relay', desc: 'Discord / TG' },
                    { label: '🌐 DNS Inspector', desc: 'Record Lookup' },
                    { label: '🧰 DevTools', desc: 'JWT & Hash' },
                    { label: '🎵 FLAC Music', desc: 'Hi-Res Audio' },
                    { label: '📱 QR Studio', desc: 'Wi-Fi & Link' },
                    { label: '🎭 Anti-Detect', desc: 'Agent Spoof' },
                    { label: '🛡️ WireGuard VPN', desc: 'Clash YAML' },
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      onClick={onOpenPowerStudio}
                      className="p-2 rounded-xl bg-slate-900 border-2 border-slate-800 text-left transition-all active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] hover:border-cyan-400 group"
                    >
                      <div className="font-black text-slate-200 group-hover:text-cyan-400 truncate">{t.label}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            const senderInitial = (msg.from.name || msg.from.address || '?').charAt(0).toUpperCase();

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                className={`group relative cursor-pointer p-3 sm:p-3.5 transition-all active:translate-x-[1px] ${
                  isSelected
                    ? 'bg-slate-900 border-l-4 border-l-cyan-400 shadow-inner'
                    : 'hover:bg-slate-900/50'
                } ${!msg.isRead ? 'bg-slate-900/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar Badge */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                        msg.from.name || msg.from.address
                      )} border-2 text-xs font-black text-white shadow-[2px_2px_0px_#000000]`}
                    >
                      {senderInitial}
                    </div>

                    {!msg.isRead && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          !msg.isRead ? 'font-black text-cyan-300' : 'font-bold text-slate-300'
                        }`}
                      >
                        {msg.from.name || msg.from.address}
                      </p>

                      <div className="flex items-center gap-1 shrink-0 text-[9px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(msg.receivedAt)}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        !msg.isRead ? 'font-black text-white' : 'text-slate-200'
                      }`}
                    >
                      {msg.subject || '(NO SUBJECT)'}
                    </p>

                    {/* Snippet */}
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                      {msg.text ? msg.text.replace(/\s+/g, ' ').substring(0, 90) : '(HTML PAYLOAD)'}
                    </p>

                    {/* Badges */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[9px]">
                      {msg.isSpam && (
                        <span className="inline-flex items-center gap-1 rounded border border-rose-500/60 bg-rose-950/40 px-1.5 py-0.2 font-black text-rose-400">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          <span>SPAM CRIT ({msg.spamScore}%)</span>
                        </span>
                      )}

                      {msg.security.spf === 'pass' && !msg.isSpam && (
                        <span className="inline-flex items-center rounded border border-emerald-500/60 bg-emerald-950/40 px-1.5 py-0.2 font-bold text-emerald-400">
                          SPF OK
                        </span>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.2 font-bold text-slate-300">
                          <Paperclip className="h-2.5 w-2.5" />
                          <span>DROP ({msg.attachments.length})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <button
                      onClick={(e) => onToggleStar(msg.id, e)}
                      className={`p-1 rounded transition-colors active:scale-90 ${
                        msg.isStarred
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${msg.isStarred ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => onDeleteMessage(msg.id, e)}
                      title="Hapus pesan"
                      className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
