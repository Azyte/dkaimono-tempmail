'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { InboundLog } from '@/types';

export function LogsTab() {
  const [logs, setLogs] = useState<InboundLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!confirm('Bersihkan semua log aktivitas?')) return;
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Log Aktivitas Inbound Masuk</h4>
          <p className="text-xs text-slate-400">Audit setiap transaksi email yang masuk ke gateway server.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-3 w-3 ${logsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Log</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20"
            >
              Bersihkan Log
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada log inbound tercatat.</div>
        ) : (
          <div className="divide-y divide-slate-800 font-mono text-[11px]">
            {logs.map((lg) => (
              <div key={lg.id} className="p-3 space-y-1 hover:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">{new Date(lg.timestamp).toLocaleTimeString()}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      lg.status === 'spam_flagged'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {lg.status === 'spam_flagged' ? 'SPAM FLAGGED' : 'RECEIVED'}
                  </span>
                </div>
                <div className="text-slate-200">
                  <span className="text-slate-400">Dari:</span> {lg.sender} → <span className="text-slate-400">Ke:</span> {lg.recipient}
                </div>
                <div className="text-slate-400 text-[10px] font-sans truncate">
                  Subjek: {lg.subject} • Gateway: {lg.gateway} {lg.details ? `• (${lg.details})` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
