export type ServiceType = 'alight_motion' | 'cursor_ai' | 'elevenlabs' | 'canva_pro' | 'leonardo_ai' | 'custom';

export type AuthMethod = 'magic_link' | 'otp' | 'verification_link' | 'team_invite' | 'password';

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  icon: string;
  description: string;
  badge: string;
  defaultDuration: string;
  authMethod: AuthMethod;
  hasPassword: boolean;
  requiresInviteUrl?: boolean;
  signupUrl: string;
  loginUrl?: string;
  instructions: string;
  stepByStep: string[];
}

export const SUPPORTED_SERVICES: Record<ServiceType, ServiceDefinition> = {
  alight_motion: {
    type: 'alight_motion',
    name: 'Alight Motion Premium',
    icon: '🎬',
    description: '1 Tahun Full Auto Server Magic Link + Bypass Order (Tanpa Password)',
    badge: '1 Tahun Full Auto',
    defaultDuration: '1 Tahun Premium (Aktif)',
    authMethod: 'magic_link',
    hasPassword: false,
    signupUrl: 'https://alightmotion.com',
    loginUrl: 'https://alightmotion.com',
    instructions: 'Alight Motion menggunakan login Magic Link (tanpa password). Akun sudah 100% aktif di server kami.',
    stepByStep: [
      'Salin alamat Email Alight Motion di bawah.',
      'Buka aplikasi Alight Motion di HP ➔ Masuk ke menu Akun/Profil ➔ Pilih "Masuk dengan Email".',
      'Masukkan alamat email tersebut ➔ Buka kotak masuk TempMail di web / bot Telegram ini.',
      'Klik link verifikasi login yang masuk ➔ Aplikasi Alight Motion kamu langsung terbuka dengan status 1 Tahun Premium Aktif!',
    ],
  },
  cursor_ai: {
    type: 'cursor_ai',
    name: 'Cursor AI Pro',
    icon: '💻',
    description: '14 Hari Pro Trial AI Coding Assistant (Claude 3.5 Sonnet & GPT-4o)',
    badge: '14 Hari Pro Trial',
    defaultDuration: '14 Hari Pro Trial',
    authMethod: 'otp',
    hasPassword: true,
    signupUrl: 'https://www.cursor.com/sign-up',
    loginUrl: 'https://www.cursor.com/login',
    instructions: 'Daftar dengan Email & Password yang digenerate. Kode OTP 6-Digit otomatis tampil di TempMail & Telegram.',
    stepByStep: [
      'Salin Email dan Password yang sudah digenerate.',
      'Klik tombol "🚀 Buka Sign-Up Cursor" untuk membuka halaman pendaftaran resmi.',
      'Isi Nama Depan, Nama Belakang, Email, dan Password ➔ Tekan Daftar.',
      'Cursor akan mengirim 6-digit kode OTP ke TempMail.',
      'Kode OTP otomatis muncul di banner atas TempMail & Telegram ➔ Salin dan masukkan kode ke Cursor ➔ Akun Pro 14 Hari langsung aktif!',
    ],
  },
  elevenlabs: {
    type: 'elevenlabs',
    name: 'ElevenLabs AI Voice',
    icon: '🤖',
    description: '10.000 Karakter AI Voice Clone & Text-to-Speech per akun',
    badge: '10K Karakter Voice',
    defaultDuration: '10.000 Karakter (Free Tier)',
    authMethod: 'verification_link',
    hasPassword: true,
    signupUrl: 'https://elevenlabs.io/sign-up',
    loginUrl: 'https://elevenlabs.io/app/sign-in',
    instructions: 'Daftar di ElevenLabs dengan Email & Password. Link aktivasi otomatis masuk ke inbox TempMail.',
    stepByStep: [
      'Salin Email dan Password otomatis di bawah.',
      'Klik tombol "🚀 Buka Sign-Up ElevenLabs".',
      'Daftar dengan email dan password tersebut.',
      'Buka kotak masuk TempMail di web atau Telegram kamu ➔ Klik tombol "Buka Tautan Verifikasi".',
      'Akun ElevenLabs langsung aktif dengan 10.000 kuota karakter voice gratis!',
    ],
  },
  canva_pro: {
    type: 'canva_pro',
    name: 'Canva Pro Team',
    icon: '🎨',
    description: 'Auto-join Ruang Tim Canva Pro + Email & Password siap login',
    badge: 'Pro Team Member',
    defaultDuration: 'Canva Pro Team (Aktif)',
    authMethod: 'team_invite',
    hasPassword: true,
    requiresInviteUrl: true,
    signupUrl: 'https://www.canva.com/signup',
    loginUrl: 'https://www.canva.com/login',
    instructions: 'Masukkan link undangan tim Canva, lalu daftar dengan Email & Password TempMail untuk langsung join Pro.',
    stepByStep: [
      'Masukkan link undangan tim Canva Pro (jika ada).',
      'Buka tautan tim Canva tersebut di browser.',
      'Pilih daftar dengan Email dan masukkan Password yang sudah digenerate.',
      'Akun kamu otomatis menjadi member Canva Pro dengan akses semua template premium!',
    ],
  },
  leonardo_ai: {
    type: 'leonardo_ai',
    name: 'Leonardo AI Image',
    icon: '✨',
    description: '150 Token Fast Generation AI Image per akun',
    badge: '150 Token/Hari',
    defaultDuration: '150 Token Daily',
    authMethod: 'otp',
    hasPassword: true,
    signupUrl: 'https://app.leonardo.ai/auth/signup',
    loginUrl: 'https://app.leonardo.ai/auth/login',
    instructions: 'Daftar di Leonardo AI menggunakan Email & Password. Masukkan kode OTP konfirmasi dari TempMail.',
    stepByStep: [
      'Salin Email dan Password.',
      'Klik tombol "🚀 Buka Sign-Up Leonardo".',
      'Daftar dengan email dan password.',
      'Cek kode OTP yang masuk ke TempMail & masukkan ke formulir pendaftaran.',
      'Akun langsung aktif dengan 150 token AI image gratis per hari!',
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
