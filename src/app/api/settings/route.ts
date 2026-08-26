import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET settings & system stats
export async function GET() {
  try {
    const settings = db.getSettings();
    const stats = db.getStats();
    return NextResponse.json({ success: true, settings, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if adding API Key
    if (body.action === 'add-api-key') {
      const current = db.getSettings();
      const newKey = {
        id: 'key_' + nanoid(6),
        name: body.name || 'API Token',
        key: 'tm_' + nanoid(24),
        createdAt: new Date().toISOString(),
      };
      const updated = db.updateSettings({
        apiKeys: [...(current.apiKeys || []), newKey],
      });
      return NextResponse.json({ success: true, key: newKey, settings: updated });
    }

    // Check if removing API Key
    if (body.action === 'remove-api-key') {
      const current = db.getSettings();
      const updated = db.updateSettings({
        apiKeys: (current.apiKeys || []).filter(k => k.id !== body.keyId),
      });
      return NextResponse.json({ success: true, settings: updated });
    }

    // Check if regenerate webhook secret
    if (body.action === 'regenerate-secret') {
      const newSecret = 'sec_tempmail_' + nanoid(16);
      const updated = db.updateSettings({ webhookSecret: newSecret });
      return NextResponse.json({ success: true, webhookSecret: newSecret, settings: updated });
    }

    // Standard settings update
    const updated = db.updateSettings(body);
    const stats = db.getStats();

    return NextResponse.json({ success: true, settings: updated, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
