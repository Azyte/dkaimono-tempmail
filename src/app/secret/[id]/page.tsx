'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Eye, Copy, Check, ShieldAlert, Sparkles, ArrowLeft, Flame } from 'lucide-react';
import Link from 'next/link';

export default function SecretViewPage() {
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : '';

  const [secretContent, setSecretContent] = useState<string | null>(null);
  const [isBurned, setIsBurned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRevealSecret = async () => {
    // Extract key from URL hash (#key)
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      setError('Kunci dekripsi hilang dari tautan URL. Pesan tidak dapat dibuka.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/secrets/${encodeURIComponent(rawId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: hash }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setSecretContent(data.content);
        setIsBurned(data.burned);
      } else {
        setError(data.error || 'Pesan rahasia ini sudah hancur (self-destructed) atau kedaluwarsa.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!secretContent) return;
    navigator.clipboard.writeText(secretContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Dkaimono TempMail</span>
          </Link>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
            <Lock className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pesan Rahasia Terenkripsi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pesan ini dilindungi enkripsi AES-256-GCM dan akan hancur otomatis setelah dibaca.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {!secretContent && !error && (
            <div className="text-center space-y-4 py-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 leading-relaxed text-left flex items-start gap-3">
                <Flame className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Peringatan Self-Destruct:</span>
                  Mengklik tombol di bawah akan membuka pesan dan langsung memusnahkannya secara permanen dari server.
                </div>
              </div>

              <button
                type="button"
                onClick={handleRevealSecret}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                <span>{isLoading ? 'Mendekripsi Pesan...' : '🔓 Buka & Hancurkan Pesan Sekarang'}</span>
              </button>
            </div>
          )}

          {error && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Pesan Tidak Ditemukan / Sudah Hangus</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{error}</p>
              </div>
              <Link
                href="/"
                className="inline-block rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 py-2.5 px-4 transition-all"
              >
                Buat Pesan Rahasia Baru
              </Link>
            </div>
          )}

          {secretContent && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Isi Pesan Rahasia:</span>
                </span>

                {isBurned && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    <span>Sudah Hangus (Destroyed)</span>
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap break-all leading-relaxed select-all">
                {secretContent}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 px-4 text-xs font-bold text-white border border-slate-700 transition-all active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Teks Berhasil Disalin!' : 'Salin Pesan Rahasia'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
