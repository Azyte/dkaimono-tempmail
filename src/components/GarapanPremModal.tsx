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
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

interface GarapanPremModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTempEmail?: string;
}

type GarapanTab = 'edu' | 'cookie' | 'bin' | 'family' | 'promo';

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
// 2. DATA PRESETS UNTUK STREAMING COOKIES
// ---------------------------------------------------------------------------
const STREAMING_COOKIES_LIST = [
  {
    id: 'netflix',
    name: 'Netflix 4K UHD Premium',
    category: 'Video Streaming',
    status: 'active',
    health: 98,
    usersActive: 42,
    badge: 'Ultra HD 4K',
    color: 'from-red-600 to-rose-700',
    border: 'border-red-500/40',
    textCol: 'text-red-400',
    sampleJson: `[{"domain":".netflix.com","name":"NetflixId","value":"v%3D3%26ct%3DBQAOAAEBEN3h...","path":"/","secure":true,"httpOnly":true},{"domain":".netflix.com","name":"SecureNetflixId","value":"v%3D3%26mac%3DAQEAEQAB...","path":"/","secure":true,"httpOnly":true}]`,
    guideUrl: 'https://netflix.com',
  },
  {
    id: 'spotify',
    name: 'Spotify Web Premium Individual',
    category: 'Music & Podcasts',
    status: 'active',
    health: 95,
    usersActive: 68,
    badge: 'High Quality Audio',
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-500/40',
    textCol: 'text-emerald-400',
    sampleJson: `[{"domain":".spotify.com","name":"sp_dc","value":"AQDu67WvRk...","path":"/","secure":true,"httpOnly":true},{"domain":".spotify.com","name":"sp_key","value":"9e21...","path":"/","secure":true,"httpOnly":true}]`,
    guideUrl: 'https://open.spotify.com',
  },
  {
    id: 'disney',
    name: 'Disney+ Hotstar VIP Max',
    category: 'Movies & Series',
    status: 'active',
    health: 92,
    usersActive: 31,
    badge: 'Dolby Vision 4K',
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/40',
    textCol: 'text-blue-400',
    sampleJson: `[{"domain":".hotstar.com","name":"userSession","value":"eyJhbGciOiJIUzI1NiIs...","path":"/","secure":true,"httpOnly":true}]`,
    guideUrl: 'https://hotstar.com',
  },
  {
    id: 'vidio',
    name: 'Vidio Premier Platinum + Liga 1',
    category: 'Live Sports',
    status: 'active',
    health: 96,
    usersActive: 54,
    badge: 'Full Sports HD',
    color: 'from-amber-600 to-red-600',
    border: 'border-amber-500/40',
    textCol: 'text-amber-400',
    sampleJson: `[{"domain":".vidio.com","name":"_vidio_session","value":"8b9c2a1...","path":"/","secure":true,"httpOnly":true}]`,
    guideUrl: 'https://vidio.com',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll Mega Fan HD',
    category: 'Anime Streaming',
    status: 'active',
    health: 94,
    usersActive: 27,
    badge: 'Simulcast Ad-Free',
    color: 'from-orange-600 to-amber-700',
    border: 'border-orange-500/40',
    textCol: 'text-orange-400',
    sampleJson: `[{"domain":".crunchyroll.com","name":"session_id","value":"cr_session_9102...","path":"/","secure":true,"httpOnly":true}]`,
    guideUrl: 'https://crunchyroll.com',
  },
];

// ---------------------------------------------------------------------------
// 3. DATA PRESETS BIN TRIAL TEST CARD
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

