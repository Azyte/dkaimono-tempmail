'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Shuffle,
  Edit3,
  QrCode,
  FlaskConical,
  RefreshCw,
  Trash2,
  ChevronDown,
  Globe,
  Clock,
  Sparkles,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { DomainConfig, Mailbox } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface MailboxHeaderProps {
  mailbox: Mailbox | null;
  domains: DomainConfig[];
  activeDomain: string;
  onSelectDomain: (domain: string) => void;
  onGenerateRandom: () => void;
  onOpenCustomAlias: () => void;
  onOpenQrCode: () => void;
  onOpenTestEmail: () => void;
  onRefresh: () => void;
  onClearMailbox: () => void;
  onOpenSettings: (tab?: string) => void;
  isRefreshing: boolean;
  refreshCountdown: number;
  totalMessages: number;
}

export function MailboxHeader({
  mailbox,
  domains,
  activeDomain,
  onSelectDomain,
  onGenerateRandom,
  onOpenCustomAlias,
  onOpenQrCode,
  onOpenTestEmail,
  onRefresh,
  onClearMailbox,
  onOpenSettings,
  isRefreshing,
  refreshCountdown,
  totalMessages,
}: MailboxHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);

  const address = mailbox?.address || `temp@${activeDomain || 'yourdomain.com'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      fireConfetti();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Email Address Display & Copy */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
              <Sparkles className="h-3 w-3" />
              Alamat Temp Mail Aktif
            </span>

            {/* Domain Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700/90"
              >
                <Globe className="h-3 w-3 text-sky-400" />
                <span>@{activeDomain || 'default'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {domainDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl z-50">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Domain Tersedia:
                  </div>
                  {domains.map((dom) => (
                    <button
                      key={dom.id}
                      onClick={() => {
                        onSelectDomain(dom.name);
                        setDomainDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                        activeDomain === dom.name
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">@{dom.name}</span>
                      {dom.isPrimary && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                          Utama
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setDomainDropdownOpen(false);
                        onOpenSettings('dns');
                      }}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-sky-400 hover:bg-sky-500/10"
                    >
                      <span>+ Tambah / Konfigurasi Domain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>Catch-All Aktif</span>
            </div>
          </div>

          {/* Email Card & Fast Copy Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="group relative flex flex-1 items-center justify-between rounded-xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 shadow-inner transition-all hover:border-indigo-500/50">
              <div className="min-w-0 flex-1 pr-3">
                <p className="truncate font-mono text-base font-semibold tracking-tight text-white sm:text-xl selection:bg-indigo-500 selection:text-white">
                  {address}
                </p>
              </div>

              {/* Fast Copy Button Inside Input */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Random New Mailbox */}
          <button
            onClick={onGenerateRandom}
            title="Generate alamat email acak baru"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400" />
            <span>Acak Baru</span>
          </button>

          {/* Custom Alias */}
          <button
            onClick={onOpenCustomAlias}
            title="Buat alamat email kustom"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-sky-400" />
            <span>Custom Alias</span>
          </button>

          {/* Test Simulation Email */}
          <button
            onClick={onOpenTestEmail}
            title="Simulasikan email masuk (OTP, Newsletter, Spam, dll)"
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2.5 text-xs font-semibold text-indigo-300 shadow-md transition-all hover:bg-indigo-500/20 hover:text-indigo-200 active:scale-95"
          >
            <FlaskConical className="h-3.5 w-3.5 text-indigo-400" />
            <span>Kirim Test Email</span>
          </button>

          {/* QR Code */}
          <button
            onClick={onOpenQrCode}
            title="Tampilkan QR Code untuk buka di HP"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-300 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <QrCode className="h-4 w-4 text-cyan-400" />
          </button>

          {/* Manual Refresh / Countdown */}
          <button
            onClick={onRefresh}
            title={`Refresh inbox (Auto-refresh dalam ${refreshCountdown}d)`}
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-300 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="tabular-nums font-mono text-[11px] text-slate-400">{refreshCountdown}s</span>
          </button>

          {/* Clear Mailbox Messages */}
          {totalMessages > 0 && (
            <button
              onClick={onClearMailbox}
              title="Bersihkan semua pesan di mailbox ini"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-md transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
