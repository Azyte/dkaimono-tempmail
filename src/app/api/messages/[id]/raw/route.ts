import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const message = db.getMessage(id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const raw = message.rawSource || `From: ${message.from.address}\nTo: ${message.recipient}\nSubject: ${message.subject}\n\n${message.text}`;
    const filename = `${message.subject.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30) || 'email'}_${message.id}.eml`;

    return new NextResponse(raw, {
      status: 200,
      headers: {
        'Content-Type': 'message/rfc822',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
