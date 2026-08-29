'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  GraduationCap,
  Cookie,
  CreditCard,
  Users,
  Gift,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  BookOpen,
  QrCode,
  Music,
  Video,
  Layers,
  FileText,
  Terminal,
  Code,
  Wrench,
  ShieldAlert,
  Laptop,
  Bookmark,
  Search,
  Filter,
  AlertTriangle,
  Play,
  Share2,
  Scissors,
  Radio,
  Send,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import {
  getStreamingCookiesPresets,
  convertCookiesToNetscape,
  convertCookiesToHeaderString,
  generateBookmarkletInjector,
  sanitizeAndFixUserCookie,
  StreamingCookieService,
} from '@/lib/streamingCookieManager';
import { LivePromoItem } from '@/app/api/promos/live/route';
import { MediaDownloadItem } from '@/lib/mediaDownloader';
import { LivePhoneNumber } from '@/lib/tempSmsLiveEngine';
import { generateFastProxyNodes, generateBase64Subscription, generateClashYamlConfig } from '@/lib/proxyNodeGenerator';

interface GarapanPremModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTempEmail?: string;
}

type GarapanTab = 'promo' | 'downloader' | 'edu' | 'sms' | 'vpn' | 'cookie' | 'family';
type CookieExportFormat = 'json' | 'bookmarklet' | 'netscape' | 'header';

// ---------------------------------------------------------------------------
// 1. DATA PRESETS UNTUK GARAPAN EDU PERK
// ---------------------------------------------------------------------------
const EDU_UNIVERSITIES = [
  { name: 'Universitas Indonesia (UI)', domain: 'ui.ac.id', code: 'UI-DEPOK' },
  { name: 'Institut Teknologi Bandung (ITB)', domain: 'itb.ac.id', code: 'ITB-GANESHA' },
  { name: 'Universitas Gadjah Mada (UGM)', domain: 'ugm.ac.id', code: 'UGM-YOGYA' },
  { name: 'Stanford University (US)', domain: 'stanford.edu', code: 'SU-CALIF' },
  { name: 'Massachusetts Inst. of Technology (MIT)', domain: 'mit.edu', code: 'MIT-CAMB' },
];

const STUDENT_NAMES = [
  'Rian Pratama',
  'Aditya Wicaksono',
  'Nadia Aurelia',
  'Bagas Ramadhan',
  'Fajar Nugroho',
  'Siti Rahmawati',
  'Kevin Jonathan',
  'Alif Maulana',
];

const MAJORS = [
  'Teknik Informatika / Computer Science',
  'Sistem Informasi & Bisnis Digital',
  'Desain Komunikasi Visual (DKV)',
  'Manajemen & Kewirausahaan',
  'Teknik Elektro',
];

