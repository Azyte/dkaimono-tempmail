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
  ArrowRight,
} from 'lucide-react';
import { EmailMessage } from '@/types';
import { FolderType } from './FolderSidebar';

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
      'from-blue-600 to-indigo-600',
      'from-purple-600 to-pink-600',
      'from-emerald-600 to-teal-600',
      'from-amber-600 to-orange-600',
      'from-cyan-600 to-blue-600',
      'from-rose-600 to-red-600',
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

      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin}m lalu`;
      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-xl backdrop-blur-xl">
      {/* Search Header Bar */}
      <div className="border-b border-slate-800/80 p-3 bg-slate-900/40">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengirim, subjek, isi email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
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

        {/* Results Counter Subtitle */}
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="truncate">
              {currentFolder === 'all' && 'Semua Pesan'}
              {currentFolder === 'inbox' && 'Kotak Masuk'}
              {currentFolder === 'spam' && 'Pesan Spam'}
              {currentFolder === 'starred' && 'Berbintang'}
            </span>
          </span>
          <span className="font-mono text-cyan-300 font-semibold shrink-0">
            {filteredMessages.length} pesan
          </span>
        </div>
      </div>

      {/* Email List Scrollable Container */}
      <div className="flex-1 divide-y divide-slate-800/50 overflow-y-auto custom-scrollbar">
        {filteredMessages.length === 0 ? (
          /* Clean & Minimalist Empty State */
          <div className="flex h-full flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[320px] space-y-3.5">
            {/* Pulsing Radar Ring */}
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500/20 opacity-75" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-tr from-slate-900 to-indigo-950/60 shadow-lg text-indigo-400">
                <Inbox className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {searchQuery ? 'Tidak ada pesan yang cocok' : 'Kotak Masuk Kosong'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {searchQuery
                  ? 'Coba kata kunci pencarian yang lain.'
                  : 'Sistem aktif mendengarkan. Pesan & OTP baru akan otomatis muncul di sini.'}
              </p>
            </div>

            {/* Quick Interactive Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenTestEmail}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Simulasi Tes Email Masuk</span>
              </button>
            </div>

            {/* ⚡ Quick Tools Bento 2x4 Grid */}
            {onOpenPowerStudio && (
              <div className="w-full max-w-md pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ⚡ Cyber Power Studio (8 IN 1):
                  </span>
                  <button
                    onClick={onOpenPowerStudio}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <span>Semua Tools</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  {[
                    { label: '🔐 Burn Secret', desc: 'Pesan 1x Baca' },
                    { label: '🤖 Webhook Relay', desc: 'Discord / TG' },
                    { label: '🌐 DNS Inspector', desc: 'Cek Record' },
                    { label: '🧰 DevTools', desc: 'JWT & Hash' },
                    { label: '🎵 FLAC Music', desc: 'Download Hi-Res' },
                    { label: '📱 QR Studio', desc: 'Wi-Fi & Link' },
                    { label: '🎭 Anti-Detect', desc: 'User-Agent' },
                    { label: '🛡️ WireGuard VPN', desc: 'Clash YAML' },
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      onClick={onOpenPowerStudio}
                      className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/90 text-left transition-all active:scale-95 group hover:border-indigo-500/40"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-indigo-300 truncate">{t.label}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{t.desc}</div>
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
                className={`group relative cursor-pointer p-3 transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'bg-indigo-950/50 border-l-4 border-l-cyan-400 shadow-inner'
                    : 'hover:bg-slate-900/60'
                } ${!msg.isRead ? 'bg-slate-900/40' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Sender Avatar & Unread Indicator */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                        msg.from.name || msg.from.address
                      )} text-xs font-bold text-white shadow-sm`}
                    >
                      {senderInitial}
                    </div>

                    {!msg.isRead && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={`truncate text-xs ${
                          !msg.isRead ? 'font-bold text-white' : 'font-medium text-slate-300'
                        }`}
                      >
                        {msg.from.name || msg.from.address}
                      </p>

                      <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatTime(msg.receivedAt)}</span>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        !msg.isRead ? 'font-bold text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {msg.subject || '(Tanpa Subjek)'}
                    </p>

                    {/* Body Snippet */}
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                      {msg.text ? msg.text.replace(/\s+/g, ' ').substring(0, 80) : '(Konten HTML)'}
                    </p>

                    {/* Badges Footer */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {msg.isSpam && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-amber-400">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          <span>Spam ({msg.spamScore}%)</span>
                        </span>
                      )}

                      {msg.security.spf === 'pass' && !msg.isSpam && (
                        <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                          SPF OK
                        </span>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.2 text-[9px] font-medium text-slate-300">
                          <Paperclip className="h-2.5 w-2.5 text-slate-400" />
                          <span>{msg.attachments.length}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Star & Delete) */}
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <button
                      onClick={(e) => onToggleStar(msg.id, e)}
                      className={`p-1 rounded-lg transition-colors active:scale-95 ${
                        msg.isStarred
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${msg.isStarred ? 'fill-yellow-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => onDeleteMessage(msg.id, e)}
                      title="Hapus pesan"
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors active:scale-95"
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
