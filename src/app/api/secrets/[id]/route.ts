import { NextRequest, NextResponse } from 'next/server';
import { readAndBurnSecret } from '@/lib/secretsVault';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const keyHex = String(body.key || '').trim();

    if (!id || !keyHex) {
      return NextResponse.json({ success: false, error: 'ID pesan atau kunci dekripsi tidak valid.' }, { status: 400 });
    }

    const result = readAndBurnSecret(id, keyHex);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      remainingViews: result.remainingViews,
      burned: result.burned,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal membaca pesan rahasia' }, { status: 500 });
  }
}
