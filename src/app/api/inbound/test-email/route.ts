import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmailMessage, EmailSecurity } from '@/types';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipient = (body.recipient || '').toLowerCase().trim();
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient email address is required' }, { status: 400 });
    }

    const type = body.type || 'otp'; // 'otp' | 'newsletter' | 'spam' | 'invoice' | 'custom'

    let subject = '';
    let senderName = '';
    let senderAddress = '';
    let html = '';
    let text = '';
    let isSpam = false;
    let spamScore = 0;
    let spamReasons: string[] = [];
    let security: EmailSecurity = { spf: 'pass', dkim: 'pass', dmarc: 'pass' };
    let attachments: any[] = [];

    const otpCode = Math.floor(100000 + Math.random() * 900000);

    if (type === 'otp') {
      subject = `Kode Verifikasi Keamanan Anda: ${otpCode}`;
      senderName = 'Auth Security Team';
      senderAddress = 'security@authservice-cloud.com';
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">🔐 Verifikasi Akun</h1>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Gunakan kode OTP sekali pakai di bawah ini untuk melanjutkan.</p>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">Halo! Kami menerima permintaan verifikasi masuk untuk akun <b>${recipient}</b>.</p>
            <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; display: inline-block; margin: 0 auto;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Kode ini hanya berlaku selama <b>10 menit</b>. Jangan berikan kode ini kepada siapapun.</p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Jika Anda tidak meminta kode ini, abaikan email ini dengan aman.<br/>© 2026 Security Protection Shield
          </div>
        </div>
      `;
      text = `Kode Verifikasi Keamanan Anda: ${otpCode}\n\nMasukkan kode ${otpCode} untuk menyelesaikan proses verifikasi akun ${recipient}.\nKode ini berlaku 10 menit.`;
    } 
    else if (type === 'spam') {
      subject = `💥 URGENT!!! YOU WON $2,500,000 CASH PRIZE LOTTERY INVITATION 💥`;
      senderName = 'International Claim Office';
      senderAddress = 'winner-notification-dept@spam-promo-hub.biz';
      isSpam = true;
      spamScore = 95;
      spamReasons = [
        'SPF record failed (Domain sender tidak terotorisasi)',
        'Subject mengandung huruf KAPITAL berlebih (ALL CAPS)',
        'Subject memiliki tanda seru berlebih (!!!)',
        'Kata kunci spam terdeteksi: "lottery", "urgent", "cash prize", "winner"',
        'Upstream score melampaui batas aman spam'
      ];
      security = { spf: 'fail', dkim: 'fail', dmarc: 'fail' };
      html = `
        <div style="font-family: Arial, sans-serif; background: #fffbeb; padding: 24px; border: 2px solid #f59e0b; border-radius: 8px;">
          <h2 style="color: #b45309; text-transform: uppercase;">🎉 CONGRATULATIONS! OFFICIAL WINNER NOTIFICATION 🎉</h2>
          <p style="font-size: 16px; color: #1f2937;">Dear Beneficiary <b>${recipient}</b>,</p>
          <p style="font-size: 14px; color: #374151;">We are pleased to inform you that your email address was selected as a 1st category winner of <b>$2,500,000 USD</b> in the Annual Global Promo Lottery!</p>
          <div style="background: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #d97706;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Batch Ref: INT-LOTTO/99281-XYZ</p>
            <p style="margin: 5px 0 0 0; color: #b45309;">Prize Amount: $2,500,000.00 USD</p>
          </div>
          <p style="font-size: 14px; color: #374151;">To claim your prize, immediately reply with your Full Name, Bank Account Details, and Phone Number.</p>
          <p style="color: #dc2626; font-weight: bold;">(Ini adalah email simulasi spam untuk menguji filter spam & catch-all tempmail)</p>
        </div>
      `;
      text = `CONGRATULATIONS! YOU WON $2,500,000 USD.\nBatch Ref: INT-LOTTO/99281-XYZ\nReply to claim your prize immediately.`;
    }
    else if (type === 'newsletter') {
      subject = `🚀 Tech Weekly Recap: Apa yang baru di Next.js & AI 2026`;
      senderName = 'Tech Insider Digest';
      senderAddress = 'editor@technews-weekly.io';
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 12px; font-weight: 700; color: #6366f1; text-transform: uppercase;">EDISI #142 • AGUSTUS 2026</span>
            <h2 style="margin: 8px 0 0 0; color: #0f172a;">Perkembangan AI Terkini & Tool Produktivitas Developer</h2>
          </div>
          <div style="padding: 24px;">
            <p style="color: #334155; line-height: 1.6;">Selamat datang di edisi minggu ini! Hari ini kita membahas rilis terbaru, tips arsitektur cloud serverless, dan optimasi performa web modern.</p>
            <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">📌 Highlight Minggu Ini:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.5;">
                <li>Next.js 16 & Server Actions Best Practice</li>
                <li>Cloudflare Email Routing untuk Domain Kustom</li>
                <li>Desain UI/UX Modern dengan Tailwind CSS</li>
              </ul>
            </div>
            <a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">Baca Selengkapnya →</a>
          </div>
        </div>
      `;
      text = `Tech Weekly Recap #142\nPerkembangan AI Terkini & Tool Produktivitas Developer.\n\nBaca artikel selengkapnya di web.`;
    }
    else if (type === 'invoice') {
      subject = `🧾 Bukti Pembayaran Invoice #INV-2026-8941 LUNAS`;
      senderName = 'Billing Cloud Services';
      senderAddress = 'billing@cloudhosting-pro.com';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #16a34a; margin-top: 0;">✓ Pembayaran Berhasil Diterima</h3>
          <p style="color: #475569;">Terima kasih! Pembayaran Anda telah kami konfirmasi.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b;">
              <th style="padding: 8px 0;">Item</th>
              <th style="padding: 8px 0; text-align: right;">Biaya</th>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #1e293b;">Cloud Domain & Tempmail Catch-All (1 Bulan)</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1e293b;">Rp 150.000</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">Total Terbayar</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #16a34a; font-size: 16px;">Rp 150.000</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8;">Lampiran struk bukti pembayaran: <b>Receipt_INV-2026-8941.pdf</b></p>
        </div>
      `;
      text = `Invoice #INV-2026-8941 LUNAS\nTotal: Rp 150.000\nTerima kasih atas pembayaran Anda.`;
      attachments = [
        {
          id: 'att_' + nanoid(6),
          filename: 'Receipt_INV-2026-8941.pdf',
          contentType: 'application/pdf',
          size: 1024 * 48, // 48 KB
        }
      ];
    }
    else {
      // Custom
      subject = body.subject || 'Pesan Uji Coba Kustom';
      senderName = body.senderName || 'Tester Pengembang';
      senderAddress = body.senderAddress || 'test@sender.com';
      html = `<div style="font-family:sans-serif;padding:16px;">${body.content || 'Ini adalah konten email uji coba kustom.'}</div>`;
      text = body.content || 'Ini adalah konten email uji coba kustom.';
    }

    const simulatedRaw = [
      `From: "${senderName}" <${senderAddress}>`,
      `To: <${recipient}>`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${nanoid(12)}@simulated.mail>`,
      `Content-Type: text/html; charset=utf-8`,
      `Received-SPF: ${security.spf} (domain is simulated)`,
      isSpam ? `X-Spam-Flag: YES` : `X-Spam-Flag: NO`,
      `X-Spam-Score: ${spamScore}`,
      '',
      html
    ].join('\r\n');

    const emailMessage: EmailMessage = {
      id: 'msg_' + nanoid(10),
      mailboxAddress: recipient,
      recipient,
      from: {
        name: senderName,
        address: senderAddress,
      },
      to: [{ name: '', address: recipient }],
      subject,
      text,
      html,
      rawSource: simulatedRaw,
      headers: {
        'from': `"${senderName}" <${senderAddress}>`,
        'to': recipient,
        'subject': subject,
        'date': new Date().toISOString(),
        'received-spf': security.spf,
        'x-spam-flag': isSpam ? 'YES' : 'NO',
        'x-spam-score': String(spamScore),
      },
      attachments,
      receivedAt: new Date().toISOString(),
      isRead: false,
      isStarred: false,
      isSpam,
      spamScore,
      spamReasons,
      security,
      inboundSource: 'simulation',
      size: Buffer.byteLength(simulatedRaw),
    };

    db.saveMessage(emailMessage);

    return NextResponse.json({
      success: true,
      message: emailMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
