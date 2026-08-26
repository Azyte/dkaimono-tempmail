'use client';

import React, { useState } from 'react';
import {
  Crown,
  Send,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Bot,
  MessageSquare,
  Lock,
  Flame,
} from 'lucide-react';
import { User } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface ProTabProps {
  currentUser: User | null;
  onRefreshUser: () => void;
  onOpenAuthModal: () => void;
}

export function ProTab({ currentUser, onRefreshUser, onOpenAuthModal }: ProTabProps) {
  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PRO Settings state
  const [botToken, setBotToken] = useState(currentUser?.telegramBotToken || '');
  const [chatId, setChatId] = useState(currentUser?.telegramChatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(currentUser?.telegramEnabled || false);
  const [customPin, setCustomPin] = useState(currentUser?.customPin || '');
  const [keepForever, setKeepForever] = useState(currentUser?.keepEmailsForever || false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Telegram state
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg, setTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Handle Redeem Voucher
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!voucherCode.trim()) return;

    setRedeemLoading(true);
    setRedeemMsg(null);
    try {
      const res = await fetch('/api/auth/redeem-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRedeemMsg({ type: 'error', text: data.error || 'Voucher tidak valid.' });
      } else {
        setRedeemMsg({ type: 'success', text: data.message });
        setVoucherCode('');
        fireConfetti();
        onRefreshUser();
      }
    } catch (err: any) {
      setRedeemMsg({ type: 'error', text: err.message || 'Gagal meredeem voucher.' });
    } finally {
      setRedeemLoading(false);
    }
  };

  // 2. Handle Save PRO Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    setSaveLoading(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/auth/pro-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramBotToken: botToken,
          telegramChatId: chatId,
          telegramEnabled,
          customPin,
          keepEmailsForever: keepForever,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveMsg({ type: 'error', text: data.error || 'Gagal menyimpan konfigurasi.' });
      } else {
        setSaveMsg({ type: 'success', text: data.message });
        fireConfetti();
        onRefreshUser();
      }
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message || 'Terjadi kesalahan.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // 3. Handle Test Telegram Notification
  const handleTestTelegram = async () => {
    if (!botToken || !chatId) {
      setTestMsg({ type: 'error', text: 'Masukkan Bot Token dan Chat ID terlebih dahulu!' });
      return;
    }

    setTestLoading(true);
    setTestMsg(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestMsg({ type: 'error', text: data.error || 'Gagal mengirim pesan test.' });
      } else {
        setTestMsg({ type: 'success', text: data.message });
        fireConfetti();
      }
    } catch (err: any) {
      setTestMsg({ type: 'error', text: err.message || 'Gagal menghubungi Telegram API.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Membership Status */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/50 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-cyan-950/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 text-white font-black text-xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Langganan TempMail PRO</h3>
                {currentUser?.isPro ? (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                    AKTIF ({currentUser.proPlan?.toUpperCase() || 'LIFETIME'})
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                    BELUM AKTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser?.isPro
                  ? currentUser.proExpiresAt
                    ? `Masa aktif hingga ${new Date(currentUser.proExpiresAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}`
                    : 'Akses Permanen Selamanya (Lifetime PRO)'
                  : 'Gunakan bot Telegram sendiri & amankan mailbox Anda dengan PIN!'}
              </p>
            </div>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all shrink-0"
            >
              <span>Login / Daftar Dulu</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Redeem Voucher Lisensi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white">Aktivasi Voucher / Lisensi PRO</h4>
        </div>
        <p className="text-xs text-slate-400">
          Punya kode lisensi VIP? Masukkan kode di bawah untuk mengaktifkan status PRO.
        </p>

        {redeemMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              redeemMsg.type === 'success'
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {redeemMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{redeemMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            placeholder="Contoh: VIP-PRO-2026"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-xs uppercase font-bold text-cyan-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={redeemLoading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            {redeemLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Klaim Voucher</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Kode voucher demo untuk Anda coba sekarang: </span>
          <code
            onClick={() => setVoucherCode('VIP-PRO-2026')}
            className="cursor-pointer rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-300 hover:bg-slate-700"
            title="Klik untuk memasukkan"
          >
            VIP-PRO-2026
          </code>
        </div>
      </div>

      {/* Section 2: Konfigurasi Bot Telegram Sendiri (Custom Bot) */}
      <form onSubmit={handleSaveConfig} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-sky-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">Bot Telegram Pribadi (Realtime OTP Notifier)</h4>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={telegramEnabled}
              onChange={(e) => setTelegramEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-800 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
          </label>
        </div>

        <p className="text-xs text-slate-400">
          Masukkan <b>Bot Token</b> dan <b>Chat ID Telegram</b> Anda. Setiap kali ada email atau OTP masuk, bot Anda akan langsung mengirim pesan ke Telegram Anda!
        </p>

        {saveMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              saveMsg.type === 'success'
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {saveMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{saveMsg.text}</span>
          </div>
        )}

        {testMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              testMsg.type === 'success'
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {testMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{testMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Bot Token */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Telegram Bot Token (dari @BotFather)
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Chat ID */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Telegram Chat ID Anda (dari @userinfobot)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Contoh: 123456789"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Telegram Guide Steps */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
            <span>Cara membuat Bot Telegram (1 Menit):</span>
          </div>
          <ol className="list-inside list-decimal space-y-0.5 text-slate-400">
            <li>Buka Telegram, cari bot <b>@BotFather</b> lalu kirim perintah <code>/newbot</code>.</li>
            <li>Salin <b>HTTP API Token</b> yang diberikan ke kolom Bot Token di atas.</li>
            <li>Cari bot <b>@userinfobot</b> untuk melihat angka <b>ID</b> Anda, lalu masukkan ke Chat ID di atas.</li>
            <li>Tekan <b>/start</b> pada bot baru Anda agar bot bisa mengirim pesan ke Anda.</li>
          </ol>
        </div>

        {/* Section 3: Extra PRO Features (PIN Lock & Lifetime Storage) */}
        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Custom PIN */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Kunci PIN Mailbox (Opsional)</span>
            </label>
            <input
              type="password"
              maxLength={6}
              value={customPin}
              onChange={(e) => setCustomPin(e.target.value)}
              placeholder="Contoh: 1234"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Lifetime Storage Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div>
              <div className="text-xs font-semibold text-white">Simpan Email Selamanya</div>
              <div className="text-[10px] text-slate-400">Jangan hapus email otomatis</div>
            </div>
            <input
              type="checkbox"
              checked={keepForever}
              onChange={(e) => setKeepForever(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={testLoading || !botToken || !chatId}
            className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {testLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>🧪 Test Kirim Notifikasi Telegram</span>
          </button>

          <button
            type="submit"
            disabled={saveLoading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            <span>Simpan Konfigurasi PRO</span>
          </button>
        </div>
      </form>
    </div>
  );
}
