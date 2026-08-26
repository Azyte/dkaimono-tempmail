import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, numAnswer, numExpected } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify Numeric Challenge (Verifikasi Angka)
    if (numAnswer === undefined || numExpected === undefined || parseInt(numAnswer, 10) !== parseInt(numExpected, 10)) {
      return NextResponse.json(
        { error: 'Verifikasi angka salah. Silakan coba hitung kembali dengan benar.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter (huruf, angka, titik, strip).' },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: 'Password minimal 5 karakter.' },
        { status: 400 }
      );
    }

    // Check existing
    const existingUser = db.getUserByUsername(cleanUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username ini sudah terdaftar. Silakan pilih username lain atau login.' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || `${cleanUsername}@loginptn.xyz`).toLowerCase().trim();

    // Create user
    const newUser = db.createUser({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      isPro: false,
      telegramEnabled: false,
      savedMailboxes: [`${cleanUsername}@loginptn.xyz`],
    });

    // Create session token
    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Pendaftaran akun berhasil!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isPro: newUser.isPro,
        proPlan: newUser.proPlan,
        proExpiresAt: newUser.proExpiresAt,
        telegramBotToken: newUser.telegramBotToken,
        telegramChatId: newUser.telegramChatId,
        telegramEnabled: newUser.telegramEnabled,
        customPin: newUser.customPin,
      },
    });

    // Set cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 90 * 24 * 3600, // 90 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}
