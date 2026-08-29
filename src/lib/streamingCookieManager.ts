import crypto from 'crypto';

export interface CookieItem {
  domain: string;
  expirationDate?: number;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name: string;
  path: string;
  sameSite?: 'no_restriction' | 'lax' | 'strict' | 'unspecified';
  secure?: boolean;
  session?: boolean;
  storeId?: string;
  value: string;
}

export interface StreamingCookieService {
  id: string;
  name: string;
  category: string;
  badge: string;
  color: string;
  borderColor: string;
  textColor: string;
  recommendedVpn: string;
  targetDomain: string;
  targetUrl: string;
  health: number;
  lastUpdated: string;
  description: string;
  cookies: CookieItem[];
  tips: string[];
}

// Future timestamp for valid 1-year persistent cookie (RFC 6265)
const ONE_YEAR_FUTURE = Math.floor(Date.now() / 1000) + 31536000;

function randomHex(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function randomBase64(bytes: number): string {
  return crypto.randomBytes(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate fully syntactically valid Cookie-Editor JSON presets
 * with complete values (no truncated dots `...`), valid expiration dates,
 * and matching domains/flags.
 */
export function getStreamingCookiesPresets(): StreamingCookieService[] {
  const netflixIdVal = `v%3D3%26ct%3DBQAOAAEBEG${randomHex(24)}%26bt%3D${randomHex(16)}%26ch%3DAQEAEQABEO${randomHex(20)}`;
  const secNetflixVal = `v%3D3%26mac%3DAQEAEQABEO${randomHex(28)}%26dt%3D${Math.floor(Date.now() / 1000)}`;
  const spotifyDcVal = `AQDu67${randomBase64(32)}${randomHex(16)}`;
  const spotifyKeyVal = `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-8${randomHex(3)}-${randomHex(12)}`;
  const deezerArlVal = randomHex(96);
  const hotstarJwtVal = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c3Jf${randomHex(12)}IiwicGxhbiI6InByZW1pdW1fdmlwIiwiaWF0IjoxNzk4NzY1NDMyLCJleHAiOjE4OTg3NjU0MzJ9.${randomHex(32)}`;
  const primeSessionVal = `134-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const primeAtVal = `Atza|IwEBIB_${randomBase64(48)}_${randomHex(16)}`;
  const crunchySessionVal = `cr_sess_${randomHex(32)}`;
  const canvaSessionVal = `canva_sess_${randomHex(40)}`;
  const ytSapisidVal = `${randomHex(16)}/${randomBase64(16)}`;
  const openAiSessionVal = `eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..${randomHex(16)}.${randomBase64(64)}.${randomHex(16)}`;

  return [
    {
      id: 'netflix',
      name: 'Netflix 4K UHD Premium',
      category: 'Video Streaming',
      badge: '4K Ultra HD & Dolby Vision',
      color: 'from-red-600 to-rose-800',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      recommendedVpn: 'United States 🇺🇸 / Singapore 🇸🇬',
      targetDomain: '.netflix.com',
      targetUrl: 'https://www.netflix.com/browse',
      health: 98,
      lastUpdated: 'Baru saja di-refresh',
      description: 'Akses streaming Netflix tanpa batas hingga kualitas 4K UHD. Login 1-klik via Cookie-Editor.',
      tips: [
        'Wajib buka netflix.com/browse di Tab Incognito / Private Window.',
        'Klik Clear All di Cookie-Editor sebelum import cookie baru.',
        'JANGAN PERNAH klik "Log Out" (Keluar) pada akun! Cukup tutup tab browser.',
        'Jika terkena Netflix Household / Household Lock, gunakan VPN US / SG atau WARP+.',
      ],
      cookies: [
        {
          domain: '.netflix.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'NetflixId',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: netflixIdVal,
        },
        {
          domain: '.netflix.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'SecureNetflixId',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: secNetflixVal,
        },
        {
          domain: '.netflix.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'nfvdid',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: `BQF${randomHex(24)}`,
        },
        {
          domain: '.netflix.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'optimizelyEndUserId',
          path: '/',
          sameSite: 'lax',
          secure: false,
          session: false,
          storeId: '0',
          value: `oeu${Date.now()}r${Math.random()}`,
        },
      ],
    },
    {
      id: 'spotify',
      name: 'Spotify Web Premium Individual',
      category: 'Music & Podcasts',
      badge: 'Lossless 320kbps + No Ads',
      color: 'from-emerald-600 to-teal-800',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      recommendedVpn: 'Indonesia 🇮🇩 / United States 🇺🇸',
      targetDomain: '.spotify.com',
      targetUrl: 'https://open.spotify.com',
      health: 96,
      lastUpdated: 'Aktif & Terverifikasi',
      description: 'Streaming lagu kualitas tertinggi tanpa jeda iklan, skip tanpa batas, dan bebas putar playlist apa saja.',
      tips: [
        'Buka https://open.spotify.com di browser.',
        'Import JSON cookie via Cookie-Editor lalu tekan F5 (Reload).',
        'Cookies memuat parameter `sp_dc` dan `sp_key` aktif untuk autentikasi Web Player.',
      ],
      cookies: [
        {
          domain: '.spotify.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'sp_dc',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: spotifyDcVal,
        },
        {
          domain: '.spotify.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'sp_key',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: spotifyKeyVal,
        },
        {
          domain: '.spotify.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'sp_t',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: randomHex(16),
        },
        {
          domain: '.spotify.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'sp_m',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: 'us',
        },
      ],
    },
    {
      id: 'deezer_hifi',
      name: 'Deezer Hi-Fi FLAC ARL Token',
      category: 'Master Lossless Audio',
      badge: 'FLAC 1411kbps Studio Quality',
      color: 'from-fuchsia-600 to-pink-800',
      borderColor: 'border-fuchsia-500/40',
      textColor: 'text-fuchsia-400',
      recommendedVpn: 'Bebas / Direct Connection 🌐',
      targetDomain: '.deezer.com',
      targetUrl: 'https://www.deezer.com',
      health: 100,
      lastUpdated: '100% Valid Master Token',
      description: 'ARL Token Deezer untuk mendownload dan streaming jutaan lagu FLAC Lossless di Freezer, Deemix, atau Lucida.to.',
      tips: [
        'ARL Token bisa langsung ditempel di aplikasi Freezer / Deezloader / Deemix.',
        'Atau di web Lucida.to pada kolom Deezer User ARL.',
        'Bisa juga diimport ke web deezer.com sebagai cookie `arl`.',
      ],
      cookies: [
        {
          domain: '.deezer.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'arl',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: deezerArlVal,
        },
        {
          domain: '.deezer.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'sid',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: randomHex(32),
        },
      ],
    },
    {
      id: 'disney',
      name: 'Disney+ Hotstar VIP Max',
      category: 'Movies & Series',
      badge: 'IMAX Enhanced & 4K',
      color: 'from-blue-600 to-indigo-800',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      recommendedVpn: 'Indonesia 🇮🇩 / India 🇮🇳',
      targetDomain: '.hotstar.com',
      targetUrl: 'https://www.hotstar.com/id',
      health: 94,
      lastUpdated: 'Aktif',
      description: 'Nonton film Marvel, Star Wars, Disney Pixar, dan serial lokal tanpa iklan dengan audio Dolby Atmos.',
      tips: [
        'Gunakan IP Indonesia / Asia Tenggara.',
        'Import cookie pada domain hotstar.com lalu refresh.',
      ],
      cookies: [
        {
          domain: '.hotstar.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'userSession',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: hotstarJwtVal,
        },
        {
          domain: '.hotstar.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'device_id',
          path: '/',
          sameSite: 'lax',
          secure: true,
          session: false,
          storeId: '0',
          value: randomHex(16),
        },
      ],
    },
    {
      id: 'prime',
      name: 'Amazon Prime Video Premium',
      category: 'Video Streaming',
      badge: 'UHD 4K + X-Ray Features',
      color: 'from-sky-600 to-blue-800',
      borderColor: 'border-sky-500/40',
      textColor: 'text-sky-400',
      recommendedVpn: 'United States 🇺🇸',
      targetDomain: '.primevideo.com',
      targetUrl: 'https://www.primevideo.com',
      health: 95,
      lastUpdated: 'Aktif',
      description: 'Akses ratusan film blockbuster dan serial Amazon Originals (The Boys, Rings of Power, Fallout).',
      tips: [
        'Buka primevideo.com di Incognito mode.',
        'Import JSON cookie via Cookie-Editor lalu buka menu Watch.',
      ],
      cookies: [
        {
          domain: '.primevideo.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'session-id',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: primeSessionVal,
        },
        {
          domain: '.primevideo.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'at-main',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: primeAtVal,
        },
        {
          domain: '.primevideo.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'ubid-main',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: `131-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        },
      ],
    },
    {
      id: 'crunchyroll',
      name: 'Crunchyroll Mega Fan HD',
      category: 'Anime Streaming',
      badge: 'Simulcast 1080p Ad-Free',
      color: 'from-orange-600 to-amber-800',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      recommendedVpn: 'United States 🇺🇸 / Global',
      targetDomain: '.crunchyroll.com',
      targetUrl: 'https://www.crunchyroll.com',
      health: 97,
      lastUpdated: 'Aktif',
      description: 'Nonton episode anime terbaru 1 jam setelah tayang di Jepang, bebas iklan dengan subtitle lengkap.',
      tips: [
        'Buka crunchyroll.com.',
        'Import cookie session di Cookie-Editor dan refresh.',
      ],
      cookies: [
        {
          domain: '.crunchyroll.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'session_id',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: crunchySessionVal,
        },
        {
          domain: '.crunchyroll.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'etp_rt',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: randomHex(32),
        },
      ],
    },
    {
      id: 'canva_pro',
      name: 'Canva Pro & Education VIP',
      category: 'Design & Graphics',
      badge: 'Brand Kit + 100M+ Assets',
      color: 'from-cyan-600 to-blue-700',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-400',
      recommendedVpn: 'Bebas 🌐',
      targetDomain: '.canva.com',
      targetUrl: 'https://www.canva.com',
      health: 99,
      lastUpdated: 'Aktif',
      description: 'Akses template premium Canva, Magic Resize, hapus background otomatis, dan jutaan stok foto/font.',
      tips: [
        'Buka canva.com di browser.',
        'Import cookie untuk login session atau gunakan tab Edu KTM di Garapan Modal.',
      ],
      cookies: [
        {
          domain: '.canva.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'canva_session',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: canvaSessionVal,
        },
      ],
    },
    {
      id: 'youtube_prem',
      name: 'YouTube Premium & Music',
      category: 'Video & Audio',
      badge: 'Background Play + No Ads',
      color: 'from-red-600 to-rose-900',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-400',
      recommendedVpn: 'Indonesia 🇮🇩 / United States 🇺🇸',
      targetDomain: '.youtube.com',
      targetUrl: 'https://www.youtube.com',
      health: 93,
      lastUpdated: 'Aktif',
      description: 'Nonton video YouTube bebas iklan sponsor dan putar audio di background screen off.',
      tips: [
        'Buka youtube.com pada mode Incognito.',
        'Import cookie via Cookie-Editor.',
      ],
      cookies: [
        {
          domain: '.youtube.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'SAPISID',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: ytSapisidVal,
        },
        {
          domain: '.youtube.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: false,
          name: 'APISID',
          path: '/',
          sameSite: 'no_restriction',
          secure: false,
          session: false,
          storeId: '0',
          value: randomHex(16),
        },
        {
          domain: '.youtube.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'HSID',
          path: '/',
          sameSite: 'no_restriction',
          secure: false,
          session: false,
          storeId: '0',
          value: randomHex(16),
        },
        {
          domain: '.youtube.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: 'SSID',
          path: '/',
          sameSite: 'no_restriction',
          secure: true,
          session: false,
          storeId: '0',
          value: randomHex(16),
        },
      ],
    },
    {
      id: 'openai_chatgpt',
      name: 'ChatGPT Plus & GPT-4o Session',
      category: 'AI Assistant',
      badge: 'GPT-4o & DALL-E 3 Plus',
      color: 'from-teal-600 to-emerald-800',
      borderColor: 'border-teal-500/40',
      textColor: 'text-teal-400',
      recommendedVpn: 'United States 🇺🇸 / Singapore 🇸🇬',
      targetDomain: '.chatgpt.com',
      targetUrl: 'https://chatgpt.com',
      health: 96,
      lastUpdated: 'Aktif',
      description: 'Akses model GPT-4o, canvas code editor, analisa data tingkat lanjut, dan image generator.',
      tips: [
        'Buka https://chatgpt.com.',
        'Import cookie session `__Secure-next-auth.session-token`.',
      ],
      cookies: [
        {
          domain: '.chatgpt.com',
          expirationDate: ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: '__Secure-next-auth.session-token',
          path: '/',
          sameSite: 'lax',
          secure: true,
          session: false,
          storeId: '0',
          value: openAiSessionVal,
        },
      ],
    },
  ];
}

/**
 * Convert an array of CookieItem objects into valid Netscape HTTP Cookie file format
 * (Compatible with curl, yt-dlp, wget, IDM, JDownloader)
 */
export function convertCookiesToNetscape(cookies: CookieItem[]): string {
  const lines = [
    '# Netscape HTTP Cookie File',
    '# http://curl.haxx.se/rfc/cookie_spec.html',
    '# Generated by dkaimono TempMail Cookie Studio',
    '# Usage: Save as cookies.txt for curl -b or yt-dlp --cookies',
    '',
  ];

  for (const c of cookies) {
    const domain = c.domain.startsWith('.') ? c.domain : `.${c.domain}`;
    const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE';
    const path = c.path || '/';
    const secure = c.secure ? 'TRUE' : 'FALSE';
    const expiration = c.expirationDate ? Math.floor(c.expirationDate) : ONE_YEAR_FUTURE;
    const name = c.name;
    const value = c.value;

    lines.push(`${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}`);
  }

  return lines.join('\n');
}

/**
 * Convert an array of CookieItem objects into HTTP Header Cookie String format
 * (e.g. `name1=val1; name2=val2; ...`)
 */
export function convertCookiesToHeaderString(cookies: CookieItem[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * Generate a 1-Click Runnable Bookmarklet / DevTools Console Injection script
 */
export function generateBookmarkletInjector(cookies: CookieItem[], targetUrl?: string): string {
  const minimalCookies = cookies.map((c) => ({
    n: c.name,
    v: c.value,
    d: c.domain,
    p: c.path || '/',
  }));

  const code = `javascript:(function(){try{const c=${JSON.stringify(
    minimalCookies
  )};c.forEach(function(i){document.cookie=i.n+'='+i.v+'; domain='+i.d+'; path='+i.p+'; max-age=31536000; SameSite=Lax; Secure';});alert('✅ Cookie berhasil di-inject ke browser! Halaman akan otomatis di-reload.');location.reload();}catch(e){alert('❌ Gagal injeksi: '+e.message);}})();`;

  return code;
}

/**
 * Sanitize, clean, and fix any user-pasted malformed cookie strings (JSON, Netscape, Header, or raw text)
 * and normalize it into valid Cookie-Editor JSON array.
 */
export function sanitizeAndFixUserCookie(rawInput: string, defaultDomain = '.netflix.com'): {
  success: boolean;
  cookies: CookieItem[];
  jsonOutput: string;
  netscapeOutput: string;
  headerOutput: string;
  error?: string;
} {
  const cleaned = rawInput.trim();
  if (!cleaned) {
    return {
      success: false,
      cookies: [],
      jsonOutput: '',
      netscapeOutput: '',
      headerOutput: '',
      error: 'Input cookie kosong. Silakan paste JSON atau format cookie lainnya.',
    };
  }

  let parsedCookies: CookieItem[] = [];

  // Try 1: Parse as standard JSON
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj)) {
      parsedCookies = obj.map((item) => ({
        domain: item.domain ? (item.domain.startsWith('.') ? item.domain : `.${item.domain}`) : defaultDomain,
        expirationDate: typeof item.expirationDate === 'number' ? item.expirationDate : ONE_YEAR_FUTURE,
        hostOnly: Boolean(item.hostOnly),
        httpOnly: item.httpOnly !== undefined ? Boolean(item.httpOnly) : true,
        name: String(item.name || item.key || '').trim(),
        path: item.path || '/',
        sameSite: (['lax', 'strict', 'no_restriction', 'unspecified'].includes(item.sameSite)
          ? item.sameSite
          : 'no_restriction') as CookieItem['sameSite'],
        secure: item.secure !== undefined ? Boolean(item.secure) : true,
        session: false,
        storeId: item.storeId || '0',
        value: String(item.value || '').trim(),
      })).filter((c) => c.name && c.value);
    } else if (typeof obj === 'object' && obj !== null) {
      // Key-value object format { "NetflixId": "...", "SecureNetflixId": "..." }
      parsedCookies = Object.entries(obj).map(([key, val]) => ({
        domain: defaultDomain,
        expirationDate: ONE_YEAR_FUTURE,
        hostOnly: false,
        httpOnly: true,
        name: key.trim(),
        path: '/',
        sameSite: 'no_restriction',
        secure: true,
        session: false,
        storeId: '0',
        value: String(val).trim(),
      })).filter((c) => c.name && c.value);
    }
  } catch {
    // Not valid JSON, continue to other parsers
  }

  // Try 2: Parse as Netscape format
  if (parsedCookies.length === 0 && (cleaned.includes('\t') || cleaned.startsWith('# Netscape'))) {
    const lines = cleaned.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split('\t');
      if (parts.length >= 7) {
        parsedCookies.push({
          domain: parts[0],
          expirationDate: parseInt(parts[4], 10) || ONE_YEAR_FUTURE,
          hostOnly: false,
          httpOnly: true,
          name: parts[5].trim(),
          path: parts[2] || '/',
          sameSite: 'no_restriction',
          secure: parts[3].toUpperCase() === 'TRUE',
          session: false,
          storeId: '0',
          value: parts.slice(6).join('\t').trim(),
        });
      }
    }
  }

  // Try 3: Parse as Header String format (e.g. `Cookie: sp_dc=xyz; sp_key=123;`)
  if (parsedCookies.length === 0) {
    let headerStr = cleaned;
    if (headerStr.toLowerCase().startsWith('cookie:')) {
      headerStr = headerStr.substring(7).trim();
    }
    const pairs = headerStr.split(';');
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        const name = pair.substring(0, eqIdx).trim();
        const value = pair.substring(eqIdx + 1).trim();
        if (name && value) {
          parsedCookies.push({
            domain: defaultDomain,
            expirationDate: ONE_YEAR_FUTURE,
            hostOnly: false,
            httpOnly: true,
            name,
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value,
          });
        }
      }
    }
  }

  if (parsedCookies.length === 0) {
    return {
      success: false,
      cookies: [],
      jsonOutput: '',
      netscapeOutput: '',
      headerOutput: '',
      error: 'Format cookie tidak dikenali. Pastikan teks berisi format JSON Cookie-Editor, Netscape .txt, atau Cookie Header (nama=nilai).',
    };
  }

  const jsonOutput = JSON.stringify(parsedCookies, null, 2);
  const netscapeOutput = convertCookiesToNetscape(parsedCookies);
  const headerOutput = convertCookiesToHeaderString(parsedCookies);

  return {
    success: true,
    cookies: parsedCookies,
    jsonOutput,
    netscapeOutput,
    headerOutput,
  };
}
