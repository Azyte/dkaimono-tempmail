'use client';

import React, { useState } from 'react';
import { X, FlaskConical, ShieldAlert, KeyRound, Newspaper, Receipt, Send, Sparkles } from 'lucide-react';
import { playNotificationSound } from '@/lib/sound';

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  onSuccess: () => void;
}

export function TestEmailModal({
  isOpen,
  onClose,
  recipientEmail,
  onSuccess,
}: TestEmailModalProps) {
  const [selectedType, setSelectedType] = useState<'otp' | 'spam' | 'newsletter' | 'invoice' | 'custom'>('otp');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'otp' as const,
      title: '🔐 Kode Verifikasi OTP',
      desc: 'Simulasi kode 6 digit verifikasi keamanan login Google / Discord.',
      badge: 'Normal / Clean',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: KeyRound,
    },
    {
      id: 'spam' as const,
      title: '💥 Email Simulasi Spam & Undian',
      desc: 'Simulasi pesan spam dengan SPF fail & CAPS untuk menguji retensi folder spam!',
      badge: 'Terdeteksi Spam',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: ShieldAlert,
    },
    {
      id: 'newsletter' as const,
      title: '🚀 Tech Weekly Newsletter',
      desc: 'Email HTML kaya visual, tombol aksi, dan format newsletter modern.',
      badge: 'Rich HTML',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: Newspaper,
    },
    {
      id: 'invoice' as const,
      title: '🧾 Bukti Pembayaran & Lampiran',
      desc: 'Invoice pembayaran dengan file struk PDF terlampir.',
      badge: 'Ada Lampiran',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Receipt,
    },
  ];

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/inbound/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipientEmail,
          type: selectedType,
          subject: customSubject,
          content: customContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playNotificationSound();
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'Gagal mengirim email test');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
              <FlaskConical className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulasi Email Masuk</h3>
              <p className="text-[11px] text-slate-400">Target: <span className="font-mono text-cyan-400">{recipientEmail}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Presets */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300">Pilih jenis email simulasi yang ingin dikirimkan ke kotak masuk ini:</p>

          <div className="grid grid-cols-1 gap-2.5">
            {presets.map((p) => {
              const isSelected = selectedType === p.id;
              const Icon = p.icon;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedType(p.id)}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/20'
                      : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSendTest}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-xs font-bold text-white hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{isSending ? 'Mengirim Simulasi...' : 'Kirim Email Simulasi Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
