'use client';

import React, { useState } from 'react';
import { Globe, Plus, RefreshCw, Trash2, Check, Copy } from 'lucide-react';
import { DomainConfig } from '@/types';
import { DnsCheckResult } from '@/lib/dns-checker';

interface DnsTabProps {
  domains: DomainConfig[];
  onRefreshDomains: () => void;
  onRefreshSettings: () => void;
}

export function DnsTab({ domains = [], onRefreshDomains, onRefreshSettings }: DnsTabProps) {
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [dnsCheckLoading, setDnsCheckLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState<DnsCheckResult | null>(null);
  const [selectedCheckDomain, setSelectedCheckDomain] = useState(
    Array.isArray(domains) && domains.length > 0 ? domains[0].name : ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    setIsAddingDomain(true);
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDomainInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewDomainInput('');
        onRefreshDomains();
        runDnsCheck(data.domain.name, data.domain.id);
      } else {
        alert(data.error || 'Gagal menambahkan domain');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleSetPrimaryDomain = async (id: string) => {
    try {
      await fetch('/api/domains', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'set-primary' }),
      });
      onRefreshDomains();
      onRefreshSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('Hapus domain ini dari daftar?')) return;
    try {
      await fetch(`/api/domains?id=${id}`, { method: 'DELETE' });
      onRefreshDomains();
    } catch (e) {
      console.error(e);
    }
  };

  const runDnsCheck = async (domain: string, id?: string) => {
    if (!domain) return;
    setDnsCheckLoading(true);
    try {
      const url = `/api/domains/check-dns?domain=${encodeURIComponent(domain)}${id ? `&id=${id}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDnsResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDnsCheckLoading(false);
    }
  };

  const targetDomainName = domains[0]?.name || 'yourdomain.com';

  return (
    <div className="space-y-6">
      {/* Manage Domain Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white">Kelola Domain Anda</h4>
          <p className="text-xs text-slate-400">Tambahkan domain atau subdomain kustom Anda untuk menerima tempmail.</p>
        </div>

        <form onSubmit={handleAddDomain} className="flex gap-2">
          <input
            type="text"
            value={newDomainInput}
            onChange={(e) => setNewDomainInput(e.target.value)}
            placeholder="Contoh: mail.domainanda.com atau domainanda.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAddingDomain}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{isAddingDomain ? 'Menambahkan...' : 'Tambah Domain'}</span>
          </button>
        </form>

        <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
          {domains.map((dom) => (
            <div key={dom.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                  @
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{dom.name}</span>
                    {dom.isPrimary && (
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                        Domain Utama
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        dom.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {dom.status === 'active' ? 'MX Terhubung' : 'Perlu Verifikasi MX'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Catch-all: <span className="text-emerald-400">Aktif (*@{dom.name})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setSelectedCheckDomain(dom.name);
                    runDnsCheck(dom.name, dom.id);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-sky-300 hover:bg-slate-700"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Cek DNS</span>
                </button>

                {!dom.isPrimary && (
                  <button
                    onClick={() => handleSetPrimaryDomain(dom.id)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Jadikan Utama
                  </button>
                )}

                {domains.length > 1 && (
                  <button
                    onClick={() => handleDeleteDomain(dom.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live DNS Diagnostic */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Alat Diagnostik Live DNS &amp; MX Query</h4>
            <p className="text-xs text-slate-400">Uji langsung apakah MX Record dan SPF domain Anda sudah terpropagasi di internet.</p>
          </div>

          <button
            onClick={() => runDnsCheck(selectedCheckDomain || targetDomainName)}
            disabled={dnsCheckLoading}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dnsCheckLoading ? 'animate-spin' : ''}`} />
            <span>Cek DNS Sekarang</span>
          </button>
        </div>

        {dnsResult && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300">Hasil Query DNS: <span className="font-mono text-cyan-400">{dnsResult.domain}</span></span>
              <span className={`text-xs font-bold ${dnsResult.isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {dnsResult.isConfigured ? '✓ MX Record Terdeteksi' : '⚠️ MX Record Belum Ditemukan'}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <span className="font-semibold text-slate-400">MX Records Ditemukan:</span>
              {dnsResult.mxRecords.length > 0 ? (
                <div className="space-y-1 font-mono text-[11px] text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  {dnsResult.mxRecords.map((mx, i) => (
                    <div key={i}>Prioritas {mx.priority}: {mx.exchange}</div>
                  ))}
                </div>
              ) : (
                <div className="text-amber-400/90 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  Tidak ada MX record ditemukan untuk {dnsResult.domain}. Silakan tambahkan MX record di registrar Anda.
                </div>
              )}
            </div>

            <div className="text-xs space-y-1">
              <span className="font-semibold text-slate-400">SPF TXT Record:</span>
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                {dnsResult.spfRecord || 'Belum ada record SPF (TXT: v=spf1 ~all)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DNS Record Setup Reference Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white">Panduan Pengaturan DNS Record (MX, SPF, DMARC)</h4>
          <p className="text-xs text-slate-400">
            Buka panel DNS domain Anda lalu tambahkan record berikut:
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Tipe</th>
                <th className="p-3">Nama / Host</th>
                <th className="p-3">Nilai / Target</th>
                <th className="p-3">Prioritas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              <tr>
                <td className="p-3 font-bold text-indigo-400">MX</td>
                <td className="p-3">@</td>
                <td className="p-3 text-slate-200">mail.{targetDomainName}</td>
                <td className="p-3">10</td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => handleCopy(`mail.${targetDomainName}`, 'mx-val')}
                    className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                  >
                    {copiedKey === 'mx-val' ? 'Disalin' : 'Salin'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-sky-400">TXT (SPF)</td>
                <td className="p-3">@</td>
                <td className="p-3 text-slate-200">v=spf1 ~all</td>
                <td className="p-3">-</td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => handleCopy('v=spf1 ~all', 'spf-val')}
                    className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                  >
                    {copiedKey === 'spf-val' ? 'Disalin' : 'Salin'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-400">TXT (DMARC)</td>
                <td className="p-3">_dmarc</td>
                <td className="p-3 text-slate-200">v=DMARC1; p=none;</td>
                <td className="p-3">-</td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => handleCopy('v=DMARC1; p=none;', 'dmarc-val')}
                    className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                  >
                    {copiedKey === 'dmarc-val' ? 'Disalin' : 'Salin'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
