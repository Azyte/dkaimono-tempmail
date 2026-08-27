'use client';

import React, { useState } from 'react';
import { X, Edit3, Globe, Sparkles, Plus, Shuffle, Check, Info } from 'lucide-react';
import { DomainConfig } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface CustomAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: DomainConfig[];
  activeDomain: string;
  onSelectMailbox: (address: string) => void;
}

export function CustomAliasModal({
  isOpen,
  onClose,
  domains,
  activeDomain,
  onSelectMailbox,
}: CustomAliasModalProps) {
  const [aliasName, setAliasName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(activeDomain || domains[0]?.name || 'loginptn.xyz');
  const [isManualDomain, setIsManualDomain] = useState(false);
  const [manualDomainText, setManualDomainText] = useState('');

  if (!isOpen) return null;

  const currentDomain = isManualDomain
    ? manualDomainText.trim().toLowerCase().replace(/^@/, '') || 'customdomain.com'
    : selectedDomain;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlias = aliasName.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '') || 'tempuser';
    const cleanDomain = isManualDomain
      ? manualDomainText.trim().toLowerCase().replace(/^@/, '')
      : selectedDomain;

    if (!cleanDomain) return;

    const fullAddress = `${cleanAlias}@${cleanDomain}`;
    fireConfetti();
    onSelectMailbox(fullAddress);
    onClose();
  };

  const handleGenerateRandomAlias = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAliasName(rand);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col">
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 shrink-0 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Custom Email &amp; Multi-Domain Hub</h3>
              <p className="text-xs text-slate-400">Pilih dari 12+ domain siap pakai atau ketik domain custom bebas.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Alias Name Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Nama Alias Depan (Username):</label>
              <button
                type="button"
                onClick={handleGenerateRandomAlias}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 active:scale-95"
              >
                <Shuffle className="h-3 w-3" />
                <span>Acak Nama</span>
              </button>
            </div>

            <div className="flex rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                autoFocus
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value)}
                placeholder="misal: john.doe, akun.kerja, test123"
                className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <span className="flex items-center bg-slate-900 px-3 text-xs text-cyan-300 font-mono font-bold">
                @{currentDomain}
              </span>
            </div>
          </div>

          {/* Domain Selection Tabs: Presets vs Manual Custom Domain */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Pilih Domain Ekstensi:</label>
              <button
                type="button"
                onClick={() => setIsManualDomain(!isManualDomain)}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isManualDomain ? 'Kembali ke Pilihan Domain' : '+ Ketik Domain Bebas'}</span>
              </button>
            </div>

            {!isManualDomain ? (
              /* Preset Domains Grid (12+ Options) */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1 -m-1">
                {domains.map((d) => {
                  const isSelected = selectedDomain === d.name;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDomain(d.name)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold ring-1 ring-indigo-500/50 shadow-sm'
                          : 'border-slate-800/90 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60 active:scale-[0.98]'
                      }`}
                    >
                      <span className="font-mono text-[11px] truncate">@{d.name}</span>
                      {isSelected ? (
                        <Check className="h-3 w-3 text-indigo-400 stroke-[3] shrink-0 ml-1" />
                      ) : d.isPrimary ? (
                        <span className="text-[8px] rounded bg-indigo-500/20 px-1 py-0.2 text-indigo-300 font-bold shrink-0 ml-1">
                          Utama
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Free Manual Domain Input (Generator.email style) */
              <div className="space-y-2 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ketik Domain Apapun (Mode Generator.email Bebas):</span>
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-indigo-500">
                  <span className="text-slate-500 text-xs font-mono mr-1">@</span>
                  <input
                    type="text"
                    value={manualDomainText}
                    onChange={(e) => setManualDomainText(e.target.value)}
                    placeholder="misal: company.com, generator.email, disposable.net"
                    className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Domain baru yang Anda ketik akan langsung otomatis didaftarkan ke sistem TempMail Anda.
                </p>
              </div>
            )}
          </div>

          {/* Realtime Address Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0">Preview Alamat:</span>
            <span className="font-mono font-bold text-cyan-400 truncate text-right">
              {aliasName.trim() || 'nama_alias'}@{currentDomain}
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 py-3 text-xs font-bold text-white hover:from-sky-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" />
            <span>⚡ Aktifkan Mailbox @{currentDomain} Sekarang</span>
          </button>
        </form>
      </div>
    </div>
  );
}
