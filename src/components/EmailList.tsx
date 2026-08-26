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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/80 shadow-xl backdrop-blur-xl">
      {/* Search Header Bar */}
      <div className="border-b border-slate-800/80 p-3 sm:p-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengirim, subjek, isi email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-9 py-2 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results Counter Subtitle */}
        <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>
            {currentFolder === 'all' && 'Semua Pesan Masuk'}
            {currentFolder === 'inbox' && 'Kotak Masuk (Bersih)'}
            {currentFolder === 'spam' && 'Pesan Spam & Filtered'}
            {currentFolder === 'starred' && 'Pesan Favorit'}
          </span>
          <span className="font-mono text-slate-400">
            {filteredMessages.length} pesan
          </span>
        </div>
      </div>

      {/* Email List Scrollable Container */}
      <div className="flex-1 divide-y divide-slate-800/60 overflow-y-auto custom-scrollbar">
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[280px]">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 shadow-inner">
              <Inbox className="h-6 w-6 sm:h-7 sm:w-7 text-slate-400" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-200">
              {searchQuery ? 'Tidak ada pesan yang cocok' : 'Belum ada email masuk'}
            </h4>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              {searchQuery
                ? 'Coba kata kunci pencarian yang lain.'
                : 'Email masuk akan otomatis muncul di sini secara realtime.'}
            </p>

            <button
              onClick={onOpenTestEmail}
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-all active:scale-95"
            >
              <FlaskConical className="h-3.5 w-3.5 text-indigo-400" />
              <span>Kirim Email Test</span>
            </button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            const senderInitial = (msg.from.name || msg.from.address || '?').charAt(0).toUpperCase();

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                className={`group relative cursor-pointer p-3 sm:p-4 transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500 shadow-inner'
                    : 'hover:bg-slate-900/60'
                } ${!msg.isRead ? 'bg-slate-900/40' : ''}`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  {/* Sender Avatar & Unread Indicator */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                        msg.from.name || msg.from.address
                      )} text-xs sm:text-sm font-bold text-white shadow-md`}
                    >
                      {senderInitial}
                    </div>

                    {!msg.isRead && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-cyan-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={`truncate text-xs ${
                          !msg.isRead ? 'font-bold text-slate-100' : 'font-medium text-slate-300'
                        }`}
                      >
                        {msg.from.name || msg.from.address}
                      </p>

                      <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(msg.receivedAt)}</span>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        !msg.isRead ? 'font-bold text-white' : 'text-slate-200'
                      }`}
                    >
                      {msg.subject || '(Tanpa Subjek)'}
                    </p>

                    {/* Body Snippet */}
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                      {msg.text ? msg.text.replace(/\s+/g, ' ').substring(0, 100) : '(Konten HTML)'}
                    </p>

                    {/* Badges Footer */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {msg.isSpam && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                          <ShieldAlert className="h-3 w-3" />
                          <span>Spam ({msg.spamScore}%)</span>
                        </span>
                      )}

                      {msg.security.spf === 'pass' && !msg.isSpam && (
                        <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                          SPF OK
                        </span>
                      )}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300">
                          <Paperclip className="h-2.5 w-2.5 text-slate-400" />
                          <span>{msg.attachments.length}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Star & Delete) */}
                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <button
                      onClick={(e) => onToggleStar(msg.id, e)}
                      className={`p-1 rounded-lg transition-colors active:scale-95 ${
                        msg.isStarred
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${msg.isStarred ? 'fill-yellow-400' : ''}`} />
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
