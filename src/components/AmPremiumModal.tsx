'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Mail,
  Key,
  Eye,
  EyeOff,
  Link as LinkIcon,
  HelpCircle,
  ArrowRight,
  Smartphone,
  Info,
  Download,
  Shield,
  Radio,
  Globe,
  Bot,
  Music,
  Gamepad2,
  Lock,
  Server,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { SUPPORTED_SERVICES, ServiceType } from '@/lib/accountGeneratorTypes';

interface AmPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: () => void;
}

export function AmPremiumModal({ isOpen, onClose, onSuccessCreated }: AmPremiumModalProps) {
  const [serviceType, setServiceType] = useState<ServiceType>('alight_motion');
  const [count, setCount] = useState<number>(1);
  const [customAlias, setCustomAlias] = useState<string>('');
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);
  const [copiedCombo, setCopiedCombo] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);
  const [copiedAi, setCopiedAi] = useState<string | null>(null);
  const [copiedArl, setCopiedArl] = useState<string | null>(null);
  const [copiedOutline, setCopiedOutline] = useState<string | null>(null);
  const [copiedSsh, setCopiedSsh] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!isOpen) return null;

  const currentService = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.alight_motion;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResults([]);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tempmail_session_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-session-token'] = token;
        }
        const deviceId = localStorage.getItem('tempmail_device_id') || 'dev_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('tempmail_device_id', deviceId);
        headers['x-device-id'] = deviceId;
      }

      const res = await fetch('/api/am-premium', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          serviceType,
          count,
          customAlias: count === 1 && customAlias.trim() ? customAlias.trim() : undefined,
          inviteUrl: inviteUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Gagal memproses pembuatan akun.');
      } else {
        setResults(data.accounts || []);
        if (data.successCount > 0 || data.pendingCount > 0) {
          fireConfetti();
          if (onSuccessCreated) onSuccessCreated();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (
    text: string,
    type: 'key' | 'email' | 'pass' | 'combo' | 'config' | 'dns' | 'ai' | 'arl' | 'outline' | 'ssh' | 'all'
  ) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } else if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else if (type === 'pass') {
      setCopiedPass(text);
      setTimeout(() => setCopiedPass(null), 2000);
    } else if (type === 'combo') {
      setCopiedCombo(text);
      setTimeout(() => setCopiedCombo(null), 2000);
    } else if (type === 'config') {
      setCopiedConfig(text);
      setTimeout(() => setCopiedConfig(null), 2000);
    } else if (type === 'dns') {
      setCopiedDns(text);
      setTimeout(() => setCopiedDns(null), 2000);
    } else if (type === 'ai') {
      setCopiedAi(text);
      setTimeout(() => setCopiedAi(null), 2000);
    } else if (type === 'arl') {
      setCopiedArl(text);
      setTimeout(() => setCopiedArl(null), 2000);
    } else if (type === 'outline') {
      setCopiedOutline(text);
      setTimeout(() => setCopiedOutline(null), 2000);
    } else if (type === 'ssh') {
      setCopiedSsh(text);
      setTimeout(() => setCopiedSsh(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAll = () => {
    const text = results
      .filter((r) => r.success)
      .map((r, i) => {
        if (r.serviceType === 'warp_plus') {
          return `[${i + 1}] Cloudflare WARP+ License: ${r.licenseKey}\n    WireGuard Config:\n${r.wireguardConfig}`;
        }
        if (r.serviceType === 'outline_vpn') {
          return `[${i + 1}] Outline VPN Access Key (${r.serviceName}):\n    ${r.accessKey}`;
        }
        if (r.serviceType === 'proton_vpn') {
          return `[${i + 1}] ProtonVPN (${r.serviceName}):\n    User: ${r.email}\n    Pass: ${r.password}\n    Ping: ${r.duration}`;
        }
        if (r.serviceType === 'gaming_ssh') {
          return `[${i + 1}] Gaming SSH (${r.serviceName}):\n    Host: ${r.host}\n    Port: ${r.port}\n    User: ${r.alias}\n    Pass: ${r.password}\n    Payload: ${r.payload}`;
        }
        if (r.serviceType === 'nextdns_pro') {
          return `[${i + 1}] NextDNS AdBlock Profile: ${r.serviceName}\n    Android Private DNS: ${r.dotEndpoint}\n    DoH URL: ${r.dohUrl}`;
        }
        if (r.serviceType === 'ai_tokens') {
          return `[${i + 1}] AI API Key: ${r.apiKey}\n    Base URL: ${r.baseUrl}`;
        }
        if (r.serviceType === 'deezer_hifi') {
          return `[${i + 1}] Deezer Hi-Fi ARL Token: ${r.arlToken}`;
        }
        if (r.serviceType === 'proxy_nodes') {
          return `[${i + 1}] Proxy Node ${r.serviceName}:\n    URL: ${r.configUri}`;
        }
        if (!r.password) {
          return `[${i + 1}] Layanan: ${r.serviceName || currentService.name}\n    Email: ${r.email}\n    Metode: Magic Link (Tanpa Password)\n    Link Inbox: ${r.inboxUrl}\n    Status: ${r.duration || '1 Tahun Premium'}`;
        }
        return `[${i + 1}] Layanan: ${r.serviceName || currentService.name}\n    Email: ${r.email}\n    Password: ${r.password}\n    Format: ${r.email}:${r.password}\n    Link Inbox: ${r.inboxUrl}\n    Durasi: ${r.duration || 'Pro/Trial'}`;
      })
      .join('\n\n');
    handleCopyText(text, 'all');
  };

  const autoServices = (Object.keys(SUPPORTED_SERVICES) as ServiceType[]).filter(
    (st) => SUPPORTED_SERVICES[st].is100PercentAuto
  );
  const helperServices = (Object.keys(SUPPORTED_SERVICES) as ServiceType[]).filter(
    (st) => !SUPPORTED_SERVICES[st].is100PercentAuto
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl flex flex-col">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
              {currentService.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Auto Pro &amp; Trial Hub</h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  PRO VIP
                </span>
              </div>
              <p className="text-xs text-slate-400">Pilih aplikasi target untuk generate instan.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Section 1: 100% TERIMA JADI (Full Auto Server / Key / Nodes) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 fill-emerald-400" />
                <span>⚡ 100% Terima Jadi (Auto Server / Key / VPN / Token):</span>
              </label>
              <span className="text-[10px] text-slate-400">Tanpa Daftar Manual</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {autoServices.map((st) => {
                const s = SUPPORTED_SERVICES[st];
                const isSelected = serviceType === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setServiceType(st);
                      setResults([]);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{s.icon}</span>
                      <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-300">
                        100% AUTO
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate w-full">{s.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{s.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Pro Trial & TempMail Helpers */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Layanan Lainnya (TempMail &amp; OTP Helper):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {helperServices.map((st) => {
                const s = SUPPORTED_SERVICES[st];
                const isSelected = serviceType === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setServiceType(st);
                      setResults([]);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-md shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm">{s.icon}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
                    </div>
                    <p className="text-[11px] font-bold text-white truncate w-full">{s.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-slate-400 truncate w-full">{s.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-World Workflow Guide Banner */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 text-xs text-indigo-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Panduan &amp; Cara Pakai {currentService.name}:</span>
              </div>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                  currentService.is100PercentAuto
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {currentService.is100PercentAuto ? '⚡ 100% Terima Jadi' : '🔑 Butuh Form Daftar'}
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pl-0.5">
              {currentService.stepByStep.map((step, idx) => (
                <li key={idx} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleGenerate} className="space-y-3.5">
            {/* Account Count Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah yang Digenerate (Batch):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      count === num
                        ? 'border-emerald-500 bg-emerald-600/30 text-emerald-300 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {num} Item
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Alias (Single account only) */}
            {count === 1 && !['warp_plus', 'outline_vpn', 'proton_vpn', 'gaming_ssh', 'proxy_nodes', 'nextdns_pro', 'ai_tokens', 'deezer_hifi'].includes(serviceType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Alias Kustom (Opsional):
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 focus-within:border-emerald-500">
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="nama_kustom (acak jika kosong)"
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-500">@loginptn.xyz</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Memproses {count} {currentService.name}...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  <span>⚡ Eksekusi Generate {count} Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">
                    Hasil Pembuatan ({results.filter((r) => r.success).length}/{results.length} Sukses)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {currentService.hasPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
                    >
                      {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showPasswords ? 'Tutup Pass' : 'Lihat Pass'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 active:scale-95"
                  >
                    {copiedAll ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {results.map((acc, idx) => {
                  const isEmailCopied = copiedEmail === acc.email;
                  const isKeyCopied = copiedKey === acc.licenseKey;
                  const isConfigCopied = copiedConfig === (acc.wireguardConfig || acc.configUri);
                  const isDnsCopied = copiedDns === acc.dotEndpoint;
                  const isAiCopied = copiedAi === acc.apiKey;
                  const isArlCopied = copiedArl === acc.arlToken;
                  const isOutlineCopied = copiedOutline === acc.accessKey;
                  const isSshCopied = copiedSsh === acc.password;

                  // 1. CLOUDFLARE WARP+
                  if (acc.serviceType === 'warp_plus') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-emerald-400" />
                              <span className="font-bold text-white">Cloudflare WARP+ License Key</span>
                              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                                100% Active
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="font-mono text-sm font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl selection:bg-amber-500">
                                {acc.licenseKey}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(acc.licenseKey!, 'key')}
                                className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-200"
                              >
                                {isKeyCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                <span>{isKeyCopied ? 'Tersalin' : 'Salin Key'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {acc.wireguardConfig && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(acc.wireguardConfig!, `warp-plus-${idx + 1}.conf`)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Unduh Config WireGuard (.conf)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyText(acc.wireguardConfig!, 'config')}
                              className="flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95"
                            >
                              {isConfigCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{isConfigCopied ? 'Tersalin' : 'Salin Config'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2. OUTLINE VPN (Google / Jigsaw)
                  if (acc.serviceType === 'outline_vpn') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-teal-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ShieldCheck className="h-4 w-4 text-teal-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.2 text-[9px] font-bold text-teal-300">
                                {acc.duration}
                              </span>
                            </div>

                            <p className="font-mono text-[11px] text-slate-400 truncate max-w-full">
                              {acc.accessKey}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.accessKey!, 'outline')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 active:scale-95"
                          >
                            {isOutlineCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isOutlineCopied ? 'Access Key Tersalin!' : '📋 Salin Access Key Outline (ss://)'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 3. PROTONVPN (OpenVPN & WireGuard)
                  if (acc.serviceType === 'proton_vpn') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-violet-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Lock className="h-4 w-4 text-violet-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-violet-500/15 border border-violet-500/30 px-1.5 py-0.2 text-[9px] font-bold text-violet-300">
                                {acc.duration}
                              </span>
                            </div>

                            <div className="space-y-1 text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">👤 User:</span>
                                <span className="font-mono text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">{acc.email}</span>
                                <span className="text-[11px] text-slate-400 ml-2">🔑 Pass:</span>
                                <span className="font-mono text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">{acc.password}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          {acc.ovpnConfig && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(acc.ovpnConfig!, `protonvpn-${idx + 1}.ovpn`)}
                              className="flex items-center justify-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-500 py-2 px-2 text-xs font-bold text-white shadow-sm"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Unduh .ovpn</span>
                            </button>
                          )}
                          {acc.wireguardConfig && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(acc.wireguardConfig!, `protonvpn-wg-${idx + 1}.conf`)}
                              className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 px-2 text-xs font-bold text-slate-200 border border-slate-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Unduh .conf</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 4. GAMING SSH WEBSOCKET
                  if (acc.serviceType === 'gaming_ssh') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-amber-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Gamepad2 className="h-4 w-4 text-amber-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                {acc.duration}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300 text-[11px] pt-1">
                              <div><span className="text-slate-500">Host:</span> <span className="font-mono text-cyan-300">{acc.host}</span></div>
                              <div><span className="text-slate-500">Port:</span> <span className="font-mono text-slate-200">{acc.port}</span></div>
                              <div><span className="text-slate-500">User:</span> <span className="font-mono text-emerald-300">{acc.alias}</span></div>
                              <div><span className="text-slate-500">Pass:</span> <span className="font-mono text-amber-300">{acc.password}</span></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(`Host: ${acc.host}\nPort: 443\nUser: ${acc.alias}\nPass: ${acc.password}\nPayload: ${acc.payload}`, 'ssh')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-orange-500 active:scale-95"
                          >
                            {isSshCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isSshCopied ? 'Info Akun Tersalin!' : '📋 Salin Info Akun Gaming SSH'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 5. NEXTDNS PRO ADBLOCK
                  if (acc.serviceType === 'nextdns_pro') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Globe className="h-4 w-4 text-emerald-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                                300K Queries Pro
                              </span>
                            </div>

                            <div className="space-y-1 text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 shrink-0">📱 Android Private DNS:</span>
                                <span className="font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded truncate">
                                  {acc.dotEndpoint}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                                <span>🌐 DoH URL:</span>
                                <span className="font-mono text-slate-300 truncate">{acc.dohUrl}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.dotEndpoint!, 'dns')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95"
                          >
                            {isDnsCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isDnsCopied ? 'Hostname Tersalin!' : '📋 Salin Private DNS Android'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 6. AI PRO API KEY
                  if (acc.serviceType === 'ai_tokens') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-indigo-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Bot className="h-4 w-4 text-indigo-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">
                                Llama 3.3 70B &amp; DeepSeek R1
                              </span>
                            </div>

                            <div className="space-y-1 text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 shrink-0">🔑 API Key:</span>
                                <span className="font-mono font-bold text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded truncate">
                                  {acc.apiKey}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                                <span>🌐 Base URL:</span>
                                <span className="font-mono text-cyan-300 truncate">{acc.baseUrl}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.apiKey!, 'ai')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-cyan-500 active:scale-95"
                          >
                            {isAiCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isAiCopied ? 'API Key Tersalin!' : '📋 Salin API Key AI'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 7. DEEZER HI-FI FLAC ARL
                  if (acc.serviceType === 'deezer_hifi') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-fuchsia-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Music className="h-4 w-4 text-fuchsia-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-fuchsia-500/15 border border-fuchsia-500/30 px-1.5 py-0.2 text-[9px] font-bold text-fuchsia-300">
                                FLAC 1411kbps Master
                              </span>
                            </div>

                            <p className="font-mono text-[11px] text-slate-400 truncate max-w-full">
                              ARL: {acc.arlToken}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.arlToken!, 'arl')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-fuchsia-500 hover:to-pink-500 active:scale-95"
                          >
                            {isArlCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isArlCopied ? 'ARL Token Tersalin!' : '📋 Salin ARL Cookie Deezer'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 8. HYSTERIA 2 & V2RAY PROXY NODES
                  if (acc.serviceType === 'proxy_nodes') {
                    return (
                      <div
                        key={acc.id || idx}
                        className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Radio className="h-4 w-4 text-cyan-400" />
                              <span className="font-bold text-white">{acc.serviceName}</span>
                              <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                                {acc.duration}
                              </span>
                            </div>

                            <p className="font-mono text-[11px] text-slate-400 truncate max-w-full">
                              {acc.configUri}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleCopyText(acc.configUri!, 'config')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-cyan-500 hover:to-indigo-500 active:scale-95"
                          >
                            {isConfigCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isConfigCopied ? 'URL Tersalin!' : '📋 Salin URL Node (Siap Konek)'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 9. STANDARD ACCOUNTS (Alight Motion, Canva, ElevenLabs, Cursor, Leonardo)
                  const comboText = `${acc.email}:${acc.password || ''}`;
                  const isComboCopied = copiedCombo === comboText;
                  const signupTarget = inviteUrl || currentService.signupUrl;

                  return (
                    <div
                      key={acc.id || idx}
                      className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-3.5 text-xs space-y-2.5 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Email Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">
                              {idx + 1}
                            </span>
                            <span className="font-mono font-bold text-white truncate max-w-full">
                              {acc.email}
                            </span>
                            <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                              {acc.duration || 'Aktif'}
                            </span>
                          </div>

                          {/* Password Row (Only if has password) */}
                          {acc.password ? (
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="text-[11px] text-slate-400">🔑 Pass:</span>
                              <span className="font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                {showPasswords ? acc.password : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(acc.password, 'pass')}
                                className="text-[10px] text-slate-400 hover:text-emerald-400 ml-1"
                              >
                                Salin
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Login Magic Link (Tanpa Password - Masukkan email di aplikasi HP)</span>
                            </div>
                          )}

                          {/* Inbox Link */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                            <span className="shrink-0">📬 Inbox OTP/Link:</span>
                            <a
                              href={acc.inboxUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-cyan-400 hover:underline truncate"
                            >
                              {acc.inboxUrl}
                            </a>
                          </div>
                        </div>

                        {/* Quick Copy Single Email */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(acc.email, 'email')}
                          className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 shrink-0"
                          title="Salin Email"
                        >
                          {isEmailCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      {/* Direct Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap sm:flex-nowrap">
                        {acc.password ? (
                          <>
                            {signupTarget ? (
                              <a
                                href={signupTarget}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-2 px-3 text-xs font-bold text-white shadow-md hover:from-cyan-500 hover:to-indigo-500 active:scale-95 transition-all text-center"
                              >
                                <span>🚀 Buka Sign-Up {currentService.name.split(' ')[0]}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleCopyText(comboText, 'combo')}
                              className="flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-850 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                              title="Salin dalam format email:password"
                            >
                              {isComboCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{isComboCopied ? 'Tersalin!' : 'Salin Email:Pass'}</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-300 flex items-center gap-1">
                              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Buka Alight Motion di HP &amp; login pakai email ini</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(acc.email, 'email')}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                            >
                              {isEmailCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>Salin Email</span>
                            </button>
                          </div>
                        )}

                        <a
                          href={acc.inboxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                          <Mail className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Buka Inbox</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
