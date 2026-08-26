'use client';

import React from 'react';
import { X, QrCode, Smartphone, Copy } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailAddress: string;
}

export function QrCodeModal({ isOpen, onClose, emailAddress }: QrCodeModalProps) {
  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const mailboxUrl = `${currentOrigin}/?mailbox=${encodeURIComponent(emailAddress)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(mailboxUrl)}&bgcolor=0f172a&color=38bdf8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl text-center">
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Scan untuk Buka di HP</h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Mailbox QR Code"
              className="h-full w-full rounded-xl object-contain"
            />
          </div>

          <div className="space-y-1">
            <p className="font-mono text-xs font-bold text-slate-200 truncate">{emailAddress}</p>
            <p className="text-[11px] text-slate-400">
              Scan barcode di atas menggunakan kamera smartphone untuk langsung membuka inbox sementara ini di HP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
