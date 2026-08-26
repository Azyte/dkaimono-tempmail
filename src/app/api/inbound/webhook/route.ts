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
      if (provided && provided !== settings.webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
      }
    }

    const contentType = req.headers.get('content-type') || '';
    let emailMessage: EmailMessage;

    if (contentType.includes('application/json')) {
      const body = await req.json();

      // Case 1: Payload has full raw RFC822 string (Cloudflare Worker format)
      if (body.raw) {
        emailMessage = await parseRawEmail(body.raw, body.recipient, body.source || 'cloudflare');
      } 
      // Case 2: Pre-parsed JSON payload (Sendgrid / Mailgun / generic webhook)
      else {
        const recipient = (body.recipient || body.to || body.mailbox || '').toLowerCase().trim();
        if (!recipient) {
          return NextResponse.json({ error: 'Recipient email address is required' }, { status: 400 });
        }

        const senderAddress = body.sender || (typeof body.from === 'object' ? body.from.address : body.from) || 'unknown@sender.com';
        const senderName = (typeof body.from === 'object' ? body.from.name : '') || body.senderName || senderAddress;

        const htmlContent = body.html || (body.text ? `<p style="white-space:pre-wrap;">${body.text}</p>` : '<p>(No content)</p>');
        const textContent = body.text || '';

        // Fake MIME generation for source inspection
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
    // Case 3: Raw RFC 822 Email Body (e.g. POST raw text or multipart)
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
