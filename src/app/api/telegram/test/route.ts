import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const botToken = body.botToken || user?.telegramBotToken;
    const chatId = body.chatId || user?.telegramChatId;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Bot Token dan Chat ID Telegram wajib diisi untuk melakukan test.' },
        { status: 400 }
      );
    }

    const testMessage = `🤖 <b>TEST NOTIFIKASI TELEGRAM BERHASIL!</b> 🎉\n\n` +
      `✅ <b>Status:</b> Terhubung Sukses ke TempMail Pro!\n` +
      `📧 <b>Domain:</b> <code>loginptn.xyz</code>\n` +
      `🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
      `Setiap ada email masuk atau kode OTP baru, bot Telegram Anda akan otomatis mengirimkan notifikasi ke chat ini secara realtime! 🚀`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json(
        { error: `Telegram API Error: ${data.description || 'Gagal mengirim pesan'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifikasi berhasil dikirim! Silakan cek chat Telegram Anda.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghubungi Telegram' }, { status: 500 });
  }
}
