'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Clock,
  Mail,
  AlertCircle,
  Plus,
  Crown,
} from 'lucide-react';
import { AmPremiumAccount, User } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface AmAccountsTabProps {
  currentUser: User | null;
  onOpenAmPremiumModal: () => void;
  onOpenMailbox: (alias: string) => void;
  onOpenAuthModal: () => void;
}

export function AmAccountsTab({
  currentUser,
  onOpenAmPremiumModal,
  onOpenMailbox,
  onOpenAuthModal,
}: AmAccountsTabProps) {
  const [accounts, setAccounts] = useState<AmPremiumAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSessionHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tempmail_session_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-session-token'] = token;
      }
      const deviceId = localStorage.getItem('tempmail_device_id') || 'dev_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('tempmail_device_id', deviceId);
      headers['x-device-id'] = deviceId;
    }
    return headers;
  };

  const fetchAccounts = async () => {
    if (!currentUser?.isPro) {
      // Load from local storage fallback
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('tempmail_local_am_accounts');
        if (local) {
          try {
            setAccounts(JSON.parse(local));
          } catch {}
        }
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/am-premium', {
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tempmail_local_am_accounts', JSON.stringify(data.accounts));
        }
      }
    } catch (e) {
      console.error('Failed to load AM accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentUser]);

  const handleCopy = (text: string, type: 'email' | 'link' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else if (type === 'link') {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyAll = () => {
    if (accounts.length === 0) return;
    const text = accounts
      .map(
        (a, i) =>
          `[${i + 1}] Email: ${a.email}\n    Link Inbox: ${a.inboxUrl}\n    Durasi: ${a.duration}\n    Dibuat: ${new Date(a.createdAt).toLocaleString('id-ID')}`
      )
      .join('\n\n');
    handleCopy(text, 'all');
  };

  const handleDownloadTxt = () => {
    if (accounts.length === 0) return;
    const text = accounts
      .map(
        (a, i) =>
          `=== AKUN ALIGHT MOTION PREMIUM #${i + 1} ===\nEmail: ${a.email}\nLink Inbox: ${a.inboxUrl}\nDurasi: ${a.duration}\nStatus: Aktif\nTanggal: ${new Date(a.createdAt).toISOString()}\n`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `am_premium_accounts_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus akun ini dari riwayat?')) return;
    try {
      await fetch(`/api/am-premium?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getSessionHeaders(),
      });
      const updated = accounts.filter((a) => a.id !== id);
      setAccounts(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tempmail_local_am_accounts', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Yakin ingin mengosongkan semua riwayat akun AM Premium?')) return;
    try {
      await fetch('/api/am-premium', {
        method: 'DELETE',
        headers: getSessionHeaders(),
        body: JSON.stringify({ clearAll: true }),
      });
      setAccounts([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tempmail_local_am_accounts');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.email.toLowerCase().includes(q) || a.duration.toLowerCase().includes(q);
  });

  if (!currentUser?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 text-white font-black text-2xl mb-4">
          👑
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white">
          Fitur Khusus Member PRO / VIP
        </h3>
        <p className="mt-1 max-w-md text-xs text-slate-400">
          Generator dan manajemen riwayat Akun Alight Motion (AM) Premium otomatis hanya tersedia untuk pengguna berstatus PRO/VIP.
        </p>

        <button
          onClick={onOpenAuthModal}
          className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all"
        >
          <Crown className="h-4 w-4" />
          <span>Aktivasi PRO / Klaim Voucher</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Zap className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Riwayat Akun AM Premium
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  {accounts.length} Akun Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Daftar akun Alight Motion 1 Tahun Premium yang dibuat otomatis via TempMail.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenAmPremiumModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Akun Baru</span>
            </button>

            <button
              onClick={fetchAccounts}
              disabled={loading}
              title="Refresh Riwayat"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Batch Exports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari email akun..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyAll}
            disabled={accounts.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            disabled={accounts.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Unduh .TXT</span>
          </button>

          {accounts.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Bersihkan Semua"
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Account Cards List */}
      {filteredAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-slate-800 bg-slate-950/60 min-h-[220px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500 mb-3">
            <Mail className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            {searchQuery ? 'Tidak ada akun yang cocok' : 'Belum ada akun AM Premium'}
          </h4>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            {searchQuery
              ? 'Coba kata kunci pencarian yang lain.'
              : 'Klik tombol "Buat Akun Baru" di atas untuk generate akun Alight Motion 1 Tahun secara otomatis!'}
          </p>

          {!searchQuery && (
            <button
              onClick={onOpenAmPremiumModal}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>⚡ Generate Akun Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAccounts.map((acc, index) => {
            const isEmailCopied = copiedEmail === acc.email;
            const isLinkCopied = copiedLink === acc.inboxUrl;
            const alias = acc.alias || acc.email.split('@')[0];

            return (
              <div
                key={acc.id || index}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/70 p-3.5 sm:p-4 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Email and Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        {index + 1}
                      </span>
                      <p className="font-mono text-sm sm:text-base font-bold text-white truncate max-w-full">
                        {acc.email}
                      </p>
                      <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                        {acc.duration || '1 Tahun Premium'}
                      </span>
                    </div>

                    {/* Inbox Link Display */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="shrink-0 text-slate-500">🔗 Link Inbox:</span>
                      <span className="font-mono truncate text-cyan-400 max-w-[240px] sm:max-w-md">
                        {acc.inboxUrl}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Dibuat pada {new Date(acc.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t border-slate-800/60 md:border-0">
                    {/* Copy Email Button */}
                    <button
                      onClick={() => handleCopy(acc.email, 'email')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                        isEmailCopied
                          ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title="Salin alamat email"
                    >
                      {isEmailCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isEmailCopied ? 'Tersalin' : 'Salin Email'}</span>
                    </button>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopy(acc.inboxUrl, 'link')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                        isLinkCopied
                          ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                          : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title="Salin URL kotak masuk"
                    >
                      {isLinkCopied ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      <span>{isLinkCopied ? 'Link Disalin' : 'Salin Link'}</span>
                    </button>

                    {/* Open Mailbox Button */}
                    <button
                      onClick={() => onOpenMailbox(alias)}
                      className="flex items-center gap-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 active:scale-95 transition-all"
                      title="Buka kotak masuk akun ini di dashboard"
                    >
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Buka</span>
                    </button>

                    {/* Delete Single Account Button */}
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                      title="Hapus dari daftar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
