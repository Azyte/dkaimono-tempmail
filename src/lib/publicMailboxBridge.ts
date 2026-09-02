import { db } from './db';
import { EmailMessage } from '@/types';
import { nanoid } from 'nanoid';

const GUERRILLA_DOMAINS = new Set([
  'sharklasers.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'grr.la',
  'guerrillamail.net',
  'guerrillamail.biz',
  'pokemail.net',
  'spam4.me',
]);

const sessionCache = new Map<string, { sid: string; expiresAt: number }>();

async function getGuerrillaSid(username: string): Promise<string | null> {
  const cached = sessionCache.get(username);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.sid;
  }

  try {
    const initRes = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    const initData = await initRes.json();
    const sid = initData.sid_token;
    if (!sid) return null;

    // Set custom username
    await fetch(
      `https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=${encodeURIComponent(
        username
      )}&lang=en&sid_token=${sid}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
    );

    sessionCache.set(username, { sid, expiresAt: Date.now() + 15 * 60 * 1000 });
    return sid;
  } catch (err) {
    console.error('Guerrilla session error:', err);
    return null;
  }
}

export async function syncExternalInbox(fullAddress: string): Promise<void> {
  const normalized = fullAddress.toLowerCase().trim();
  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain) return;

  // 1. Guerrilla Mail Provider Sync
  if (GUERRILLA_DOMAINS.has(domain)) {
    try {
      const sid = await getGuerrillaSid(localPart);
      if (!sid) return;

      const checkRes = await fetch(
        `https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
      );
      const checkData = await checkRes.json();
      if (!checkData || !Array.isArray(checkData.list)) return;

      const existingMessages = db.getMessages(normalized);
      const existingSubjectsAndTimes = new Set(
        existingMessages.map((m) => `${m.from.address}_${m.subject}_${m.size}`)
      );

      for (const item of checkData.list) {
        // Skip default welcome banner if already exists or not needed
        const sender = item.mail_from || 'unknown@sender.com';
        const subject = item.mail_subject || '(Tanpa Subjek)';
        const sig = `${sender}_${subject}_${item.size || 0}`;
        if (existingSubjectsAndTimes.has(sig)) continue;

        // Fetch full email body
        let emailBody = item.mail_body || item.mail_excerpt || '';
        if (item.mail_id && (!item.mail_body || item.mail_body.length < 50)) {
          try {
            const fetchRes = await fetch(
              `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${item.mail_id}&sid_token=${sid}`,
              { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
            );
            const fetched = await fetchRes.json();
            if (fetched && fetched.mail_body) {
              emailBody = fetched.mail_body;
            }
          } catch (e) {}
        }

        const isHtml = /<[a-z][\s\S]*>/i.test(emailBody);
        const html = isHtml ? emailBody : `<div style="white-space:pre-wrap;font-family:sans-serif;">${emailBody}</div>`;
        const text = isHtml ? emailBody.replace(/<[^>]+>/g, ' ') : emailBody;

        const simulatedRaw = [
          `From: ${sender}`,
          `To: ${normalized}`,
          `Subject: ${subject}`,
          `Date: ${new Date().toUTCString()}`,
          `Content-Type: text/html; charset=utf-8`,
          '',
          html,
        ].join('\r\n');

        const newMsg: EmailMessage = {
          id: 'msg_ext_' + nanoid(10),
          mailboxAddress: normalized,
          recipient: normalized,
          from: {
            name: sender.split('@')[0] || sender,
            address: sender,
          },
          to: [{ name: localPart, address: normalized }],
          subject,
          text,
          html,
          rawSource: simulatedRaw,
          headers: {},
          attachments: [],
          receivedAt: new Date().toISOString(),
          isRead: false,
          isStarred: false,
          isSpam: false,
          spamScore: 0,
          spamReasons: [],
          security: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
          inboundSource: 'guerrilla_live',
          size: Buffer.byteLength(simulatedRaw),
        };

        db.saveMessage(newMsg);
        existingSubjectsAndTimes.add(sig);
      }
    } catch (err) {
      console.error('Failed to sync Guerrilla Mail:', err);
    }
  }
}
