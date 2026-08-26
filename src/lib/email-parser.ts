import { EmailMessage, EmailSecurity, EmailAttachment } from '@/types';
import { nanoid } from 'nanoid';

const SPAM_KEYWORDS = [
  'urgent wire transfer',
  'winner',
  'lottery',
  'claim your prize',
  'viagra',
  'cialis',
  'crypto investment guaranteed',
  'nigerian prince',
  'unclaimed funds',
  'million dollars',
  'verify your bank account immediately',
  'account suspended click here',
  'western union',
  'congratulations you won',
  'dating single girls',
  'casino bonus',
  'work from home earn $$$',
  'free money',
  'bitcoin deposit',
  'transfer receipt attached',
];

export interface SpamAnalysisResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

export function analyzeSpam(
  headers: Record<string, string>,
  subject: string,
  text: string,
  fromAddress: string,
  security: EmailSecurity
): SpamAnalysisResult {
  let score = 0;
  const reasons: string[] = [];

  const lowerSubject = (subject || '').toLowerCase();
  const lowerText = (text || '').toLowerCase();

  const getHeader = (key: string): string => {
    return String(headers[key] || headers[key.toLowerCase()] || '');
  };

  const xSpamFlag = getHeader('x-spam-flag');
  const xSpamStatus = getHeader('x-spam-status');

  if (xSpamFlag.toLowerCase().includes('yes') || xSpamStatus.toLowerCase().includes('yes')) {
    score += 50;
    reasons.push('Tandai Spam dari Upstream Server (X-Spam-Flag: YES)');
  }

  // 2. SPF & DKIM check
  if (security.spf === 'fail') {
    score += 25;
    reasons.push('SPF Authentication Gagal (Domain sender tidak terotorisasi)');
  } else if (security.spf === 'softfail') {
    score += 10;
    reasons.push('SPF Softfail');
  }

  if (security.dkim === 'fail') {
    score += 20;
    reasons.push('DKIM Signature Tidak Valid / Gagal');
  }

  if (security.dmarc === 'fail') {
    score += 25;
    reasons.push('DMARC Policy Rejection / Fail');
  }

  // 3. Keyword matches
  let keywordMatches = 0;
  for (const kw of SPAM_KEYWORDS) {
    if (lowerSubject.includes(kw) || lowerText.includes(kw)) {
      keywordMatches++;
      reasons.push(`Kata kunci mencurigakan terdeteksi: "${kw}"`);
    }
  }
  score += Math.min(keywordMatches * 15, 45);

  // 4. CAPS check in subject
  if (subject && subject.length > 10) {
    const letters = subject.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 5) {
      const upperRatio = letters.split('').filter(c => c === c.toUpperCase()).length / letters.length;
      if (upperRatio > 0.75) {
        score += 15;
        reasons.push('Subject mengandung dominan huruf KAPITAL (ALL CAPS)');
      }
    }
  }

  // 5. Exclamation marks
  if ((subject.match(/!{2,}/g) || []).length > 0) {
    score += 10;
    reasons.push('Subject memiliki tanda seru berlebih (!!!)');
  }

  const finalScore = Math.min(100, score);
  const isSpam = finalScore >= 30;

  return {
    isSpam,
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['Email lolos uji filter keamanan (Clean)'],
  };
}

