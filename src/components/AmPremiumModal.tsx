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
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { AmAccountResult } from '@/lib/alightMotion';

interface AmPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: () => void;
}

export function AmPremiumModal({ isOpen, onClose, onSuccessCreated }: AmPremiumModalProps) {
  const [count, setCount] = useState<number>(1);
  const [customAlias, setCustomAlias] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AmAccountResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

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
          count,
          customAlias: count === 1 ? customAlias : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Gagal memproses pembuatan akun.');
      } else {
        setResults(data.accounts || []);
        if (data.successCount > 0) {
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

  const handleCopyText = (text: string, type: 'email' | 'link' | 'all') => {
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
    const text = results
      .filter((r) => r.success)
      .map(
        (r, i) =>
          `[${i + 1}] Email: ${r.email}\n    Link Inbox: ${r.inboxUrl}\n    Durasi: ${r.duration || '1 Tahun Premium'}`
      )
      .join('\n\n');
    handleCopyText(text, 'all');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Auto AM Premium Creator</span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-black text-emerald-300">
                  PRO VIP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate email &amp; aktivasi akun Alight Motion 1 Tahun otomatis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Workflow Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-300 space-y-1 mb-3.5">
          <div className="font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Alur Otomatis End-to-End:</span>
          </div>
          <p className="text-slate-400">
            Generate TempMail ➡️ Request Magic Link ke AM ➡️ Tangkap Link Sign In ➡️ Aktivasi 1 Tahun Premium!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Jumlah Akun */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Jumlah Akun</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value={1}>1 Akun</option>
                <option value={2}>2 Akun</option>
                <option value={3}>3 Akun</option>
                <option value={5}>5 Akun</option>
                <option value={10}>10 Akun (Batch)</option>
              </select>
            </div>

            {/* Custom Alias (if count == 1) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Custom Alias {count > 1 ? '(Nonaktif)' : '(Opsional)'}
              </label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                disabled={loading || count > 1}
                placeholder="contoh: rayyenpro"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Memproses Aktivasi Akun ({count} Akun)...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Generate &amp; Aktivasi {count} Akun AM Premium</span>
              </>
            )}
          </button>
        </form>

        {/* Results Display */}
        {results.length > 0 && (
          <div className="mt-3.5 space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Hasil ({results.filter((r) => r.success).length}/{results.length} Berhasil):
              </span>
              {results.filter((r) => r.success).length > 1 && (
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  {copiedAll ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Salin Semua (Email + Link)</span>
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {results.map((acc, idx) => {
                const isEmailCopied = copiedEmail === acc.email;
                const isLinkCopied = copiedLink === acc.inboxUrl;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-2.5 text-xs transition-all space-y-1.5 ${
                      acc.success
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                        : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono font-bold text-white truncate text-xs sm:text-sm">
                          {acc.email}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {acc.success ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span className="text-emerald-300 font-semibold">{acc.duration || '1 Tahun Premium'}</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-rose-400 shrink-0" />
                              <span className="text-rose-400">{acc.error || acc.statusText}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {acc.success && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopyText(acc.email, 'email')}
                            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                              isEmailCopied
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                            title="Salin Email"
                          >
                            {isEmailCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{isEmailCopied ? 'Tersalin' : 'Email'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(acc.inboxUrl, 'link')}
                            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                              isLinkCopied
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                            }`}
                            title="Salin Link Inbox"
                          >
                            {isLinkCopied ? <Check className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                            <span>{isLinkCopied ? 'Tersalin' : 'Link'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {acc.success && (
                      <div className="rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-cyan-400">{acc.inboxUrl}</span>
                        <a
                          href={acc.inboxUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-slate-400 hover:text-white flex items-center gap-0.5 underline ml-1"
                        >
                          <span>Buka</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
