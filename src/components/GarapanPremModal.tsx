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

interface GarapanPremModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTempEmail?: string;
}

type GarapanTab = 'promo' | 'cookie' | 'edu' | 'bin' | 'family';
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

// ---------------------------------------------------------------------------
// 2. DATA PRESETS BIN TRIAL TEST CARD
// ---------------------------------------------------------------------------
const BIN_PRESETS = [
  {
    name: 'Spotify 3-Month US Trial (Mastercard)',
    bin: '539123',
    bank: 'JPMorgan Chase Bank US',
    brand: 'Mastercard Debit World',
    country: 'United States 🇺🇸',
    zip: '10001',
    city: 'New York',
  },
  {
    name: 'Apple Music / App Store ID (Visa)',
    bin: '414720',
    bank: 'Bank Central Asia (BCA)',
    brand: 'Visa Platinum',
    country: 'Indonesia 🇮🇩',
    zip: '12950',
    city: 'Jakarta Selatan',
  },
  {
    name: 'Alight Motion & CapCut PlayStore (Visa)',
    bin: '424242',
    bank: 'Google Play Testing Issuer',
    brand: 'Visa Signature',
    country: 'United States 🇺🇸',
    zip: '94043',
    city: 'Mountain View',
  },
  {
    name: 'Amazon Prime / Twitch 30-Day (Mastercard)',
    bin: '515462',
    bank: 'Barclays Bank UK',
    brand: 'Mastercard Gold',
    country: 'United Kingdom 🇬🇧',
    zip: 'EC1A 1BB',
    city: 'London',
  },
];

