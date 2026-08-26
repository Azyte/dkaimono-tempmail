import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ success: false, user: null });
    }

    const token = createSessionToken(user);

    return NextResponse.json({
      success: true,
      token,
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
