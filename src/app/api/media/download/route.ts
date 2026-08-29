import { NextRequest, NextResponse } from 'next/server';
import { fetchRealMediaDownload } from '@/lib/mediaDownloader';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = body.url ? String(body.url).trim() : '';

    if (!url) {
      return NextResponse.json({ success: false, error: 'Silakan masukkan URL media (TikTok, Instagram, YouTube).' }, { status: 400 });
    }

    const result = await fetchRealMediaDownload(url);
    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: result.error || 'Gagal memproses video. Pastikan link bersifat publik.' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      media: result.data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error saat mengunduh media' }, { status: 500 });
  }
}
