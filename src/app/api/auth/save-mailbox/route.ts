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

    const user = await getCurrentUser(headerToken);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not logged in' });
    }

    const body = await req.json().catch(() => ({}));
    const { mailboxAddress } = body;

    if (!mailboxAddress) {
      return NextResponse.json({ error: 'Mailbox address required' }, { status: 400 });
    }

    const clean = mailboxAddress.toLowerCase().trim();
    const saved = user.savedMailboxes || [];

    if (!saved.includes(clean)) {
      saved.push(clean);
      db.updateUser(user.id, { savedMailboxes: saved });
    }

    return NextResponse.json({ success: true, savedMailboxes: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
