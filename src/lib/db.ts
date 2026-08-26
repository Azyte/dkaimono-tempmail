import fs from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  DomainConfig,
  Mailbox,
  EmailMessage,
  AppSettings,
  InboundLog,
  User,
  Voucher,
} from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function escapeTelegramHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultDomain: 'loginptn.xyz',
  webhookSecret: 'sec_tempmail_' + Math.random().toString(36).substring(2, 12),
  bypassSpamFilter: true, // Tangkap semua pesan spam & folder spam tetap masuk
  autoRefreshSeconds: 10,
  retentionHours: 24, // 24 hours retention
  soundEnabled: true,
  allowCustomAlias: true,
  smtpPort: 2525,
  apiKeys: [
    {
      id: 'key_master',
      name: 'Default Admin Key',
      key: 'tm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    },
  ],
};

const DEFAULT_DOMAINS: DomainConfig[] = [
  {
    id: 'dom_loginptn',
    name: 'loginptn.xyz',
    isPrimary: true,
    isCatchAll: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    mxRecords: ['10 route1.mx.cloudflare.net', '20 route2.mx.cloudflare.net', '30 route3.mx.cloudflare.net'],
    spfRecord: 'v=spf1 include:_spf.mx.cloudflare.net ~all',
  },
];

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'vouch_1',
    code: 'VIP-PRO-2026',
    plan: 'lifetime',
    durationDays: 0,
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vouch_2',
    code: 'PRO-30HARI-PASS',
    plan: 'monthly',
    durationDays: 30,
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vouch_3',
    code: 'PRO-LIFETIME-DKA',
    plan: 'lifetime',
    durationDays: 0,
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
];

let memoryDbCache: DatabaseSchema | null = null;
let lastMtimeMs = 0;

function ensureDataDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDb(): DatabaseSchema {
  ensureDataDirectory();

  if (fs.existsSync(DB_PATH)) {
    try {
      const stats = fs.statSync(DB_PATH);
      if (memoryDbCache && stats.mtimeMs === lastMtimeMs) {
        return memoryDbCache;
      }
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(content) as DatabaseSchema;
      lastMtimeMs = stats.mtimeMs;
      memoryDbCache = {
        domains: parsed.domains || DEFAULT_DOMAINS,
        mailboxes: parsed.mailboxes || [],
        messages: parsed.messages || [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        logs: parsed.logs || [],
        users: parsed.users || [],
        vouchers: parsed.vouchers && parsed.vouchers.length > 0 ? parsed.vouchers : DEFAULT_VOUCHERS,
      };
      return memoryDbCache;
    } catch (e) {
      console.error('Error reading database file:', e);
    }
  }

  // Initial seed
  const initialDb: DatabaseSchema = {
    domains: DEFAULT_DOMAINS,
    mailboxes: [],
    messages: [],
    settings: DEFAULT_SETTINGS,
    logs: [],
    users: [],
    vouchers: DEFAULT_VOUCHERS,
  };

  saveDbSync(initialDb);
  memoryDbCache = initialDb;
  return memoryDbCache;
}

function saveDbSync(data: DatabaseSchema) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    const stats = fs.statSync(DB_PATH);
    lastMtimeMs = stats.mtimeMs;
    memoryDbCache = data;
  } catch (err) {
    console.error('Failed to save DB synchronously:', err);
  }
}

function saveDb(data: DatabaseSchema) {
  saveDbSync(data);
}

