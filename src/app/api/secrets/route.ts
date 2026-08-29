import { NextRequest, NextResponse } from 'next/server';
import { createSecret } from '@/lib/secretsVault';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const content = String(body.content || '').trim();
    const views = Number(body.burnAfterViews) || 1;
    const duration = Number(body.durationMinutes) || 60;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Isi pesan rahasia tidak boleh kosong.' }, { status: 400 });
    }

    const result = createSecret(content, views, duration);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal membuat pesan rahasia' }, { status: 500 });
  }
}
