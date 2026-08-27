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
  Clock,
  Mail,
  Plus,
  Crown,
  Play,
  Key,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { AmPremiumAccount, User } from '@/types';
import { fireConfetti } from '@/lib/confetti';
import { SUPPORTED_SERVICES, ServiceType } from '@/lib/accountGeneratorTypes';

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
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activatingAll, setActivatingAll] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [showPasswords, setShowPasswords] = useState(false);

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
      console.error('Failed to load accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentUser]);

  const handleActivateAccount = async (id: string) => {
    setActivatingId(id);
    try {
      const res = await fetch('/api/am-premium', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify({ action: 'retry', id }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        fireConfetti();
        setAccounts((prev) => prev.map((a) => (a.id === id ? data.account : a)));
      } else {
        alert(data.error || 'Server aktivasi sedang cooldown. Silakan coba kembali dalam beberapa detik.');
      }
    } catch (e) {
      console.error('Activation error:', e);
    } finally {
      setActivatingId(null);
    }
  };

  const handleActivateAllPending = async () => {
    setActivatingAll(true);
    try {
      const res = await fetch('/api/am-premium', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify({ action: 'retry_all' }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.activatedCount > 0) {
          fireConfetti();
        }
        await fetchAccounts();
      }
    } catch (e) {
      console.error('Batch activation error:', e);
    } finally {
      setActivatingAll(false);
    }
  };

  const handleCopy = (text: string, type: 'email' | 'pass' | 'link' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else if (type === 'pass') {
      setCopiedPass(text);
      setTimeout(() => setCopiedPass(null), 2000);
    } else if (type === 'link') {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyAll = () => {
    if (filteredAccounts.length === 0) return;
    const text = filteredAccounts
      .map(
        (a, i) =>
          `[${i + 1}] Layanan: ${a.serviceName || 'Premium Account'}\n    Email: ${a.email}\n    Password: ${a.password || '(Tanpa Password / Magic Link)'}\n    Link Inbox: ${a.inboxUrl}\n    Durasi: ${a.duration}\n    Dibuat: ${new Date(a.createdAt).toLocaleString('id-ID')}`
      )
      .join('\n\n');
    handleCopy(text, 'all');
  };

  const handleDownloadTxt = () => {
    if (filteredAccounts.length === 0) return;
    const text = filteredAccounts
      .map(
        (a, i) =>
          `=== AKUN PREMIUM #${i + 1} (${a.serviceName || 'Universal Pro'}) ===\nEmail: ${a.email}\nPassword: ${a.password || '(Magic Link Auth)'}\nLink Inbox: ${a.inboxUrl}\nDurasi: ${a.duration}\nStatus: ${a.status === 'active' ? 'Aktif' : 'Menunggu Aktivasi'}\nTanggal: ${new Date(a.createdAt).toISOString()}\n`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `premium_accounts_${Date.now()}.txt`;
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
    if (!confirm('Yakin ingin mengosongkan semua riwayat akun Premium?')) return;
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

  const pendingCount = accounts.filter((a) => a.status === 'pending').length;

  const filteredAccounts = accounts.filter((a) => {
    if (selectedService !== 'all') {
      const matchService = (a.serviceType || 'alight_motion') === selectedService;
      if (!matchService) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.email.toLowerCase().includes(q) ||
      a.duration.toLowerCase().includes(q) ||
      (a.serviceName && a.serviceName.toLowerCase().includes(q))
    );
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
          Generator dan manajemen riwayat Akun Premium &amp; Trial otomatis (Alight Motion, Canva, ElevenLabs, Cursor AI) hanya tersedia untuk pengguna berstatus PRO/VIP.
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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Riwayat Akun Pro &amp; Trial
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  {accounts.length} Akun
                </span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 animate-pulse">
                    {pendingCount} Menunggu Aktivasi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Daftar akun Alight Motion, Canva Pro, ElevenLabs, Cursor AI &amp; password otomatis.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {pendingCount > 0 && (
              <button
                onClick={handleActivateAllPending}
                disabled={activatingAll}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 fill-white ${activatingAll ? 'animate-spin' : ''}`} />
                <span>{activatingAll ? 'Mengaktivasi...' : `Aktivasi ${pendingCount} Akun`}</span>
              </button>
            )}

            <button
              onClick={onOpenAmPremiumModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>⚡ Buat Akun Baru</span>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedService('all')}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            selectedService === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          Semua Layanan ({accounts.length})
        </button>

        {(Object.keys(SUPPORTED_SERVICES) as ServiceType[]).map((st) => {
          const s = SUPPORTED_SERVICES[st];
          const c = accounts.filter((a) => (a.serviceType || 'alight_motion') === st).length;
          if (c === 0 && st !== 'alight_motion' && st !== 'canva_pro' && st !== 'elevenlabs') return null;

          return (
            <button
              key={st}
              onClick={() => setSelectedService(st)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedService === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
              <span className="opacity-70 text-[10px]">({c})</span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search & Batch Exports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari email atau layanan..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all"
          >
            {showPasswords ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
            <span>{showPasswords ? 'Sembunyikan Pass' : 'Lihat Pass'}</span>
          </button>

          <button
            onClick={handleCopyAll}
            disabled={filteredAccounts.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            disabled={filteredAccounts.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
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
            {searchQuery ? 'Tidak ada akun yang cocok' : 'Belum ada akun yang digenerate'}
          </h4>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            {searchQuery
              ? 'Coba kata kunci pencarian yang lain.'
              : 'Klik tombol "Buat Akun Baru" di atas untuk generate akun Alight Motion, Canva, ElevenLabs, atau Cursor Pro secara instan!'}
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
            const isPassCopied = copiedPass === acc.password;
            const isLinkCopied = copiedLink === acc.inboxUrl;
            const alias = acc.alias || acc.email.split('@')[0];
            const isPending = acc.status === 'pending';
            const isActivating = activatingId === acc.id;
            const st = (acc.serviceType as ServiceType) || 'alight_motion';
            const serviceDef = SUPPORTED_SERVICES[st] || SUPPORTED_SERVICES.custom;

            return (
              <div
                key={acc.id || index}
                className={`group relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-lg transition-all backdrop-blur-xl ${
                  isPending
                    ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/70 hover:bg-slate-900/90'
                    : 'border-slate-800/90 bg-slate-900/70 hover:border-emerald-500/50 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Email, Password and Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Service Badge */}
                      <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold text-cyan-300 flex items-center gap-1">
                        <span>{serviceDef.icon}</span>
                        <span>{acc.serviceName || serviceDef.name}</span>
                      </span>

                      <p className="font-mono text-sm sm:text-base font-bold text-white truncate max-w-full">
                        {acc.email}
                      </p>

                      {isPending ? (
                        <span className="rounded-md border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                          ⏳ Siap Diaktivasi
                        </span>
                      ) : (
                        <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                          {acc.duration || 'Aktif'}
                        </span>
                      )}
                    </div>

                    {/* 1. WARP+ License & WireGuard Display */}
                    {acc.serviceType === 'warp_plus' && acc.licenseKey && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">🔑 License Key:</span>
                          <span className="font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            {acc.licenseKey}
                          </span>
                          <button
                            onClick={() => handleCopy(acc.licenseKey!, 'pass')}
                            className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            Salin Key
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Proxy Node VLESS URL Display */}
                    {acc.serviceType === 'proxy_nodes' && acc.configUri && (
                      <div className="space-y-1 pt-1">
                        <p className="text-xs font-mono text-cyan-400 truncate max-w-sm sm:max-w-md">
                          {acc.configUri}
                        </p>
                      </div>
                    )}

                    {/* 3. Password Display / Magic Link Notice for Other Services */}
                    {acc.serviceType !== 'warp_plus' && acc.serviceType !== 'proxy_nodes' && (
                      <>
                        {acc.password ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Key className="h-3 w-3 text-amber-400" />
                              <span>Password:</span>
                            </span>
                            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                              {showPasswords ? acc.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => handleCopy(acc.password!, 'pass')}
                              className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              {isPassCopied ? 'Tersalin' : 'Salin Pass'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400/90 font-medium">
                            <Mail className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Login Magic Link (Tanpa Password - Masukkan email di aplikasi HP)</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Inbox Link Display (if applicable) */}
                    {acc.serviceType !== 'proxy_nodes' && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="shrink-0 text-slate-500">🔗 Link Inbox:</span>
                        <span className="font-mono truncate text-cyan-400 max-w-[240px] sm:max-w-md">
                          {acc.inboxUrl}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Dibuat pada {new Date(acc.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t border-slate-800/60 md:border-0 flex-wrap sm:flex-nowrap">
                    {/* Activation Button for Pending Accounts */}
                    {isPending && (
                      <button
                        onClick={() => handleActivateAccount(acc.id)}
                        disabled={isActivating}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-orange-500 active:scale-95 transition-all disabled:opacity-50"
                        title="Aktivasi status Premium akun ini sekarang"
                      >
                        <Zap className={`h-3.5 w-3.5 fill-white ${isActivating ? 'animate-spin' : ''}`} />
                        <span>{isActivating ? 'Mengaktivasi...' : '⚡ Aktivasi Sekarang'}</span>
                      </button>
                    )}

                    {/* WARP+ Action Buttons */}
                    {acc.serviceType === 'warp_plus' && (
                      <>
                        {acc.wireguardConfig && (
                          <button
                            onClick={() => {
                              const blob = new Blob([acc.wireguardConfig!], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `warp-plus-${acc.id.substring(0, 6)}.conf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
                            title="Unduh file konfigurasi WireGuard .conf"
                          >
                            <span>Unduh .conf</span>
                          </button>
                        )}
                        {acc.licenseKey && (
                          <button
                            onClick={() => handleCopy(acc.licenseKey!, 'pass')}
                            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
                            title="Salin License Key"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Salin Key</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Proxy Nodes Action Button */}
                    {acc.serviceType === 'proxy_nodes' && acc.configUri && (
                      <button
                        onClick={() => handleCopy(acc.configUri!, 'email')}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-cyan-500 hover:to-indigo-500 active:scale-95 transition-all"
                        title="Salin URL VLESS / VMess siap konek"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin VLESS URL</span>
                      </button>
                    )}

                    {/* Direct Sign-Up Web Launcher (For services with password/signup) */}
                    {acc.password && serviceDef.signupUrl ? (
                      <a
                        href={serviceDef.signupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-cyan-500 hover:to-indigo-500 active:scale-95 transition-all"
                        title={`Buka web pendaftaran ${serviceDef.name}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Sign-Up</span>
                      </a>
                    ) : null}

                    {/* Copy Combo Email:Pass Button (Only if password exists) */}
                    {acc.password && (
                      <button
                        onClick={() => handleCopy(`${acc.email}:${acc.password}`, 'combo')}
                        className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
                        title="Salin dalam format email:password"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Email:Pass</span>
                      </button>
                    )}

                    {/* Copy Email Button (for email-based services) */}
                    {acc.serviceType !== 'warp_plus' && acc.serviceType !== 'proxy_nodes' && (
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
                    )}

                    {/* Copy Pass Button (if present) */}
                    {acc.password && (
                      <button
                        onClick={() => handleCopy(acc.password!, 'pass')}
                        className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                          isPassCopied
                            ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                            : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                        title="Salin password"
                      >
                        {isPassCopied ? <Check className="h-3.5 w-3.5 text-amber-400" /> : <Key className="h-3.5 w-3.5" />}
                        <span>{isPassCopied ? 'Tersalin' : 'Pass'}</span>
                      </button>
                    )}

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
                      <span>{isLinkCopied ? 'Link Disalin' : 'Link'}</span>
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
