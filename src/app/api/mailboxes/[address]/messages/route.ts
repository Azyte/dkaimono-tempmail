import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncExternalInbox } from '@/lib/publicMailboxBridge';

interface RouteContext {
  params: Promise<{ address: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { address } = await context.params;
    const decoded = decodeURIComponent(address);
    const { searchParams } = new URL(req.url);

    // Sync live incoming emails from external public providers if applicable
    await syncExternalInbox(decoded);

    const folder = (searchParams.get('folder') || 'all') as 'all' | 'inbox' | 'spam' | 'starred';
    const search = searchParams.get('search') || undefined;

    const messages = db.getMessages(decoded, { folder, search });

    return NextResponse.json({
      success: true,
      mailboxAddress: decoded,
      folder,
      total: messages.length,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { address } = await context.params;
    const decoded = decodeURIComponent(address);
    const count = db.clearMailboxMessages(decoded);

    return NextResponse.json({ success: true, clearedCount: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
