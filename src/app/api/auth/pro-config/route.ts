import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (!user.isPro) {
      return NextResponse.json(
        { error: 'Fitur ini khusus untuk pengguna PRO / VIP. Silakan upgrade atau redeem voucher.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { telegramBotToken, telegramChatId, telegramEnabled, customPin, keepEmailsForever } = body;

    const updatedUser = db.updateUser(user.id, {
      telegramBotToken: telegramBotToken !== undefined ? telegramBotToken.trim() : user.telegramBotToken,
      telegramChatId: telegramChatId !== undefined ? telegramChatId.trim() : user.telegramChatId,
      telegramEnabled: telegramEnabled !== undefined ? Boolean(telegramEnabled) : user.telegramEnabled,
      customPin: customPin !== undefined ? customPin.trim() : user.customPin,
      keepEmailsForever: keepEmailsForever !== undefined ? Boolean(keepEmailsForever) : user.keepEmailsForever,
    });

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi PRO berhasil disimpan!',
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
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
