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
}
