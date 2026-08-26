'use client';

import React, { useState } from 'react';
import { Zap, Check, Copy } from 'lucide-react';
import { generateCloudflareWorkerCode } from '@/lib/cloudflare-worker-template';

interface CloudflareTabProps {
  webhookSecret: string;
}

export function CloudflareTab({ webhookSecret }: CloudflareTabProps) {
  const [copied, setCopied] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  const webhookUrl = `${currentHost}/api/inbound/webhook`;
  const workerCode = generateCloudflareWorkerCode(webhookUrl, webhookSecret || 'sec_tempmail_123');

  const handleCopy = () => {
    navigator.clipboard.writeText(workerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Integrasi Cloudflare Email Catch-All (Worker)</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cloudflare menyediakan fitur Email Routing gratis tanpa batas. Worker ini akan menangkap semua email ke domain Anda dan mengirimkannya ke webhook TempMail.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-indigo-600 shadow-md self-start sm:self-auto"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Kode Worker Disalin!' : 'Salin Kode Worker'}</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <pre className="max-h-[300px] overflow-y-auto font-mono text-[11px] text-cyan-300/90 leading-relaxed custom-scrollbar selection:bg-indigo-500">
            {workerCode}
          </pre>
        </div>

        <div className="space-y-3 pt-2">
          <h5 className="text-xs font-bold text-slate-200">Langkah Pemasangan di Cloudflare (Hanya 2 Menit):</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">1</span>
              <p className="font-semibold text-slate-200">Buat Worker</p>
              <p className="text-[11px] text-slate-400">Buka Cloudflare Dashboard &gt; Workers &amp; Pages &gt; Create Worker, lalu paste kode di atas &amp; klik Deploy.</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">2</span>
              <p className="font-semibold text-slate-200">Aktifkan Email Routing</p>
              <p className="text-[11px] text-slate-400">Buka menu Email Routing di domain Anda di Cloudflare, klik Enable Email Routing.</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">3</span>
              <p className="font-semibold text-slate-200">Atur Catch-All Rule</p>
              <p className="text-[11px] text-slate-400">Di menu Routing Rules &gt; Catch-all, pilih Action: &quot;Send to a Worker&quot; dan pilih Worker yang dibuat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
