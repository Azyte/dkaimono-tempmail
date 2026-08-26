'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sliders } from 'lucide-react';
import { AppSettings } from '@/types';

interface PoliciesTabProps {
  settings: AppSettings | null;
  onRefreshSettings: () => void;
}

export function PoliciesTab({ settings, onRefreshSettings }: PoliciesTabProps) {
  const [bypassSpam, setBypassSpam] = useState(settings?.bypassSpamFilter ?? true);
  const [retentionHours, setRetentionHours] = useState(settings?.retentionHours ?? 24);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState(settings?.autoRefreshSeconds ?? 10);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled ?? true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setBypassSpam(settings.bypassSpamFilter);
      setRetentionHours(settings.retentionHours);
      setAutoRefreshSecs(settings.autoRefreshSeconds);
      setSoundEnabled(settings.soundEnabled);
    }
  }, [settings]);

  const handleSavePolicies = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bypassSpamFilter: bypassSpam,
          retentionHours,
          autoRefreshSeconds: autoRefreshSecs,
          soundEnabled,
        }),
      });
      onRefreshSettings();
      alert('Pengaturan berhasil disimpan!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-white">Kebijakan Spam &amp; Filter Inbound</h4>
          <p className="text-xs text-slate-400">Atur bagaimana server menangani email yang dicurigai spam.</p>
        </div>

        {/* Bypass Spam Filter Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Bypass Spam Filter (Tangkap Semua Email Masuk)</span>
            </div>
            <p className="text-[11px] text-indigo-200/80 leading-relaxed">
              Saat aktif, SEMUA email termasuk yang gagal SPF/DKIM atau terdeteksi spam <b>tetap diterima dan disimpan</b> di folder &quot;Semua Pesan&quot; dan &quot;Spam&quot; tanpa ada email yang dibuang/didrop.
            </p>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={bypassSpam}
              onChange={(e) => setBypassSpam(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-800 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
          </label>
        </div>

        {/* Retention Hours */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Masa Simpan Email (Auto-Delete Expiry)</label>
          <select
            value={retentionHours}
            onChange={(e) => setRetentionHours(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value={1}>1 Jam (Sangat Sementara)</option>
            <option value={6}>6 Jam</option>
            <option value={24}>24 Jam (1 Hari - Rekomendasi)</option>
            <option value={72}>72 Jam (3 Hari)</option>
            <option value={168}>7 Hari (1 Minggu)</option>
            <option value={0}>Jangan Pernah Dihapus (Permanen)</option>
          </select>
        </div>

        {/* Auto Refresh */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Interval Auto-Refresh Kotak Masuk: {autoRefreshSecs} Detik</label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={autoRefreshSecs}
            onChange={(e) => setAutoRefreshSecs(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>5s (Super Cepat)</span>
            <span>30s</span>
            <span>60s (Santai)</span>
          </div>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-300">Suara Efek Saat Ada Email Masuk</span>
            <p className="text-[11px] text-slate-500">Memutar audio synthesizer saat menerima pesan baru.</p>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-indigo-600"
          />
        </div>

        <div className="pt-3">
          <button
            onClick={handleSavePolicies}
            disabled={savingSettings}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
}
