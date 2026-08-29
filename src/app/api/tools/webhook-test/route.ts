import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, url, botToken, chatId, customHeaders } = body;

    // 1. DISCORD WEBHOOK TEST
    if (type === 'discord') {
      if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
        return NextResponse.json({ success: false, error: 'URL Discord Webhook tidak valid.' }, { status: 400 });
      }

      const payload = {
        username: 'Dkaimono TempMail Relay',
        avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
        embeds: [
          {
            title: '📬 Uji Coba Relay Notifikasi Email Berhasil!',
            description: 'Webhook Discord kamu telah berhasil terhubung dengan **Dkaimono TempMail**. Setiap email masuk yang baru akan diteruskan langsung ke channel ini.',
            color: 0x4f46e5,
            fields: [
              { name: '👤 Pengirim Demo', value: 'security@service.com', inline: true },
              { name: '🔑 Kode OTP Demo', value: '`729184`', inline: true },
              { name: '⏱️ Timestamp', value: new Date().toLocaleTimeString('id-ID'), inline: true },
            ],
            footer: { text: 'Dkaimono Privacy Relay System' },
          },
        ],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json({ success: false, error: `Discord menolak webhook: ${txt}` }, { status: 422 });
      }

      return NextResponse.json({ success: true, message: 'Notifikasi berhasil terkirim ke channel Discord!' });
    }

    // 2. TELEGRAM TEST
    if (type === 'telegram') {
      if (!botToken || !chatId) {
        return NextResponse.json({ success: false, error: 'Bot Token dan Chat ID wajib diisi.' }, { status: 400 });
      }

      const text = `🚀 *Dkaimono TempMail Relay Active*\n\n` +
        `Uji coba notifikasi Telegram berhasil! Email masuk dan kode OTP akan diteruskan otomatis ke obrolan ini.\n\n` +
        `⏱️ _Waktu: ${new Date().toLocaleString('id-ID')}_`;

      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });

      const tgData = await res.json();
      if (!tgData.ok) {
        return NextResponse.json({ success: false, error: tgData.description || 'Gagal mengirim pesan Telegram' }, { status: 422 });
      }

      return NextResponse.json({ success: true, message: 'Pesan notifikasi Telegram berhasil dikirim!' });
    }

    // 3. CUSTOM HTTP WEBHOOK TEST
    if (type === 'custom') {
      if (!url || !url.startsWith('http')) {
        return NextResponse.json({ success: false, error: 'URL Webhook HTTP/HTTPS tidak valid.' }, { status: 400 });
      }

      const payload = {
        event: 'email.test',
        timestamp: new Date().toISOString(),
        mailbox: 'demo@dkaimono.tech',
        message: {
          from: 'test@example.com',
          subject: 'Uji Coba Webhook Dkaimono',
          otp: '482910',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Dkaimono-Webhook-Relay/3.0',
          ...(customHeaders || {}),
        },
        body: JSON.stringify(payload),
      });

      return NextResponse.json({
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        message: res.ok ? 'Webhook merespons dengan status 200 OK!' : `Webhook merespons status ${res.status}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Tipe relay webhook tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error saat menguji webhook' }, { status: 500 });
  }
}
