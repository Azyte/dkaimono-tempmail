import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ address: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { address } = await context.params;
    const decoded = decodeURIComponent(address);
    const mailbox = db.getMailbox(decoded) || db.createOrGetMailbox(decoded);

    return NextResponse.json({ success: true, mailbox });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { address } = await context.params;
    const decoded = decodeURIComponent(address);
    const deleted = db.deleteMailbox(decoded);

    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
