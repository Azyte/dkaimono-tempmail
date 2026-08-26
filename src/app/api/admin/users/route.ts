import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = db.getUsers().map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      isPro: u.isPro,
      proPlan: u.proPlan,
      proExpiresAt: u.proExpiresAt,
      telegramEnabled: u.telegramEnabled,
      hasTelegramBot: Boolean(u.telegramBotToken),
      savedMailboxes: u.savedMailboxes || [],
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
