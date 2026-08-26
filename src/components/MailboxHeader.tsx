'use client';

import React, { useState } from 'react';
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
  History,
  Inbox,
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
  onOpenHistory: () => void;
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
  onOpenHistory,
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

  const address = mailbox?.address || `temp@${activeDomain || 'loginptn.xyz'}`;

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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"></div>
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-4 lg:gap-5">
        {/* Top Row: Status Badge & Domain Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              <Sparkles className="h-3 w-3" />
              <span>Email Aktif</span>
            </span>

            {/* Domain Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
              >
                <Globe className="h-3 w-3 text-sky-400" />
                <span className="truncate max-w-[150px]">@{activeDomain || 'loginptn.xyz'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {domainDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl z-50 backdrop-blur-xl">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        activeDomain === dom.name
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
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
                      className="flex w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-sky-400 hover:bg-sky-500/10"
                    >
                      <span>+ Tambah / Setting Domain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Top Actions (History & Auto Refresh) */}
          <div className="flex items-center gap-2">
            {/* Riwayat / Switcher Button */}
            <button
              onClick={onOpenHistory}
              title="Buka daftar email yang pernah dipakai / cari email lama"
              className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/25 hover:text-indigo-200 active:scale-95 transition-all shadow-sm"
            >
              <History className="h-3 w-3 text-indigo-400" />
              <span>Cari Email Lama</span>
            </button>

            {/* Auto Refresh Indicator Pill */}
            <button
              onClick={onRefresh}
              title="Refresh inbox sekarang"
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white active:scale-95 transition-all"
            >
              <RefreshCw className={`h-3 w-3 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-slate-400 font-mono">{refreshCountdown}s</span>
            </button>
          </div>
        </div>

        {/* Middle: Email Address Card with Click-To-Copy */}
        <div
          onClick={handleCopy}
          className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3.5 sm:p-4 shadow-inner cursor-pointer hover:border-indigo-500/60 transition-all active:scale-[0.99]"
        >
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5 sm:hidden">
              Alamat Email Masuk:
            </div>
            <p className="truncate font-mono text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white selection:bg-indigo-500">
              {address}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Salin Alamat</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom Row: Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-2">
          {/* Random New Mailbox */}
          <button
            onClick={onGenerateRandom}
            title="Generate alamat email acak baru"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Acak Baru</span>
          </button>

          {/* Custom Alias */}
          <button
            onClick={onOpenCustomAlias}
            title="Buat alamat email kustom"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Custom Alias</span>
          </button>

          {/* History / Search Old Mailboxes */}
          <button
            onClick={onOpenHistory}
            title="Cari dan buka kotak masuk yang pernah dipakai sebelumnya"
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3 py-2.5 text-xs font-semibold text-indigo-300 shadow-md transition-all hover:bg-indigo-500/25 hover:text-indigo-200 active:scale-95"
          >
            <History className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Riwayat Email</span>
          </button>

          {/* Test Simulation Email */}
          <button
            onClick={onOpenTestEmail}
            title="Simulasikan email masuk (OTP, Newsletter, Spam, dll)"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Test Email</span>
          </button>

          {/* QR Code */}
          <button
            onClick={onOpenQrCode}
            title="Tampilkan QR Code untuk buka di HP"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 shadow-md transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Scan QR HP</span>
          </button>

          {/* Clear Mailbox Messages (if any) */}
          {totalMessages > 0 && (
            <button
              onClick={onClearMailbox}
              title="Bersihkan semua pesan di mailbox ini"
              className="col-span-2 sm:col-span-4 lg:col-auto flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-400 shadow-md transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Bersihkan Inbox ({totalMessages})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
