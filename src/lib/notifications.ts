'use client';

/**
 * Extract OTP code (4-8 digits) from email text or subject
 */
export function extractOtpCode(text: string): string | null {
  if (!text) return null;
  // Match patterns like "kode verifikasi: 123456", "OTP: 1234", "code: 123456", or standalone 6-digit numbers
  const otpMatch =
    text.match(/(?:otp|code|kode|verifikasi|verification)[\s:=#\-]*([0-9]{4,8})/i) ||
    text.match(/\b([0-9]{6})\b/);
  return otpMatch ? otpMatch[1] : null;
}

/**
 * Request Web Push Notification Permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Trigger Native Web Push Notification when new email arrives
 */
export function triggerEmailNotification(from: string, subject: string, snippet?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const otp = extractOtpCode(subject + ' ' + (snippet || ''));
  const title = otp ? `🔔 OTP Ditemukan: ${otp}` : `📬 Email Masuk: ${from || 'Pengirim'}`;
  const body = otp
    ? `Kode: ${otp} | Subjek: ${subject || 'Pesan Baru'}`
    : subject || 'Klik untuk membuka kotak masuk email kamu.';

  try {
    const notif = new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      silent: false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.error('Failed to trigger notification:', err);
  }
}
