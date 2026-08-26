'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Mail,
  Key,
  Eye,
  EyeOff,
  Link as LinkIcon,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { SUPPORTED_SERVICES, ServiceType } from '@/lib/accountGeneratorTypes';

interface AmPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: () => void;
}

export function AmPremiumModal({ isOpen, onClose, onSuccessCreated }: AmPremiumModalProps) {
  const [serviceType, setServiceType] = useState<ServiceType>('alight_motion');
  const [count, setCount] = useState<number>(1);
  const [customAlias, setCustomAlias] = useState<string>('');
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!isOpen) return null;

  const currentService = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.alight_motion;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResults([]);

    try {
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

      const res = await fetch('/api/am-premium', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          serviceType,
          count,
          customAlias: count === 1 && customAlias.trim() ? customAlias.trim() : undefined,
          inviteUrl: inviteUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Gagal memproses pembuatan akun.');
      } else {
        setResults(data.accounts || []);
        if (data.successCount > 0 || data.pendingCount > 0) {
          fireConfetti();
          if (onSuccessCreated) onSuccessCreated();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, type: 'email' | 'pass' | 'link' | 'all') => {
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
    const text = results
      .filter((r) => r.success)
      .map(
        (r, i) =>
          `[${i + 1}] Layanan: ${r.serviceName || currentService.name}\n    Email: ${r.email}\n    Password: ${r.password || '(Tanpa Password / Magic Link)'}\n    Link Inbox: ${r.inboxUrl}\n    Durasi: ${r.duration || 'Pro/Trial'}`
      )
      .join('\n\n');
    handleCopyText(text, 'all');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl flex flex-col">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
              {currentService.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Auto Pro &amp; Trial Generator</h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  PRO Feature
                </span>
              </div>
              <p className="text-xs text-slate-400">Generate akun premium &amp; password otomatis.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Service Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Layanan yang Ingin Digenerate:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(SUPPORTED_SERVICES) as ServiceType[]).map((st) => {
                const s = SUPPORTED_SERVICES[st];
                const isSelected = serviceType === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setServiceType(st);
                      setResults([]);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{s.icon}</span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                    </div>
                    <p className="text-xs font-bold text-white truncate w-full">{s.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{s.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Canva Invite Link (If Canva selected) */}
            {currentService.requiresInviteUrl && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Link Undangan Tim Canva (Opsional):</span>
                </label>
                <input
                  type="url"
                  value={inviteUrl}
                  onChange={(e) => setInviteUrl(e.target.value)}
                  placeholder="https://www.canva.com/brand/join?token=..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Masukkan link undangan tim jika ada, sistem akan menyematkannya ke akun baru.
                </p>
              </div>
            )}

            {/* Account Count Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Akun Sekaligus (Batch):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      count === num
                        ? 'border-emerald-500 bg-emerald-600/30 text-emerald-300 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {num} Akun
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Alias (Single account only) */}
            {count === 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Alias Kustom (Opsional):
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 focus-within:border-emerald-500">
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="nama_kustom (acak jika kosong)"
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-500">@loginptn.xyz</span>
                </div>
              </div>
            )}

            {/* Password Info Box */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Password Otomatis</p>
                  <p className="text-[10px] text-slate-400">Password kuat &amp; unik digenerate untuk setiap akun.</p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Auto-Secure
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Memproses {count} Akun {currentService.name}...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  <span>⚡ Eksekusi Buat {count} Akun Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">
                    Hasil Pembuatan ({results.filter((r) => r.success).length}/{results.length} Sukses)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
                  >
                    {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showPasswords ? 'Sembunyikan' : 'Lihat Pass'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 active:scale-95"
                  >
                    {copiedAll ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {results.map((acc, idx) => {
                  const isEmailCopied = copiedEmail === acc.email;
                  const isPassCopied = copiedPass === acc.password;
                  const isLinkCopied = copiedLink === acc.inboxUrl;

                  return (
                    <div
                      key={acc.id || idx}
                      className={`rounded-2xl border p-3 text-xs transition-all ${
                        acc.success
                          ? 'border-emerald-500/40 bg-slate-950/90'
                          : 'border-rose-500/40 bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Email Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">
                              {idx + 1}
                            </span>
                            <span className="font-mono font-bold text-white truncate max-w-full">
                              {acc.email}
                            </span>
                            <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                              {acc.duration || 'Aktif'}
                            </span>
                          </div>

                          {/* Password Row */}
                          {acc.password && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-[11px] text-slate-400">🔑 Pass:</span>
                              <span className="font-mono font-bold text-amber-300">
                                {showPasswords ? acc.password : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(acc.password, 'pass')}
                                className="text-[10px] text-slate-400 hover:text-emerald-400 ml-1"
                              >
                                {isPassCopied ? 'Tersalin' : 'Salin'}
                              </button>
                            </div>
                          )}

                          {/* Inbox Link */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                            <span className="shrink-0">🔗 Inbox:</span>
                            <a
                              href={acc.inboxUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-cyan-400 hover:underline truncate"
                            >
                              {acc.inboxUrl}
                            </a>
                          </div>
                        </div>

                        {/* Quick Copy Action */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.email, 'email')}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                            title="Salin Email"
                          >
                            {isEmailCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <a
                            href={acc.inboxUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-1.5 text-indigo-300 hover:bg-indigo-500/20"
                            title="Buka Inbox"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
