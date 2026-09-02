// Domain configuration
export interface DomainConfig {
  id: string;
  name: string; // e.g. "mail.mycustomdomain.com" or "mycustomdomain.com"
  isPrimary: boolean;
  isCatchAll: boolean;
  status: 'active' | 'pending' | 'unverified';
  createdAt: string;
  lastChecked?: string;
  mxRecords?: string[];
  spfRecord?: string;
}

// Mailbox configuration
export interface Mailbox {
  id: string;
  address: string; // full lowercase email (e.g. user@domain.com)
  name: string; // local part before @
  domain: string;
  createdAt: string;
  expiresAt: string | null; // ISO timestamp or null
  isStarred?: boolean;
  messageCount?: number;
  unreadCount?: number;
  lastActive?: string;
  pinLock?: string | null; // 4-6 digit PIN for PRO locked mailboxes
  ownerId?: string | null; // User ID who owns this mailbox
}

// Security & Spam Assessment
export interface EmailSecurity {
  spf: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none';
  dkim: 'pass' | 'fail' | 'none';
  dmarc: 'pass' | 'fail' | 'none';
  tlsVersion?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
}

// Email Message
export interface EmailMessage {
  id: string;
  mailboxAddress: string; // normalized lowercase
  recipient: string;
  from: {
    name: string;
    address: string;
  };
  to: Array<{ name: string; address: string }>;
  cc?: Array<{ name: string; address: string }>;
  bcc?: Array<{ name: string; address: string }>;
  replyTo?: Array<{ name: string; address: string }>;
  subject: string;
  text: string;
  html: string;
  rawSource?: string;
  headers?: Record<string, string | string[]>;
  attachments: EmailAttachment[];
  receivedAt: string;
  isRead: boolean;
  isStarred?: boolean;
  isSpam: boolean;
  spamScore: number; // 0 (clean) to 100 (definitely spam)
  spamReasons: string[];
  security: EmailSecurity;
  inboundSource: 'webhook' | 'smtp' | 'simulation' | 'cloudflare' | 'manual';
  size: number;
}

// App Global Settings
export interface AppSettings {
  defaultDomain: string;
  webhookSecret: string;
  bypassSpamFilter: boolean; // default: true (Catch all emails even if spam)
  autoRefreshSeconds: number; // default: 10
  retentionHours: number; // 0 = keep forever, 24 = 24h
  soundEnabled: boolean;
  allowCustomAlias: boolean;
  smtpPort: number;
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    createdAt: string;
  }>;
}

// Alight Motion Premium Account History Item
export interface AmPremiumAccount {
  id: string;
  email: string;
  alias: string;
  password?: string;
  serviceType?:
    | 'alight_motion'
    | 'warp_plus'
    | 'outline_vpn'
    | 'proton_vpn'
    | 'gaming_ssh'
    | 'nextdns_pro'
    | 'ai_tokens'
    | 'deezer_hifi'
    | 'scribd_doc'
    | 'media_downloader'
    | 'flux_ai_image'
    | 'temp_sms'
    | 'proxy_nodes'
    | 'canva_pro'
    | 'elevenlabs'
    | 'cursor_ai'
    | 'leonardo_ai'
    | 'custom'
    | string;
  serviceName?: string;
  inboxUrl: string;
  duration: string;
  status: 'active' | 'pending' | 'failed';
  magicLink?: string;
  orderId?: string;
  licenseKey?: string;
  wireguardConfig?: string;
  ovpnConfig?: string;
  configUri?: string;
  accessKey?: string;
  host?: string;
  port?: string | number;
  payload?: string;
  country?: string;
  apiKey?: string;
  baseUrl?: string;
  arlToken?: string;
  dohUrl?: string;
  dotEndpoint?: string;
  documentTitle?: string;
  pdfDownloadUrl?: string;
  imageUrl?: string;
  hdVideoUrl?: string;
  audioMp3Url?: string;
  thumbnailUrl?: string;
  videoTitle?: string;
  viralHooks?: string[];
  viralTitles?: string[];
  viralDescription?: string;
  viralHashtags?: string;
  pinnedCommentCta?: string;
  copyrightDisclaimer?: string;
  monetizationTips?: string[];
  antiCopyrightScore?: string;
  aspectRatio?: string;
  sourcePlatform?: string;
  phoneNumber?: string;
  formattedNumber?: string;
  smsInboxUrl?: string;
  error?: string;
  inviteUrl?: string;
  createdAt: string;
  userId?: string;
  deviceFingerprint?: string;
}

// User Subscription & Profile Model
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isPro: boolean;
  proPlan?: 'monthly' | 'yearly' | 'lifetime';
  proExpiresAt?: string | null; // null if lifetime or expired
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  customPin?: string;
  keepEmailsForever?: boolean;
  savedMailboxes?: string[];
  monitoredAliases?: string[]; // list of alias prefixes to send to Telegram
  preferredDomain?: string; // e.g. "sharklasers.com" or "loginptn.xyz"
  amAccounts?: AmPremiumAccount[];
  createdAt: string;
}

// Voucher / Subscription License Key Model
export interface Voucher {
  id: string;
  code: string; // e.g. "PRO-30DAYS-VIP"
  plan: 'monthly' | 'yearly' | 'lifetime';
  durationDays: number; // 30, 365, 0 (lifetime)
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

// Inbound Audit / Diagnostic Log
export interface InboundLog {
  id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  subject: string;
  status: 'received' | 'spam_flagged' | 'error';
  gateway: 'cloudflare' | 'smtp' | 'webhook' | 'simulation';
  ip?: string;
  details?: string;
  spamScore?: number;
}

// Database schema
export interface DatabaseSchema {
  domains: DomainConfig[];
  mailboxes: Mailbox[];
  messages: EmailMessage[];
  settings: AppSettings;
  logs: InboundLog[];
  users: User[];
  vouchers: Voucher[];
  amAccounts?: AmPremiumAccount[];
}
