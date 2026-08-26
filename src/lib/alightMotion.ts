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
  createdAt: string;
}

function getRandomAmAlias(): string {
  const adjectives = ['ampro', 'alight', 'motion', 'swift', 'hyper', 'ninja', 'cyber', 'star', 'prime', 'pixel'];
  const nouns = ['user', 'creator', 'edit', 'sync', 'flow', 'wave', 'vfx', 'master', 'hero', 'club'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}_${noun}${num}`;
}

function extractMagicLinkFromEmail(html: string, text: string): string | null {
  if (html) {
    // Match Firebase / Alight Creative magic link
    const linkMatch =
      html.match(/href=["'](https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links[^"'>\s]+)["']/i) ||
      html.match(/href=["'](https:\/\/[^"'>\s]*alightcreative\.com\/auth_action[^"'>\s]+)["']/i) ||
      html.match(/href=["'](https:\/\/[^"'>\s]*oobCode=[^"'>\s]+)["']/i);

    if (linkMatch) {
      return linkMatch[1].replace(/&amp;/g, '&');
    }
  }

  if (text) {
    const textMatch =
      text.match(/(https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links[^\s<>"']+)/i) ||
      text.match(/(https:\/\/[^\s<>"']*alightcreative\.com\/auth_action[^\s<>"']+)/i) ||
      text.match(/(https:\/\/[^\s<>"']*oobCode=[^\s<>"']+)/i);

    if (textMatch) {
      return textMatch[1].replace(/[.,;)]+$/, '').replace(/&amp;/g, '&');
    }
  }

  return null;
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
    // 2. Request Magic Link from dapjimotionpro generator v2
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
    if (!sendData.success && !sendData.status) {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: false,
        statusText: 'Gagal meminta magic link ke server generator.',
        error: sendData.error || sendData.message || 'Generator service error',
        createdAt: now,
      };
    }

    // 3. Poll mailbox for incoming email (up to 40 seconds)
    let magicLink: string | null = null;
    const startTime = Date.now();

    while (Date.now() - startTime < 40000) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const messages = db.getMessages(emailAddress);
      const amEmail = messages.find(
        (m) =>
          m.from.address.toLowerCase().includes('alight') ||
          m.subject.toLowerCase().includes('alight') ||
          m.subject.toLowerCase().includes('sign in')
      );

      if (amEmail) {
        magicLink = extractMagicLinkFromEmail(amEmail.html, amEmail.text);
        if (magicLink) break;
      }
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

    // 4. Verify & Activate Premium via dapjimotionpro proxy-qsr
    const verifyRes = await fetch('https://dapjimotionpro.my.id/api/proxy-qsr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        action: 'verify',
        email: emailAddress,
        link: magicLink,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    if (verifyData.success || verifyData.status) {
      const durationStr =
        verifyData.data?.duration ||
        verifyData.duration ||
        verifyData.message ||
        '1 Tahun Premium (Aktif)';

      const successResult: AmAccountResult = {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: true,
        statusText: 'Sukses Diaktivasi',
        duration: durationStr,
        message: verifyData.message || 'Premium sudah diaktifkan!',
        createdAt: now,
      };

      // Save to database history
      const amRecord: AmPremiumAccount = {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        duration: durationStr,
        status: 'active',
        createdAt: now,
        userId,
        deviceFingerprint,
      };
      db.saveAmAccount(amRecord);

      return successResult;
    } else {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        inboxUrl,
        success: false,
        statusText: 'Verifikasi Gagal',
        error: verifyData.error || verifyData.message || 'Aktivasi gagal diproses',
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
