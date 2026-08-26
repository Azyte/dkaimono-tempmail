import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    let botToken = (body.botToken || user?.telegramBotToken || '').trim();
    let chatId = (body.chatId || user?.telegramChatId || '').trim();

    // Clean token & chat ID
    botToken = botToken.replace(/^bot/i, '').trim();
    chatId = chatId.replace(/^@/, '').trim();

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
      const desc = data.description || '';
      if (data.error_code === 401 || desc.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Bot Token salah / tidak valid. Pastikan Anda menyalin seluruh HTTP API Token dari @BotFather.' },
          { status: 400 }
        );
      }
      if (desc.includes('chat not found') || desc.includes('bot was blocked') || desc.includes('Forbidden')) {
        return NextResponse.json(
          {
            error: 'PENTING: Bot belum di-START! Silakan buka bot Anda di Telegram dan ketuk tombol START atau kirim pesan /start terlebih dahulu, lalu coba lagi.',
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Telegram Error: ${desc}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifikasi berhasil dikirim! Silakan cek chat bot Telegram Anda.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghubungi server Telegram' }, { status: 500 });
  }
}
