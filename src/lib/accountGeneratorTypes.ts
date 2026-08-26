export type ServiceType = 'alight_motion' | 'canva_pro' | 'elevenlabs' | 'cursor_ai' | 'leonardo_ai' | 'custom';

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  icon: string;
  description: string;
  badge: string;
  defaultDuration: string;
  requiresInviteUrl?: boolean;
  mode: 'full_auto' | 'otp_assisted';
  signupUrl: string;
  loginUrl?: string;
  instructions: string;
}

export const SUPPORTED_SERVICES: Record<ServiceType, ServiceDefinition> = {
  alight_motion: {
    type: 'alight_motion',
    name: 'Alight Motion Premium',
    icon: '🎬',
    description: '1 Tahun Full Auto Magic Link + Bypass Order Instant (Server-side)',
    badge: '1 Tahun (Full Auto)',
    defaultDuration: '1 Tahun Premium (Aktif)',
    mode: 'full_auto',
    signupUrl: 'https://alightmotion.com',
    loginUrl: 'https://alightmotion.com',
    instructions: 'Akun langsung diaktivasi di server. Langsung masukkan email di aplikasi Alight Motion!',
  },
  cursor_ai: {
    type: 'cursor_ai',
    name: 'Cursor AI Pro',
    icon: '💻',
    description: '14 Hari Pro Trial AI Coding Assistant (Claude 3.5 & GPT-4o)',
    badge: '14 Hari Pro Trial',
    defaultDuration: '14 Hari Pro Trial',
    mode: 'otp_assisted',
    signupUrl: 'https://www.cursor.com/sign-up',
    loginUrl: 'https://www.cursor.com/login',
    instructions: '1. Salin email & password\n2. Buka link Sign-Up Cursor\n3. Masukkan kode OTP 6-digit yang otomatis masuk ke TempMail!',
  },
  elevenlabs: {
    type: 'elevenlabs',
    name: 'ElevenLabs AI Voice',
    icon: '🤖',
    description: '10.000 Karakter AI Voice Clone & Text-to-Speech per akun',
    badge: '10K Karakter Voice',
    defaultDuration: '10.000 Karakter (Free Tier)',
    mode: 'otp_assisted',
    signupUrl: 'https://elevenlabs.io/sign-up',
    loginUrl: 'https://elevenlabs.io/app/sign-in',
    instructions: '1. Salin email & password\n2. Daftar di web ElevenLabs\n3. Link aktivasi otomatis masuk ke kotak masuk TempMail kamu!',
  },
  canva_pro: {
    type: 'canva_pro',
    name: 'Canva Pro Team',
    icon: '🎨',
    description: 'Auto-join Ruang Tim Canva Pro + Email & Password siap login',
    badge: 'Pro Team Member',
    defaultDuration: 'Canva Pro Team (Aktif)',
    requiresInviteUrl: true,
    mode: 'otp_assisted',
    signupUrl: 'https://www.canva.com/signup',
    loginUrl: 'https://www.canva.com/login',
    instructions: '1. Masukkan link undangan tim Canva\n2. Buka link tim & daftar pakai email TempMail\n3. Akun langsung menjadi member Canva Pro!',
  },
  leonardo_ai: {
    type: 'leonardo_ai',
    name: 'Leonardo AI Image',
    icon: '✨',
    description: '150 Token Fast Generation AI Image per akun',
    badge: '150 Token/Hari',
    defaultDuration: '150 Token Daily',
    mode: 'otp_assisted',
    signupUrl: 'https://app.leonardo.ai/auth/signup',
    loginUrl: 'https://app.leonardo.ai/auth/login',
    instructions: '1. Salin email & password\n2. Buka link signup Leonardo\n3. Masukkan kode OTP yang otomatis masuk ke inbox!',
  },
  custom: {
    type: 'custom',
    name: 'Kustom / Layanan Lain',
    icon: '⚡',
    description: 'Generate Email + Password Otomatis + Pantau OTP Realtime',
    badge: 'Custom Pro Account',
    defaultDuration: 'Permanent Mailbox',
    mode: 'otp_assisted',
    signupUrl: '',
    instructions: 'Gunakan email dan password ini untuk mendaftar di situs/layanan pilihan Anda.',
  },
};