export const db = {
  // Settings
  getSettings(): AppSettings {
    const data = loadDb();
    return data.settings;
  },

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const data = loadDb();
    data.settings = { ...data.settings, ...updates };
    saveDb(data);
    return data.settings;
  },

  // Domains
  getDomains(): DomainConfig[] {
    const data = loadDb();
    return data.domains;
  },

  addDomain(name: string, isCatchAll = true): DomainConfig {
    const data = loadDb();
    const cleanName = name.toLowerCase().trim().replace(/^@/, '');

    // Check if already exists
    const existing = data.domains.find((d) => d.name === cleanName);
    if (existing) return existing;

    const newDomain: DomainConfig = {
      id: 'dom_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      isPrimary: data.domains.length === 0,
      isCatchAll,
      status: 'pending',
      createdAt: new Date().toISOString(),
      mxRecords: [],
    };

    data.domains.push(newDomain);
    saveDb(data);
    return newDomain;
  },

  updateDomain(id: string, updates: Partial<DomainConfig>): DomainConfig | null {
    const data = loadDb();
    const idx = data.domains.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    data.domains[idx] = { ...data.domains[idx], ...updates };
    saveDb(data);
    return data.domains[idx];
  },

  setPrimaryDomain(id: string): boolean {
    const data = loadDb();
    let found = false;
    data.domains = data.domains.map((d) => {
      if (d.id === id) {
        found = true;
        data.settings.defaultDomain = d.name;
        return { ...d, isPrimary: true };
      }
      return { ...d, isPrimary: false };
    });

    if (found) {
      saveDb(data);
    }
    return found;
  },

  deleteDomain(id: string): boolean {
    const data = loadDb();
    const target = data.domains.find((d) => d.id === id);
    if (!target) return false;

    data.domains = data.domains.filter((d) => d.id !== id);

    // If deleted domain was primary, pick the first one
    if (target.isPrimary && data.domains.length > 0) {
      data.domains[0].isPrimary = true;
      data.settings.defaultDomain = data.domains[0].name;
    }

    saveDb(data);
    return true;
  },

  // Mailboxes
  getMailboxes(): Mailbox[] {
    const data = loadDb();
    return (data.mailboxes || []).map((mb) => {
      const msgs = (data.messages || []).filter((m) => m.mailboxAddress === mb.address);
      const unread = msgs.filter((m) => !m.isRead).length;
      return {
        ...mb,
        messageCount: msgs.length,
        unreadCount: unread,
        lastActive: msgs[0]?.receivedAt || mb.createdAt,
      };
    });
  },

  getMailbox(address: string): Mailbox | null {
    const data = loadDb();
    const normalized = address.toLowerCase().trim();
    const mb = data.mailboxes.find((m) => m.address === normalized);
    if (!mb) return null;
    const msgs = (data.messages || []).filter((m) => m.mailboxAddress === normalized);
    return {
      ...mb,
      messageCount: msgs.length,
      unreadCount: msgs.filter((m) => !m.isRead).length,
      lastActive: msgs[0]?.receivedAt || mb.createdAt,
    };
  },

  createOrGetMailbox(address: string, ownerId?: string): Mailbox {
    const data = loadDb();
    const normalized = address.toLowerCase().trim();
    const existing = data.mailboxes.find((m) => m.address === normalized);
    if (existing) {
      if (ownerId && !existing.ownerId) {
        existing.ownerId = ownerId;
        saveDb(data);
      }
      return existing;
    }

    const [name, domain] = normalized.split('@');
    const newMailbox: Mailbox = {
      id: 'mb_' + Math.random().toString(36).substring(2, 9),
      address: normalized,
      name: name || 'temp',
      domain: domain || data.settings.defaultDomain,
      createdAt: new Date().toISOString(),
      expiresAt:
        data.settings.retentionHours > 0
          ? new Date(Date.now() + data.settings.retentionHours * 3600 * 1000).toISOString()
          : null,
      isStarred: false,
      ownerId: ownerId || null,
    };

    data.mailboxes.unshift(newMailbox);
    saveDb(data);
    return newMailbox;
  },

  deleteMailbox(address: string): boolean {
    const data = loadDb();
    const normalized = address.toLowerCase().trim();
    data.mailboxes = data.mailboxes.filter((m) => m.address !== normalized);
    data.messages = data.messages.filter((msg) => msg.mailboxAddress !== normalized);
    saveDb(data);
    return true;
  },

  // Messages
  getMessages(
    mailboxAddress: string,
    options?: {
      folder?: 'all' | 'inbox' | 'spam' | 'starred';
      search?: string;
    }
  ): EmailMessage[] {
    const data = loadDb();
    const normalized = mailboxAddress.toLowerCase().trim();
    let list = data.messages.filter((m) => m.mailboxAddress === normalized);

    if (options?.folder === 'inbox') {
      list = list.filter((m) => !m.isSpam);
    } else if (options?.folder === 'spam') {
      list = list.filter((m) => m.isSpam);
    } else if (options?.folder === 'starred') {
      list = list.filter((m) => m.isStarred);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.address.toLowerCase().includes(q) ||
          m.from.name.toLowerCase().includes(q) ||
          m.text.toLowerCase().includes(q)
      );
    }

    // Sort descending by receivedAt
    return list.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  },

  getMessage(id: string): EmailMessage | null {
    const data = loadDb();
    return data.messages.find((m) => m.id === id) || null;
  },

  saveMessage(msg: EmailMessage): EmailMessage {
    const data = loadDb();

    // Auto-create mailbox if Catch-All received message for non-existing mailbox
    this.createOrGetMailbox(msg.mailboxAddress);

    // If message exists, update it, otherwise prepend
    const existingIndex = data.messages.findIndex((m) => m.id === msg.id);
    if (existingIndex >= 0) {
      data.messages[existingIndex] = msg;
    } else {
      data.messages.unshift(msg);
    }

    // Add Inbound Log
    this.addLog({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: msg.receivedAt,
      sender: msg.from.address,
      recipient: msg.recipient,
      subject: msg.subject || '(No Subject)',
      status: msg.isSpam ? 'spam_flagged' : 'received',
      gateway: msg.inboundSource,
      spamScore: msg.spamScore,
      details: msg.isSpam ? `Spam triggers: ${msg.spamReasons.join(', ')}` : 'Delivered to inbox',
    });

    saveDb(data);

    // Check if any PRO user should receive Telegram Notification
    try {
      this.dispatchTelegramNotification(msg);
    } catch (e) {
      console.error('Error dispatching telegram notification:', e);
    }

    return msg;
  },

  markMessageRead(id: string, isRead = true): boolean {
    const data = loadDb();
    const msg = data.messages.find((m) => m.id === id);
    if (!msg) return false;
    msg.isRead = isRead;
    saveDb(data);
    return true;
  },

  toggleMessageStar(id: string): boolean {
    const data = loadDb();
    const msg = data.messages.find((m) => m.id === id);
    if (!msg) return false;
    msg.isStarred = !msg.isStarred;
    saveDb(data);
    return msg.isStarred;
  },

  deleteMessage(id: string): boolean {
    const data = loadDb();
    const initialLen = data.messages.length;
    data.messages = data.messages.filter((m) => m.id !== id);
    saveDb(data);
    return data.messages.length < initialLen;
  },

  clearMailboxMessages(mailboxAddress: string): number {
    const data = loadDb();
    const normalized = mailboxAddress.toLowerCase().trim();
    const before = data.messages.length;
    data.messages = data.messages.filter((m) => m.mailboxAddress !== normalized);
    const count = before - data.messages.length;
    saveDb(data);
    return count;
  },

  // Users & Authentication
  getUsers(): User[] {
    const data = loadDb();
    return data.users || [];
  },

  getUserById(id: string): User | null {
    const data = loadDb();
    return (data.users || []).find((u) => u.id === id) || null;
  },

  getUserByUsername(username: string): User | null {
    const data = loadDb();
    const q = username.toLowerCase().trim();
    return (data.users || []).find((u) => u.username.toLowerCase() === q) || null;
  },

  getUserByEmail(email: string): User | null {
    const data = loadDb();
    const q = email.toLowerCase().trim();
    return (data.users || []).find((u) => u.email.toLowerCase() === q) || null;
  },

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const data = loadDb();
    if (!data.users) data.users = [];

    const newUser: User = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveDb(data);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const data = loadDb();
    const idx = (data.users || []).findIndex((u) => u.id === id);
    if (idx === -1) return null;

    data.users[idx] = { ...data.users[idx], ...updates };
    saveDb(data);
    return data.users[idx];
  },

  // Vouchers
  getVouchers(): Voucher[] {
    const data = loadDb();
    return data.vouchers || [];
  },

  createVoucher(plan: 'monthly' | 'yearly' | 'lifetime', durationDays = 30, customCode?: string): Voucher {
    const data = loadDb();
    if (!data.vouchers) data.vouchers = [];

    const code = customCode || `VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newVoucher: Voucher = {
      id: 'vouch_' + Math.random().toString(36).substring(2, 9),
      code: code.toUpperCase().trim(),
      plan,
      durationDays,
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    data.vouchers.push(newVoucher);
    saveDb(data);
    return newVoucher;
  },

  redeemVoucher(code: string, userId: string): { success: boolean; message: string; user?: User } {
    const data = loadDb();
    const cleanCode = code.toUpperCase().trim();
    const voucher = (data.vouchers || []).find((v) => v.code === cleanCode);

    if (!voucher) {
      return { success: false, message: 'Kode voucher tidak valid atau tidak ditemukan.' };
    }

    if (voucher.isUsed) {
      return { success: false, message: 'Kode voucher ini sudah pernah digunakan sebelumnya.' };
    }

    const user = (data.users || []).find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Mark voucher used
    voucher.isUsed = true;
    voucher.usedBy = userId;
    voucher.usedAt = new Date().toISOString();

    // Activate PRO on user
    user.isPro = true;
    user.proPlan = voucher.plan;

    if (voucher.durationDays > 0) {
      const currentExpiry = user.proExpiresAt ? new Date(user.proExpiresAt).getTime() : Date.now();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      user.proExpiresAt = new Date(baseTime + voucher.durationDays * 24 * 3600 * 1000).toISOString();
    } else {
      user.proExpiresAt = null; // Lifetime
    }

    saveDb(data);
    return { success: true, message: `Selamat! Akun PRO (${voucher.plan.toUpperCase()}) Anda berhasil aktif!`, user };
  },

  // Telegram Notifications Dispatcher
  async dispatchTelegramNotification(msg: EmailMessage) {
    const data = loadDb();
    const localPart = msg.mailboxAddress.split('@')[0];

    // Find PRO users with Telegram Bot Token & Chat ID configured
    const targetUsers = (data.users || []).filter(
      (u) =>
        u.isPro &&
        u.telegramEnabled &&
        u.telegramBotToken &&
        u.telegramChatId
    );

    // Extract OTP if present
    const combined = `${msg.subject} ${msg.text}`;
    const otpMatch =
      combined.match(/(?:code|kode|otp|token|pin|verification|verifikasi)[^\d]{1,15}(\d{4,8})\b/i) ||
      combined.match(/\b(\d{6})\b/);
    const otpCode = otpMatch ? otpMatch[1] : null;

    const safeMailbox = escapeTelegramHtml(msg.mailboxAddress);
    const safeSender = escapeTelegramHtml(msg.from.name || msg.from.address);
    const safeSenderAddr = escapeTelegramHtml(msg.from.address);
    const safeSubject = escapeTelegramHtml(msg.subject || '(Tanpa Subjek)');
    const safeText = escapeTelegramHtml((msg.text || '').substring(0, 250));

    for (const user of targetUsers) {
      try {
        const cleanBotToken = (user.telegramBotToken || '').trim().replace(/^bot/i, '');
        const cleanChatId = (user.telegramChatId || '').trim().replace(/^@/, '');

        if (!cleanBotToken || !cleanChatId) continue;

        const text = `📬 <b>EMAIL BARU DITERIMA!</b>\n\n` +
          `📧 <b>Mailbox:</b> <code>${safeMailbox}</code>\n` +
          `👤 <b>Pengirim:</b> ${safeSender} &lt;${safeSenderAddr}&gt;\n` +
          `📋 <b>Subjek:</b> ${safeSubject}\n\n` +
          (otpCode ? `🔑 <b>KODE OTP:</b> <code>${escapeTelegramHtml(otpCode)}</code>\n\n` : '') +
          (safeText ? `📄 <b>Cuplikan Pesan:</b>\n<i>${safeText}...</i>\n\n` : '') +
          `🔗 <a href="https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(localPart)}">Buka Kotak Masuk Sekarang</a>`;

        await fetch(`https://api.telegram.org/bot${cleanBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          }),
        });
      } catch (err) {
        console.error(`Failed to send Telegram notification to user ${user.id}:`, err);
      }
    }
  },

  // Logs
  getLogs(limit = 100): InboundLog[] {
    const data = loadDb();
    return data.logs.slice(0, limit);
  },

  addLog(log: InboundLog) {
    const data = loadDb();
    data.logs.unshift(log);
    if (data.logs.length > 500) {
      data.logs = data.logs.slice(0, 500);
    }
    saveDb(data);
  },

  clearLogs() {
    const data = loadDb();
    data.logs = [];
    saveDb(data);
  },

  // System Stats
  getStats() {
    const data = loadDb();
    const totalMessages = data.messages.length;
    const spamCount = data.messages.filter((m) => m.isSpam).length;
    const unreadCount = data.messages.filter((m) => !m.isRead).length;
    const mailboxesCount = data.mailboxes.length;
    const domainsCount = data.domains.length;

    return {
      totalMessages,
      spamCount,
      unreadCount,
      mailboxesCount,
      domainsCount,
      primaryDomain: data.settings.defaultDomain,
      bypassSpamFilter: data.settings.bypassSpamFilter,
    };
  },
};
