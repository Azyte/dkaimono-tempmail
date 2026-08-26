import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
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

    return NextResponse.json({
      success: true,
      message: result.message,
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
