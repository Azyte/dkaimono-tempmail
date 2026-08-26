import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const customHeader = req.headers.get('x-session-token');
    let headerToken: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7).trim();
    } else if (customHeader) {
      headerToken = customHeader.trim();
    }

    const user = await getCurrentUser(headerToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk menyimpan konfigurasi PRO.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    let { telegramBotToken, telegramChatId, telegramEnabled, customPin, keepEmailsForever, monitoredAliases } = body;

    // Clean Bot Token & Chat ID
    let cleanBotToken = telegramBotToken !== undefined ? telegramBotToken.trim().replace(/^bot/i, '') : user.telegramBotToken;
    let cleanChatId = telegramChatId !== undefined ? telegramChatId.trim().replace(/^@/, '') : user.telegramChatId;

    let cleanAliases: string[] | undefined = undefined;
    if (monitoredAliases !== undefined) {
      if (Array.isArray(monitoredAliases)) {
        cleanAliases = monitoredAliases.map((a: string) => a.trim().toLowerCase()).filter(Boolean);
      } else if (typeof monitoredAliases === 'string') {
        cleanAliases = monitoredAliases.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
      }
    }

    const updatedUser = db.updateUser(user.id, {
      telegramBotToken: cleanBotToken,
      telegramChatId: cleanChatId,
      telegramEnabled: telegramEnabled !== undefined ? Boolean(telegramEnabled) : user.telegramEnabled,
      customPin: customPin !== undefined ? customPin.trim() : user.customPin,
      keepEmailsForever: keepEmailsForever !== undefined ? Boolean(keepEmailsForever) : user.keepEmailsForever,
      monitoredAliases: cleanAliases !== undefined ? cleanAliases : user.monitoredAliases,
    });

    // Auto-register Telegram Webhook for interactive commands
    if (cleanBotToken) {
      try {
        const webhookUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/api/telegram/webhook?token=${cleanBotToken}`;
        await fetch(`https://api.telegram.org/bot${cleanBotToken}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message', 'edited_message', 'callback_query'],
          }),
        });
      } catch (e) {
        console.error('Failed to set Telegram webhook:', e);
      }
    }

    const token = createSessionToken(updatedUser!);
    const response = NextResponse.json({
      success: true,
      message: 'Konfigurasi PRO & Bot Telegram Interaktif berhasil disimpan!',
      token,
      user: {
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        isPro: updatedUser!.isPro,
        proPlan: updatedUser!.proPlan,
        proExpiresAt: updatedUser!.proExpiresAt,
        telegramBotToken: updatedUser!.telegramBotToken,
        telegramChatId: updatedUser!.telegramChatId,
        telegramEnabled: updatedUser!.telegramEnabled,
        customPin: updatedUser!.customPin,
        monitoredAliases: updatedUser!.monitoredAliases,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 90 * 24 * 3600,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
