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
  Link,
  Gamepad2,
  Zap,
} from 'lucide-react';
import { DomainConfig, Mailbox } from '@/types';
import { fireConfetti } from '@/lib/confetti';
import { playNotificationSound } from '@/lib/sound';

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
  onOpenAmPremiumModal?: () => void;
  onOpenPowerStudio?: () => void;
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
  onOpenAmPremiumModal,
  onOpenPowerStudio,
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

  const domain = activeDomain || mailbox?.domain || 'sharklasers.com';
  const localPart = mailbox?.name || 'player1';
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
      playNotificationSound();
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
        const shareUrl = `${window.location.origin}/?mail=${encodeURIComponent(fullAddress)}`;
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        playNotificationSound();
        fireConfetti();
        setTimeout(() => setLinkCopied(false), 2000);
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

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-3.5 sm:p-5 shadow-xl backdrop-blur-xl">
      <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
        {/* Top Status & Controls Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          {/* Status Live Pulse */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-300 truncate">
              Inbox Realtime
            </span>
            <span className="hidden xs:inline-block rounded-full bg-emerald-500/15 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
              Online
            </span>
          </div>

          {/* Right Controls: Auto-Refresh Timer + Domain Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Auto Refresh Counter */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Perbarui inbox manual"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95 transition-all"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono text-cyan-300">{refreshCountdown}s</span>
            </button>

            {/* Domain Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/40 transition-all active:scale-95"
              >
                <Globe className="h-3 w-3 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[130px]">@{domain}</span>
                <ChevronDown className={`h-3 w-3 text-cyan-400 shrink-0 transition-transform ${domainDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Domain Dropdown Menu */}
              {domainDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                    Pilih Domain Aktif
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                    {domains.map((dom) => (
                      <button
                        key={dom.id}
                        onClick={() => {
                          onSelectDomain(dom.name);
                          setDomainDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-all ${
                          dom.name === domain
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate font-mono">@{dom.name}</span>
                        {dom.name === domain && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setDomainDropdownOpen(false);
                        onOpenSettings('dns');
                      }}
                      className="w-full flex items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Globe className="h-3 w-3" />
                      <span>+ Kelola / Tambah Domain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Active Email Box */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-3.5">
          {isEditingAlias ? (
            /* Inline Alias Form */
            <form onSubmit={handleSaveAlias} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center rounded-lg border border-cyan-400 bg-slate-950 px-3 py-1.5 text-white">
                <input
                  ref={inputRef}
                  type="text"
                  value={aliasInputValue}
                  onChange={(e) => setAliasInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="masukkan-alias-kustom"
                  className="w-full bg-transparent font-mono text-sm sm:text-base font-bold text-cyan-300 placeholder-slate-600 focus:outline-none"
                />
                <span className="text-xs text-slate-400 shrink-0 font-mono">@{domain}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAlias(false)}
                  className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Main Email Display */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div
                onClick={() => setIsEditingAlias(true)}
                className="group/alias flex-1 cursor-pointer min-w-0"
                title="Klik untuk ubah nama alias kustom"
              >
                <p className="font-mono text-sm sm:text-base md:text-lg font-bold tracking-tight text-white group-hover/alias:text-cyan-200 transition-colors break-all sm:break-normal">
                  <span className="border-b border-dashed border-cyan-400 pb-0.5 text-white">
                    {localPart}
                  </span>
                  <span className="text-cyan-400 font-semibold">@{domain}</span>
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Edit3 className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span>Ketuk untuk mengganti nama alias</span>
                </p>
              </div>

              {/* 2 Primary CTA Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyShareLink}
                  title="Bagikan link langsung ke inbox ini"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 py-1.5 px-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Bagikan</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-sm ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 📱 Mobile Grid Toolbar: 4 Clean Equal Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Acak Baru */}
          <button
            onClick={onGenerateRandom}
            title="Generate alamat email acak baru"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 px-2 text-xs font-semibold text-slate-200 hover:border-amber-500/50 hover:bg-slate-850 active:scale-95 transition-all"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Acak Baru</span>
          </button>

          {/* 2. Ubah Alias */}
          <button
            onClick={onOpenCustomAlias}
            title="Buat nama alias kustom"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 px-2 text-xs font-semibold text-slate-200 hover:border-fuchsia-500/50 hover:bg-slate-850 active:scale-95 transition-all"
          >
            <Edit3 className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
            <span className="truncate">Ubah Alias</span>
          </button>

          {/* 3. Tes Email */}
          <button
            onClick={onOpenTestEmail}
            title="Kirim email simulasi tes OTP"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 px-2 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-850 active:scale-95 transition-all"
          >
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Tes Email</span>
          </button>

          {/* 4. Scan QR */}
          <button
            onClick={onOpenQrCode}
            title="Tampilkan QR code scan HP"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 px-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:bg-slate-850 active:scale-95 transition-all"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Scan QR</span>
          </button>
        </div>

        {/* Cyber Power Studio Quick Action Banner */}
        {onOpenPowerStudio && (
          <div
            onClick={onOpenPowerStudio}
            className="group/studio flex items-center justify-between gap-2.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 p-2.5 shadow-sm hover:border-indigo-400/80 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold shadow-sm">
                <Sparkles className="h-3.5 w-3.5 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover/studio:text-indigo-300 truncate">
                    ⚡ Cyber Power Studio &amp; DevTools Hub
                  </span>
                  <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1 py-0.2 text-[8px] font-bold text-indigo-300">
                    8 IN 1
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Burn Secret • Webhooks • DNS • DevTools • FLAC Music • QR • Anti-Detect
                </p>
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
            >
              <span>Buka</span>
              <span className="text-[9px]">➔</span>
            </button>
          </div>
        )}

        {/* Clear Messages */}
        {totalMessages > 0 && (
          <button
            onClick={onClearMailbox}
            title="Bersihkan semua pesan di mailbox ini"
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>Bersihkan Inbox ({totalMessages} pesan)</span>
          </button>
        )}
      </div>
    </div>
  );
}
