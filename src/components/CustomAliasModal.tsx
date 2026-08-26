'use client';

import React, { useState } from 'react';
import { X, Edit3, Globe, Sparkles } from 'lucide-react';
import { DomainConfig } from '@/types';

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
  const [selectedDomain, setSelectedDomain] = useState(activeDomain || domains[0]?.name || 'yourdomain.com');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlias = aliasName.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    if (!cleanAlias) return;

    const fullAddress = `${cleanAlias}@${selectedDomain}`;
    onSelectMailbox(fullAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 shadow-md">
              <Edit3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Buat Custom Alias TempMail</h3>
              <p className="text-[11px] text-slate-400">Tentukan nama email kustom yang Anda inginkan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nama Alias Depan:</label>
            <div className="flex rounded-xl border border-slate-700 bg-slate-950 overflow-hidden focus-within:border-indigo-500">
              <input
                type="text"
                autoFocus
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value)}
                placeholder="misal: daftar.netflix atau akun123"
                className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <span className="flex items-center bg-slate-900 px-3 text-xs text-slate-400 font-mono">
                @
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Pilih Domain Target:</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {domains.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} {d.isPrimary ? '(Utama)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
            Preview alamat: <span className="font-mono font-bold text-cyan-400">{aliasName || 'nama_alias'}@{selectedDomain}</span>
          </div>

          <button
            type="submit"
            disabled={!aliasName.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            Aktifkan Mailbox Kustom Ini
          </button>
        </form>
      </div>
    </div>
  );
}
