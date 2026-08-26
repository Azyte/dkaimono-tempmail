import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPro: user.isPro,
        proPlan: user.proPlan,
        proExpiresAt: user.proExpiresAt,
        telegramBotToken: user.telegramBotToken,
        telegramChatId: user.telegramChatId,
        telegramEnabled: user.telegramEnabled,
        customPin: user.customPin,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
