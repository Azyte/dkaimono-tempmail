import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, numAnswer, numExpected } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify Numeric Challenge (Verifikasi Angka) if provided
    if (numAnswer !== undefined && numExpected !== undefined) {
      if (parseInt(numAnswer, 10) !== parseInt(numExpected, 10)) {
        return NextResponse.json(
          { error: 'Verifikasi angka salah. Silakan coba hitung kembali.' },
          { status: 400 }
        );
      }
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = db.getUserByUsername(cleanUsername) || db.getUserByEmail(cleanUsername);

    if (!user) {
      return NextResponse.json(
        { error: 'Username / Email tidak ditemukan. Silakan periksa kembali atau daftar baru.' },
        { status: 404 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Check if PRO has expired
    if (user.isPro && user.proExpiresAt) {
      if (new Date(user.proExpiresAt).getTime() < Date.now()) {
        user.isPro = false;
        user.proPlan = undefined;
        db.updateUser(user.id, { isPro: false, proPlan: undefined });
      }
    }

    // Create session token
    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
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

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 90 * 24 * 3600, // 90 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}