// ---------------------------------------------------------------------------
// 4. DATA PROMO LINKS
// ---------------------------------------------------------------------------
const PROMO_LINKS = [
  {
    title: 'Discord Nitro 3-Bulan (Epic Games Promo)',
    benefit: '2 Server Boosts + 500 Emojis + HD Stream 60FPS',
    req: 'Akun baru / belum pernah punya Nitro sebelumnya',
    badge: 'PROMO AKTIF',
    color: 'bg-indigo-600',
    link: 'https://store.epicgames.com/id/p/discord--discord-nitro',
    tag: 'Discord',
  },
  {
    title: 'Apple TV+ & Apple Music 3-Bulan Gratis',
    benefit: 'Streaming 4K Dolby Atmos + Full Album Lossless',
    req: 'Klaim via web browser atau Apple ID baru',
    badge: 'PROMO AKTIF',
    color: 'bg-slate-700',
    link: 'https://redeem.services.apple/shazam-3months',
    tag: 'Apple',
  },
  {
    title: 'Xbox Game Pass for PC 14-Hari / 1-Bulan',
    benefit: 'Main ratusan game PC (Forza, Minecraft, GTA)',
    req: 'Gunakan BIN US / Mastercard Debit',
    badge: 'TRIAL 1$',
    color: 'bg-emerald-600',
    link: 'https://www.xbox.com/id-ID/xbox-game-pass/pc-game-pass',
    tag: 'Xbox',
  },
  {
    title: 'Notion Plus + Unlimited AI (Student Perk)',
    benefit: 'Unlimited AI Q&A + 50MB File Upload',
    req: 'Gunakan email .edu yang di-generate di Tab 1',
    badge: 'LIFETIME FREE',
    color: 'bg-stone-800',
    link: 'https://www.notion.so/students',
    tag: 'Notion',
  },
];

