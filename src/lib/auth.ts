import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';
import { User } from '@/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'tempmail_super_secret_jwt_key_2026_dkaimono';
const COOKIE_NAME = 'tempmail_user_session';

export function hashPassword(password: string): string {
  const salt = 'dkaimono_salt_';
  return crypto.createHmac('sha256', AUTH_SECRET).update(salt + password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;

    const [userId, timestamp, signature] = parts;
    const payload = `${userId}:${timestamp}`;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');

    if (signature !== expectedSig) return null;

    // 30 days session expiry
    const tokenTime = parseInt(timestamp, 10);
    if (Date.now() - tokenTime > 30 * 24 * 3600 * 1000) return null;

    return userId;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;

    const userId = verifySessionToken(sessionCookie.value);
    if (!userId) return null;

    const user = db.getUserById(userId);
    if (!user) return null;

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
