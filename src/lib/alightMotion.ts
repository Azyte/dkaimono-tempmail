import { db } from './db';
import { AmPremiumAccount } from '@/types';

export interface AmAccountResult {
  id: string;
  email: string;
  alias: string;
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
  const adjectives = ['ampro', 'alight', 'motion', 'swift', 'hyper', 'ninja', 'cyber', 'star', 'prime', 'pixel'];
  const nouns = ['user', 'creator', 'edit', 'sync', 'flow', 'wave', 'vfx', 'master', 'hero', 'club'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}_${noun}${num}`;
}

// Request magic link directly via Google Firebase Auth REST API (Zero Cooldown, Unlimited Batch)
async function requestMagicLink(emailAddress: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Direct Firebase Auth request (High throughput, no 5-min proxy rate-limit)
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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
      return { success: true };
    }

    // 2. Fallback to upstream generator proxy if Firebase direct fails
    const sendRes = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        action: 'send',
        email: emailAddress,
      }),
    });

    const sendData = await sendRes.json().catch(() => ({}));
    if (sendData.success || sendData.status) {
      return { success: true };
    }

    return {
      success: false,
      error: fbData?.error?.message || sendData?.error || sendData?.message || 'Gagal meminta magic link',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error koneksi saat meminta magic link' };
  }
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

  // Format requirement for activation proxy
  if (rawLink.startsWith('https://alight-creative.firebaseapp.com/')) {
    return rawLink;
  }

  return `https://alight-creative.firebaseapp.com/__/auth/links?link=${encodeURIComponent(rawLink)}`;
}

// Verification runner that tries direct QSR endpoint and fallback proxy
export async function verifyAmMagicLink(
  emailAddress: string,
  magicLink: string
): Promise<{ success: boolean; duration?: string; orderId?: string; message?: string; error?: string; isRateLimit?: boolean }> {
  try {
    // Ensure properly formatted wrapped link
    const wrappedLink = magicLink.startsWith('https://alight-creative.firebaseapp.com/')
      ? magicLink
      : `https://alight-creative.firebaseapp.com/__/auth/links?link=${encodeURIComponent(magicLink)}`;

    // 1. Try Direct QSR API
    try {
      const encEmail = encodeURIComponent(emailAddress);
      const encLink = encodeURIComponent(wrappedLink);
      const qsrRes = await fetch(`https://api.qsr.web.id/alight/verify?apikey=qsr&email=${encEmail}&link=${encLink}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });
      const qsrData = await qsrRes.json().catch(() => ({}));
      if (qsrData.status || qsrData.success) {
        return {
          success: true,
          duration: qsrData.data?.duration || qsrData.duration || '1 Tahun Premium (Aktif)',
          orderId: qsrData.data?.orderId,
          message: qsrData.message || 'Premium berhasil diaktifkan!',
        };
      }

      if (qsrData.error && qsrData.error.toLowerCase().includes('tunggu')) {
        return {
          success: false,
          isRateLimit: true,
          error: qsrData.error,
        };
      }
    } catch (e) {}

    // 2. Fallback to dapjimotionpro proxy
    const verifyRes = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        action: 'verify',
        email: emailAddress,
        link: wrappedLink,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    if (verifyData.success || verifyData.status) {
      return {
        success: true,
        duration: verifyData.data?.duration || verifyData.duration || '1 Tahun Premium (Aktif)',
        orderId: verifyData.data?.orderId,
        message: verifyData.message || 'Premium sudah diaktifkan!',
      };
    }

    const errMsg = verifyData.error || verifyData.message || 'Aktivasi gagal diproses';
    const isRateLimit = errMsg.toLowerCase().includes('tunggu');

    return {
      success: false,
      isRateLimit,
      error: errMsg,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error saat verifikasi' };
  }
}

// Retrying / manually activating an existing account
export async function verifyExistingAmAccount(
  accountId: string,
  userId?: string
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

  const result = await verifyAmMagicLink(target.email, magicLink);
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

export async function createSingleAmPremium(
  customAlias?: string,
  domain = 'loginptn.xyz',
  userId?: string,
  deviceFingerprint?: string
): Promise<AmAccountResult> {
  const alias = customAlias || getRandomAmAlias();
  const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
  const emailAddress = `${cleanAlias}@${domain}`;
  const now = new Date().toISOString();
  const accountId = 'am_' + Math.random().toString(36).substring(2, 11);
  const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

  // 1. Ensure mailbox exists
  db.createOrGetMailbox(emailAddress, userId);

  try {
    // 2. Request Magic Link (Direct Firebase with zero rate-limit cooldown)
    const sendResult = await requestMagicLink(emailAddress);
    if (!sendResult.success) {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: false,
        statusText: 'Gagal meminta magic link ke server generator.',
        error: sendResult.error || 'Generator request failed',
        createdAt: now,
      };
    }

    // 3. Poll mailbox for incoming email (up to 40 seconds)
    let magicLink: string | null = null;
    const startTime = Date.now();

    while (Date.now() - startTime < 40000) {
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
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    if (!magicLink) {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: false,
        statusText: 'Timeout: Email tautan verifikasi dari Alight Motion tidak kunjung tiba dalam 40 detik.',
        error: 'Email not received',
        createdAt: now,
      };
    }

    // 4. Verify & Activate Premium via QSR / proxy
    const verifyResult = await verifyAmMagicLink(emailAddress, magicLink);

    if (verifyResult.success) {
      const durationStr = verifyResult.duration || '1 Tahun Premium (Aktif)';

      const successResult: AmAccountResult = {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: true,
        statusText: 'Sukses Diaktivasi',
        duration: durationStr,
        message: verifyResult.message || 'Premium sudah diaktifkan!',
        createdAt: now,
      };

      // Save active account
      const amRecord: AmPremiumAccount = {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        duration: durationStr,
        status: 'active',
        magicLink,
        orderId: verifyResult.orderId,
        createdAt: now,
        userId,
        deviceFingerprint,
      };
      db.saveAmAccount(amRecord);

      return successResult;
    } else if (verifyResult.isRateLimit) {
      // Upstream server is on temporary IP cooldown -> Save as pending with magic link ready
      const pendingRecord: AmPremiumAccount = {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        duration: '1 Tahun (Siap Diaktivasi)',
        status: 'pending',
        magicLink,
        error: verifyResult.error,
        createdAt: now,
        userId,
        deviceFingerprint,
      };
      db.saveAmAccount(pendingRecord);

      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: true,
        isPending: true,
        statusText: 'Email Siap (Menunggu Aktivasi)',
        duration: 'Siap Diaktivasi (1-Klik)',
        message: 'Email & Magic link siap. Klik Aktivasi di Riwayat.',
        error: verifyResult.error,
        createdAt: now,
      };
    } else {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: false,
        statusText: 'Verifikasi Gagal',
        error: verifyResult.error || 'Aktivasi gagal diproses',
        createdAt: now,
      };
    }
  } catch (err: any) {
    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      inboxUrl,
      success: false,
      statusText: 'Error Koneksi',
      error: err.message || 'Terjadi kesalahan sistem',
      createdAt: now,
    };
  }
}