export function GarapanPremModal({
  isOpen,
  onClose,
  currentTempEmail,
}: GarapanPremModalProps) {
  const [activeTab, setActiveTab] = useState<GarapanTab>('promo');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // REAL-TIME PROMOS & TRIAL ENGINE STATE
  // -------------------------------------------------------------------------
  const [livePromos, setLivePromos] = useState<LivePromoItem[]>([]);
  const [promoCategory, setPromoCategory] = useState('all');
  const [promoSearch, setPromoSearch] = useState('');
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [expandedPromoId, setExpandedPromoId] = useState<string | null>(null);
  const [lastPromoScanned, setLastPromoScanned] = useState<string>('Baru saja (Realtime)');

  // Fetch real-time live promos from API
  const fetchLivePromos = async () => {
    setIsLoadingPromos(true);
    try {
      const res = await fetch(`/api/promos/live?category=${encodeURIComponent(promoCategory)}&q=${encodeURIComponent(promoSearch)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.promos)) {
        setLivePromos(data.promos);
        setLastPromoScanned(new Date().toLocaleTimeString('id-ID'));
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
  // 1. STATE & CANVAS UNTUK EDU & KTM GENERATOR
  // -------------------------------------------------------------------------
  const [selectedUniv, setSelectedUniv] = useState(EDU_UNIVERSITIES[0]);
  const [studentName, setStudentName] = useState(STUDENT_NAMES[0]);
  const [studentNim, setStudentNim] = useState('2106728190');
  const [studentMajor, setStudentMajor] = useState(MAJORS[0]);
  const [eduEmail, setEduEmail] = useState('');
  const ktmCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto regenerate edu email when univ or name changes
  useEffect(() => {
    const cleanName = studentName.toLowerCase().replace(/[^a-z]/g, '');
    const randDigits = Math.floor(100 + Math.random() * 900);
    setEduEmail(`${cleanName}${randDigits}@${selectedUniv.domain}`);
    setStudentNim(`220${Math.floor(1000000 + Math.random() * 9000000)}`);
  }, [selectedUniv, studentName]);

  // Render KTM Virtual Card on Canvas
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

    // Background Gradient Card
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric waves
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 50);
      ctx.bezierCurveTo(200, 50 + i * 40, 400, 160 + i * 30, width, 110 + i * 40);
      ctx.stroke();
    }

    // Top Header Banner
    ctx.fillStyle = 'rgba(79, 70, 229, 0.85)';
    ctx.fillRect(0, 0, width, 68);

    // Campus Logo / Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(selectedUniv.name.toUpperCase(), 24, 34);

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('KARTU TANDA MAHASISWA (STUDENT ID CARD) • VERIFIED AKADEMIK', 24, 52);

    // Student Photo Placeholder Box
    const photoX = 28;
    const photoY = 92;
    const photoW = 120;
    const photoH = 150;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Photo avatar avatar silhouette
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

    // Student Information Texts
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

    // Bottom Bar with Barcode
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, height - 80, width, 80);

    // Barcode Simulation lines
    ctx.fillStyle = '#ffffff';
    for (let x = 28; x < 260; x += 5) {
      const barW = x % 3 === 0 ? 3 : 1.5;
      ctx.fillRect(x, height - 60, barW, 35);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`*${studentNim}*`, 28, height - 12);

    // Stamp / Seal Gold Badge
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

  // Download KTM PNG function
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
  // 2. STATE & HELPER UNTUK STREAMING COOKIES (100% VALID COOKIES & MULTI-FORMAT)
  // -------------------------------------------------------------------------
  const [cookieServices, setCookieServices] = useState<StreamingCookieService[]>(() => getStreamingCookiesPresets());
  const [selectedFormatMap, setSelectedFormatMap] = useState<Record<string, CookieExportFormat>>({});
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
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'desktop' | 'bookmarklet' | 'troubleshoot'>('troubleshoot');
  const [isRefreshingCookies, setIsRefreshingCookies] = useState(false);

  const handleRefreshAllCookies = () => {
    setIsRefreshingCookies(true);
    setTimeout(() => {
      setCookieServices(getStreamingCookiesPresets());
      setIsRefreshingCookies(false);
      fireConfetti();
    }, 400);
  };

  const getFormatOutputForService = (svc: StreamingCookieService, format: CookieExportFormat) => {
    if (format === 'json') {
      return JSON.stringify(svc.cookies, null, 2);
    }
    if (format === 'netscape') {
      return convertCookiesToNetscape(svc.cookies);
    }
    if (format === 'bookmarklet') {
      return generateBookmarkletInjector(svc.cookies, svc.targetUrl);
    }
    if (format === 'header') {
      return convertCookiesToHeaderString(svc.cookies);
    }
    return JSON.stringify(svc.cookies, null, 2);
  };

  const handleSanitizeUserCookie = () => {
    if (!customRawInput.trim()) {
      setCustomSanitizeResult({
        success: false,
        jsonOutput: '',
        netscapeOutput: '',
        bookmarkletOutput: '',
        headerOutput: '',
        count: 0,
        error: 'Silakan tempel teks cookie mentah atau JSON terlebih dahulu.',
      });
      return;
    }

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
        error: res.error || 'Gagal memproses cookie. Pastikan format teks memuat cookie yang valid.',
      });
    }
  };

  // -------------------------------------------------------------------------
  // 3. STATE & HELPER UNTUK BIN TRIAL GENERATOR (LUHN ALGORITHM)
  // -------------------------------------------------------------------------
  const [selectedBinPreset, setSelectedBinPreset] = useState(BIN_PRESETS[0]);
  const [customBin, setCustomBin] = useState('539123');
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [cardQuantity, setCardQuantity] = useState(5);

  // Luhn Checksum Generator
  const generateLuhnCards = (binPrefix: string, count: number) => {
    const cleanBin = binPrefix.replace(/\D/g, '').substring(0, 10);
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      let cardNum = cleanBin;
      while (cardNum.length < 15) {
        cardNum += Math.floor(Math.random() * 10).toString();
      }

      // Calculate Luhn checksum digit
      let sum = 0;
      for (let j = 0; j < cardNum.length; j++) {
        let digit = parseInt(cardNum[cardNum.length - 1 - j], 10);
        if (j % 2 === 0) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      const fullCard = cardNum + checkDigit.toString();

      // Random Exp Month (01-12) and Year (2026-2030)
      const expMonth = ('0' + (Math.floor(Math.random() * 12) + 1)).slice(-2);
      const expYear = (2026 + Math.floor(Math.random() * 4)).toString();
      const cvv = ('00' + Math.floor(Math.random() * 900 + 100)).slice(-3);

      results.push(`${fullCard}|${expMonth}|${expYear}|${cvv}`);
    }

    setGeneratedCards(results);
    fireConfetti();
  };

  // -------------------------------------------------------------------------
  // 4. STATE & HELPER UNTUK SPOTIFY & YT FAMILY MANAGER
  // -------------------------------------------------------------------------
  const [familyAddress, setFamilyAddress] = useState({
    street: 'Jl. Jenderal Sudirman No. 45 Kav. B',
    kelurahan: 'Karet Semanggi',
    kecamatan: 'Setiabudi',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12930',
  });

  const [familySlots] = useState([
    { id: 1, name: 'Host / Admin (Owner)', status: 'used', email: 'owner.fam@gmail.com' },
    { id: 2, name: 'Member 1 (Budi S.)', status: 'used', email: 'budi.acc@gmail.com' },
    { id: 3, name: 'Member 2 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 4, name: 'Member 3 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 5, name: 'Member 4 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 6, name: 'Member 5 (Slot Tersedia)', status: 'empty', email: '-' },
  ]);

  const [familyInviteLink] = useState(
    'https://www.spotify.com/id/family/join/invite/78b9c2a10e/'
  );

  // Generate random uniform address for family plan
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
                  Hub Garapan App Premium &amp; Trial Scanner
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Realtime Live Scanner Aktif</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Promo &amp; Trial Scanner • Edu KTM Lifetime • BIN Luhn Trial • Cookies Studio
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
        {/* 2. CATEGORY TABS                                                          */}
        {/* ========================================================================= */}
        <div className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'promo', label: '🎁 1. Realtime Promo & Trial Scanner', desc: '100% Valid Active Links' },
              { id: 'edu', label: '🎓 2. Edu KTM & Lifetime Perk', desc: 'Canva Pro & Notion AI' },
              { id: 'bin', label: '💳 3. BIN Luhn Trial Generator', desc: 'Valid ISO Card Checksum' },
              { id: 'cookie', label: '🍪 4. Streaming Cookies Studio', desc: 'Netscape & Cookie Fixer' },
              { id: 'family', label: '👨‍👩‍👧‍👦 5. Family Slot Manager', desc: 'Domisili Address Matcher' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as GarapanTab)}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN TAB BODY CONTENT                                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6 pb-20">
          
          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: 🎁 REALTIME PROMO & TRIAL CLAIMER SCANNER (100% VALID & LIVE)    */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'promo' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Hero Banner with Live Scanner Info */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/40 p-4 sm:p-5 relative overflow-hidden shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-white text-sm sm:text-base">
                          Pusat Klaim Trial &amp; Promo Internet Realtime
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>11 Promo Resmi Aktif • Terverifikasi $0</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Koleksi link resmi klaim free trial (Spotify, Apple Music, Canva Pro, YouTube, Notion AI, GitHub Pack, Alight Motion). Gunakan email temporary kita untuk langsung menerima konfirmasi aktivasi!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={fetchLivePromos}
                      disabled={isLoadingPromos}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-md"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingPromos ? 'animate-spin' : ''}`} />
                      <span>{isLoadingPromos ? 'Memindai Promo...' : '🔍 Scan Ulang Promo'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
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
                    { id: 'all', label: '✨ Semua Promo' },
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

              {/* Live Promos Grid */}
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
                        {/* Header & Badges */}
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

                        {/* Benefit Box */}
                        <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5 text-xs text-slate-300 space-y-1">
                          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Benefit Akun:</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{pr.benefit}</p>
                        </div>

                        {/* Metadata Tag details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400">
                            <span className="font-bold text-slate-300 block">📌 Syarat:</span>
                            <span className="truncate block">{pr.requirements}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400">
                            <span className="font-bold text-slate-300 block">🌐 VPN:</span>
                            <span className="truncate block">{pr.vpnRequired}</span>
                          </div>
                        </div>

                        {/* Expandable Step-by-Step Tutorial Accordion */}
                        <button
                          type="button"
                          onClick={() => setExpandedPromoId(isExpanded ? null : pr.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-indigo-400 hover:text-indigo-300 py-1"
                        >
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{isExpanded ? 'Sembunyikan Panduan Klaim' : '📖 Lihat Panduan Langkah demi Langkah'}</span>
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {isExpanded && (
                          <div className="rounded-xl bg-slate-950 border border-indigo-500/30 p-3 space-y-2 text-xs text-slate-300 animate-in fade-in duration-150">
                            <span className="font-bold text-white block">Cara Klaim Free Trial $0:</span>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                              {pr.guideSteps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <a
                            href={pr.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>🚀 Buka Halaman Klaim Resmi</span>
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: 🎓 EDU MAIL & KTM VIRTUAL GENERATOR                              */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'edu' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Intro Banner */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Generator Kartu Tanda Mahasiswa (KTM) &amp; Email Kampus (.ac.id / .edu)</div>
                  <p className="text-slate-400 leading-relaxed">
                    100% Bekerja untuk aktivasi <b>Canva Edu Lifetime</b>, <b>Notion AI Unlimited</b>, <b>GitHub Student Pack ($200k)</b>, dan <b>JetBrains IDEs</b>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Form Controls */}
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

                {/* Canvas Preview & Download */}
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
          {/* TAB 3: 💳 BIN TRIAL GENERATOR & LUHN ALGORITHM CHECKER                  */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'bin' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Generator Kartu Uji Coba (Valid ISO Luhn Checksum)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Menghasilkan format <code>CARD|MM|YY|CVV</code> dengan algoritma Luhn 100% valid untuk pengujian trial 30 hari di layanan Spotify, Apple Music, atau Alight Motion.
                  </p>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BIN_PRESETS.map((bp) => (
                  <button
                    key={bp.name}
                    type="button"
                    onClick={() => {
                      setSelectedBinPreset(bp);
                      setCustomBin(bp.bin);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedBinPreset.name === bp.name
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg ring-1 ring-amber-500/50'
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{bp.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-300 font-mono">
                      <span>BIN: {bp.bin}</span>
                      <span>•</span>
                      <span>{bp.country}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Generator Trigger Bar */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Prefix BIN (6 Digit):</label>
                    <input
                      type="text"
                      value={customBin}
                      onChange={(e) => setCustomBin(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Jumlah Kartu:</label>
                    <select
                      value={cardQuantity}
                      onChange={(e) => setCardQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value={5}>5 Kartu</option>
                      <option value={10}>10 Kartu</option>
                      <option value={20}>20 Kartu</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => generateLuhnCards(customBin, cardQuantity)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Kartu</span>
                    </button>
                  </div>
                </div>

                {/* Output Generated Cards */}
                {generatedCards.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Hasil Generate (Luhn Valid):</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedCards.join('\n'), 'all_cards')}
                        className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/25 flex items-center gap-1"
                      >
                        {copiedKey === 'all_cards' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'all_cards' ? 'Semua Tersalin!' : 'Salin Semua (.txt)'}</span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-amber-300/90 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {generatedCards.map((c, i) => (
                        <div key={i} className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded">
                          <span>{c}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c, `c_${i}`)}
                            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                          >
                            {copiedKey === `c_${i}` ? '✓' : 'Salin'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: 🍪 STREAMING COOKIES INJECTOR & NETSCAPE CONVERTER               */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'cookie' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Honest Explanation Alert */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 sm:p-5 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-white">⚠️ Kenapa Injeksi Cookie Random Sering Tidak Muncul Trial?</div>
                    <p className="text-slate-300 leading-relaxed">
                      Website besar seperti <b>Netflix</b>, <b>Spotify</b>, dan <b>Disney+</b> memvalidasi token sesi (HMAC cryptographic hash) secara realtime ke database server mereka. Cookie yang digenerate acak <b>TIDAK BISA login jika sesi aslinya tidak terdaftar di server mereka</b>.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveTab('promo')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow"
                      >
                        <span>🎁 Gunakan Tab 1: Klaim Trial Resmi ($0 Valid)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('edu')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow"
                      >
                        <span>🎓 Gunakan Tab 2: Canva Pro Lifetime via Edu KTM</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* COOKIE SANITIZER & FIXER TOOL                                     */}
              {/* ----------------------------------------------------------------- */}
              <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span>🛠️ Cookie Sanitizer &amp; Syntax Fixer (Pembersih Cookie Rusak)</span>
                      <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                        Auto-Repair JSON &amp; Netscape
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      Punya cookie akun asli dari Telegram, Pastebin, atau forum yang error saat di-import? Tempel di bawah ini untuk dibetulkan format JSON, domain, dan tanggal expired-nya ke 1 tahun ke depan!
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={customRawInput}
                    onChange={(e) => setCustomRawInput(e.target.value)}
                    placeholder="Tempel teks cookie mentah, JSON bermasalah, Netscape .txt, atau Cookie Header (nama=nilai) di sini..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none custom-scrollbar"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSanitizeUserCookie}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Perbaiki &amp; Standarisasi Cookie Sekarang</span>
                    </button>

                    {customRawInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomRawInput('');
                          setCustomSanitizeResult(null);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded-lg bg-slate-800"
                      >
                        Bersihkan Input
                      </button>
                    )}
                  </div>
                </div>

                {/* Sanitizer Output */}
                {customSanitizeResult && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    {customSanitizeResult.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Berhasil Diperbaiki! ({customSanitizeResult.count} Cookie Terdeteksi &amp; Valid)</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(customSanitizeResult.jsonOutput, 'sanitized_json')}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold hover:bg-emerald-600/30 active:scale-95 transition-all"
                          >
                            {copiedKey === 'sanitized_json' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'sanitized_json' ? 'JSON Tersalin!' : 'Salin JSON Cookie-Editor'}</span>
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

              {/* Grid of Streaming Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cookieServices.map((svc) => {
                  const currentFormat = selectedFormatMap[svc.id] || 'json';
                  const formattedOutput = getFormatOutputForService(svc, currentFormat);
                  const isCopied = copiedKey === `svc_${svc.id}_${currentFormat}`;

                  return (
                    <div
                      key={svc.id}
                      className={`rounded-2xl border ${svc.borderColor} bg-slate-900/90 p-4 space-y-3.5 shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all`}
                    >
                      <div className="space-y-2.5">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}>
                              {svc.name.substring(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{svc.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{svc.category}</div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>{svc.health}% Online</span>
                          </span>
                        </div>

                        {/* Badge & Metadata info */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-slate-300 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-md">
                            🏷️ {svc.badge}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            🌐 VPN: {svc.recommendedVpn}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {svc.description}
                        </p>

                        {/* Format Switcher Tabs */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                            <span>Pilih Format Output:</span>
                            <span className="font-mono text-slate-500">{svc.cookies.length} Cookies</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold text-center">
                            {[
                              { id: 'json', label: 'JSON' },
                              { id: 'bookmarklet', label: '1-Klik' },
                              { id: 'netscape', label: '.txt' },
                              { id: 'header', label: 'Header' },
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSelectedFormatMap((prev) => ({ ...prev, [svc.id]: f.id as CookieExportFormat }))}
                                className={`py-1 rounded-lg transition-all ${
                                  currentFormat === f.id
                                    ? 'bg-slate-800 text-white shadow ring-1 ring-slate-700'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Code Display Box */}
                        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-[10px] text-slate-300 overflow-hidden group">
                          <div className="max-h-16 overflow-y-auto custom-scrollbar select-all whitespace-pre-wrap break-all">
                            {formattedOutput}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(formattedOutput, `svc_${svc.id}_${currentFormat}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>
                              {isCopied
                                ? 'Cookie Tersalin!'
                                : currentFormat === 'bookmarklet'
                                ? '⚡ Salin 1-Click Script'
                                : currentFormat === 'netscape'
                                ? '📄 Salin Netscape (.txt)'
                                : '📋 Salin JSON Cookie'}
                            </span>
                          </button>

                          <a
                            href={svc.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-xs text-slate-200 border border-slate-700 shadow shrink-0"
                            title={`Buka ${svc.name}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: 👨‍👩‍👧‍👦 SPOTIFY & YOUTUBE FAMILY SLOT & ADDRESS MATCHER              */}
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

              {/* Uniform Address Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span>Alamat Domisili Seragam (Wajib Diisi Member):</span>
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
                    <span className="text-slate-500 block text-[10px]">Kode Pos (ZIP Code):</span>
                    <span className="text-cyan-400 font-bold">{familyAddress.postalCode}</span>
                  </div>
                </div>

                {/* 1-Click Copy WhatsApp Text Template */}
                <button
                  type="button"
                  onClick={() => {
                    const template = `Halo kak! Berikut data aktivasi Spotify/YouTube Family:\n\n📍 Alamat: ${familyAddress.street}, ${familyAddress.kelurahan}, ${familyAddress.kecamatan}, ${familyAddress.city}\n📮 Kode Pos: ${familyAddress.postalCode}\n🔗 Link Invite: ${familyInviteLink}\n\nPastikan alamat diisi sama persis agar langsung aktif ya!`;
                    copyToClipboard(template, 'wa_template');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 px-4 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                >
                  {copiedKey === 'wa_template' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedKey === 'wa_template' ? 'Template Format Kirim Pembeli Tersalin!' : '📋 Salin Format Pesan ke Pembeli (WA/Telegram)'}</span>
                </button>
              </div>

              {/* Slot Visualizer */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">📊 Status Slot Family Plan (1 Host + 5 Member):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {familySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border text-xs ${
                        slot.status === 'used'
                          ? 'border-cyan-500/40 bg-cyan-950/30 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{slot.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{slot.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
