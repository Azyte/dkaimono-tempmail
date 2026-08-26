'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  X,
  Lock,
  Link,
  Share2,
} from 'lucide-react';
import { DomainConfig, Mailbox } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface MailboxHeaderProps {
  mailbox: Mailbox | null;
  domains: DomainConfig[];
  activeDomain: string;
  onSelectDomain: (domain: string) => void;
  onSelectMailbox: (address: string) => void;
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
  onSelectMailbox,
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInputValue, setAliasInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const domain = activeDomain || mailbox?.domain || 'loginptn.xyz';
  const localPart = mailbox?.name || 'user';
  const fullAddress = mailbox?.address || `${localPart}@${domain}`;

  useEffect(() => {
    if (isEditingAlias) {
      setAliasInputValue(localPart);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isEditingAlias, localPart]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      fireConfetti();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyShareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof window !== 'undefined') {
        const shareUrl = `${window.location.origin}/?mail=${encodeURIComponent(localPart)}`;
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        fireConfetti();
        setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy share link', e);
    }
  };

  const handleSaveAlias = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAlias = aliasInputValue.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    if (!cleanAlias) {
      setIsEditingAlias(false);
      return;
    }
    const newFullAddress = `${cleanAlias}@${domain}`;
    onSelectMailbox(newFullAddress);
    setIsEditingAlias(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveAlias();
    } else if (e.key === 'Escape') {
      setIsEditingAlias(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-950 p-3 sm:p-5 lg:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"></div>
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
        {/* Top Row: Domain Selector & Auto-Refresh Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* Domain Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
            >
              <Globe className="h-3 w-3 text-sky-400 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">@{domain}</span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>

            {domainDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl z-50 backdrop-blur-xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Domain Tersedia:
                </div>
                {domains.map((dom) => (
                  <button
                    key={dom.id}
                    onClick={() => {
                      onSelectDomain(dom.name);
                      setDomainDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                      domain === dom.name
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">@{dom.name}</span>
                    {dom.isPrimary && (
                      <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] text-indigo-300">
                        Utama
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

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

        {/* Middle: Email Address Card with Inline Alias Editor */}
        <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3 sm:p-4 shadow-inner transition-all hover:border-indigo-500/60">
          {isEditingAlias ? (
            /* Inline Edit Mode Form */
            <form onSubmit={handleSaveAlias} className="space-y-2.5">
              <div className="flex items-center rounded-xl border border-indigo-500 bg-slate-900/90 px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/50">
                <input
                  ref={inputRef}
                  type="text"
                  value={aliasInputValue}
                  onChange={(e) => setAliasInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ketik_alias"
                  className="flex-1 min-w-0 bg-transparent font-mono text-sm sm:text-base font-bold text-white placeholder-slate-500 focus:outline-none"
                />
                <span className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 shrink-0 ml-1.5">
                  <Lock className="h-3 w-3 text-slate-400" />
                  @{domain}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan &amp; Buka</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingAlias(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-3">
              {/* Clickable Address Bar */}
              <div
                onClick={() => setIsEditingAlias(true)}
                className="flex items-center justify-between gap-2 cursor-pointer group/alias rounded-xl p-1 -m-1 hover:bg-slate-900/60 transition-colors"
                title="Klik untuk ubah nama alias"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white group-hover/alias:text-indigo-200">
                    <span className="border-b border-dashed border-indigo-500 pb-0.5 text-white">
                      {localPart}
                    </span>
                    <span className="text-cyan-400 font-semibold">@{domain}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">(Ketuk untuk ubah alias)</p>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover/alias:bg-indigo-500/20 group-hover/alias:text-indigo-300">
                  <Edit3 className="h-4 w-4" />
                </div>
              </div>

              {/* 2 Big Primary Buttons on Mobile & Desktop */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopyShareLink}
                  title="Salin link langsung ke inbox ini untuk pembeli"
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 text-xs font-bold transition-all active:scale-95 ${
                    linkCopied
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/15'
                      : 'border-slate-700 bg-slate-850 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Bagikan Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all shadow-md active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Salin Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row: Mobile-Friendly Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Random New Mailbox */}
          <button
            onClick={onGenerateRandom}
            title="Buat alamat acak baru"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 py-2 px-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Acak Baru</span>
          </button>

          {/* Custom Alias Button */}
          <button
            onClick={() => setIsEditingAlias(true)}
            title="Ketik nama alias kustom"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 py-2 px-2.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Ubah Alias</span>
          </button>

          {/* Test Email */}
          <button
            onClick={onOpenTestEmail}
            title="Simulasikan email masuk"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 py-2 px-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 active:scale-95"
          >
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Test Mail</span>
          </button>

          {/* Scan QR */}
          <button
            onClick={onOpenQrCode}
            title="Tampilkan QR Code"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 py-2 px-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Scan QR</span>
          </button>
        </div>

        {/* Clear Mailbox Messages (if any) */}
        {totalMessages > 0 && (
          <button
            onClick={onClearMailbox}
            title="Bersihkan semua pesan di mailbox ini"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>Bersihkan Inbox ({totalMessages} pesan)</span>
          </button>
        )}
      </div>
    </div>
  );
}
