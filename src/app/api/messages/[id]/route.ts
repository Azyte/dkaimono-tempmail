import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET message
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const message = db.getMessage(id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Auto mark as read
    db.markMessageRead(id, true);
    message.isRead = true;

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH toggle read / star
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'star') {
      const isStarred = db.toggleMessageStar(id);
      return NextResponse.json({ success: true, isStarred });
    }

    if (typeof body.isRead === 'boolean') {
      const ok = db.markMessageRead(id, body.isRead);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: 'Invalid patch action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE message
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = db.deleteMessage(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
