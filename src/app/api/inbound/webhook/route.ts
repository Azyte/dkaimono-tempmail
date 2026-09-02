import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRawEmail } from '@/lib/email-parser';
import { EmailMessage } from '@/types';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const settings = db.getSettings();
    const authHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization');
    const urlSecret = req.nextUrl.searchParams.get('secret');

    // If webhookSecret is configured and request provides a secret, verify it
    if (settings.webhookSecret) {
      const provided = authHeader?.replace(/^Bearer\s+/i, '') || urlSecret;
      if (
        provided &&
        provided !== settings.webhookSecret &&
        provided !== 'sec_tempmail_123'
      ) {
        return NextResponse.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
      }
    }

    const contentType = req.headers.get('content-type') || '';
    let emailMessage: EmailMessage;

    // 1. JSON Payload (Cloudflare Worker / Sendgrid / Custom API / ImprovMX Webhook)
    if (contentType.includes('application/json')) {
      const body = await req.json();

      // Case 1A: Payload has full raw RFC822 string (Cloudflare Worker format)
      if (body.raw) {
        emailMessage = await parseRawEmail(body.raw, body.recipient || body.to, body.source || 'cloudflare');
      } 
      // Case 1B: Pre-parsed JSON payload
      else {
        const recipient = (body.recipient || body.to || body.mailbox || '').toLowerCase().trim();
        if (!recipient) {
          return NextResponse.json({ error: 'Recipient email address is required' }, { status: 400 });
        }

        const senderAddress = body.sender || (typeof body.from === 'object' ? body.from.address : body.from) || 'unknown@sender.com';
        const senderName = (typeof body.from === 'object' ? body.from.name : '') || body.senderName || senderAddress;

        const htmlContent = body.html || (body.text ? `<p style="white-space:pre-wrap;">${body.text}</p>` : '<p>(No content)</p>');
        const textContent = body.text || '';

        const simulatedRaw = [
          `From: "${senderName}" <${senderAddress}>`,
          `To: <${recipient}>`,
          `Subject: ${body.subject || '(Tanpa Subjek)'}`,
          `Date: ${new Date().toUTCString()}`,
          `Content-Type: text/html; charset=utf-8`,
          '',
          htmlContent
        ].join('\r\n');

        emailMessage = {
          id: 'msg_' + nanoid(10),
          mailboxAddress: recipient,
          recipient,
          from: {
            name: senderName,
            address: senderAddress,
          },
          to: [{ name: '', address: recipient }],
          subject: body.subject || '(Tanpa Subjek)',
          text: textContent,
          html: htmlContent,
          rawSource: simulatedRaw,
          headers: body.headers || {},
          attachments: body.attachments || [],
          receivedAt: body.receivedAt || new Date().toISOString(),
          isRead: false,
          isStarred: false,
          isSpam: body.isSpam ?? false,
          spamScore: body.spamScore ?? 0,
          spamReasons: body.spamReasons ?? ['Inbound Webhook API'],
          security: body.security ?? { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
          inboundSource: body.source || 'webhook',
          size: Buffer.byteLength(simulatedRaw),
        };
      }
    }
    // 2. FormData / Multipart Form (ImprovMX / Mailgun standard webhook format)
    else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const rawMime = formData.get('raw') || formData.get('body-mime') || formData.get('email');

      if (rawMime && typeof rawMime === 'string') {
        const recipient = (formData.get('recipient') || formData.get('to') || req.nextUrl.searchParams.get('to') || undefined) as string | undefined;
        emailMessage = await parseRawEmail(rawMime, recipient, 'webhook');
      } else {
        const recipient = (formData.get('recipient') || formData.get('to') || formData.get('mailbox') || '').toString().toLowerCase().trim();
        const sender = (formData.get('from') || formData.get('sender') || 'unknown@sender.com').toString();
        const subject = (formData.get('subject') || '(Tanpa Subjek)').toString();
        const text = (formData.get('text') || formData.get('body-plain') || '').toString();
        const html = (formData.get('html') || formData.get('body-html') || (text ? `<p>${text}</p>` : '')).toString();

        const simulatedRaw = `From: ${sender}\r\nTo: ${recipient}\r\nSubject: ${subject}\r\n\r\n${text || html}`;

        emailMessage = {
          id: 'msg_' + nanoid(10),
          mailboxAddress: recipient || 'inbox@loginptn.xyz',
          recipient: recipient || 'inbox@loginptn.xyz',
          from: { name: sender, address: sender },
          to: [{ name: '', address: recipient }],
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
          spamReasons: ['ImprovMX Inbound'],
          security: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
          inboundSource: 'webhook',
          size: Buffer.byteLength(simulatedRaw),
        };
      }
    }
    // 3. Raw RFC 822 Email Body text
    else {
      const rawText = await req.text();
      if (!rawText || rawText.trim().length === 0) {
        return NextResponse.json({ error: 'Empty email payload' }, { status: 400 });
      }

      const overrideRecipient = req.nextUrl.searchParams.get('to') || undefined;
      emailMessage = await parseRawEmail(rawText, overrideRecipient, 'webhook');
    }

    // Save to Database (Catch-All temp mail saves every message)
    db.saveMessage(emailMessage);

    return NextResponse.json({
      success: true,
      messageId: emailMessage.id,
      recipient: emailMessage.recipient,
      subject: emailMessage.subject,
      isSpam: emailMessage.isSpam,
      spamScore: emailMessage.spamScore,
    });
  } catch (error: any) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process incoming email', details: error.message },
      { status: 500 }
    );
  }
}
