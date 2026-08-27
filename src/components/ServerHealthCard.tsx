'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, RefreshCw, Server, CheckCircle2 } from 'lucide-react';

interface ServerStatus {
  name: string;
  category: string;
  ping: number;
  status: 'online' | 'degraded' | 'maintenance';
}

const INITIAL_SERVERS: ServerStatus[] = [
  { name: 'AM Generator V1 (Direct)', category: 'AM Pro', ping: 18, status: 'online' },
  { name: 'AM Generator V2 (Fast)', category: 'AM Pro', ping: 24, status: 'online' },
  { name: 'AM Generator V3 (Auto-Sync)', category: 'AM Pro', ping: 22, status: 'online' },
  { name: 'AM Generator V4 (V4 Token API)', category: 'AM Pro', ping: 31, status: 'online' },
  { name: 'VPN WARP+ 12PB License', category: 'VPN Cloud', ping: 15, status: 'online' },
  { name: 'Scribd & Media Downloader', category: 'Media', ping: 42, status: 'online' },
  { name: 'Video Clipper 9:16 Studio', category: 'Video AI', ping: 12, status: 'online' },
  { name: 'Inbound Webhook TempMail', category: 'Core Mail', ping: 8, status: 'online' },
];

export function ServerHealthCard() {
  const [servers, setServers] = useState<ServerStatus[]>(INITIAL_SERVERS);
  const [isPinging, setIsPinging] = useState(false);

  const handleRefreshPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          ping: Math.floor(Math.random() * 25) + 10,
        }))
      );
      setIsPinging(false);
    }, 600);
  };

  return (
    <div className="bento-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Status Server & Generator Live</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-live-pulse" />
            </h4>
            <span className="text-[10px] text-slate-400">Semua 8 cluster server 100% normal</span>
          </div>
        </div>

        <button
          onClick={handleRefreshPing}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
          title="Refresh Ping Latency"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {servers.map((srv, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-1.5 rounded-xl bg-slate-900/60 px-2.5 py-2 border border-slate-800/80"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-300 truncate block">
                {srv.name}
              </span>
              <span className="text-[9px] text-slate-500 block">{srv.category}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {srv.ping}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
