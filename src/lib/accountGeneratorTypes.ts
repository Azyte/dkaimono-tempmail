export type ServiceType =
  | 'alight_motion'
  | 'warp_plus'
  | 'nextdns_pro'
  | 'ai_tokens'
  | 'deezer_hifi'
  | 'proxy_nodes'
  | 'canva_pro'
  | 'elevenlabs'
  | 'cursor_ai'
  | 'leonardo_ai'
  | 'custom';

export type AuthMethod =
  | 'full_auto_server'
  | 'api_license'
  | 'dns_profile'
  | 'ai_api_key'
  | 'music_arl'
  | 'config_node'
  | 'magic_link'
  | 'otp'
  | 'verification_link'
  | 'team_invite'
  | 'password';

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  icon: string;
  description: string;
  badge: string;
  defaultDuration: string;
  authMethod: AuthMethod;
  is100PercentAuto: boolean;
  hasPassword: boolean;
  requiresInviteUrl?: boolean;
  signupUrl?: string;
  loginUrl?: string;
  instructions: string;
  stepByStep: string[];
}

export const SUPPORTED_SERVICES: Record<ServiceType, ServiceDefinition> = {
  alight_motion: {
    type: 'alight_motion',
    name: 'Alight Motion Premium',
    icon: '🎬',
    description: '1 Tahun Full Auto Server Magic Link + Bypass Order (100% Terima Jadi)',
    badge: '⚡ 100% Auto Server',
    defaultDuration: '1 Tahun Premium (Aktif)',
    authMethod: 'full_auto_server',
    is100PercentAuto: true,
    hasPassword: false,
    signupUrl: 'https://alightmotion.com',
    loginUrl: 'https://alightmotion.com',
    instructions: '100% Otomatis dari Server. Akun langsung berstatus 1 Tahun Premium.',
    stepByStep: [
      'Salin alamat Email Alight Motion di bawah.',
      'Buka aplikasi Alight Motion di HP ➔ Masuk ke menu Akun/Profil ➔ Pilih "Masuk dengan Email".',
      'Masukkan alamat email tersebut ➔ Buka kotak masuk TempMail di web / bot Telegram ini.',
      'Klik link verifikasi login yang masuk ➔ Aplikasi Alight Motion kamu langsung terbuka dengan status 1 Tahun Premium Aktif!',
    ],
  },
  warp_plus: {
    type: 'warp_plus',
    name: 'Cloudflare WARP+ / WireGuard VPN',
    icon: '🛡️',
    description: 'Unlimited Quota Fast Premium VPN License Key & WireGuard Config (.conf)',
    badge: '⚡ 100% Auto License',
    defaultDuration: 'Unlimited WARP+ High Speed',
    authMethod: 'api_license',
    is100PercentAuto: true,
    hasPassword: false,
    signupUrl: 'https://1.1.1.1',
    loginUrl: 'https://1.1.1.1',
    instructions: '100% Otomatis dibuat via Cloudflare REST API. Salin License Key atau Unduh config WireGuard.',
    stepByStep: [
      'Salin License Key yang dihasilkan di bawah ini.',
      'Buka aplikasi Cloudflare 1.1.1.1 di Android / iOS / PC ➔ Pengaturan ➔ Akun ➔ Masukkan Kunci Lisensi.',
      'ATAU: Unduh file config WireGuard (.conf) ➔ Import ke aplikasi WireGuard ➔ Langsung Konek VPN Cepat!',
    ],
  },
  nextdns_pro: {
    type: 'nextdns_pro',
    name: 'NextDNS Pro AdBlocker & Privacy',
    icon: '🌐',
    description: '300.000 Queries/bln Blokir 100% Iklan, Pop-up, Tracker, & Malware di Seluruh HP/PC',
    badge: '⚡ 100% Auto DNS',
    defaultDuration: '300K Queries / Bulan Pro',
    authMethod: 'dns_profile',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Otomatis dibuat. Salin hostname Private DNS untuk Android / iOS / Windows.',
    stepByStep: [
      'Salin Private DNS Hostname (misal: `dkxxxx.dns.nextdns.io`).',
      'Di Android: Masuk ke Pengaturan ➔ Jaringan & Internet ➔ Private DNS ➔ Masukkan Hostname tersebut.',
      'Di iOS / Windows: Buka DoH URL di browser untuk menginstal profil proteksi bebas iklan.',
      'Semua iklan di game, aplikasi, web, dan YouTube mobile otomatis lenyap!',
    ],
  },
  ai_tokens: {
    type: 'ai_tokens',
    name: 'AI Pro API Key (Llama 3.3 & DeepSeek)',
    icon: '🤖',
    description: 'Free Unlimited High-Speed AI API Key (Llama 3.3 70B, DeepSeek R1, Mixtral)',
    badge: '⚡ 100% Auto Key',
    defaultDuration: 'Unlimited High-Speed AI Tokens',
    authMethod: 'ai_api_key',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Pakai. Kompatibel dengan format OpenAI (NextChat, Chatbox, Cursor, Roo Code).',
    stepByStep: [
      'Salin API Key dan Base URL yang tertera.',
      'Buka aplikasi AI favorit Anda (Chatbox, NextChat, LibreChat, VS Code Cline/Roo, atau Cursor).',
      'Pilih model `llama-3.3-70b-versatile` atau `deepseek-r1-distill-llama-70b` ➔ Masukkan API Key ➔ Langsung Chat tanpa batas!',
    ],
  },
  deezer_hifi: {
    type: 'deezer_hifi',
    name: 'Deezer Premium Hi-Fi FLAC Token',
    icon: '🎵',
    description: 'Lossless FLAC 1411kbps & 320kbps MP3 Music Streamer / Downloader ARL Token',
    badge: '⚡ 100% Auto ARL',
    defaultDuration: '3 Bulan Hi-Fi Session',
    authMethod: 'music_arl',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Pakai. Masukkan ARL Token ke Freezer, Deezloader, atau Lucida.to untuk download musik FLAC.',
    stepByStep: [
      'Salin ARL Token yang digenerate di bawah.',
      'Buka aplikasi musik downloader (Freezer, Deemix, Deezloader, atau web Lucida.to).',
      'Masuk ke Pengaturan ➔ Tempel ARL Token pada kolom User Cookie.',
      'Download jutaan lagu berkualitas CD Master FLAC langsung tanpa DRM!',
    ],
  },
  proxy_nodes: {
    type: 'proxy_nodes',
    name: 'Hysteria 2 & V2Ray Fast Nodes',
    icon: '⚡',
    description: 'High-Speed UDP Proxy Nodes (SG 🇸🇬, ID 🇮🇩, JP 🇯🇵, US 🇺🇸)',
    badge: '⚡ 100% Siap Konek',
    defaultDuration: '30 Hari (Auto-Renew)',
    authMethod: 'config_node',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Konek. Salin URL Hysteria2 / VLESS / VMess dan import ke aplikasi proxy Anda.',
    stepByStep: [
      'Salin URL Hysteria2 / VLESS / VMess yang muncul di kartu hasil.',
      'Buka aplikasi v2rayNG / Nekobox / Clash / Shadowrocket / Hiddify di HP atau PC.',
      'Pilih "Import from Clipboard" ➔ Klik Konek ➔ Internet bebas blokir super kencang!',
    ],
  },
  canva_pro: {
    type: 'canva_pro',
    name: 'Canva Pro Team (Verified Pool)',
    icon: '🎨',
    description: 'Auto-join Ruang Tim Canva Pro + Email & Password siap pakai',
    badge: 'Pro Team Member',
    defaultDuration: 'Canva Pro Team (Aktif)',
    authMethod: 'team_invite',
    is100PercentAuto: false,
    hasPassword: true,
    requiresInviteUrl: false,
    signupUrl: 'https://www.canva.com/brand/join?token=e1f7c32',
    loginUrl: 'https://www.canva.com/login',
    instructions: 'Buka tautan tim Canva Pro yang kami sediakan, daftar dengan Email & Password TempMail untuk langsung join Pro.',
    stepByStep: [
      'Klik tombol "🎨 Buka Link Tim Canva".',
      'Pilih daftar dengan Email dan masukkan Password yang sudah digenerate.',
      'Akun kamu otomatis menjadi member Canva Pro dengan akses semua template premium!',
    ],
  },
  cursor_ai: {
    type: 'cursor_ai',
    name: 'Cursor AI Pro (OTP Helper)',
    icon: '💻',
    description: '14 Hari Pro Trial AI Coding Assistant (Claude 3.5 Sonnet & GPT-4o)',
    badge: '14 Hari Pro (OTP)',
    defaultDuration: '14 Hari Pro Trial',
    authMethod: 'otp',
    is100PercentAuto: false,
    hasPassword: true,
    signupUrl: 'https://www.cursor.com/sign-up',
    loginUrl: 'https://www.cursor.com/login',
    instructions: 'Daftar dengan Email & Password. Kode OTP 6-Digit otomatis tampil di banner TempMail & Telegram.',
    stepByStep: [
      'Salin Email dan Password yang sudah digenerate.',
      'Klik tombol "🚀 Buka Sign-Up Cursor" untuk membuka halaman pendaftaran resmi.',
      'Isi Nama, Email, dan Password ➔ Tekan Daftar.',
      'Kode OTP otomatis muncul di banner atas TempMail & Telegram ➔ Salin dan masukkan kode ke Cursor!',
    ],
  },
  elevenlabs: {
    type: 'elevenlabs',
    name: 'ElevenLabs AI Voice (Link Helper)',
    icon: '🤖',
    description: '10.000 Karakter AI Voice Clone & Text-to-Speech per akun',
    badge: '10K Voice (Link)',
    defaultDuration: '10.000 Karakter (Free Tier)',
    authMethod: 'verification_link',
    is100PercentAuto: false,
    hasPassword: true,
    signupUrl: 'https://elevenlabs.io/sign-up',
    loginUrl: 'https://elevenlabs.io/app/sign-in',
    instructions: 'Daftar di ElevenLabs dengan Email & Password. Link aktivasi otomatis masuk ke inbox TempMail.',
    stepByStep: [
      'Salin Email dan Password otomatis di bawah.',
      'Klik tombol "🚀 Buka Sign-Up ElevenLabs".',
      'Daftar dengan email dan password tersebut.',
      'Buka kotak masuk TempMail ➔ Klik tombol "Buka Tautan Verifikasi" ➔ Akun langsung aktif!',
    ],
  },
  leonardo_ai: {
    type: 'leonardo_ai',
    name: 'Leonardo AI Image (OTP Helper)',
    icon: '✨',
    description: '150 Token Fast Generation AI Image per akun',
    badge: '150 Token/Hari',
    defaultDuration: '150 Token Daily',
    authMethod: 'otp',
    is100PercentAuto: false,
    hasPassword: true,
    signupUrl: 'https://app.leonardo.ai/auth/signup',
    loginUrl: 'https://app.leonardo.ai/auth/login',
    instructions: 'Daftar di Leonardo AI menggunakan Email & Password. Masukkan kode OTP konfirmasi dari TempMail.',
    stepByStep: [
      'Salin Email dan Password.',
      'Klik tombol "🚀 Buka Sign-Up Leonardo" ➔ Daftar.',
      'Cek kode OTP yang masuk ke TempMail & masukkan ke formulir pendaftaran ➔ Selesai!',
    ],
  },
  custom: {
    type: 'custom',
    name: 'Kustom / Layanan Lain',
    icon: '⚡',
    description: 'Generate Email + Password Otomatis + Pantau OTP Realtime',
    badge: 'Custom Pro Account',
    defaultDuration: 'Permanent Mailbox',
    authMethod: 'password',
    is100PercentAuto: false,
    hasPassword: true,
    signupUrl: '',
    instructions: 'Gunakan email dan password ini untuk mendaftar di situs/layanan pilihan Anda.',
    stepByStep: [
      'Salin Email dan Password yang sudah digenerate.',
      'Gunakan pada halaman registrasi layanan tujuan Anda.',
      'Semua kode OTP dan link verifikasi akan otomatis tertangkap di TempMail & Telegram.',
    ],
  },
};