export function extractSecurity(headers: Record<string, string>): EmailSecurity {
  const getHeader = (key: string): string => {
    return String(headers[key] || headers[key.toLowerCase()] || '');
  };

  const authResults = getHeader('authentication-results').toLowerCase();
  const receivedSpf = getHeader('received-spf').toLowerCase();

  let spf: EmailSecurity['spf'] = 'none';
  if (receivedSpf.includes('pass') || authResults.includes('spf=pass')) {
    spf = 'pass';
  } else if (receivedSpf.includes('fail') || authResults.includes('spf=fail')) {
    spf = 'fail';
  } else if (receivedSpf.includes('softfail') || authResults.includes('spf=softfail')) {
    spf = 'softfail';
  } else if (receivedSpf.includes('neutral') || authResults.includes('spf=neutral')) {
    spf = 'neutral';
  }

  let dkim: EmailSecurity['dkim'] = 'none';
  if (authResults.includes('dkim=pass')) {
    dkim = 'pass';
  } else if (authResults.includes('dkim=fail')) {
    dkim = 'fail';
  }

  let dmarc: EmailSecurity['dmarc'] = 'none';
  if (authResults.includes('dmarc=pass')) {
    dmarc = 'pass';
  } else if (authResults.includes('dmarc=fail')) {
    dmarc = 'fail';
  }

  return { spf, dkim, dmarc };
}

// MIME Header Decoder (RFC 2047: =?charset?B/Q?encoded?=)
export function decodeMimeHeader(headerStr: string): string {
  if (!headerStr) return '';
  return headerStr.replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g, (_, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        return Buffer.from(text, 'base64').toString(charset.toLowerCase().includes('utf-8') ? 'utf-8' : 'latin1');
      } else if (encoding.toUpperCase() === 'Q') {
        const unescaped = text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (__: any, hex: string) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
        return unescaped;
      }
    } catch {
      // Fallback
    }
    return text;
  });
}

// Quoted-Printable Decoder
export function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, '') // Soft line breaks
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return _ ;
      }
    });
}

