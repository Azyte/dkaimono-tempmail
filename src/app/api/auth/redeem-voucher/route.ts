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
        { error: 'Silakan login terlebih dahulu untuk mengaktifkan voucher PRO.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Masukkan kode voucher.' },
        { status: 400 }
      );
    }

    const result = db.redeemVoucher(code, user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const token = createSessionToken(result.user!);

    const response = NextResponse.json({
      success: true,
      message: result.message,
      token,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        isPro: result.user!.isPro,
        proPlan: result.user!.proPlan,
        proExpiresAt: result.user!.proExpiresAt,
        telegramBotToken: result.user!.telegramBotToken,
        telegramChatId: result.user!.telegramChatId,
        telegramEnabled: result.user!.telegramEnabled,
        customPin: result.user!.customPin,
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
