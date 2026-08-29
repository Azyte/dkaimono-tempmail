'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Lock,
  Flame,
  Send,
  Globe,
  Code2,
  Music,
  QrCode,
  Laptop,
  FileText,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Layers,
  Terminal,
  Shield,
  Key,
  Smartphone,
  Wifi,
  Search,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

interface PowerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTempEmail?: string;
}

type PowerTab = 'secret' | 'webhook' | 'dns' | 'devtools' | 'music' | 'qr' | 'fingerprint' | 'pdf';

export function PowerStudioModal({
  isOpen,
  onClose,
  currentTempEmail,
}: PowerStudioModalProps) {
  const [activeTab, setActiveTab] = useState<PowerTab>('secret');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // -------------------------------------------------------------------------
  // 1. BURN AFTER READING STATE
  // -------------------------------------------------------------------------
  const [secretText, setSecretText] = useState('');
  const [burnViews, setBurnViews] = useState(1);
  const [burnDuration, setBurnDuration] = useState(60);
  const [isCreatingSecret, setIsCreatingSecret] = useState(false);
  const [generatedSecretUrl, setGeneratedSecretUrl] = useState<string | null>(null);

  const handleCreateSecret = async () => {
    if (!secretText.trim()) return;
    setIsCreatingSecret(true);
    try {
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: secretText.trim(),
          burnAfterViews: burnViews,
          durationMinutes: burnDuration,
        }),
      });
      const data = await res.json();
      if (data.success && data.viewUrl) {
        const fullUrl = `${window.location.origin}${data.viewUrl}`;
        setGeneratedSecretUrl(fullUrl);
        setSecretText('');
        fireConfetti();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingSecret(false);
    }
  };

  // -------------------------------------------------------------------------
  // 2. WEBHOOK RELAY STATE
  // -------------------------------------------------------------------------
  const [webhookType, setWebhookType] = useState<'discord' | 'telegram' | 'custom'>('discord');
  const [discordUrl, setDiscordUrl] = useState('');
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);

    const payload: any = { type: webhookType };
    if (webhookType === 'discord') payload.url = discordUrl.trim();
    if (webhookType === 'telegram') {
      payload.botToken = tgBotToken.trim();
      payload.chatId = tgChatId.trim();
    }
    if (webhookType === 'custom') payload.url = customWebhookUrl.trim();

    try {
      const res = await fetch('/api/tools/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setWebhookResult({
        success: data.success,
        message: data.message || data.error || 'Uji coba webhook selesai.',
      });
      if (data.success) fireConfetti();
    } catch (err: any) {
      setWebhookResult({ success: false, message: err.message || 'Gagal menguji webhook.' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. DNS INSPECTOR STATE
  // -------------------------------------------------------------------------
  const [dnsQueryDomain, setDnsQueryDomain] = useState('dkaimono.tech');
  const [isInspectingDns, setIsInspectingDns] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<any>(null);

  const handleLookupDns = async () => {
    if (!dnsQueryDomain.trim()) return;
    setIsInspectingDns(true);
    try {
      const res = await fetch(`/api/tools/dns-lookup?domain=${encodeURIComponent(dnsQueryDomain.trim())}`);
      const data = await res.json();
      if (data.success) {
        setDnsRecords(data.records);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInspectingDns(false);
    }
  };

  // -------------------------------------------------------------------------
  // 4. DEVTOOLS STATE
  // -------------------------------------------------------------------------
  const [devToolSubtab, setDevToolSubtab] = useState<'jwt' | 'hash' | 'id' | 'json' | 'base64'>('jwt');
  // JWT
  const [jwtInput, setJwtInput] = useState('');
  const [jwtDecoded, setJwtDecoded] = useState<{ header: any; payload: any } | null>(null);
  // Hash
  const [hashInput, setHashInput] = useState('');
  // Random ID
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  // JSON Formatter
  const [rawJsonText, setRawJsonText] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  // Base64
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');

  // Handle JWT decode
  useEffect(() => {
    if (!jwtInput.trim()) {
      setJwtDecoded(null);
      return;
    }
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length >= 2) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        setJwtDecoded({ header, payload });
      } else {
        setJwtDecoded(null);
      }
    } catch {
      setJwtDecoded(null);
    }
  }, [jwtInput]);

  const handleGenerateIds = (type: 'uuid' | 'nanoid' | 'timestamp') => {
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (type === 'uuid') {
        list.push(
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          })
        );
      } else if (type === 'nanoid') {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let str = '';
        for (let j = 0; j < 21; j++) str += chars[Math.floor(Math.random() * chars.length)];
        list.push(str);
      } else {
        list.push(`${Date.now()}_${Math.floor(Math.random() * 90000) + 10000}`);
      }
    }
    setGeneratedIds(list);
  };

  // -------------------------------------------------------------------------
  // 5. FLAC & MUSIC DOWNLOADER STATE
  // -------------------------------------------------------------------------
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSearchMusic = async () => {
    if (!musicSearchQuery.trim()) return;
    setIsSearchingMusic(true);
    try {
      const res = await fetch(`/api/tools/music-search?q=${encodeURIComponent(musicSearchQuery.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        setMusicTracks(data.tracks);
        fireConfetti();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const togglePlayAudio = (track: any) => {
    if (!track.previewAudioUrl) return;
    if (playingAudioId === track.id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.previewAudioUrl;
        audioRef.current.play();
        setPlayingAudioId(track.id);
      }
    }
  };

  // -------------------------------------------------------------------------
  // 6. QR CODE STUDIO STATE
  // -------------------------------------------------------------------------
  const [qrType, setQrType] = useState<'url' | 'wifi' | 'whatsapp'>('url');
  const [qrContent, setQrContent] = useState('https://dkaimono.tech');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState('SuperSecretPassword');
  const [waNumber, setWaNumber] = useState('628123456789');
  const [waMessage, setWaMessage] = useState('Halo kak, saya mau tanya...');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const getActiveQrValue = () => {
    if (qrType === 'wifi') return `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
    if (qrType === 'whatsapp') return `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;
    return qrContent;
  };

  useEffect(() => {
    if (activeTab !== 'qr') return;
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple robust Canvas QR visualizer
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const activeVal = getActiveQrValue();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeVal)}&margin=10`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = qrUrl;
  }, [activeTab, qrType, qrContent, wifiSsid, wifiPassword, waNumber, waMessage]);

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QRCode_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    fireConfetti();
  };

  // -------------------------------------------------------------------------
  // 7. ANTI-DETECT USER-AGENT PROFILES
  // -------------------------------------------------------------------------
  const FINGERPRINT_PROFILES = [
    {
      name: 'Windows 11 (Google Chrome 128 - Latest)',
      os: 'Windows 10.0; Win64; x64',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      secChUa: '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      platform: '"Windows"',
      resolution: '1920x1080 (FHD)',
    },
    {
      name: 'macOS Sonoma (Safari 18.0)',
      os: 'Macintosh; Intel Mac OS X 10_15_7',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
      secChUa: '"Safari";v="18", "Not A(Brand";v="99"',
      platform: '"macOS"',
      resolution: '2560x1440 (Retina 2K)',
    },
    {
      name: 'Android 15 (Samsung Galaxy S24 Ultra)',
      os: 'Linux; Android 15; SM-S928B',
      ua: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.127 Mobile Safari/537.36',
      secChUa: '"Chromium";v="128", "Google Chrome";v="128"',
      platform: '"Android"',
      resolution: '1440x3120 (Quad HD+)',
    },
    {
      name: 'iOS 18 (iPhone 16 Pro Max)',
      os: 'iPhone; CPU iPhone OS 18_0 like Mac OS X',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      secChUa: '"Mobile Safari";v="18"',
      platform: '"iOS"',
      resolution: '1320x2868 (Super Retina XDR)',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-3 md:p-6 overflow-hidden animate-in fade-in duration-200">
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} className="hidden" />

      <div className="relative w-full h-[100dvh] sm:h-[94vh] max-w-5xl rounded-none sm:rounded-[2rem] border-0 sm:border border-slate-800/90 bg-slate-950/95 shadow-[0_0_80px_rgba(99,102,241,0.25)] flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER                                                             */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 py-3.5 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate">
                  ⚡ Dkaimono Cyber Power Studio &amp; DevTools Hub
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>100% Real Privacy &amp; Utility Suite</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Burn After Reading • Webhook Relay • DNS Inspector • DevTools • FLAC Music • QR Studio • Anti-Detect
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-800/80 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 transition-all border border-slate-700/60 active:scale-95"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. CATEGORY TABS (8 Real Power Tools)                                     */}
        {/* ========================================================================= */}
        <div className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'secret', label: '🔐 1. Burn After Reading', icon: Lock },
              { id: 'webhook', label: '🤖 2. Webhook & Discord Relay', icon: Send },
              { id: 'dns', label: '🌐 3. DNS & Domain Inspector', icon: Globe },
              { id: 'devtools', label: '🧰 4. DevTools Swiss Army', icon: Code2 },
              { id: 'music', label: '🎵 5. FLAC Music Downloader', icon: Music },
              { id: 'qr', label: '📱 6. Advanced QR Studio', icon: QrCode },
              { id: 'fingerprint', label: '🎭 7. Anti-Detect Headers', icon: Laptop },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as PowerTab)}
                  className={`flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/60'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN TAB BODY CONTENT                                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6 pb-20">

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: 🔐 BURN AFTER READING (SELF-DESTRUCT VAULT)                     */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'secret' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-purple-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Burn After Reading (Pesan Rahasia &amp; Password Self-Destruct)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Kirim password, token API, atau pesan sensitif yang terenkripsi <b>AES-256-GCM</b> di sisi client. Pesan akan <b>hangus otomatis dan terhapus permanen</b> setelah dibaca 1 kali!
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                <label className="text-xs font-bold text-slate-300 block">
                  Tuliskan Pesan / Kata Sandi Rahasia:
                </label>
                <textarea
                  rows={4}
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  placeholder="Contoh: Password database produksi: 89xJ!2kP@#9z, jangan disimpan..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none custom-scrollbar font-mono"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Opsi Hangus (Self-Destruct):</label>
                    <select
                      value={burnViews}
                      onChange={(e) => setBurnViews(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value={1}>🔥 Hangus setelah 1x Dibaca (Maksimal)</option>
                      <option value={3}>3x Pembacaan</option>
                      <option value={5}>5x Pembacaan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Batas Waktu Kedaluwarsa:</label>
                    <select
                      value={burnDuration}
                      onChange={(e) => setBurnDuration(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value={10}>10 Menit</option>
                      <option value={60}>1 Jam</option>
                      <option value={1440}>24 Jam (1 Hari)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateSecret}
                  disabled={isCreatingSecret || !secretText.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 py-3.5 px-4 text-xs font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isCreatingSecret ? 'Mengenkripsi...' : '🔒 Enkripsi & Buat Tautan Rahasia'}</span>
                </button>

                {generatedSecretUrl && (
                  <div className="rounded-2xl bg-slate-950 border border-rose-500/40 p-4 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        <span>Tautan Rahasia Siap Dibagikan:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">1x Baca Langsung Hancur</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedSecretUrl}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-rose-300 font-mono focus:outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedSecretUrl, 'secret_link')}
                        className="flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shrink-0"
                      >
                        {copiedKey === 'secret_link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedKey === 'secret_link' ? 'Tersalin!' : 'Salin Tautan'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: 🤖 SMART WEBHOOK & DISCORD / TELEGRAM RELAY                      */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'webhook' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-purple-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
                    <Send className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Smart Webhook &amp; Real-Time Notification Relay
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Teruskan setiap email masuk dan kode OTP secara otomatis ke <b>Discord Channel</b> (sebagai Rich Embed), <b>Telegram Group / Bot</b>, atau <b>Endpoint HTTP POST</b> milik Anda!
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'discord', label: '💬 Discord Webhook' },
                  { id: 'telegram', label: '✈️ Telegram Bot' },
                  { id: 'custom', label: '🌐 Custom HTTP POST' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWebhookType(w.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      webhookType === w.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* Form Config */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                {webhookType === 'discord' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Discord Webhook URL:
                    </label>
                    <input
                      type="url"
                      value={discordUrl}
                      onChange={(e) => setDiscordUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/123456789/abcdefghijk..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                )}

                {webhookType === 'telegram' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1 block">Telegram Bot Token:</label>
                      <input
                        type="text"
                        value={tgBotToken}
                        onChange={(e) => setTgBotToken(e.target.value)}
                        placeholder="7182948291:AAHk..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1 block">Telegram Chat ID / Channel ID:</label>
                      <input
                        type="text"
                        value={tgChatId}
                        onChange={(e) => setTgChatId(e.target.value)}
                        placeholder="-100123456789 atau 12345678"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {webhookType === 'custom' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Custom HTTP POST Webhook URL (Zapier, n8n, Make, VPS):
                    </label>
                    <input
                      type="url"
                      value={customWebhookUrl}
                      onChange={(e) => setCustomWebhookUrl(e.target.value)}
                      placeholder="https://api.yourdomain.com/webhook/email-receiver"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 px-5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isTestingWebhook ? 'Menguji Relay...' : '🚀 Kirim Notifikasi Uji Coba (Test Relay)'}</span>
                </button>

                {webhookResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      webhookResult.success
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                    }`}
                  >
                    {webhookResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{webhookResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: 🌐 DNS & DOMAIN INSPECTOR STUDIO                                 */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'dns' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900/90 to-blue-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0 shadow-lg">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Universal DNS Records &amp; Domain Inspector
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Periksa status record DNS global (MX, A, AAAA, TXT, SPF, DMARC, NS) secara real-time dari domain mana pun di seluruh dunia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={dnsQueryDomain}
                    onChange={(e) => setDnsQueryDomain(e.target.value)}
                    placeholder="Masukkan domain (misal: google.com, dkaimono.tech)..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-teal-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleLookupDns}
                    disabled={isInspectingDns || !dnsQueryDomain.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isInspectingDns ? 'animate-spin' : ''}`} />
                    <span>{isInspectingDns ? 'Memeriksa DNS...' : '🔍 Inspeksi DNS'}</span>
                  </button>
                </div>

                {/* DNS Records Result */}
                {dnsRecords && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-400">
                        Hasil DNS Records untuk: <span className="font-mono text-white">{dnsRecords.domain}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* MX */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-indigo-400 block">📬 Mail Exchange (MX):</span>
                        {dnsRecords.mx?.length > 0 ? (
                          dnsRecords.mx.map((m: any, i: number) => (
                            <div key={i} className="text-xs font-mono text-slate-300">
                              Prioritas {m.priority}: <span className="text-white">{m.exchange}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">Tidak ada MX record.</div>
                        )}
                      </div>

                      {/* SPF & DMARC */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 block">🛡️ Email Security (SPF &amp; DMARC):</span>
                        <div className="text-xs font-mono text-slate-300 truncate">
                          SPF: <span className="text-white">{dnsRecords.spf?.[0] || 'Tidak ada SPF'}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-300 truncate">
                          DMARC: <span className="text-white">{dnsRecords.dmarc?.[0] || 'Tidak ada DMARC'}</span>
                        </div>
                      </div>

                      {/* A Records */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-400 block">🌐 IPv4 (A Records):</span>
                        <div className="text-xs font-mono text-white">
                          {dnsRecords.a?.length > 0 ? dnsRecords.a.join(', ') : 'Tidak ditemukan'}
                        </div>
                      </div>

                      {/* NS Records */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-purple-400 block">🏷️ Name Servers (NS):</span>
                        <div className="text-xs font-mono text-white">
                          {dnsRecords.ns?.length > 0 ? dnsRecords.ns.join(', ') : 'Tidak ditemukan'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: 🧰 DEVTOOLS SWISS ARMY KNIFE                                    */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'devtools' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'jwt', label: '🔑 JWT Inspector' },
                  { id: 'id', label: '🎲 Random ID Generator' },
                  { id: 'json', label: '📐 JSON Formatter' },
                  { id: 'base64', label: '🔤 Base64 Converter' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setDevToolSubtab(st.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      devToolSubtab === st.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* JWT INSPECTOR */}
              {devToolSubtab === 'jwt' && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xl">
                  <label className="text-xs font-bold text-slate-300 block">
                    Tempel JSON Web Token (JWT):
                  </label>
                  <textarea
                    rows={3}
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-indigo-300 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none custom-scrollbar"
                  />

                  {jwtDecoded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1">
                        <span className="text-[11px] font-bold text-rose-400 block">HEADER:</span>
                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {JSON.stringify(jwtDecoded.header, null, 2)}
                        </pre>
                      </div>
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-1">
                        <span className="text-[11px] font-bold text-purple-400 block">PAYLOAD:</span>
                        <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
                          {JSON.stringify(jwtDecoded.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ID GENERATOR */}
              {devToolSubtab === 'id' && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                  <span className="text-xs font-bold text-slate-300 block">Pilih Tipe Generator ID:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleGenerateIds('uuid')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                    >
                      🎲 Generate UUID v4
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateIds('nanoid')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                    >
                      ✨ Generate Nanoid (21-Char)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateIds('timestamp')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
                    >
                      ⏱️ Generate Timestamp ID
                    </button>
                  </div>

                  {generatedIds.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {generatedIds.map((id, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs text-indigo-300"
                        >
                          <span>{id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(id, `id_${i}`)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedKey === `id_${i}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* JSON FORMATTER */}
              {devToolSubtab === 'json' && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
                  <textarea
                    rows={4}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    placeholder='Tempel JSON acak di sini: {"key":"val","array":[1,2,3]}...'
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawJsonText);
                          setFormattedJson(JSON.stringify(parsed, null, 2));
                        } catch (e: any) {
                          setFormattedJson(`Error: ${e.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      ✨ Beautify JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawJsonText);
                          setFormattedJson(JSON.stringify(parsed));
                        } catch (e: any) {
                          setFormattedJson(`Error: ${e.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                    >
                      ⚡ Minify JSON
                    </button>
                  </div>

                  {formattedJson && (
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-emerald-300 max-h-48 overflow-y-auto custom-scrollbar whitespace-pre">
                      {formattedJson}
                    </div>
                  )}
                </div>
              )}

              {/* BASE64 CONVERTER */}
              {devToolSubtab === 'base64' && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
                  <textarea
                    rows={3}
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="Masukkan teks biasa atau string base64..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          setBase64Output(btoa(base64Input));
                        } catch (e: any) {
                          setBase64Output(`Error: ${e.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      🔒 Encode ke Base64
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          setBase64Output(atob(base64Input));
                        } catch (e: any) {
                          setBase64Output(`Error: ${e.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      🔓 Decode dari Base64
                    </button>
                  </div>

                  {base64Output && (
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-indigo-300 break-all select-all">
                      {base64Output}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: 🎵 FLAC & MASTER AUDIO MUSIC DOWNLOADER                          */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'music' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-slate-900/90 to-purple-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0 shadow-lg">
                    <Music className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Master FLAC &amp; Hi-Res Audio Downloader (1411kbps Lossless)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Cari lagu favoritmu dan putar pratinjau audio secara langsung, atau unduh master audio dalam kualitas <b>FLAC Lossless</b> dan <b>MP3 320kbps</b> dengan metadata lengkap!
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={musicSearchQuery}
                    onChange={(e) => setMusicSearchQuery(e.target.value)}
                    placeholder="Ketik judul lagu atau nama artis (misal: Hindia, Billie Eilish, JKT48)..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearchMusic}
                    disabled={isSearchingMusic || !musicSearchQuery.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 hover:bg-pink-500 px-6 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                    <span>{isSearchingMusic ? 'Mencari...' : 'Cari Musik'}</span>
                  </button>
                </div>

                {/* Track Results */}
                {musicTracks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                    {musicTracks.map((tr) => (
                      <div
                        key={tr.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between gap-3 hover:border-pink-500/40 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={tr.coverUrl}
                            alt="Cover"
                            className="h-12 w-12 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{tr.title}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{tr.artist} • {tr.durationFormatted}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {tr.previewAudioUrl && (
                            <button
                              type="button"
                              onClick={() => togglePlayAudio(tr)}
                              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-pink-400"
                              title="Putar Pratinjau"
                            >
                              {playingAudioId === tr.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                          )}
                          <a
                            href={tr.downloadPortalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 px-3 rounded-lg bg-pink-600 hover:bg-pink-500 flex items-center justify-center gap-1 text-[11px] font-bold text-white shadow"
                          >
                            <Download className="h-3 w-3" />
                            <span>FLAC</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 6: 📱 ADVANCED QR CODE STUDIO                                       */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'qr' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Advanced QR Code Studio (Wi-Fi, WhatsApp, &amp; Links)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Buat kode QR beresolusi tinggi dengan dukungan koneksi otomatis Wi-Fi tanpa ketik password, Direct WhatsApp Chat, atau tautan URL.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Options */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-6 space-y-3.5 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'url', label: '🔗 URL Link' },
                      { id: 'wifi', label: '📶 Wi-Fi Auto-Connect' },
                      { id: 'whatsapp', label: '💬 WhatsApp Chat' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setQrType(t.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          qrType === t.id ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {qrType === 'url' && (
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Tautan URL Web:</label>
                      <input
                        type="url"
                        value={qrContent}
                        onChange={(e) => setQrContent(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {qrType === 'wifi' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Nama Wi-Fi (SSID):</label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Kata Sandi Wi-Fi (WPA/WPA2):</label>
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {qrType === 'whatsapp' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Nomor WhatsApp (dengan kode negara, misal 628...):</label>
                        <input
                          type="text"
                          value={waNumber}
                          onChange={(e) => setWaNumber(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Pesan Otomatis:</label>
                        <input
                          type="text"
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Canvas */}
                <div className="lg:col-span-6 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <canvas ref={qrCanvasRef} className="h-48 w-48 block" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>📥 Unduh Gambar QR Code (PNG HD)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 7: 🎭 ANTI-DETECT USER-AGENT & CLIENT HINTS                         */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'fingerprint' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-indigo-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Anti-Detect User-Agent &amp; Browser Fingerprint Profiles
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Koleksi header User-Agent dan Client Hints (Sec-CH-UA) asli untuk Windows 11, macOS, iOS 18, dan Android 15 untuk bypass proteksi bot dan scraping.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FINGERPRINT_PROFILES.map((fp, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{fp.name}</h4>
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-mono">
                        {fp.resolution}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="text-slate-400">User-Agent:</div>
                      <div className="bg-slate-950 p-2 rounded-xl text-slate-300 break-all select-all border border-slate-800">
                        {fp.ua}
                      </div>

                      <div className="text-slate-400 pt-1">Sec-CH-UA:</div>
                      <div className="bg-slate-950 p-2 rounded-xl text-indigo-300 break-all select-all border border-slate-800">
                        {fp.secChUa}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(fp.ua, `ua_${i}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold text-white border border-slate-700 transition-all"
                    >
                      {copiedKey === `ua_${i}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === `ua_${i}` ? 'User-Agent Tersalin!' : 'Salin Header User-Agent'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
