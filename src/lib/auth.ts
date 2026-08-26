import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { db } from './db';
import { User } from '@/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'tempmail_super_secret_jwt_key_2026_dkaimono_production';
export const COOKIE_NAME = 'tempmail_user_session';

function ensureTelegramWebhook(botToken: string) {
  if (!botToken) return;
  const clean = botToken.replace(/^bot/i, '').trim();
  const webhookUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/api/telegram/webhook?token=${clean}`;
  fetch(`https://api.telegram.org/bot${clean}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ['message', 'edited_message', 'callback_query'],
    }),
  }).catch(() => {});
}

export function hashPassword(password: string): string {
  const salt = 'dkaimono_salt_2026_';
  return crypto.createHmac('sha256', AUTH_SECRET).update(salt + password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false;
  return hashPassword(password) === hash;
}

export function createSessionToken(user: User): string {
  const payloadObj = {
    id: user.id,
    username: user.username,
    email: user.email,
    isPro: Boolean(user.isPro),
    proPlan: user.proPlan,
    proExpiresAt: user.proExpiresAt,
    telegramBotToken: user.telegramBotToken,
    telegramChatId: user.telegramChatId,
    telegramEnabled: Boolean(user.telegramEnabled),
    customPin: user.customPin,
    monitoredAliases: user.monitoredAliases,
    ts: Date.now(),
  };
  const jsonStr = JSON.stringify(payloadObj);
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(jsonStr).digest('hex');
  return Buffer.from(`${jsonStr}|||${signature}`).toString('base64');
}

export function verifySessionToken(token: string): User | null {
  try {
    if (!token) return null;
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split('|||');
    if (parts.length !== 2) return null;

    const [jsonStr, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(jsonStr).digest('hex');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(jsonStr);

    // 90 days session validity
    if (Date.now() - payload.ts > 90 * 24 * 3600 * 1000) return null;

    // Check if user exists in DB
    let user = db.getUserById(payload.id) || db.getUserByUsername(payload.username);
    if (!user) {
      // Auto-restore user in DB if container restarted
      user = db.createUser({
        username: payload.username,
        email: payload.email || `${payload.username}@loginptn.xyz`,
        passwordHash: hashPassword('default_restored_pwd'),
        isPro: payload.isPro || false,
        proPlan: payload.proPlan,
        proExpiresAt: payload.proExpiresAt,
        telegramBotToken: payload.telegramBotToken,
        telegramChatId: payload.telegramChatId,
        telegramEnabled: payload.telegramEnabled || false,
        customPin: payload.customPin,
        savedMailboxes: [`${payload.username}@loginptn.xyz`],
        monitoredAliases: payload.monitoredAliases || [],
      });
    }

    if (user.telegramBotToken) {
      ensureTelegramWebhook(user.telegramBotToken);
    }

    // Check if PRO has expired
    if (user.isPro && user.proExpiresAt) {
      if (new Date(user.proExpiresAt).getTime() < Date.now()) {
        user.isPro = false;
        user.proPlan = undefined;
        db.updateUser(user.id, { isPro: false, proPlan: undefined });
      }
    }

    return user;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(requestToken?: string): Promise<User | null> {
  try {
    let token = requestToken;

    if (!token) {
      const headerStore = await headers();
      const authHeader = headerStore.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        const customToken = headerStore.get('x-session-token');
        if (customToken) {
          token = customToken.trim();
        }
      }
    }

    if (!token) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(COOKIE_NAME);
      if (sessionCookie && sessionCookie.value) {
        token = sessionCookie.value;
      }
    }

    if (!token) return null;

    return verifySessionToken(token);
  } catch (e) {
    return null;
  }
}
