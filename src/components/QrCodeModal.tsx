'use client';

import React, { useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailAddress?: string;
  address?: string;
}

export function QrCodeModal({ isOpen, onClose, emailAddress, address }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetEmail = emailAddress || address || '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const mailboxUrl = `${currentOrigin}/?mail=${encodeURIComponent(targetEmail)}`;
  // Clean, high-contrast QR code (black on white) for 100% reliable camera scanning on all smartphones
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(mailboxUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mailboxUrl);
    setCopied(true);
    fireConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <QrCode className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Scan untuk Buka di HP</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* High Contrast QR Container for Instant Camera Detection */}
          <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-2xl bg-white p-3 shadow-xl ring-4 ring-cyan-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR Code untuk ${emailAddress}`}
              className="h-full w-full object-contain rounded-lg"
            />
          </div>

          <div className="space-y-1 text-center">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 max-w-full truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="truncate">{emailAddress}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Arahkan kamera smartphone ke barcode di atas untuk langsung membuka dan menyinkronkan kotak masuk akun ini.
            </p>
          </div>

          {/* Copy Direct Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 py-2.5 px-4 transition-all active:scale-95 shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            <span>{copied ? 'Tautan Inbox Berhasil Disalin!' : 'Salin Tautan Akses Inbox'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
