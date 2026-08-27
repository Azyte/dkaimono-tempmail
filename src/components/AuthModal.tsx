'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Lock,
  Mail,
  Crown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { User } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onAuthSuccess?: (user: User, token?: string) => void;
  onSuccess?: () => void;
  onLogout?: () => void;
  onOpenProTab?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSuccess,
  onLogout,
  onOpenProTab,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Numeric Challenge (Verifikasi Angka)
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userNumAnswer, setUserNumAnswer] = useState('');

  const generateNewChallenge = () => {
    const n1 = Math.floor(Math.random() * 40) + 10;
    const n2 = Math.floor(Math.random() * 30) + 5;
    setNum1(n1);
    setNum2(n2);
    setUserNumAnswer('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewChallenge();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const expectedAnswer = num1 + num2;
    if (parseInt(userNumAnswer, 10) !== expectedAnswer) {
      setErrorMsg(`Verifikasi angka salah! Berapa ${num1} + ${num2}?`);
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = {
        username,
        email,
        password,
        numAnswer: userNumAnswer,
        numExpected: expectedAnswer,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Terjadi kesalahan saat memproses permintaan.');
        generateNewChallenge();
      } else {
        setSuccessMsg(data.message || 'Berhasil!');
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('tempmail_session_token', data.token);
          localStorage.setItem('tempmail_saved_user', JSON.stringify(data.user));
        }
        fireConfetti();
        if (typeof onAuthSuccess === 'function') {
          try { onAuthSuccess(data.user, data.token); } catch (e) {}
        }
        if (typeof onSuccess === 'function') {
          try { onSuccess(); } catch (e) {}
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menghubungi server.');
      generateNewChallenge();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-2xl">
        {/* Background Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
              {currentUser ? <Crown className="h-4 w-4 text-amber-300" /> : <UserIcon className="h-4 w-4 text-white" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {currentUser ? 'Akun Saya' : mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Kelola status langganan & profil' : 'Akses fitur eksklusif PRO & bot Telegram'}
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

        {/* Logged-In User Profile View */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Username:</div>
                  <div className="font-mono text-base font-bold text-white">@{currentUser.username}</div>
                </div>
                {currentUser.isPro ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 shadow-sm">
                    <Crown className="h-3.5 w-3.5 fill-amber-400" />
                    <span>MEMBER PRO</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                    Akun Gratis
                  </span>
                )}
              </div>

              {currentUser.isPro ? (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-xs text-indigo-200">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Paket PRO Aktif ({currentUser.proPlan?.toUpperCase() || 'LIFETIME'})</span>
                  </div>
                  <p className="text-[11px] text-indigo-300/80 mt-0.5">
                    {currentUser.proExpiresAt
                      ? `Berlaku hingga: ${new Date(currentUser.proExpiresAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}`
                      : 'Masa Aktif: Selamanya (Lifetime Access)'}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200">
                  <p>Tingkatkan akun Anda ke <b>VIP / PRO</b> untuk bot notifikasi Telegram dan proteksi PIN!</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (typeof onOpenProTab === 'function') {
                    onOpenProTab();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all"
              >
                <Crown className="h-3.5 w-3.5 text-amber-300" />
                <span>{currentUser.isPro ? 'Konfigurasi Bot & PIN PRO' : 'Upgrade ke PRO / Redeem Voucher'}</span>
              </button>

              <button
                onClick={async () => {
                  if (typeof onLogout === 'function') {
                    onLogout();
                  } else {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('tempmail_session_token');
                        localStorage.removeItem('tempmail_saved_user');
                      }
                      if (typeof onSuccess === 'function') onSuccess();
                    } catch (e) {}
                  }
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Username</label>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 focus-within:border-indigo-500">
                <UserIcon className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: ra1ven"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Input (Register only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Pribadi / Kontak (Opsional)</label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 focus-within:border-indigo-500">
                  <Mail className="h-4 w-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email_kamu@gmail.com"
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Password</label>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 focus-within:border-indigo-500">
                <Lock className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Verifikasi Angka (Numeric Math Challenge) */}
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Verifikasi Keamanan Angka:</span>
                </div>
                <button
                  type="button"
                  onClick={generateNewChallenge}
                  title="Ganti angka verifikasi"
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Acak</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 font-mono text-sm font-black text-cyan-300 border border-slate-700 tracking-wider select-none">
                  {num1} + {num2} = ?
                </div>

                <input
                  type="number"
                  required
                  value={userNumAnswer}
                  onChange={(e) => setUserNumAnswer(e.target.value)}
                  placeholder="Ketik hasil angka"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                <span>Masuk Sekarang</span>
              ) : (
                <span>Daftar Akun Baru</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