export function GarapanPremModal({
  isOpen,
  onClose,
  currentTempEmail,
}: GarapanPremModalProps) {
  const [activeTab, setActiveTab] = useState<GarapanTab>('edu');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      const barW = (x % 3 === 0 ? 3 : 1.5);
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
  // 2. STATE & HELPER UNTUK BIN TRIAL GENERATOR (LUHN ALGORITHM)
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
  // 3. STATE & HELPER UNTUK SPOTIFY & YT FAMILY MANAGER
  // -------------------------------------------------------------------------
  const [familyAddress, setFamilyAddress] = useState({
    street: 'Jl. Jenderal Sudirman No. 45 Kav. B',
    kelurahan: 'Karet Semanggi',
    kecamatan: 'Setiabudi',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12930',
  });

  const [familySlots, setFamilySlots] = useState([
    { id: 1, name: 'Host / Admin (Owner)', status: 'used', email: 'owner.fam@gmail.com' },
    { id: 2, name: 'Member 1 (Budi S.)', status: 'used', email: 'budi.acc@gmail.com' },
    { id: 3, name: 'Member 2 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 4, name: 'Member 3 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 5, name: 'Member 4 (Slot Tersedia)', status: 'empty', email: '-' },
    { id: 6, name: 'Member 5 (Slot Tersedia)', status: 'empty', email: '-' },
  ]);

  const [familyInviteLink, setFamilyInviteLink] = useState(
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
                  Hub Garapan App Premium &amp; Bypass Studio
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-400">
                  <Zap className="h-3 w-3 fill-indigo-400" />
                  <span>5 Tool Kit Aktif</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Edu Perk • Cookies Injector • BIN Trial Checksum • Family Plan • Promo Hub
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
        {/* 2. CATEGORY TABS (Touch-Friendly Horizontal Scroll, Clean Layout)         */}
        {/* ========================================================================= */}
        <div className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'edu', label: '🎓 1. Edu & KTM Perk', desc: 'Canva Edu & GitHub' },
              { id: 'cookie', label: '🍪 2. Streaming Cookies', desc: 'Netflix & Spotify' },
              { id: 'bin', label: '💳 3. BIN Luhn Trial', desc: 'Card Checksum' },
              { id: 'family', label: '👨‍👩‍👧‍👦 4. Family Slot Plan', desc: 'Address Matcher' },
              { id: 'promo', label: '🎁 5. Promo Claim Hub', desc: 'Nitro & Apple' },
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
        {/* 3. MAIN TAB BODY CONTENT (Clean, Well Spaced, Card-Based)                 */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6 pb-20">
          
          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: 🎓 EDU MAIL & KTM VIRTUAL GENERATOR                              */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'edu' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Intro Banner */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Generator Kartu Tanda Mahasiswa (KTM) &amp; Email Kampus (.ac.id / .edu)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Digunakan untuk verifikasi upload foto kartu pelajar di <b>Canva Edu Lifetime</b>, <b>GitHub Student Pack</b>, <b>Notion AI Student</b>, dan <b>JetBrains</b>.
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
                        const u = EDU_UNIVERSITIES.find((x) => x.name === e.target.value);
                        if (u) setSelectedUniv(u);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {EDU_UNIVERSITIES.map((u) => (
                        <option key={u.name} value={u.name}>
                          {u.name} (@{u.domain})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Nama Mahasiswa:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const r = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
                          setStudentName(r);
                        }}
                        className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 text-xs font-bold border border-slate-700"
                      >
                        Acak
                      </button>
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

                  {/* Generated Email Box */}
                  <div className="pt-2">
                    <label className="text-[11px] text-slate-400 mb-1 block">Email Mahasiswa Ter-generate:</label>
                    <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-indigo-500/40 p-2.5 text-xs font-mono text-indigo-300">
                      <span className="truncate">{eduEmail}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(eduEmail, 'edu_email')}
                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg ml-2 shrink-0 flex items-center gap-1"
                      >
                        {copiedKey === 'edu_email' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'edu_email' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live KTM Card Preview & Download */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">🖼️ Live Preview Kartu Mahasiswa (KTM):</span>
                    <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                      Siap Diupload
                    </span>
                  </div>

                  <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950">
                    <canvas ref={ktmCanvasRef} className="w-full h-auto object-contain" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadKTM}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 px-4 text-xs font-bold text-white shadow-lg hover:from-indigo-500 hover:to-pink-500 active:scale-95 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>📥 UNDUH KARTU KTM (FORMAT PNG HD)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: 🍪 STREAMING COOKIES INJECTOR & NETSCAPE CONVERTER               */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'cookie' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 flex items-start gap-3">
                <Cookie className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Database Cookie Login 1-Klik (Format JSON &amp; Netscape)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Gunakan ekstensi browser <b>Cookie-Editor</b> (Chrome / Kiwi Browser Android) &gt; Klik <b>Import</b> &gt; Paste JSON cookie di bawah ini untuk langsung login otomatis tanpa password!
                  </p>
                </div>
              </div>

              {/* Grid of Streaming Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {STREAMING_COOKIES_LIST.map((ck) => (
                  <div
                    key={ck.id}
                    className={`rounded-2xl border ${ck.border} bg-slate-900/80 p-4 space-y-3 shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${ck.color} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                          {ck.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{ck.name}</div>
                          <div className="text-[10px] text-slate-400">{ck.category}</div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>{ck.health}% Online</span>
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-[10px] text-slate-400 overflow-hidden line-clamp-2">
                      {ck.sampleJson}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ck.sampleJson, `ck_${ck.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 px-3 text-xs font-bold text-white border border-slate-700 active:scale-95 transition-all"
                      >
                        {copiedKey === `ck_${ck.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === `ck_${ck.id}` ? 'Cookie Tersalin!' : '📋 Salin JSON Cookie'}</span>
                      </button>

                      <a
                        href={ck.guideUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 p-2.5 text-xs text-slate-300 border border-slate-700"
                        title="Buka Website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
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
          {/* TAB 4: 👨‍👩‍👧‍👦 SPOTIFY & YOUTUBE FAMILY SLOT & ADDRESS MATCHER              */}
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

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: 🎁 PROMO LINK & VOUCHER CLAIMER HUB                              */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'promo' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-start gap-3">
                <Gift className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Pusat Promo &amp; Voucher Klaim Resmi yang Sedang Aktif</div>
                  <p className="text-slate-400 leading-relaxed">
                    Koleksi promo 3-bulan gratis dari platform partner resmi (Epic Games, Apple, Xbox). Gunakan email temporary kita untuk klaim langsung!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PROMO_LINKS.map((pr, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                        {pr.tag}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {pr.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">{pr.title}</div>
                      <div className="text-[11px] text-slate-300 mt-1">✨ {pr.benefit}</div>
                      <div className="text-[10px] text-slate-400 mt-1">📌 Syarat: {pr.req}</div>
                    </div>

                    <a
                      href={pr.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Link Klaim Promo</span>
                    </a>
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
