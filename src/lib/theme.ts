export type AppTheme = 'midnight' | 'tokyonight' | 'emerald' | 'nordic' | 'nord';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  badge: string;
  icon: string;
  description: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  accentSecondaryHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    badge: '🌑 OLED Black & Cyan',
    icon: '🌑',
    description: 'Hitam pekat OLED dengan aksen cyan neon futuristik yang hemat baterai & anti-silau.',
    bgHex: '#080b11',
    cardHex: '#0f1523',
    accentHex: '#06b6d4',
    accentSecondaryHex: '#38bdf8',
  },
  {
    id: 'tokyonight',
    name: 'Tokyo Cyberpunk',
    badge: '🌌 Deep Navy & Rose',
    icon: '🌌',
    description: 'Deep navy indigo dengan aksen cyan sky dan soft purple neon yang estetik.',
    bgHex: '#16161e',
    cardHex: '#1a1b26',
    accentHex: '#7aa2f7',
    accentSecondaryHex: '#f43f5e',
  },
  {
    id: 'emerald',
    name: 'Emerald Velvet',
    badge: '🌲 Forest Pine & Mint',
    icon: '🌲',
    description: 'Warna hijau hutan pinus & mint yang secara ilmiah menenangkan saraf mata saat bekerja lama.',
    bgHex: '#091512',
    cardHex: '#11221d',
    accentHex: '#10b981',
    accentSecondaryHex: '#34d399',
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    badge: '☕ Charcoal & Amber',
    icon: '☕',
    description: 'Matte graphite abu-abu arang dengan aksen amber emas yang hangat & minimalis.',
    bgHex: '#181a1f',
    cardHex: '#22262e',
    accentHex: '#f59e0b',
    accentSecondaryHex: '#fbbf24',
  },
  {
    id: 'nord',
    name: 'Nord Frost',
    badge: '❄️ Polar Ice Calm',
    icon: '❄️',
    description: 'Palet kutub es dengan kontras sangat lembut, bebas radiasi mata untuk waktu lama.',
    bgHex: '#242933',
    cardHex: '#2e3440',
    accentHex: '#88c0d0',
    accentSecondaryHex: '#81a1c1',
  },
];

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('tempmail_theme', theme);
}

export function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'midnight';
  const saved = localStorage.getItem('tempmail_theme') as AppTheme;
  if (saved && ['midnight', 'tokyonight', 'emerald', 'nordic', 'nord'].includes(saved)) {
    return saved;
  }
  return 'midnight';
}
