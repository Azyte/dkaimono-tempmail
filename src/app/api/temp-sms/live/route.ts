import { NextRequest, NextResponse } from 'next/server';
import { getLivePhoneNumbersDatabase } from '@/lib/tempSmsLiveEngine';

export async function GET(req: NextRequest) {
  try {
    const country = req.nextUrl.searchParams.get('country');
    let numbers = getLivePhoneNumbersDatabase();

    if (country && country !== 'all') {
      numbers = numbers.filter((n) => n.country.toLowerCase().includes(country.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalNumbers: numbers.length,
      numbers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal memuat nomor SMS' }, { status: 500 });
  }
}
