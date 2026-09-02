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
  Coins,
  Joystick,
  Flame,
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

  const domain = activeDomain || mailbox?.domain || 'loginptn.xyz';
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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-cyan-400/50 bg-slate-950 p-4 sm:p-5 shadow-[4px_4px_0px_#00F0FF,6px_6px_0px_#000000]">
      {/* Scanline Background Texture */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col gap-3.5 sm:gap-4 font-mono">
        {/* Top Retro HUD Bar */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-cyan-400/30 pb-2.5">
          {/* Status 1P Indicator */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] sm:text-xs font-black tracking-widest text-cyan-300 uppercase">
              1P STATUS: <span className="text-emerald-400">READY</span>
            </span>
          </div>

          {/* Right: Timer + Stage Domain Selector */}
          <div className="flex items-center gap-2">
            {/* Auto Refresh Counter */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Perbarui inbox manual"
              className="flex items-center gap-1.5 rounded-lg border-2 border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-cyan-400 hover:border-cyan-400 active:scale-95 transition-all shadow-[2px_2px_0px_#000000]"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{refreshCountdown}S</span>
            </button>

            {/* Stage Select (Domain Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border-2 border-fuchsia-400/60 bg-fuchsia-950/50 px-2.5 py-1 text-[11px] font-black text-fuchsia-300 hover:bg-fuchsia-900/60 transition-all active:scale-95 shadow-[2px_2px_0px_#000000]"
              >
                <Globe className="h-3 w-3 text-fuchsia-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[140px]">@{domain}</span>
                <ChevronDown className={`h-3 w-3 text-fuchsia-400 transition-transform ${domainDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Domain Dropdown Menu */}
              {domainDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border-2 border-cyan-400 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-400 border-b border-slate-800 mb-1">
                    STAGE SELECT (DOMAINS)
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                    {domains.map((dom) => (
                      <button
                        key={dom.id}
                        onClick={() => {
                          onSelectDomain(dom.name);
                          setDomainDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold text-left transition-all ${
                          dom.name === domain
                            ? 'bg-cyan-500 text-black font-black'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">@{dom.name}</span>
                        {dom.name === domain && <Check className="h-3.5 w-3.5 shrink-0 text-black" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setDomainDropdownOpen(false);
                        onOpenSettings('dns');
                      }}
                      className="w-full flex items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-black text-fuchsia-400 hover:bg-fuchsia-500/10"
                    >
                      <Globe className="h-3 w-3" />
                      <span>+ KELOLA DOMAIN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Email Screen Frame */}
        <div className="rounded-xl border-2 border-slate-800 bg-black/90 p-3 sm:p-4 shadow-inner">
          {isEditingAlias ? (
            /* Inline Alias Form */
            <form onSubmit={handleSaveAlias} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center rounded-lg border-2 border-cyan-400 bg-slate-900 px-3 py-2 text-white">
                <input
                  ref={inputRef}
                  type="text"
                  value={aliasInputValue}
                  onChange={(e) => setAliasInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="masukkan-alias-game"
                  className="w-full bg-transparent font-mono text-sm sm:text-base font-black text-emerald-400 placeholder-slate-600 focus:outline-none"
                />
                <span className="text-xs text-slate-400 shrink-0">@{domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border-2 border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-black text-black hover:bg-emerald-400 shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Check className="h-4 w-4 text-black" />
                  <span>SAVE [OK]</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAlias(false)}
                  className="flex items-center justify-center rounded-lg border-2 border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Main Email Display */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div
                onClick={() => setIsEditingAlias(true)}
                className="group/alias flex-1 cursor-pointer min-w-0"
                title="Klik untuk ubah nama alias kustom"
              >
                <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-0.5">
                  PLAYER 1 TEMPMAIL ADDRESS:
                </div>
                <p className="truncate font-mono text-base sm:text-lg md:text-xl font-black tracking-tight text-white group-hover/alias:text-emerald-300 transition-colors">
                  <span className="text-emerald-400">{localPart}</span>
                  <span className="text-cyan-400">@{domain}</span>
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Edit3 className="h-3 w-3 text-fuchsia-400" />
                  <span>[KETUK UNTUK GANTI ALIAS]</span>
                </p>
              </div>

              {/* 2 Primary CTA Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyShareLink}
                  title="Bagikan link inbox ini"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-700 bg-slate-900 py-2 px-3 text-xs font-black text-slate-300 hover:border-cyan-400 hover:text-cyan-300 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000]"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5 text-cyan-400" />
                      <span>SHARE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border-2 border-cyan-400 px-4 py-2 text-xs font-black text-black transition-all active:translate-x-[2px] active:translate-y-[2px] ${
                    copied
                      ? 'bg-emerald-400 shadow-[2px_2px_0px_#000000]'
                      : 'bg-cyan-400 hover:bg-cyan-300 shadow-[3px_3px_0px_#000000]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-black" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-black" />
                      <span>[A] COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🎮 Retro Controller 4-Button Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* [B] Reroll / Random */}
          <button
            onClick={onGenerateRandom}
            title="Generate alamat email acak baru"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-400/60 bg-amber-950/40 py-2 px-2.5 text-xs font-black text-amber-300 hover:bg-amber-900/50 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] group"
          >
            <Shuffle className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
            <span className="truncate">[B] RANDOM</span>
          </button>

          {/* [X] Custom Alias */}
          <button
            onClick={onOpenCustomAlias}
            title="Buat nama alias kustom"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-fuchsia-400/60 bg-fuchsia-950/40 py-2 px-2.5 text-xs font-black text-fuchsia-300 hover:bg-fuchsia-900/50 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] group"
          >
            <Edit3 className="h-3.5 w-3.5 text-fuchsia-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">[X] ALIAS</span>
          </button>

          {/* [Y] Test Email OTP */}
          <button
            onClick={onOpenTestEmail}
            title="Kirim email simulasi tes OTP"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-400/60 bg-emerald-950/40 py-2 px-2.5 text-xs font-black text-emerald-300 hover:bg-emerald-900/50 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] group"
          >
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">[Y] TEST OTP</span>
          </button>

          {/* [SELECT] QR Code */}
          <button
            onClick={onOpenQrCode}
            title="Tampilkan QR code scan HP"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-cyan-400/60 bg-cyan-950/40 py-2 px-2.5 text-xs font-black text-cyan-300 hover:bg-cyan-900/50 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] group"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">[SEL] QR</span>
          </button>
        </div>

        {/* Cyber Power Studio Action Banner */}
        {onOpenPowerStudio && (
          <div
            onClick={onOpenPowerStudio}
            className="group/studio flex items-center justify-between gap-3 rounded-xl border-2 border-indigo-500 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-2.5 shadow-[3px_3px_0px_#000000] hover:border-indigo-400 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white font-black shadow-sm">
                <Sparkles className="h-4 w-4 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white group-hover/studio:text-indigo-300 truncate">
                    ⚡ 8-IN-1 CYBER POWER SUITE
                  </span>
                  <span className="rounded bg-indigo-500/20 border border-indigo-400 px-1 py-0.2 text-[8px] font-black text-indigo-300">
                    POWER-UP
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">
                  Burn Secret • Webhooks • DNS • DevTools • FLAC Music • QR • VPN
                </p>
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 flex items-center gap-1 rounded-lg border-2 border-indigo-400 bg-indigo-600 px-3 py-1 text-xs font-black text-white hover:bg-indigo-500 shadow-[2px_2px_0px_#000000]"
            >
              <span>[START]</span>
            </button>
          </div>
        )}

        {/* Clear Messages */}
        {totalMessages > 0 && (
          <button
            onClick={onClearMailbox}
            title="Bersihkan semua pesan di mailbox ini"
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-rose-500/50 bg-rose-950/30 py-1.5 text-xs font-black text-rose-400 hover:bg-rose-900/40 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000]"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>CLEAR INBOX ({totalMessages} ITEMS)</span>
          </button>
        )}
      </div>
    </div>
  );
}
