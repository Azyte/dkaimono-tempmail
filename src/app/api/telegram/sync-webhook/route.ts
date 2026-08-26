import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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

    const currentUser = await getCurrentUser(headerToken);
    const body = await req.json().catch(() => ({}));
    const targetToken = body.botToken || currentUser?.telegramBotToken;

    const tokensToSync = targetToken
      ? [targetToken]
      : db
          .getUsers()
          .map((u) => u.telegramBotToken)
          .filter(Boolean) as string[];

    const syncResults: any[] = [];

    for (const rawToken of tokensToSync) {
      const cleanToken = rawToken.replace(/^bot/i, '').trim();
      if (!cleanToken) continue;

      const webhookUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/api/telegram/webhook?token=${cleanToken}`;

      // 1. setWebhook
      const setRes = await fetch(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'edited_message', 'callback_query'],
          drop_pending_updates: false,
        }),
      });
      const setData = await setRes.json().catch(() => ({}));

      // 2. getWebhookInfo
      const infoRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getWebhookInfo`);
      const infoData = await infoRes.json().catch(() => ({}));

      syncResults.push({
        tokenPreview: cleanToken.substring(0, 8) + '...',
        setWebhookResult: setData,
        webhookInfo: infoData,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Sinkronisasi Webhook Telegram selesai!',
      results: syncResults,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal sinkronisasi webhook' }, { status: 500 });
  }
}

export async function GET() {
  return POST(new NextRequest('http://localhost/api/telegram/sync-webhook', { method: 'POST' }));
}
