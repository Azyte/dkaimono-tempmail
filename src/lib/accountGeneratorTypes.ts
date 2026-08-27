export type ServiceType =
  | 'alight_motion'
  | 'video_clipper'
  | 'warp_plus'
  | 'scribd_doc'
  | 'media_downloader'
  | 'flux_ai_image'
  | 'temp_sms'
  | 'outline_vpn'
  | 'proton_vpn'
  | 'gaming_ssh'
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
  | 'video_clip'
  | 'api_license'
  | 'doc_unlocker'
  | 'media_download'
  | 'image_generate'
  | 'virtual_sms'
  | 'vpn_access_key'
  | 'vpn_config'
  | 'ssh_account'
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
  video_clipper: {
    type: 'video_clipper',
    name: 'Viral Video Clipper & Monetizer',
    icon: '✂️',
    description: 'Auto Clip Video YouTube/TikTok/IG Jadi Shorts & Reels 9:16 + Script & Hook Monetisasi Siap Upload',
    badge: '⚡ 100% Siap Upload',
    defaultDuration: '9:16 HD 60fps (Aman Copyright)',
    authMethod: 'video_clip',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Upload ke YouTube Shorts, TikTok, & Reels. Lengkap dengan Hook, Judul Clickbait, Tag SEO, dan Anti-Copyright Filter.',
    stepByStep: [
      'Tempel link video YouTube, TikTok, atau Instagram di kolom input.',
      'Pilih format target (YouTube Shorts / TikTok FYP / IG Reels / Podcast Faceless / Affiliate).',
      'Klik tombol "📥 Unduh Video Siap Upload (MP4 9:16)" atau "🎵 Unduh Audio MP3".',
      'Salin paket teks viral (Judul + Deskripsi + Hashtag FYP + Pinned Comment Affiliate + Copyright Disclaimer).',
      'Upload ke channel/akun kamu dan mulai monetisasi Ads & Affiliate!',
    ],
  },
  scribd_doc: {
    type: 'scribd_doc',
    name: 'Scribd & SlideShare PDF Unlocker',
    icon: '📚',
    description: 'Download Dokumen / Skripsi / Ebook Scribd & SlideShare Full PDF Original Gratis',
    badge: '⚡ 100% Instant PDF',
    defaultDuration: 'Full Original PDF',
    authMethod: 'doc_unlocker',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Download. Unduh dokumen Scribd / SlideShare tanpa akun berbayar.',
    stepByStep: [
      'Klik tombol "📥 Unduh Dokumen PDF" yang muncul di hasil generate.',
      'File PDF lengkap dengan teks jernih dan gambar resolusi tinggi langsung tersimpan di perangkat Anda.',
      'Bebas unduh ribuan skripsi, jurnal ilmiah, ebook, dan presentasi bisnis!',
    ],
  },
  media_downloader: {
    type: 'media_downloader',
    name: 'TikTok & IG HD No-Watermark',
    icon: '📱',
    description: 'Download Video TikTok No-Watermark HD, Audio MP3, & Instagram Reels / Carousel',
    badge: '⚡ 100% Instant Media',
    defaultDuration: 'Full HD 1080p Original',
    authMethod: 'media_download',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Download. Unduh video tanpa watermark dan musik original jernih.',
    stepByStep: [
      'Salin link video TikTok atau Reels Instagram.',
      'Klik tombol "📥 Unduh Video HD" atau "🎵 Unduh Audio MP3" di bawah.',
      'Media langsung tersimpan di galeri HP atau folder download PC Anda tanpa watermark!',
    ],
  },
  flux_ai_image: {
    type: 'flux_ai_image',
    name: 'Flux.1 AI Image Generator',
    icon: '✨',
    description: 'Generate Gambar AI Realistis (Flux.1 Schnell & Midjourney Quality) Tanpa Batas',
    badge: '⚡ 100% Auto AI Image',
    defaultDuration: '1024x1024 HD Resolution',
    authMethod: 'image_generate',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Pakai. Gambar AI dihasilkan seketika menggunakan model Flux.1.',
    stepByStep: [
      'Klik tombol "🖼️ Buka / Download Gambar AI" di bawah.',
      'Gambar kualitas sinematik 8K langsung ditampilkan dan bisa disimpan ke galeri.',
      'Gunakan bebas royalti untuk foto profil, wallpaper, logo, dan konten media sosial!',
    ],
  },
  temp_sms: {
    type: 'temp_sms',
    name: 'Nomor HP Virtual / SMS OTP',
    icon: '📲',
    description: 'Terima SMS OTP Verifikasi (WhatsApp, Telegram, TikTok, Google, Shopee) Gratis',
    badge: '⚡ 100% Live SMS OTP',
    defaultDuration: 'Nomor Virtual Aktif',
    authMethod: 'virtual_sms',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Pakai. Salin nomor virtual dan buka link kotak masuk SMS.',
    stepByStep: [
      'Salin nomor HP virtual yang muncul (misal: US 🇺🇸, UK 🇬🇧, ID 🇮🇩, MY 🇲🇾).',
      'Masukkan nomor tersebut di aplikasi yang meminta verifikasi SMS / OTP.',
      'Klik tombol "📬 Buka Kotak Masuk SMS" untuk membaca kode verifikasi yang masuk!',
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
  outline_vpn: {
    type: 'outline_vpn',
    name: 'Outline VPN (Google / Jigsaw)',
    icon: '🛡️',
    description: 'Shadowsocks Access Key (`ss://...`) Anti-Blokir & Sensor (SG 🇸🇬, ID 🇮🇩, JP 🇯🇵, US 🇺🇸)',
    badge: '⚡ 100% Auto Key',
    defaultDuration: '30 Hari (Unlimited Bandwidth)',
    authMethod: 'vpn_access_key',
    is100PercentAuto: true,
    hasPassword: false,
    signupUrl: 'https://getoutline.org',
    instructions: '100% Siap Konek. Salin Access Key dan buka aplikasi Outline VPN.',
    stepByStep: [
      'Salin Access Key (`ss://...`) yang digenerate di bawah.',
      'Buka aplikasi Outline VPN di HP (Android/iOS) atau PC (Windows/Mac).',
      'Aplikasi Outline akan otomatis mendeteksi kunci dari clipboard ➔ Klik "Add Server" ➔ Klik "Connect"!',
    ],
  },
  proton_vpn: {
    type: 'proton_vpn',
    name: 'ProtonVPN (OpenVPN & WireGuard)',
    icon: '🔒',
    description: 'Config OpenVPN (.ovpn) & WireGuard (.conf) No-Logs Privacy (SG, NL, US, JP)',
    badge: '⚡ 100% Auto Config',
    defaultDuration: 'Unlimited Bandwidth (No Logs)',
    authMethod: 'vpn_config',
    is100PercentAuto: true,
    hasPassword: false,
    signupUrl: 'https://protonvpn.com',
    instructions: '100% Siap Pakai. Unduh file .ovpn atau .conf untuk langsung konek di aplikasi OpenVPN / WireGuard.',
    stepByStep: [
      'Unduh file config OpenVPN (.ovpn) atau WireGuard (.conf) yang tersedia.',
      'Buka aplikasi OpenVPN Connect atau WireGuard di perangkat Anda.',
      'Import file konfigurasi tersebut ➔ Masukkan kredensial otomatis yang tertera ➔ Terkoneksi!',
    ],
  },
  gaming_ssh: {
    type: 'gaming_ssh',
    name: 'Gaming SSH WebSocket VPN',
    icon: '🎮',
    description: 'Zero Lag SSH Tunneling & BadVPN UDPGW Port untuk Game Online (MLBB, FF, PUBG)',
    badge: '⚡ 100% Auto Gaming',
    defaultDuration: '30 Hari (High-Speed Gaming)',
    authMethod: 'ssh_account',
    is100PercentAuto: true,
    hasPassword: false,
    instructions: '100% Siap Pakai. Masukkan Host, Port, Username, dan Password ke HTTP Custom / HTTP Injector / NetMod.',
    stepByStep: [
      'Salin info Host, Port SSH/WS, Username, dan Password yang digenerate.',
      'Buka aplikasi HTTP Custom, NetMod Syna, atau HTTP Injector di Android/PC.',
      'Masukkan akun SSH tersebut ➔ Centang BadVPN UDPGW ➔ Konek untuk ping hijau stabil di game!',
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
