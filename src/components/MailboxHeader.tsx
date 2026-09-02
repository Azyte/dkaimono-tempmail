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
  ShieldCheck,
  Zap,
  Radio,
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
        const shareUrl = `${window.location.origin}/?mail=${encodeURIComponent(fullAddress)}`;
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
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
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
      {/* Ambient Lighting Accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* Top Status & Controls Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-3 sm:pb-4">
          {/* Live Radar Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Inbox Realtime
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              Siap Menerima
            </span>
          </div>

          {/* Right Controls: Auto-Refresh Timer + Domain Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto Refresh Countdown Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Perbarui inbox sekarang"
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-850 active:scale-95 transition-all"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[10px] text-cyan-300">{refreshCountdown}s</span>
            </button>

            {/* Domain Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/40 px-3 py-1 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50 transition-all active:scale-95 shadow-sm"
              >
                <Globe className="h-3 w-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[140px]">@{domain}</span>
                <ChevronDown className={`h-3 w-3 text-indigo-400 transition-transform duration-200 ${domainDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Domain Dropdown Menu */}
              {domainDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                    Pilih Domain Aktif
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                    {domains.map((dom) => (
                      <button
                        key={dom.id}
                        onClick={() => {
                          onSelectDomain(dom.name);
                          setDomainDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-left transition-all ${
                          dom.name === domain
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-mono truncate">@{dom.name}</span>
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
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                      <span>Kelola / Tambah Domain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Active Email Box */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-3.5 sm:p-4 shadow-inner">
          {isEditingAlias ? (
            /* Inline Alias Editor */
            <form onSubmit={handleSaveAlias} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-indigo-500/60 bg-slate-900 px-3 py-2 text-white">
                <input
                  ref={inputRef}
                  type="text"
                  value={aliasInputValue}
                  onChange={(e) => setAliasInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="masukkan-alias-kustom"
                  className="w-full bg-transparent font-mono text-sm sm:text-base font-bold text-cyan-300 placeholder-slate-600 focus:outline-none"
                />
                <span className="font-mono text-xs text-slate-400 shrink-0">@{domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAlias(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Main Email Address Display with Quick Copy */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Clickable Address */}
              <div
                onClick={() => setIsEditingAlias(true)}
                className="group/alias flex-1 cursor-pointer min-w-0"
                title="Klik untuk ubah nama alias kustom"
              >
                <p className="truncate font-mono text-base sm:text-xl md:text-2xl font-black tracking-tight text-white group-hover/alias:text-indigo-200 transition-colors">
                  <span className="border-b border-dashed border-indigo-500/80 pb-0.5 text-white">
                    {localPart}
                  </span>
                  <span className="text-cyan-400 font-bold">@{domain}</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Edit3 className="h-3 w-3 text-indigo-400" />
                  <span>Ketuk untuk mengganti alias nama email</span>
                </p>
              </div>

              {/* 2 Big Primary CTA Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyShareLink}
                  title="Salin link langsung ke inbox ini"
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-bold transition-all active:scale-95 ${
                    linkCopied
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Bagikan</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-md active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-600/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 shrink-0" />
                      <span>Salin Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 📱 Mobile Grid Toolbar: 4 Quick Actions (Clean 4-Column Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Random New */}
          <button
            onClick={onGenerateRandom}
            title="Generate alamat email acak baru"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/80 py-2.5 px-3 text-xs font-bold text-slate-200 hover:border-amber-500/40 hover:bg-slate-850 active:scale-95 transition-all shadow-sm group"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
            <span className="truncate">Acak Baru</span>
          </button>

          {/* 2. Custom Alias */}
          <button
            onClick={onOpenCustomAlias}
            title="Buat nama alias kustom"
            className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 py-2.5 px-3 text-xs font-bold text-indigo-300 hover:border-indigo-400 hover:bg-indigo-900/40 active:scale-95 transition-all shadow-sm group"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Ubah Alias</span>
          </button>

          {/* 3. Test Email Simulation (POPUP) */}
          <button
            onClick={onOpenTestEmail}
            title="Kirim email simulasi tes OTP"
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/40 active:scale-95 transition-all shadow-sm group"
          >
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Tes Email</span>
          </button>

          {/* 4. Scan QR */}
          <button
            onClick={onOpenQrCode}
            title="Buka QR code untuk scan dari HP"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/80 py-2.5 px-3 text-xs font-bold text-slate-200 hover:border-cyan-500/40 hover:bg-slate-850 active:scale-95 transition-all shadow-sm group"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Scan QR</span>
          </button>
        </div>

        {/* Cyber Power Studio Single-Line Action Banner */}
        {onOpenPowerStudio && (
          <div
            onClick={onOpenPowerStudio}
            className="group/studio flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 p-3 shadow-md hover:border-indigo-400/80 hover:shadow-indigo-500/10 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold shadow-sm">
                <Sparkles className="h-4 w-4 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover/studio:text-indigo-300 transition-colors truncate">
                    ⚡ Cyber Power Studio &amp; DevTools Hub
                  </span>
                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-extrabold text-indigo-300">
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
              className="shrink-0 flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
            >
              <span>Buka</span>
              <span className="text-[10px]">➔</span>
            </button>
          </div>
        )}

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
