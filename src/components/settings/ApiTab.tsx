'use client';

import React, { useState } from 'react';
import { Key, Copy, Check, Trash2 } from 'lucide-react';
import { AppSettings } from '@/types';

interface ApiTabProps {
  settings: AppSettings | null;
  onRefreshSettings: () => void;
}

export function ApiTab({ settings, onRefreshSettings }: ApiTabProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  const webhookUrl = `${currentHost}/api/inbound/webhook`;
  const webhookSecret = settings?.webhookSecret || 'sec_tempmail_123';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerateSecret = async () => {
    if (!confirm('Buat ulang Webhook Secret? Anda harus memperbarui konfigurasi di gateway/Cloudflare Anda.')) return;
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate-secret' }),
      });
      onRefreshSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-api-key', name: newKeyName.trim() }),
      });
      setNewKeyName('');
      onRefreshSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveApiKey = async (keyId: string) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-api-key', keyId }),
      });
      onRefreshSettings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook Endpoint */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h4 className="text-sm font-bold text-white">Inbound Webhook Endpoint</h4>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Webhook URL:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 font-mono rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-cyan-300"
            />
            <button
              onClick={() => handleCopy(webhookUrl, 'wh-url')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              {copiedKey === 'wh-url' ? 'Disalin' : 'Salin URL'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400">Webhook Secret Key:</label>
            <button
              onClick={handleRegenerateSecret}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Buat Ulang Secret
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookSecret}
              className="flex-1 font-mono rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-amber-300"
            />
            <button
              onClick={() => handleCopy(webhookSecret, 'wh-sec')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              {copiedKey === 'wh-sec' ? 'Disalin' : 'Salin Secret'}
            </button>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white">API Token untuk Integrasi Programatik</h4>
          <p className="text-xs text-slate-400">Gunakan token untuk mengambil email via skrip Python / Node.js / cURL.</p>
        </div>

        <form onSubmit={handleAddApiKey} className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nama token (contoh: Bot Telegram, Skrip Otomasi)"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Buat Token
          </button>
        </form>

        <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          {(settings?.apiKeys || []).map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 text-xs">
              <div>
                <div className="font-bold text-slate-200">{k.name}</div>
                <div className="font-mono text-[11px] text-slate-500">{k.key}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(k.key, k.id)}
                  className="rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                >
                  {copiedKey === k.id ? 'Disalin' : 'Salin Token'}
                </button>
                <button
                  onClick={() => handleRemoveApiKey(k.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
