import crypto from 'crypto';

export interface SecretMessage {
  id: string;
  encryptedContent: string;
  iv: string;
  tag: string;
  burnAfterViews: number; // e.g. 1 = burn after 1 read
  viewCount: number;
  expiresAt: number; // timestamp in ms
  createdAt: number;
}

// In-memory secrets store (with auto-pruning)
const secretsStore = new Map<string, SecretMessage>();

// Clean expired secrets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, secret] of secretsStore.entries()) {
    if (secret.expiresAt < now || (secret.burnAfterViews > 0 && secret.viewCount >= secret.burnAfterViews)) {
      secretsStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

export function createSecret(
  content: string,
  burnAfterViews: number = 1,
  durationMinutes: number = 60
): { id: string; viewUrl: string; expiresAt: string } {
  const id = crypto.randomBytes(16).toString('hex');
  const encryptionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;

  // Key is appended in the fragment/ID or combined
  const secretKeyHex = encryptionKey.toString('hex');

  secretsStore.set(id, {
    id,
    encryptedContent: encrypted,
    iv: iv.toString('hex'),
    tag,
    burnAfterViews: Math.max(1, burnAfterViews),
    viewCount: 0,
    expiresAt,
    createdAt: now,
  });

  return {
    id: `${id}#${secretKeyHex}`,
    viewUrl: `/secret/${id}#${secretKeyHex}`,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

export function readAndBurnSecret(id: string, keyHex: string): {
  success: boolean;
  content?: string;
  remainingViews?: number;
  burned?: boolean;
  error?: string;
} {
  const secret = secretsStore.get(id);

  if (!secret) {
    return {
      success: false,
      error: 'Pesan rahasia ini sudah hancur (self-destructed) atau kedaluwarsa.',
    };
  }

  if (Date.now() > secret.expiresAt) {
    secretsStore.delete(id);
    return {
      success: false,
      error: 'Pesan rahasia ini telah kedaluwarsa.',
    };
  }

  try {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(secret.iv, 'hex');
    const tag = Buffer.from(secret.tag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(secret.encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    secret.viewCount += 1;
    const remaining = secret.burnAfterViews - secret.viewCount;

    if (remaining <= 0) {
      secretsStore.delete(id); // Destroy immediately!
    }

    return {
      success: true,
      content: decrypted,
      remainingViews: Math.max(0, remaining),
      burned: remaining <= 0,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Kunci dekripsi salah atau pesan telah rusak.',
    };
  }
}
