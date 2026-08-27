export type AppTheme = 'tokyonight' | 'nord' | 'catppuccin' | 'matcha';

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
    id: 'tokyonight',
    name: 'Tokyo Night',
    badge: '🌌 Modern & Teduh',
    icon: '🌌',
    description: 'Deep navy indigo dengan aksen cyan sky dan soft purple yang elegan.',
    bgHex: '#16161e',
    cardHex: '#1a1b26',
    accentHex: '#7aa2f7',
    accentSecondaryHex: '#7dcfff',
  },
  {
    id: 'nord',
    name: 'Nord Frost',
    badge: '❄️ Paling Adem & Tenang',
    icon: '❄️',
    description: 'Palet kutub es dengan kontras sangat lembut, bebas silau untuk waktu lama.',
    bgHex: '#242933',
    cardHex: '#2e3440',
    accentHex: '#88c0d0',
    accentSecondaryHex: '#81a1c1',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    badge: '🌸 Pastel Aesthetic',
    icon: '🌸',
    description: 'Warna pastel mauve, lavender, dan mint yang hangat dan empuk di mata.',
    bgHex: '#181825',
    cardHex: '#1e1e2e',
    accentHex: '#cba6f7',
    accentSecondaryHex: '#a6e3a1',
  },
  {
    id: 'matcha',
    name: 'Forest Matcha',
    badge: '🍵 Nuansa Alam & Rileks',
    icon: '🍵',
    description: 'Spektrum hijau daun & sage yang secara ilmiah merilekskan otot mata.',
    bgHex: '#0e1513',
    cardHex: '#131d1a',
    accentHex: '#4ade80',
    accentSecondaryHex: '#2dd4bf',
  },
];

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('tempmail_theme', theme);
}

export function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'tokyonight';
  const saved = localStorage.getItem('tempmail_theme') as AppTheme;
  if (saved && ['tokyonight', 'nord', 'catppuccin', 'matcha'].includes(saved)) {
    return saved;
  }
  return 'tokyonight';
}
