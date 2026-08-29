import { NextRequest, NextResponse } from 'next/server';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  previewAudioUrl: string;
  downloadPortalUrl: string;
  quality: string;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json({ success: false, error: 'Kata kunci pencarian lagu tidak boleh kosong.' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query.trim())}&limit=12`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Gagal menghubungi database musik.' }, { status: 502 });
    }

    const data = await res.json();
    const tracks: MusicTrack[] = (data.data || []).map((item: any) => {
      const mins = Math.floor((item.duration || 0) / 60);
      const secs = ('0' + ((item.duration || 0) % 60)).slice(-2);

      return {
        id: String(item.id),
        title: item.title || 'Untitled Track',
        artist: item.artist?.name || 'Unknown Artist',
        album: item.album?.title || 'Single',
        coverUrl: item.album?.cover_big || item.album?.cover_medium || item.album?.cover || '',
        durationSeconds: item.duration || 0,
        durationFormatted: `${mins}:${secs}`,
        previewAudioUrl: item.preview || '',
        downloadPortalUrl: `https://doubledouble.top/?url=${encodeURIComponent(item.link || `https://www.deezer.com/track/${item.id}`)}`,
        quality: 'FLAC 1411kbps Lossless & MP3 320kbps',
      };
    });

    return NextResponse.json({
      success: true,
      total: tracks.length,
      tracks,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error saat mencari lagu' }, { status: 500 });
  }
}