export async function parseRawEmail(
  rawInput: string | Buffer,
  overrideRecipient?: string,
  source: EmailMessage['inboundSource'] = 'webhook'
): Promise<EmailMessage> {
  const rawString = typeof rawInput === 'string' ? rawInput : rawInput.toString('utf-8');

  // Split headers and body at first double newline
  const headerBodySplit = rawString.split(/\r?\n\r?\n/);
  const headerBlock = headerBodySplit[0] || '';
  const bodyBlock = headerBodySplit.slice(1).join('\n\n') || '';

  // Parse headers line by line (handling folded lines)
  const headerLines = headerBlock.split(/\r?\n/);
  const headersObj: Record<string, string> = {};
  let currentKey = '';

  for (const line of headerLines) {
    if (/^\s+/.test(line) && currentKey) {
      headersObj[currentKey] += ' ' + line.trim();
    } else {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        currentKey = match[1].toLowerCase().trim();
        headersObj[currentKey] = match[2].trim();
      }
    }
  }

  // Extract from
  const rawFrom = headersObj['from'] || 'unknown@sender.com';
  const decodedFrom = decodeMimeHeader(rawFrom);
  const fromMatch = decodedFrom.match(/^(?:["']?([^"']*)["']?\s*)?<?([^>]+@[^>]+)>?$/i);
  const fromName = fromMatch ? (fromMatch[1] || fromMatch[2]) : decodedFrom;
  const fromAddress = fromMatch ? fromMatch[2] : decodedFrom.replace(/[<>]/g, '').trim();

  // Extract recipient
  let recipientAddress = overrideRecipient || '';
  if (!recipientAddress) {
    const rawTo = headersObj['to'] || '';
    const toMatch = rawTo.match(/<([^>]+@[^>]+)>/i) || rawTo.match(/(\S+@\S+)/i);
    recipientAddress = toMatch ? toMatch[1] : 'inbox@yourdomain.com';
  }
  const normalizedRecipient = recipientAddress.toLowerCase().trim();

  // Extract Subject
  const subject = decodeMimeHeader(headersObj['subject'] || '(Tanpa Subjek)');

  // Extract Content-Type & Boundary
  const contentTypeHeader = headersObj['content-type'] || 'text/plain';
  let html = '';
  let text = '';
  const attachments: EmailAttachment[] = [];

  const boundaryMatch = contentTypeHeader.match(/boundary=["']?([^"';]+)["']?/i);

  if (boundaryMatch && boundaryMatch[1]) {
    const boundary = boundaryMatch[1];
    const parts = bodyBlock.split(new RegExp(`--${escapeRegex(boundary)}(?:--)?`));

    for (const part of parts) {
      if (!part.trim()) continue;

      const partSplit = part.split(/\r?\n\r?\n/);
      const partHeaders = partSplit[0] || '';
      let partBody = partSplit.slice(1).join('\n\n') || '';

      const isHtmlPart = /content-type:.*text\/html/i.test(partHeaders);
      const isPlainPart = /content-type:.*text\/plain/i.test(partHeaders);
      const isAttachment = /content-disposition:.*attachment/i.test(partHeaders) || /filename=/i.test(partHeaders);
      const isBase64 = /content-transfer-encoding:.*base64/i.test(partHeaders);
      const isQP = /content-transfer-encoding:.*quoted-printable/i.test(partHeaders);

      if (isQP) {
        partBody = decodeQuotedPrintable(partBody);
      }

      if (isAttachment) {
        const fnMatch = partHeaders.match(/filename=["']?([^"';\r\n]+)["']?/i) || partHeaders.match(/name=["']?([^"';\r\n]+)["']?/i);
        const filename = fnMatch ? decodeMimeHeader(fnMatch[1]) : 'attachment';
        const ctMatch = partHeaders.match(/content-type:\s*([^;\r\n]+)/i);
        const ct = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';

        attachments.push({
          id: 'att_' + nanoid(8),
          filename,
          contentType: ct,
          size: Buffer.byteLength(partBody),
          contentBase64: isBase64 ? partBody.replace(/\s+/g, '') : Buffer.from(partBody).toString('base64'),
        });
      } else if (isHtmlPart) {
        html = isBase64 ? Buffer.from(partBody.replace(/\s+/g, ''), 'base64').toString('utf-8') : partBody;
      } else if (isPlainPart) {
        text = isBase64 ? Buffer.from(partBody.replace(/\s+/g, ''), 'base64').toString('utf-8') : partBody;
      }
    }
  } else {
    // Single body part
    const isBase64 = /content-transfer-encoding:.*base64/i.test(headersObj['content-transfer-encoding'] || '');
    const isQP = /content-transfer-encoding:.*quoted-printable/i.test(headersObj['content-transfer-encoding'] || '');
    let body = bodyBlock;

    if (isQP) {
      body = decodeQuotedPrintable(body);
    } else if (isBase64) {
      body = Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf-8');
    }

    if (/text\/html/i.test(contentTypeHeader)) {
      html = body;
    } else {
      text = body;
      html = `<div style="font-family:sans-serif;white-space:pre-wrap;">${escapeHtml(body)}</div>`;
    }
  }

  if (!html && text) {
    html = `<div style="font-family:sans-serif;white-space:pre-wrap;">${escapeHtml(text)}</div>`;
  }
  if (!text && html) {
    text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Security & Spam check
  const security = extractSecurity(headersObj);
  const spamAnalysis = analyzeSpam(headersObj, subject, text, fromAddress, security);

  const emailMessage: EmailMessage = {
    id: 'msg_' + nanoid(10),
    mailboxAddress: normalizedRecipient,
    recipient: normalizedRecipient,
    from: {
      name: fromName,
      address: fromAddress,
    },
    to: [{ name: '', address: normalizedRecipient }],
    subject: subject || '(Tanpa Subjek)',
    text: text || '',
    html: html || '<p>(No content)</p>',
    rawSource: rawString.length < 500000 ? rawString : rawString.substring(0, 500000) + '\n...[TRUNCATED]',
    headers: headersObj,
    attachments,
    receivedAt: headersObj['date'] ? new Date(headersObj['date']).toISOString() : new Date().toISOString(),
    isRead: false,
    isStarred: false,
    isSpam: spamAnalysis.isSpam,
    spamScore: spamAnalysis.score,
    spamReasons: spamAnalysis.reasons,
    security,
    inboundSource: source,
    size: Buffer.byteLength(rawString),
  };

  return emailMessage;
}

function escapeRegex(string: string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
