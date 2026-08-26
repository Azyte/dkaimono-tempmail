export type ServiceType = 'alight_motion' | 'canva_pro' | 'elevenlabs' | 'cursor_ai' | 'leonardo_ai' | 'custom';

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  icon: string;
  description: string;
  badge: string;
  defaultDuration: string;
  requiresInviteUrl?: boolean;
}

export const SUPPORTED_SERVICES: Record<ServiceType, ServiceDefinition> = {
  alight_motion: {
    type: 'alight_motion',
    name: 'Alight Motion Premium',
    icon: '🎬',
    description: '1 Tahun Full Auto Magic Link + Bypass Order Instant',
    badge: '1 Tahun (Full Auto)',
    defaultDuration: '1 Tahun Premium (Aktif)',
  },
  canva_pro: {
    type: 'canva_pro',
    name: 'Canva Pro Team',
    icon: '🎨',
    description: 'Auto-join Ruang Tim Canva Pro + Email & Password siap login',
    badge: 'Pro Team Member',
    defaultDuration: 'Canva Pro Team (Aktif)',
    requiresInviteUrl: true,
  },
  elevenlabs: {
    type: 'elevenlabs',
    name: 'ElevenLabs AI Voice',
    icon: '🤖',
    description: '10.000 Karakter AI Voice Clone & Text-to-Speech per akun',
    badge: '10K Karakter Voice',
    defaultDuration: '10.000 Karakter (Free Tier)',
  },
  cursor_ai: {
    type: 'cursor_ai',
    name: 'Cursor AI Pro',
    icon: '💻',
    description: '14 Hari Pro Trial AI Coding Assistant (Claude 3.5 & GPT-4o)',
    badge: '14 Hari Pro Trial',
    defaultDuration: '14 Hari Pro Trial',
  },
  leonardo_ai: {
    type: 'leonardo_ai',
    name: 'Leonardo AI Image',
    icon: '✨',
    description: '150 Token Fast Generation AI Image per akun',
    badge: '150 Token/Hari',
    defaultDuration: '150 Token Daily',
  },
  custom: {
    type: 'custom',
    name: 'Kustom / Layanan Lain',
    icon: '⚡',
    description: 'Generate Email + Password Otomatis + Pantau OTP Realtime',
    badge: 'Custom Pro Account',
    defaultDuration: 'Permanent Mailbox',
  },
};
