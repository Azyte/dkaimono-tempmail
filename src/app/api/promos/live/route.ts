import { NextRequest, NextResponse } from 'next/server';

export interface LivePromoItem {
  id: string;
  title: string;
  category: string;
  platform: string;
  benefit: string;
  duration: string;
  badge: string;
  badgeColor: string;
  color: string;
  officialUrl: string;
  alternateUrl?: string;
  requirements: string;
  vpnRequired: string;
  verifiedAt: string;
  status: 'active' | 'limited' | 'exclusive';
  successRate: number;
  guideSteps: string[];
  recommendedMethod: 'tempmail' | 'edu_ktm' | 'bin_card' | 'direct_redeem' | 'alight_engine';
}

const LIVE_PROMOS_DATABASE: LivePromoItem[] = [
  {
    id: 'spotify_3m',
    title: 'Spotify Premium 3-Bulan Trial Gratis',
    category: 'Music & Podcasts',
    platform: 'Spotify',
    benefit: 'Bebas iklan, download offline, skip tanpa batas, dan audio high quality 320kbps',
    duration: '3 Bulan (90 Hari)',
    badge: 'TRIAL 100% AKTIF',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    color: 'from-emerald-600 to-teal-800',
    officialUrl: 'https://www.spotify.com/id-id/premium/',
    alternateUrl: 'https://www.spotify.com/us/purchase/offer/trial-3m/',
    requirements: 'Akun baru Spotify (gunakan TempMail kami) & kartu uji coba BIN dari Tab 3',
    vpnRequired: 'Indonesia 🇮🇩 atau United States 🇺🇸 (sesuai URL)',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 98,
    recommendedMethod: 'tempmail',
    guideSteps: [
      'Salin alamat email sementara dari kotak TempMail kami.',
      'Klik tombol "Buka Halaman Klaim" untuk menuju halaman promo Spotify.',
      'Daftar akun Spotify baru dengan email temporary tersebut.',
      'Pilih paket Individual Trial 3 Bulan.',
      'Gunakan kartu uji coba valid dari Tab 3 (BIN Luhn Generator) untuk verifikasi $0.',
      'Selesai! Akun Spotify Premium langsung aktif selama 3 bulan penuh.',
    ],
  },
  {
    id: 'apple_music_3m',
    title: 'Apple Music 3-Bulan Full Lossless & Dolby Atmos',
    category: 'Master Audio Stream',
    platform: 'Apple',
    benefit: 'Akses 100 juta lagu resolusi tinggi Lossless 24-bit/192kHz & Spatial Audio Dolby Atmos',
    duration: '3 Bulan (Gratis $0)',
    badge: 'PROMO RESMI ACTIVE',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    color: 'from-rose-600 to-pink-800',
    officialUrl: 'https://www.bestbuy.com/site/apple-free-apple-music-for-up-to-3-months-new-or-returning-subscribers-only/6562010.p',
    alternateUrl: 'https://www.apple.com/id/apple-music/',
    requirements: 'Apple ID baru atau belum pernah berlangganan dalam 12 bulan terakhir',
    vpnRequired: 'Bebas / United States 🇺🇸 untuk BestBuy',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 96,
    recommendedMethod: 'direct_redeem',
    guideSteps: [
      'Buka link promo resmi BestBuy / Apple Music.',
      'Klik "Add to Cart" dengan harga $0 (Gratis) lalu checkout dengan email kamu.',
      'Buka email untuk mendapatkan kode redeem unik 16-digit.',
      'Buka aplikasi Apple Music atau web player, lalu klik "Redeem Gift Card / Code".',
      'Masukkan kode dan akun Apple Music 3 bulan langsung aktif tanpa biaya!',
    ],
  },
  {
    id: 'canva_edu_lifetime',
    title: 'Canva for Education Lifetime Free (Semua Fitur Canva Pro)',
    category: 'Design & Graphic AI',
    platform: 'Canva',
    benefit: '100+ Juta stok foto/video, Magic AI Resize, Brand Kit, Hapus Background 1-Klik, Unduh PNG Transparan HD',
    duration: 'Lifetime (Seumur Hidup)',
    badge: 'LIFETIME 100% FREE',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    color: 'from-cyan-600 to-blue-800',
    officialUrl: 'https://www.canva.com/education/',
    alternateUrl: 'https://www.canva.com/pro/',
    requirements: 'Email .edu / .ac.id dan foto kartu KTM (tersedia di Tab 2 Edu KTM Generator)',
    vpnRequired: 'Bebas 🌐 (Direct Connection)',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'exclusive',
    successRate: 99,
    recommendedMethod: 'edu_ktm',
    guideSteps: [
      'Buka Tab "2. Edu & KTM Perk" di modal ini.',
      'Klik "Unduh Kartu KTM (Format PNG HD)" untuk mendownload kartu pelajar terverifikasi.',
      'Salin email virtual kampus (.ac.id / .edu) yang sudah dibuat otomatis.',
      'Buka link resmi Canva for Education di atas.',
      'Daftar akun baru dan upload file kartu KTM yang baru kamu unduh saat verifikasi status.',
      'Akun Canva kamu langsung ter-upgrade ke versi Pro Edukasi seumur hidup!',
    ],
  },
  {
    id: 'notion_ai_plus',
    title: 'Notion Plus + Unlimited AI Q&A (Student Program)',
    category: 'Productivity & AI',
    platform: 'Notion',
    benefit: 'Unlimited AI responses, upload file tanpa batas ukuran, riwayat halaman 30 hari, dan workspace kolaborasi',
    duration: 'Gratis Selamanya ($120/Tahun Value)',
    badge: 'LIFETIME VERIFIED',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    color: 'from-stone-700 to-stone-900',
    officialUrl: 'https://www.notion.so/product/education',
    alternateUrl: 'https://www.notion.so/signup',
    requirements: 'Gunakan email .ac.id atau .edu yang dibuat di Tab 2 Edu Perk',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 100,
    recommendedMethod: 'edu_ktm',
    guideSteps: [
      'Generate email .edu / .ac.id di Tab 2 Edu Perk.',
      'Buka link resmi Notion for Education di atas.',
      'Daftar akun baru menggunakan email kampus tersebut.',
      'Masuk ke Settings & Members ➔ Upgrade ➔ Klik "Get Free Education Plan".',
      'Notion Plus langsung aktif 100% gratis selamanya!',
    ],
  },
  {
    id: 'github_student_pack',
    title: 'GitHub Student Developer Pack ($200,000+ Tools Gratis)',
    category: 'Developer & Cloud Tools',
    platform: 'GitHub',
    benefit: 'Free Domain (.me / .tech), Free JetBrains All Products, Azure Cloud $100, DigitalOcean $200, Canva Pro, Termius Pro',
    duration: '2-4 Tahun (Selama Masa Kuliah)',
    badge: '$200K VALUE FREE',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    color: 'from-purple-700 to-indigo-900',
    officialUrl: 'https://education.github.com/pack',
    alternateUrl: 'https://education.github.com/discount_requests/application',
    requirements: 'Akun GitHub + Email .ac.id/.edu + Foto KTM dari Tab 2',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'exclusive',
    successRate: 95,
    recommendedMethod: 'edu_ktm',
    guideSteps: [
      'Buka Tab 2 Edu Perk dan unduh kartu KTM HD kamu.',
      'Buka halaman aplikasi GitHub Student Developer Pack di atas.',
      'Login ke akun GitHub kamu, lalu tambahkan email kampus (.ac.id) di profil email.',
      'Pilih metode "School ID Card" dan upload foto KTM PNG yang telah diunduh.',
      'Tunggu persetujuan otomatis (1-24 jam) untuk klaim puluhan tools dev senilai $200,000+!',
    ],
  },
  {
    id: 'jetbrains_all_products',
    title: 'JetBrains All Products Pack (IntelliJ, PyCharm, WebStorm Pro)',
    category: 'Developer IDEs',
    platform: 'JetBrains',
    benefit: 'Lisensi IDE Profesional: IntelliJ IDEA Ultimate, PyCharm Pro, WebStorm, CLion, PhpStorm, GoLand, DataGrip ($649/thn)',
    duration: '1 Tahun (Bisa Diperpanjang Gratis)',
    badge: '$649/YR FREE LICENSE',
    badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    color: 'from-pink-600 to-rose-900',
    officialUrl: 'https://www.jetbrains.com/community/education/#students',
    requirements: 'Email kampus .ac.id / .edu dari Tab 2',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 99,
    recommendedMethod: 'edu_ktm',
    guideSteps: [
      'Buka link resmi pendaftaran JetBrains Education di atas.',
      'Pilih "Apply with University email address".',
      'Masukkan email .ac.id yang dibuat di Tab 2 Edu Perk.',
      'Klik link aktivasi di inbox email untuk membuat akun JetBrains.',
      'Lisensi All Products Pack langsung aktif dan bisa digunakan di aplikasi desktop!',
    ],
  },
  {
    id: 'microsoft_365_dev',
    title: 'Microsoft 365 E5 Developer Pack + 5TB OneDrive Cloud',
    category: 'Office & Cloud Storage',
    platform: 'Microsoft',
    benefit: 'Word, Excel, PowerPoint, 25 Lisensi Pengguna Microsoft 365, 5TB OneDrive Cloud Storage',
    duration: '90 Hari (Auto-Renewable Otomatis)',
    badge: 'AUTO-RENEW 5TB CLOUD',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    color: 'from-blue-600 to-indigo-900',
    officialUrl: 'https://developer.microsoft.com/microsoft-365/dev-program',
    requirements: 'Akun Microsoft (Outlook/Hotmail/TempMail) & verifikasi nomor HP dari menu Temp SMS kami',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'exclusive',
    successRate: 94,
    recommendedMethod: 'tempmail',
    guideSteps: [
      'Buka portal Microsoft 365 Developer di atas dan klik "Join now".',
      'Masuk menggunakan akun Microsoft kamu.',
      'Pilih negara "Indonesia" dan isi profil developer.',
      'Pilih "Instant Sandbox" untuk setup otomatis 25 akun admin dan 5TB OneDrive.',
      'Gunakan nomor virtual dari menu Temp SMS kami untuk verifikasi OTP.',
      'Setup selesai! Kamu memiliki domain admin @onmicrosoft.com dengan Office 365 Pro.',
    ],
  },
  {
    id: 'youtube_prem_trial',
    title: 'YouTube Premium & Music 1-3 Bulan Ad-Free',
    category: 'Video & Music Streaming',
    platform: 'YouTube',
    benefit: 'Nonton jutaan video tanpa iklan, putar audio di background layar mati, dan YouTube Music Premium',
    duration: '1-3 Bulan Gratis',
    badge: 'OFFICIAL TRIAL',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
    color: 'from-red-600 to-rose-950',
    officialUrl: 'https://www.youtube.com/premium',
    alternateUrl: 'https://www.youtube.com/musicpremium',
    requirements: 'Akun Google baru (belum pernah aktif YouTube Premium)',
    vpnRequired: 'Indonesia 🇮🇩 / United States 🇺🇸',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 97,
    recommendedMethod: 'tempmail',
    guideSteps: [
      'Buka link resmi YouTube Premium di atas pada browser Incognito.',
      'Pilih opsi "Coba 1 Bulan Gratis" atau "Paket Siswa/Keluarga".',
      'Masukkan metode pembayaran $0 menggunakan kartu BIN Luhn dari Tab 3.',
      'Konfirmasi pendaftaran, YouTube Premium langsung aktif tanpa iklan!',
    ],
  },
  {
    id: 'discord_nitro_official',
    title: 'Discord Nitro 1-3 Bulan Promo Partner',
    category: 'Chat & Gaming Streaming',
    platform: 'Discord',
    benefit: '2 Server Boosts, 500 Custom Emojis, Streaming HD 1080p 60fps, Upload File 500MB, Custom Banner',
    duration: '1-3 Bulan',
    badge: 'PARTNER CAMPAIGN',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    color: 'from-indigo-600 to-purple-900',
    officialUrl: 'https://discord.com/nitro',
    alternateUrl: 'https://www.xbox.com/xbox-game-pass',
    requirements: 'Akun Discord baru / belum pernah punya Nitro dalam 12 bulan terakhir',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 95,
    recommendedMethod: 'direct_redeem',
    guideSteps: [
      'Buka aplikasi Discord atau web browser di https://discord.com/app.',
      'Masuk ke menu User Settings (Ikon Gerigi) ➔ Nitro.',
      'Cek banner promo trial atau redeem link promo partner.',
      'Gunakan kartu uji coba valid untuk otorisasi klaim $0.',
      'Nitro langsung aktif dan server boost siap dibagikan!',
    ],
  },
  {
    id: 'amazon_prime_30d',
    title: 'Amazon Prime Video 30-Hari Trial + Twitch Prime',
    category: 'Video Streaming & Gaming',
    platform: 'Amazon',
    benefit: 'Nonton film 4K UHD Amazon Originals (The Boys, Fallout), Gratis game & loot Twitch Prime bulanan',
    duration: '30 Hari Full Access',
    badge: '30 DAYS TRIAL',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    color: 'from-sky-600 to-blue-900',
    officialUrl: 'https://www.amazon.com/amazonprime',
    alternateUrl: 'https://www.primevideo.com',
    requirements: 'Akun Amazon baru dibuat dengan TempMail kami & kartu BIN US dari Tab 3',
    vpnRequired: 'United States 🇺🇸 (Recommended)',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'active',
    successRate: 96,
    recommendedMethod: 'bin_card',
    guideSteps: [
      'Buat akun Amazon baru dengan email dari TempMail kami.',
      'Buka link promo Amazon Prime di atas.',
      'Pilih "Start your 30-day free trial".',
      'Masukkan data kartu dari Tab 3 (BIN Mastercard US / Zip 10001 New York).',
      'Konfirmasi trial $0, akses Prime Video & Twitch Prime langsung terbuka!',
    ],
  },
  {
    id: 'alight_motion_1y',
    title: 'Alight Motion 1-Tahun Premium Creator (Auto Server Engine)',
    category: 'Video VFX & Animation',
    platform: 'Alight Motion',
    benefit: 'No watermark, ekspor XML preset, semua efek visual & filter VFX VIP terbuka, 4K 60fps rendering',
    duration: '1 Tahun Penuh (365 Hari)',
    badge: '100% FULL AUTO AKTIF',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    color: 'from-purple-600 to-rose-700',
    officialUrl: 'https://alightmotion.com',
    requirements: 'Hanya perlu memasukkan nama alias email di menu generator TempMail kami',
    vpnRequired: 'Bebas 🌐',
    verifiedAt: 'Realtime Terverifikasi Aktif',
    status: 'exclusive',
    successRate: 100,
    recommendedMethod: 'alight_engine',
    guideSteps: [
      'Masuk ke menu Auto Premium Creator di dashboard TempMail kami.',
      'Pilih engine Alight Motion 1 Tahun dan klik Generate.',
      'Buka kotak masuk TempMail kamu untuk melihat email aktivasi Magic Link.',
      'Buka Magic Link di HP kamu, aplikasi Alight Motion langsung aktif menjadi Premium 1 Tahun!',
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const search = req.nextUrl.searchParams.get('q')?.toLowerCase();

    let results = [...LIVE_PROMOS_DATABASE];

    if (category && category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.platform.toLowerCase().includes(search) ||
          p.benefit.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalPromos: results.length,
      promos: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal memuat promo' }, { status: 500 });
  }
}
