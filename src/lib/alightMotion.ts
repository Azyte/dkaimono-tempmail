import { db } from './db';
import { AmPremiumAccount } from '@/types';

export type AmEngine = 'auto' | 'v1' | 'v2' | 'v3' | 'v4';

export interface AmAccountResult {
  id: string;
  email: string;
  alias: string;
  engineUsed: string;
  inboxUrl: string;
  success: boolean;
  statusText: string;
  duration?: string;
  message?: string;
  error?: string;
  isPending?: boolean;
  createdAt: string;
}

const DEFAULT_KEY_B64 = 'QUl6YVN5RHJaOWpyX1kxNmx0U0Jxc1FSNUlINkkwNEZSZ2E2S2kw';
const FIREBASE_API_KEY =
  process.env.AM_FIREBASE_API_KEY ||
  (typeof Buffer !== 'undefined' ? Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8') : '');

function getRandomAmAlias(): string {
  const adjectives = ['ampro', 'alight', 'motion', 'swift', 'hyper', 'ninja', 'cyber', 'star', 'prime', 'pixel', 'turbo', 'flow', 'apex'];
  const nouns = ['user', 'creator', 'edit', 'sync', 'flow', 'wave', 'vfx', 'master', 'hero', 'club', 'pro', 'vip'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}_${noun}${num}`;
}

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Origin': 'https://dapjimotionpro.my.id',
  'Referer': 'https://dapjimotionpro.my.id/generator',
};

// 1. Send Magic Link through 4 Generators + Firebase Direct
export async function requestMagicLink(
  emailAddress: string,
  engine: AmEngine = 'auto'
): Promise<{ success: boolean; engineUsed: string; error?: string }> {
  // Engine 4: Rafael VIP
  if (engine === 'v4') {
    try {
      const res = await fetch('https://dapjimotionpro.my.id/api/proxy-rafael?action=send', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email: emailAddress }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.status) return { success: true, engineUsed: 'Generator V4 (Rafael VIP)' };
      return { success: false, engineUsed: 'v4', error: data.message || data.error || 'V4 Send Error' };
    } catch (e: any) {
      return { success: false, engineUsed: 'v4', error: e.message };
    }
  }

  // Engine 3: QSR Cloud
  if (engine === 'v3') {
    try {
      const res = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'send', email: emailAddress }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.status) return { success: true, engineUsed: 'Generator V3 (QSR Cloud)' };
      return { success: false, engineUsed: 'v3', error: data.message || data.error || 'V3 Send Error' };
    } catch (e: any) {
      return { success: false, engineUsed: 'v3', error: e.message };
    }
  }

  // Engine 1: Dapji Classic
  if (engine === 'v1') {
    try {
      const res = await fetch('https://dapjimotionpro.my.id/api/proxy-v1', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'send', email: emailAddress }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.status) return { success: true, engineUsed: 'Generator V1 (Dapji Classic)' };
      return { success: false, engineUsed: 'v1', error: data.message || data.error || 'V1 Send Error' };
    } catch (e: any) {
      return { success: false, engineUsed: 'v1', error: e.message };
    }
  }

  // Engine 2: AmPrem Turbo
  if (engine === 'v2') {
    try {
      const res = await fetch('https://dapjimotionpro.my.id/api/proxy-amprem', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'send', email: emailAddress }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.status) return { success: true, engineUsed: 'Generator V2 (AmPrem Turbo)' };
      return { success: false, engineUsed: 'v2', error: data.message || data.error || 'V2 Send Error' };
    } catch (e: any) {
      return { success: false, engineUsed: 'v2', error: e.message };
    }
  }

  // Auto Mode: Cascading through Firebase -> V4 -> V3 -> V1 -> V2
  try {
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://alight-creative.firebaseapp.com/',
        },
        body: JSON.stringify({
          requestType: 'EMAIL_SIGNIN',
          email: emailAddress,
          continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
          canHandleCodeInApp: true,
        }),
      }
    );
    const fbData = await fbRes.json().catch(() => ({}));
    if (fbRes.ok && fbData.email) {
      return { success: true, engineUsed: 'Firebase Direct Core (Zero Rate-Limit)' };
    }
  } catch (e) {}

  // Fallback V4
  try {
    const r4 = await fetch('https://dapjimotionpro.my.id/api/proxy-rafael?action=send', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ email: emailAddress }),
    });
    const d4 = await r4.json().catch(() => ({}));
    if (d4.success || d4.status) return { success: true, engineUsed: 'Generator V4 (Rafael VIP)' };
  } catch (e) {}

  // Fallback V3
  try {
    const r3 = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ action: 'send', email: emailAddress }),
    });
    const d3 = await r3.json().catch(() => ({}));
    if (d3.success || d3.status) return { success: true, engineUsed: 'Generator V3 (QSR Cloud)' };
  } catch (e) {}

  // Fallback V1
  try {
    const r1 = await fetch('https://dapjimotionpro.my.id/api/proxy-v1', {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ action: 'send', email: emailAddress }),
    });
    const d1 = await r1.json().catch(() => ({}));
    if (d1.success || d1.status) return { success: true, engineUsed: 'Generator V1 (Dapji Classic)' };
  } catch (e) {}

  return { success: false, engineUsed: 'auto', error: 'Semua 4 server generator sedang cooldown. Coba sesaat lagi.' };
}

function extractMagicLinkFromEmail(html: string, text: string): string | null {
  let rawLink: string | null = null;

  if (html) {
    const linkMatch =
      html.match(/href=["'](https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links[^"'>\s]+)["']/i) ||
      html.match(/href=["'](https:\/\/[^"'>\s]*alightcreative\.com\/auth_action[^"'>\s]+)["']/i) ||
      html.match(/href=["'](https:\/\/[^"'>\s]*oobCode=[^"'>\s]+)["']/i);

    if (linkMatch) {
      rawLink = linkMatch[1].replace(/&amp;/g, '&');
    }
  }

  if (!rawLink && text) {
    const textMatch =
      text.match(/(https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links[^\s<>"']+)/i) ||
      text.match(/(https:\/\/[^\s<>"']*alightcreative\.com\/auth_action[^\s<>"']+)/i) ||
      text.match(/(https:\/\/[^\s<>"']*oobCode=[^\s<>"']+)/i);

    if (textMatch) {
      rawLink = textMatch[1].replace(/[.,;)]+$/, '').replace(/&amp;/g, '&');
    }
  }

  if (!rawLink) return null;

  if (rawLink.startsWith('https://alight-creative.firebaseapp.com/')) {
    return rawLink;
  }

  return `https://alight-creative.firebaseapp.com/__/auth/links?link=${encodeURIComponent(rawLink)}`;
}

// 2. Verification across all 4 generators
export async function verifyAmMagicLink(
  emailAddress: string,
  magicLink: string,
  engine: AmEngine = 'auto'
): Promise<{ success: boolean; duration?: string; orderId?: string; engineUsed?: string; message?: string; error?: string; isRateLimit?: boolean }> {
  const wrappedLink = magicLink.startsWith('https://alight-creative.firebaseapp.com/')
    ? magicLink
    : `https://alight-creative.firebaseapp.com/__/auth/links?link=${encodeURIComponent(magicLink)}`;

  // Engine 4: Rafael VIP verify + apply
  if (engine === 'v4' || engine === 'auto') {
    try {
      const v4Res = await fetch('https://dapjimotionpro.my.id/api/proxy-rafael?action=verify', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email: emailAddress, link: wrappedLink }),
      });
      const v4Data = await v4Res.json().catch(() => ({}));
      if (v4Data.success) {
        // Now apply premium
        const applyRes = await fetch('https://dapjimotionpro.my.id/api/proxy-rafael?action=apply', {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({ email: emailAddress, verifiedData: v4Data }),
        });
        const applyData = await applyRes.json().catch(() => ({}));
        if (applyData.success || applyData.status) {
          return {
            success: true,
            duration: applyData.duration || '1 Tahun Premium (V4 Rafael VIP)',
            orderId: v4Data.codeOrder || 'ORD_V4_' + Math.random().toString(36).substring(2, 7),
            engineUsed: 'Generator 4 (Rafael VIP)',
            message: 'Akun Alight Motion Pro berhasil diaktifkan via Generator V4!',
          };
        }
      }
    } catch (e) {}
    if (engine === 'v4') {
      return { success: false, engineUsed: 'v4', error: 'Generator V4 gagal memproses verifikasi' };
    }
  }

  // Engine 3: QSR Cloud
  if (engine === 'v3' || engine === 'auto') {
    try {
      const encEmail = encodeURIComponent(emailAddress);
      const encLink = encodeURIComponent(wrappedLink);
      const qsrRes = await fetch(`https://api.qsr.web.id/alight/verify?apikey=qsr&email=${encEmail}&link=${encLink}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const qsrData = await qsrRes.json().catch(() => ({}));
      if (qsrData.status || qsrData.success) {
        return {
          success: true,
          duration: qsrData.data?.duration || qsrData.duration || '1 Tahun Premium (V3 QSR Cloud)',
          orderId: qsrData.data?.orderId,
          engineUsed: 'Generator 3 (QSR Cloud)',
          message: qsrData.message || 'Premium berhasil diaktifkan via Generator V3!',
        };
      }

      // Fallback via dapji proxy-qsr
      const p3Res = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'verify', email: emailAddress, link: wrappedLink }),
      });
      const p3Data = await p3Res.json().catch(() => ({}));
      if (p3Data.success || p3Data.status) {
        return {
          success: true,
          duration: p3Data.data?.duration || p3Data.duration || '1 Tahun Premium (V3 Proxy)',
          orderId: p3Data.data?.orderId,
          engineUsed: 'Generator 3 (QSR Proxy)',
          message: p3Data.message || 'Premium sudah diaktifkan!',
        };
      }
    } catch (e) {}
    if (engine === 'v3') {
      return { success: false, engineUsed: 'v3', error: 'Generator V3 gagal memproses verifikasi' };
    }
  }

  // Engine 1: Dapji V1
  if (engine === 'v1' || engine === 'auto') {
    try {
      const v1Res = await fetch('https://dapjimotionpro.my.id/api/proxy-v1', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'verify', email: emailAddress, link: wrappedLink }),
      });
      const v1Data = await v1Res.json().catch(() => ({}));
      if (v1Data.success || v1Data.status) {
        return {
          success: true,
          duration: v1Data.duration || '1 Tahun Premium (V1 Dapji)',
          orderId: v1Data.orderId,
          engineUsed: 'Generator 1 (Dapji Classic)',
          message: v1Data.message || 'Premium berhasil diaktifkan via Generator V1!',
        };
      }
    } catch (e) {}
    if (engine === 'v1') {
      return { success: false, engineUsed: 'v1', error: 'Generator V1 sedang limit / dalam cooldown' };
    }
  }

  // Engine 2: AmPrem V2
  if (engine === 'v2' || engine === 'auto') {
    try {
      const v2Res = await fetch('https://dapjimotionpro.my.id/api/proxy-amprem', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'verify', email: emailAddress, link: wrappedLink }),
      });
      const v2Data = await v2Res.json().catch(() => ({}));
      if (v2Data.success || v2Data.status) {
        return {
          success: true,
          duration: v2Data.duration || '1 Tahun Premium (V2 AmPrem)',
          orderId: v2Data.orderId,
          engineUsed: 'Generator 2 (AmPrem Turbo)',
          message: v2Data.message || 'Premium berhasil diaktifkan via Generator V2!',
        };
      }
    } catch (e) {}
    if (engine === 'v2') {
      return { success: false, engineUsed: 'v2', error: 'Generator V2 gagal memproses verifikasi' };
    }
  }

  return {
    success: false,
    engineUsed: 'auto',
    error: 'Semua 4 generator aktivasi sedang mengalami antrean. Silakan tekan Ulangi Aktivasi sesaat lagi.',
  };
}

export async function createSingleAmPremium(
  customAlias?: string,
  domain = 'loginptn.xyz',
  userId?: string,
  deviceFingerprint?: string,
  engine: AmEngine = 'auto'
): Promise<AmAccountResult> {
  const alias = customAlias || getRandomAmAlias();
  const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
  const emailAddress = `${cleanAlias}@${domain}`;
  const now = new Date().toISOString();
  const accountId = 'am_' + Math.random().toString(36).substring(2, 11);
  const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

  db.createOrGetMailbox(emailAddress, userId);

  const reqResult = await requestMagicLink(emailAddress, engine);
  const engineLabel = reqResult.engineUsed || engine;

  if (!reqResult.success) {
    const failedAccount: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      duration: 'Belum Aktif',
      createdAt: now,
      status: 'pending',
      deviceFingerprint,
      userId,
      error: reqResult.error,
    };
    db.saveAmAccount(failedAccount);

    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      engineUsed: engineLabel,
      inboxUrl,
      success: false,
      statusText: 'Gagal Request',
      error: reqResult.error,
      isPending: true,
      createdAt: now,
    };
  }

  // Poll for magic link and auto verify
  let magicLink: string | null = null;
  const startTime = Date.now();
  const timeoutMs = 25000;

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2000));
    const messages = db.getMessages(emailAddress);
    const amEmail = messages.find(
      (m) =>
        m.from.address.toLowerCase().includes('alight') ||
        m.from.address.toLowerCase().includes('firebase') ||
        m.subject.toLowerCase().includes('alight') ||
        m.subject.toLowerCase().includes('sign in')
    );

    if (amEmail) {
      magicLink = extractMagicLinkFromEmail(amEmail.html, amEmail.text);
      if (magicLink) break;
    }
  }

  if (!magicLink) {
    const pendingAccount: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      duration: '1 Tahun (Menunggu Email Link)',
      createdAt: now,
      status: 'pending',
      deviceFingerprint,
      userId,
      error: 'Email magic link sedang dikirim oleh server. Silakan cek kotak masuk Anda.',
    };
    db.saveAmAccount(pendingAccount);

    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      engineUsed: engineLabel,
      inboxUrl,
      success: false,
      statusText: 'Menunggu Email Link',
      message: 'Magic link sedang dikirim. Email & Mailbox Anda sudah siap.',
      isPending: true,
      createdAt: now,
    };
  }

  // Auto-verify with 4-engine rotation
  const verifyResult = await verifyAmMagicLink(emailAddress, magicLink, engine);

  if (verifyResult.success) {
    const activeAccount: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      duration: verifyResult.duration || '1 Tahun Premium (Aktif)',
      createdAt: now,
      status: 'active',
      orderId: verifyResult.orderId,
      magicLink,
      deviceFingerprint,
      userId,
    };
    db.saveAmAccount(activeAccount);

    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      engineUsed: verifyResult.engineUsed || engineLabel,
      inboxUrl,
      success: true,
      statusText: '100% Aktif Pro',
      duration: verifyResult.duration || '1 Tahun Premium',
      message: 'Akun Alight Motion Pro 1 Tahun Sukses Diaktifkan Otomatis!',
      createdAt: now,
    };
  }

  const pendingVerifyAccount: AmPremiumAccount = {
    id: accountId,
    email: emailAddress,
    alias: cleanAlias,
    duration: '1 Tahun (Magic Link Siap)',
    createdAt: now,
    status: 'pending',
    magicLink,
    deviceFingerprint,
    userId,
    error: verifyResult.error || 'Server aktivasi sedang cooldown, tautan magic link tersimpan di inbox.',
  };
  db.saveAmAccount(pendingVerifyAccount);

  return {
    id: accountId,
    email: emailAddress,
    alias: cleanAlias,
    engineUsed: engineLabel,
    inboxUrl,
    success: false,
    statusText: 'Link Siap — Klik Masuk',
    message: 'Magic link sudah masuk ke inbox! Anda bisa langsung klik tautan untuk masuk ke aplikasi Alight Motion.',
    isPending: true,
    createdAt: now,
  };
}

export async function createAll4GensParallel(
  domain = 'loginptn.xyz',
  userId?: string,
  deviceFingerprint?: string
): Promise<AmAccountResult[]> {
  const engines: AmEngine[] = ['v4', 'v3', 'v1', 'v2'];
  const promises = engines.map((eng) =>
    createSingleAmPremium(undefined, domain, userId, deviceFingerprint, eng)
  );
  return await Promise.all(promises);
}

export async function createBatchAmPremium(
  count = 3,
  domain = 'loginptn.xyz',
  userId?: string,
  deviceFingerprint?: string,
  engine: AmEngine = 'auto'
): Promise<AmAccountResult[]> {
  if (engine === ('all4' as any)) {
    return await createAll4GensParallel(domain, userId, deviceFingerprint);
  }

  const safeCount = Math.min(Math.max(1, count), 10);
  const results: AmAccountResult[] = [];

  for (let i = 0; i < safeCount; i++) {
    const res = await createSingleAmPremium(undefined, domain, userId, deviceFingerprint, engine);
    results.push(res);
    if (i < safeCount - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return results;
}

export async function verifyExistingAmAccount(
  accountId: string,
  userId?: string,
  engine: AmEngine = 'auto'
): Promise<{ success: boolean; account?: AmPremiumAccount; error?: string }> {
  const accounts = db.getAmAccounts(userId);
  const target = accounts.find((a) => a.id === accountId);
  if (!target) {
    return { success: false, error: 'Akun tidak ditemukan' };
  }

  // Find magic link if missing
  let magicLink = target.magicLink;
  if (!magicLink) {
    const messages = db.getMessages(target.email);
    const amEmail = messages.find(
      (m) =>
        m.from.address.toLowerCase().includes('alight') ||
        m.from.address.toLowerCase().includes('firebase') ||
        m.subject.toLowerCase().includes('alight') ||
        m.subject.toLowerCase().includes('sign in')
    );
    if (amEmail) {
      magicLink = extractMagicLinkFromEmail(amEmail.html, amEmail.text) || undefined;
    }
  }

  if (!magicLink) {
    return { success: false, error: 'Tautan magic link email belum ditemukan di kotak masuk.' };
  }

  const result = await verifyAmMagicLink(target.email, magicLink, engine);
  if (result.success) {
    const updated: AmPremiumAccount = {
      ...target,
      status: 'active',
      duration: result.duration || '1 Tahun Premium (Aktif)',
      orderId: result.orderId || target.orderId,
      magicLink,
      error: undefined,
    };
    db.saveAmAccount(updated);
    return { success: true, account: updated };
  }

  return {
    success: false,
    error: result.error || 'Server aktivasi masih dalam cooldown antrean. Silakan coba sesaat lagi.',
  };
}
