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
  Flame,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

interface AmPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: () => void;
}

interface AccountResult {
  email: string;
  success: boolean;
  statusText: string;
  duration?: string;
  error?: string;
}

export function AmPremiumModal({ isOpen, onClose, onSuccessCreated }: AmPremiumModalProps) {
  const [count, setCount] = useState<number>(1);
  const [customAlias, setCustomAlias] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const text = results
      .filter((r) => r.success)
      .map((r) => `${r.email} | ${r.duration || '1 Tahun Premium'}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-2xl">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Auto AM Premium Generator</span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-black text-emerald-300">
                  V2 ENGINE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate email &amp; aktivasi Alight Motion Premium otomatis
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-300 space-y-1 mb-4">
          <div className="font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Alur Otomatis 100%:</span>
          </div>
          <p className="text-slate-400">
            Generate email TempMail ➡️ Minta Magic Link AM ➡️ Tangkap &amp; Salin Link Sign In ➡️ Verifikasi &amp; Aktivasi 1 Tahun Premium otomatis!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
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
                <span>Sedang Memproses Aktivasi ({count} Akun)...</span>
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
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Hasil Pembuatan Akun ({results.filter((r) => r.success).length}/{results.length} Sukses):
              </span>
              {results.filter((r) => r.success).length > 1 && (
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  {copiedAll ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Salin Semua</span>
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {results.map((acc, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl border p-2 text-xs transition-all ${
                    acc.success
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono font-bold text-white truncate">{acc.email}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {acc.success ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300">{acc.duration || '1 Tahun Premium'}</span>
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
                    <button
                      onClick={() => handleCopy(acc.email, idx)}
                      className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 shrink-0 active:scale-90 transition-all"
                      title="Salin Email"
                    >
                      {copiedIndex === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
