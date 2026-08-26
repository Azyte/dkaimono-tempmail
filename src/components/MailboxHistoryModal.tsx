'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Search,
  Mail,
  ArrowRight,
  Trash2,
  Inbox,
  Clock,
  Sparkles,
  Check,
  PlusCircle,
} from 'lucide-react';
import { Mailbox, DomainConfig } from '@/types';

interface MailboxHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  activeDomain: string;
  domains: DomainConfig[];
  onSelectMailbox: (address: string) => void;
}

export function MailboxHistoryModal({
  isOpen,
  onClose,
  currentAddress,
  activeDomain,
  domains,
  onSelectMailbox,
}: MailboxHistoryModalProps) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(activeDomain || 'loginptn.xyz');

  const fetchMailboxes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mailboxes');
      const data = await res.json();
      if (data.success && Array.isArray(data.mailboxes)) {
        setMailboxes(data.mailboxes);
      }
    } catch (e) {
      console.error('Error fetching mailboxes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMailboxes();
      setSearchQuery('');
      if (activeDomain) setSelectedDomain(activeDomain);
    }
  }, [isOpen, activeDomain]);

  if (!isOpen) return null;

  const filteredMailboxes = mailboxes.filter((mb) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return mb.address.toLowerCase().includes(q) || mb.name.toLowerCase().includes(q);
  });

  const handleSelect = (address: string) => {
    onSelectMailbox(address);
    onClose();
  };

  const handleDelete = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Hapus kotak masuk ${address} dan semua pesannya?`)) return;

    try {
      const res = await fetch(`/api/mailboxes/${encodeURIComponent(address)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMailboxes((prev) => prev.filter((m) => m.address !== address));
        if (currentAddress === address) {
          // If deleted active mailbox, switch to another or random
          const remaining = mailboxes.filter((m) => m.address !== address);
          if (remaining.length > 0) {
            onSelectMailbox(remaining[0].address);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrOpenSearched = () => {
    const cleanQuery = searchQuery.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    if (!cleanQuery) return;

    const targetAddress = cleanQuery.includes('@')
      ? cleanQuery
      : `${cleanQuery}@${selectedDomain || 'loginptn.xyz'}`;

    handleSelect(targetAddress);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const exactMatchExists = mailboxes.some(
    (m) =>
      m.address.toLowerCase() === searchQuery.toLowerCase().trim() ||
      m.name.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
      <div className="relative flex h-full max-h-[750px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Cari &amp; Buka Kotak Masuk Lama</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Pilih atau ketik nama email yang pernah Anda pakai untuk memulihkan pesan-pesannya
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Search & Domain Bar */}
        <div className="border-b border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 space-y-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-indigo-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateOrOpenSearched();
              }}
              placeholder="Ketik nama email lama atau baru (misal: ninja, user123, netflix)..."
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>

          {/* Quick Jump / Create Action Bar (when typing) */}
          {searchQuery.trim().length > 0 && !exactMatchExists && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-indigo-200">
                  Buka / Aktifkan Kotak Masuk:
                </p>
                <p className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                  {searchQuery.includes('@')
                    ? searchQuery
                    : `${searchQuery.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '')}@${selectedDomain}`}
                </p>
              </div>

              <button
                onClick={handleCreateOrOpenSearched}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Buka Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* Mailbox List Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 divide-y divide-slate-800/60">
          <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Daftar Email yang Pernah Dipakai ({filteredMailboxes.length})</span>
            {isLoading && <span className="text-indigo-400 animate-pulse">Memuat...</span>}
          </div>

          {filteredMailboxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 shadow-inner">
                <Inbox className="h-6 w-6 text-slate-400" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-200">
                {searchQuery ? 'Email belum pernah dipakai' : 'Belum ada riwayat email'}
              </h4>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                {searchQuery
                  ? `Klik tombol "Buka Sekarang" di atas untuk langsung membuat dan membuka ${searchQuery}@${selectedDomain}`
                  : 'Email yang pernah dibuat atau menerima pesan akan otomatis tersimpan di sini.'}
              </p>
            </div>
          ) : (
            filteredMailboxes.map((mb) => {
              const isActive = currentAddress === mb.address;
              const msgCount = mb.messageCount ?? 0;
              const unreadCount = mb.unreadCount ?? 0;

              return (
                <div
                  key={mb.id || mb.address}
                  onClick={() => handleSelect(mb.address)}
                  className={`group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${
                    isActive
                      ? 'bg-indigo-950/40 border border-indigo-500/50 shadow-inner'
                      : 'hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono font-bold text-sm shadow-md ${
                      isActive
                        ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {mb.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-mono text-xs sm:text-sm truncate ${
                          isActive ? 'font-bold text-white' : 'font-semibold text-slate-200'
                        }`}>
                          {mb.address}
                        </p>
                        {isActive && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{formatTime(mb.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Message Count Badge */}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-mono font-bold border ${
                      msgCount > 0
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {msgCount} pesan
                    </span>

                    {/* Delete Mailbox Button */}
                    <button
                      onClick={(e) => handleDelete(mb.address, e)}
                      title="Hapus kotak masuk ini dari riwayat"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="p-1.5 rounded-xl text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