export function GarapanPremModal({
  isOpen,
  onClose,
  currentTempEmail,
}: GarapanPremModalProps) {
  const [activeTab, setActiveTab] = useState<GarapanTab>('promo');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // 1. REAL-TIME PROMOS & TRIAL ENGINE STATE
  // -------------------------------------------------------------------------
  const [livePromos, setLivePromos] = useState<LivePromoItem[]>([]);
  const [promoCategory, setPromoCategory] = useState('all');
  const [promoSearch, setPromoSearch] = useState('');
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [expandedPromoId, setExpandedPromoId] = useState<string | null>(null);

  const fetchLivePromos = async () => {
    setIsLoadingPromos(true);
    try {
      const res = await fetch(`/api/promos/live?category=${encodeURIComponent(promoCategory)}&q=${encodeURIComponent(promoSearch)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.promos)) {
        setLivePromos(data.promos);
      }
    } catch (e) {
      console.error('Failed to load promos:', e);
    } finally {
      setIsLoadingPromos(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLivePromos();
    }
  }, [isOpen, promoCategory, promoSearch]);

  // -------------------------------------------------------------------------
  // 2. REAL MEDIA & VIDEO DOWNLOADER STATE
  // -------------------------------------------------------------------------
  const [mediaInputUrl, setMediaInputUrl] = useState('');
  const [isDownloadingMedia, setIsDownloadingMedia] = useState(false);
  const [mediaResult, setMediaResult] = useState<MediaDownloadItem | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const handleFetchMedia = async () => {
    if (!mediaInputUrl.trim()) return;
    setIsDownloadingMedia(true);
    setMediaError(null);
    setMediaResult(null);

    try {
      const res = await fetch('/api/media/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mediaInputUrl.trim() }),
      });
      const data = await res.json();
      if (data.success && data.media) {
        setMediaResult(data.media);
        fireConfetti();
      } else {
        setMediaError(data.error || 'Gagal memproses media. Pastikan link video bersifat publik.');
      }
    } catch (err: any) {
      setMediaError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsDownloadingMedia(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. REAL LIVE TEMP SMS RECEIVER STATE
  // -------------------------------------------------------------------------
  const [livePhoneNumbers, setLivePhoneNumbers] = useState<LivePhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>('num_us_01');
  const [isLoadingSms, setIsLoadingSms] = useState(false);

  const fetchLiveSms = async () => {
    setIsLoadingSms(true);
    try {
      const res = await fetch('/api/temp-sms/live');
      const data = await res.json();
      if (data.success && Array.isArray(data.numbers)) {
        setLivePhoneNumbers(data.numbers);
      }
    } catch (e) {
      console.error('Failed to load SMS numbers:', e);
    } finally {
      setIsLoadingSms(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'sms') {
      fetchLiveSms();
    }
  }, [isOpen, activeTab]);

  const activePhone = livePhoneNumbers.find((p) => p.id === selectedPhoneId) || livePhoneNumbers[0];

  // -------------------------------------------------------------------------
  // 4. REAL VPN & PROXY SUBSCRIPTION STATE
  // -------------------------------------------------------------------------
  const [vpnNodes] = useState(generateFastProxyNodes());
  const [selectedVpnFormat, setSelectedVpnFormat] = useState<'base64' | 'clash' | 'json'>('base64');

  // -------------------------------------------------------------------------
  // 5. EDU & KTM GENERATOR STATE
  // -------------------------------------------------------------------------
  const [selectedUniv, setSelectedUniv] = useState(EDU_UNIVERSITIES[0]);
  const [studentName, setStudentName] = useState(STUDENT_NAMES[0]);
  const [studentNim, setStudentNim] = useState('2106728190');
  const [studentMajor, setStudentMajor] = useState(MAJORS[0]);
  const [eduEmail, setEduEmail] = useState('');
  const ktmCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cleanName = studentName.toLowerCase().replace(/[^a-z]/g, '');
    const randDigits = Math.floor(100 + Math.random() * 900);
    setEduEmail(`${cleanName}${randDigits}@${selectedUniv.domain}`);
    setStudentNim(`220${Math.floor(1000000 + Math.random() * 9000000)}`);
  }, [selectedUniv, studentName]);

  useEffect(() => {
    if (activeTab !== 'edu') return;
    const canvas = ktmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 390;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 50);
      ctx.bezierCurveTo(200, 50 + i * 40, 400, 160 + i * 30, width, 110 + i * 40);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(79, 70, 229, 0.85)';
    ctx.fillRect(0, 0, width, 68);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(selectedUniv.name.toUpperCase(), 24, 34);

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('KARTU TANDA MAHASISWA (STUDENT ID CARD) • VERIFIED AKADEMIK', 24, 52);

    const photoX = 28;
    const photoY = 92;
    const photoW = 120;
    const photoH = 150;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + 55, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + 145, 50, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO PASPOR', photoX + photoW / 2, photoY + photoH - 12);
    ctx.textAlign = 'left';

    const infoX = 170;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('NAMA MAHASISWA:', infoX, 108);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(studentName, infoX, 128);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('NOMOR INDUK MAHASISWA (NIM):', infoX, 155);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(studentNim, infoX, 175);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('PROGRAM STUDI / JURUSAN:', infoX, 202);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(studentMajor, infoX, 220);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('STATUS & BERLAKU HINGGA:', infoX, 248);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('AKTIF • 2024 / 2028 (SEMESTER GENAP)', infoX, 266);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, height - 80, width, 80);

    ctx.fillStyle = '#ffffff';
    for (let x = 28; x < 260; x += 5) {
      const barW = x % 3 === 0 ? 3 : 1.5;
      ctx.fillRect(x, height - 60, barW, 35);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`*${studentNim}*`, 28, height - 12);

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(width - 70, height - 42, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', width - 70, height - 44);
    ctx.fillText('AKADEMIK', width - 70, height - 33);
    ctx.textAlign = 'left';
  }, [activeTab, selectedUniv, studentName, studentNim, studentMajor]);

  const handleDownloadKTM = () => {
    const canvas = ktmCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `KTM_${studentName.replace(/\s+/g, '_')}_${selectedUniv.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    fireConfetti();
  };

  // -------------------------------------------------------------------------
  // 6. COOKIE SANITIZER STATE
  // -------------------------------------------------------------------------
  const [customRawInput, setCustomRawInput] = useState('');
  const [customSanitizeResult, setCustomSanitizeResult] = useState<{
    success: boolean;
    jsonOutput: string;
    netscapeOutput: string;
    bookmarkletOutput: string;
    headerOutput: string;
    count: number;
    error?: string;
  } | null>(null);

  const handleSanitizeUserCookie = () => {
    if (!customRawInput.trim()) return;
    const res = sanitizeAndFixUserCookie(customRawInput);
    if (res.success) {
      setCustomSanitizeResult({
        success: true,
        jsonOutput: res.jsonOutput,
        netscapeOutput: res.netscapeOutput,
        bookmarkletOutput: generateBookmarkletInjector(res.cookies),
        headerOutput: res.headerOutput,
        count: res.cookies.length,
      });
      fireConfetti();
    } else {
      setCustomSanitizeResult({
        success: false,
        jsonOutput: '',
        netscapeOutput: '',
        bookmarkletOutput: '',
        headerOutput: '',
        count: 0,
        error: res.error || 'Gagal memproses cookie.',
      });
    }
  };

  // -------------------------------------------------------------------------
  // 7. FAMILY PLAN MANAGER STATE
  // -------------------------------------------------------------------------
  const [familyAddress, setFamilyAddress] = useState({
    street: 'Jl. Jenderal Sudirman No. 45 Kav. B',
    kelurahan: 'Karet Semanggi',
    kecamatan: 'Setiabudi',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12930',
  });

  const handleRandomizeFamilyAddress = () => {
    const areas = [
      { street: 'Jl. Gatot Subroto No. 12', kel: 'Kuningan Barat', kec: 'Mampang Prapatan', city: 'Jakarta Selatan', zip: '12710' },
      { street: 'Jl. Asia Afrika No. 8', kel: 'Gelora', kec: 'Tanah Abang', city: 'Jakarta Pusat', zip: '10270' },
      { street: 'Jl. Dago Asri No. 24', kel: 'Dago', kec: 'Coblong', city: 'Bandung', zip: '40135' },
      { street: 'Jl. Malioboro No. 56', kel: 'Suryatmajan', kec: 'Danurejan', city: 'Yogyakarta', zip: '55213' },
    ];
    const picked = areas[Math.floor(Math.random() * areas.length)];
    setFamilyAddress({
      street: picked.street,
      kelurahan: picked.kel,
      kecamatan: picked.kec,
      city: picked.city,
      province: 'Indonesia',
      postalCode: picked.zip,
    });
  };

  // Copy Helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-3 md:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full h-[100dvh] sm:h-[94vh] max-w-5xl rounded-none sm:rounded-[2rem] border-0 sm:border border-slate-800/90 bg-slate-950/95 shadow-[0_0_80px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. TOP MODAL HEADER                                                       */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 py-3 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate">
                  Dkaimono Power Studio &amp; Digital Utilities V3
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>100% Real Functional Tools</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Real Trial Scanner • HD Media Downloader • Edu KTM • Live SMS OTP • VPN Nodes • Cookie Fixer
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
        {/* 2. CATEGORY TABS (7 Power Tools)                                          */}
        {/* ========================================================================= */}
        <div className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'promo', label: '🎁 1. Realtime Trial Scanner', icon: Gift },
              { id: 'downloader', label: '🎬 2. HD Media Downloader', icon: Video },
              { id: 'edu', label: '🎓 3. Edu KTM Lifetime', icon: GraduationCap },
              { id: 'sms', label: '📱 4. Live Temp SMS OTP', icon: Smartphone },
              { id: 'vpn', label: '🛡️ 5. VPN & Proxy Subscriptions', icon: Radio },
              { id: 'cookie', label: '🍪 6. Cookie Sanitizer & Fixer', icon: Cookie },
              { id: 'family', label: '👨‍👩‍👧‍👦 7. Family Plan Matcher', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as GarapanTab)}
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
          {/* TAB 1: 🎁 REALTIME PROMO & TRIAL SCANNER                                */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'promo' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/40 p-4 sm:p-5 relative overflow-hidden shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-white text-sm sm:text-base">
                          Pusat Klaim Trial Resmi &amp; Promo Realtime ($0 Verified)
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>11 Promo Resmi Aktif</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Tautan resmi klaim free trial aktif (Spotify 3 Bulan, Apple Music, Canva Pro, YouTube, Notion AI, GitHub Pack, Alight Motion). Gunakan TempMail kita untuk verifikasi instan!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchLivePromos}
                    disabled={isLoadingPromos}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-md shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingPromos ? 'animate-spin' : ''}`} />
                    <span>{isLoadingPromos ? 'Memindai...' : '🔍 Scan Ulang Promo'}</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoSearch}
                    onChange={(e) => setPromoSearch(e.target.value)}
                    placeholder="Cari promo (Spotify, Canva, Apple)..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar">
                  {[
                    { id: 'all', label: '✨ Semua' },
                    { id: 'Music', label: '🎵 Musik' },
                    { id: 'Design', label: '🎨 Desain & AI' },
                    { id: 'Video', label: '🎬 Streaming' },
                    { id: 'Developer', label: '💻 Developer' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPromoCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        promoCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livePromos.map((pr) => {
                  const isExpanded = expandedPromoId === pr.id;
                  const isCopied = copiedKey === `pr_mail_${pr.id}`;

                  return (
                    <div
                      key={pr.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3.5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${pr.color} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}>
                              {pr.platform.substring(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{pr.title}</h4>
                              <div className="text-[10px] text-slate-400 truncate">{pr.category} • {pr.duration}</div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${pr.badgeColor}`}>
                            {pr.badge}
                          </span>
                        </div>

                        <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5 text-xs text-slate-300 space-y-1">
                          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Benefit:</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{pr.benefit}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedPromoId(isExpanded ? null : pr.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-indigo-400 hover:text-indigo-300 py-1"
                        >
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{isExpanded ? 'Sembunyikan Panduan' : '📖 Lihat Panduan Klaim $0'}</span>
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {isExpanded && (
                          <div className="rounded-xl bg-slate-950 border border-indigo-500/30 p-3 space-y-2 text-xs text-slate-300 animate-in fade-in duration-150">
                            <span className="font-bold text-white block">Langkah Aktivasi:</span>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                              {pr.guideSteps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <a
                          href={pr.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>🚀 Buka Link Klaim Resmi</span>
                        </a>

                        {currentTempEmail && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentTempEmail, `pr_mail_${pr.id}`)}
                            className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-xs text-slate-200 border border-slate-700 shrink-0"
                            title="Salin Email TempMail Saat Ini"
                          >
                            {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: 🎬 REAL HD MEDIA & VIDEO DOWNLOADER                             */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'downloader' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-purple-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Universal HD Video &amp; MP3 Downloader (No-Watermark)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Unduh video TikTok tanpa watermark, audio MP3 320kbps, Instagram Reels, dan YouTube Shorts dengan kualitas asli Full HD secara instan!
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xl">
                <label className="text-xs font-bold text-slate-300 block">
                  Tempel Tautan Video (TikTok, Instagram, YouTube, Twitter):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={mediaInputUrl}
                    onChange={(e) => setMediaInputUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@user/video/123456789... atau https://instagram.com/reel/..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchMedia}
                    disabled={isDownloadingMedia || !mediaInputUrl.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isDownloadingMedia ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Memproses Media...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Unduh Media HD</span>
                      </>
                    )}
                  </button>
                </div>

                {mediaError && (
                  <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{mediaError}</span>
                  </div>
                )}

                {/* Media Download Result Card */}
                {mediaResult && (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 space-y-4 pt-4 border-t border-rose-500/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={mediaResult.thumbnailUrl}
                          alt="Thumbnail"
                          className="h-16 w-16 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2">{mediaResult.title}</h4>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Oleh: <span className="text-rose-400 font-semibold">{mediaResult.authorName}</span> • {mediaResult.durationFormatted}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        ✨ {mediaResult.quality}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <a
                        href={mediaResult.hdVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                      >
                        <Video className="h-4 w-4" />
                        <span>📥 Download Video No-Watermark (MP4)</span>
                      </a>

                      {mediaResult.audioMp3Url ? (
                        <a
                          href={mediaResult.audioMp3Url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                        >
                          <Music className="h-4 w-4" />
                          <span>🎵 Download Audio Original (MP3)</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(mediaResult.hdVideoUrl, 'media_link')}
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 px-4 text-xs font-bold text-white border border-slate-700"
                        >
                          {copiedKey === 'media_link' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          <span>{copiedKey === 'media_link' ? 'Link Tersalin!' : 'Salin Direct Link'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: 🎓 EDU MAIL & KTM VIRTUAL GENERATOR                              */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'edu' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Generator Kartu Tanda Mahasiswa (KTM) &amp; Email Kampus (.ac.id / .edu)</div>
                  <p className="text-slate-400 leading-relaxed">
                    100% Bekerja untuk verifikasi <b>Canva Edu Lifetime</b>, <b>Notion AI Unlimited</b>, <b>GitHub Student Pack ($200k)</b>, dan <b>JetBrains IDEs</b>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-6 space-y-3.5 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    ⚙️ Konfigurasi Data Mahasiswa:
                  </span>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Pilih Universitas / Kampus:</label>
                    <select
                      value={selectedUniv.name}
                      onChange={(e) => {
                        const u = EDU_UNIVERSITIES.find((item) => item.name === e.target.value);
                        if (u) setSelectedUniv(u);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {EDU_UNIVERSITIES.map((u) => (
                        <option key={u.name} value={u.name}>
                          {u.name} ({u.domain})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Nama Mahasiswa:</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">NIM (Nomor Induk):</label>
                      <input
                        type="text"
                        value={studentNim}
                        onChange={(e) => setStudentNim(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Program Studi / Jurusan:</label>
                    <select
                      value={studentMajor}
                      onChange={(e) => setStudentMajor(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {MAJORS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 block">Email Kampus Virtual (.edu / .ac.id):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={eduEmail}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(eduEmail, 'edu_email')}
                        className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2.5 text-xs text-white"
                        title="Salin Email"
                      >
                        {copiedKey === 'edu_email' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-3.5 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider self-start">
                    🖼️ Live Preview Kartu KTM (HD PNG):
                  </span>

                  <div className="w-full overflow-hidden rounded-2xl border border-indigo-500/40 shadow-2xl bg-black">
                    <canvas ref={ktmCanvasRef} className="w-full h-auto block" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadKTM}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 px-4 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>📥 UNDUH KARTU KTM (FORMAT PNG HD)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: 📱 REAL LIVE TEMP SMS OTP RECEIVER                               */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'sms' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-white text-sm sm:text-base">
                        Kotak Masuk Virtual SMS &amp; Penerima OTP Realtime
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Pilih nomor telepon virtual (USA, UK, Indonesia, Jerman) untuk menerima SMS kode OTP (WhatsApp, Telegram, TikTok, Google, Shopee) secara publik tanpa kartu SIM!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchLiveSms}
                    disabled={isLoadingSms}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-md shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSms ? 'animate-spin' : ''}`} />
                    <span>{isLoadingSms ? 'Memuat SMS...' : '🔄 Refresh Kotak Masuk'}</span>
                  </button>
                </div>
              </div>

              {/* Number Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {livePhoneNumbers.map((pn) => (
                  <button
                    key={pn.id}
                    type="button"
                    onClick={() => setSelectedPhoneId(pn.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedPhoneId === pn.id
                        ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-lg ring-1 ring-cyan-500/50'
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{pn.flag}</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Online
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-1">{pn.number}</div>
                    <div className="text-[10px] text-slate-400">{pn.country}</div>
                  </button>
                ))}
              </div>

              {/* Active Phone Details & Message Stream */}
              {activePhone && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">Nomor Terpilih:</div>
                      <div className="text-sm sm:text-base font-bold text-cyan-400 font-mono flex items-center gap-2">
                        <span>{activePhone.flag} {activePhone.number}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activePhone.number, 'active_phone')}
                          className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg border border-slate-700"
                        >
                          {copiedKey === 'active_phone' ? '✓ Tersalin' : 'Salin Nomor'}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span>Pesan Masuk ({activePhone.activeMessages.length} Pesan)</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {activePhone.activeMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1.5 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                              {msg.from}
                            </span>
                            {msg.otpCode && (
                              <span className="font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded text-xs">
                                OTP: {msg.otpCode}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{msg.receivedTime}</span>
                        </div>

                        <p className="text-slate-300 text-[11px] leading-relaxed">{msg.body}</p>

                        {msg.otpCode && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(msg.otpCode!, `otp_${msg.id}`)}
                              className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all"
                            >
                              {copiedKey === `otp_${msg.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedKey === `otp_${msg.id}` ? 'OTP Tersalin!' : 'Salin Kode OTP'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: 🛡️ VPN & PROXY NODE SUBSCRIPTION STUDIO                          */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'vpn' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 p-4 sm:p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
                      <Radio className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-white text-sm sm:text-base">
                        Global High-Speed Proxy &amp; VPN Subscription Studio
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Koleksi node Hysteria 2, VLESS, VMess, Shadowsocks berkecepatan tinggi (Singapore, Indonesia, Japan, USA) siap import 1-klik ke <b>v2rayNG</b>, <b>Nekobox</b>, dan <b>Clash Verge</b>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="/api/vpn/subscription?format=base64"
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2.5 text-xs font-bold shadow-md"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Direct Sub URL</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Subscription Export Bar */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-white">📋 Link Langganan Subscription:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                    {[
                      { id: 'base64', label: 'Base64 (v2rayNG / Nekobox)' },
                      { id: 'clash', label: 'Clash YAML' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedVpnFormat(f.id as any)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          selectedVpnFormat === f.id ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedVpnFormat === 'base64'
                        ? generateBase64Subscription()
                        : generateClashYamlConfig()
                    }
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        selectedVpnFormat === 'base64'
                          ? generateBase64Subscription()
                          : generateClashYamlConfig(),
                        'vpn_sub'
                      )
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 px-4 text-xs font-bold text-white shadow active:scale-95 transition-all shrink-0"
                  >
                    {copiedKey === 'vpn_sub' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedKey === 'vpn_sub' ? 'Tersalin!' : 'Salin Config'}</span>
                  </button>
                </div>
              </div>

              {/* Node Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {vpnNodes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{n.serverName}</div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {n.ping}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded-xl border border-slate-800 truncate">
                      {n.configUri}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(n.configUri, `uri_${n.id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 px-3 text-xs font-bold text-white border border-slate-700 active:scale-95 transition-all"
                    >
                      {copiedKey === `uri_${n.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === `uri_${n.id}` ? 'URI Tersalin!' : 'Salin URI Node'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 6: 🍪 COOKIE SANITIZER & FIXER                                      */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'cookie' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">⚠️ Informasi Otentikasi Streaming Server:</div>
                    <p className="text-slate-300 leading-relaxed">
                      Layanan streaming (Netflix, Spotify) memvalidasi token sesi secara langsung ke server. Tool di bawah ini berguna jika Anda memiliki **cookie akun aktif dari Telegram/Forum** yang error saat di-import agar dibetulkan sintaksnya ke format Cookie-Editor JSON / Bookmarklet 1-klik!
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      🛠️ Cookie Sanitizer &amp; Syntax Fixer (Pembersih Cookie Rusak)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      Tempel teks cookie mentah di bawah ini untuk dibetulkan format JSON, domain, dan tanggal expired-nya ke 1 tahun ke depan!
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={customRawInput}
                    onChange={(e) => setCustomRawInput(e.target.value)}
                    placeholder="Tempel teks cookie mentah, JSON bermasalah, Netscape .txt, atau Cookie Header di sini..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none custom-scrollbar"
                  />

                  <button
                    type="button"
                    onClick={handleSanitizeUserCookie}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Perbaiki &amp; Standarisasi Cookie Sekarang</span>
                  </button>
                </div>

                {customSanitizeResult && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    {customSanitizeResult.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Berhasil Diperbaiki! ({customSanitizeResult.count} Cookie Terdeteksi)</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(customSanitizeResult.jsonOutput, 'sanitized_json')}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold"
                          >
                            {copiedKey === 'sanitized_json' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'sanitized_json' ? 'JSON Tersalin!' : 'Salin JSON'}</span>
                          </button>
                        </div>

                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-emerald-300 max-h-36 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-all">
                          {customSanitizeResult.jsonOutput}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{customSanitizeResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 7: 👨‍👩‍👧‍👦 SPOTIFY & YOUTUBE FAMILY SLOT & ADDRESS MATCHER              */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'family' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex items-start gap-3">
                <Users className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Family Plan Address Matcher (Bypass Deteksi Lokasi)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Spotify &amp; YouTube Premium Family mewajibkan seluruh 5 anggota memiliki <b>alamat domisili yang sama persis</b> dengan Host. Gunakan generator alamat seragam di bawah ini.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span>Alamat Domisili Seragam:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomizeFamilyAddress}
                    className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    🔄 Ganti Alamat
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Alamat Jalan:</span>
                    <span className="text-white font-bold">{familyAddress.street}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Kelurahan / Kecamatan:</span>
                    <span className="text-white">{familyAddress.kelurahan}, {familyAddress.kecamatan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Kota &amp; Provinsi:</span>
                    <span className="text-white">{familyAddress.city}, {familyAddress.province}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Kode Pos:</span>
                    <span className="text-cyan-400 font-bold">{familyAddress.postalCode}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const template = `Halo kak! Berikut data aktivasi Spotify/YouTube Family:\n\n📍 Alamat: ${familyAddress.street}, ${familyAddress.kelurahan}, ${familyAddress.kecamatan}, ${familyAddress.city}\n📮 Kode Pos: ${familyAddress.postalCode}\n\nPastikan alamat diisi sama persis agar langsung aktif ya!`;
                    copyToClipboard(template, 'wa_template');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 px-4 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                >
                  {copiedKey === 'wa_template' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedKey === 'wa_template' ? 'Template Format Tersalin!' : '📋 Salin Format Pesan ke Pembeli'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
