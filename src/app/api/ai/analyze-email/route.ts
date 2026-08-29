import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmailSecurityAndContent } from '@/lib/aiEmailAnalyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subject = '', from = '', text = '', html = '' } = body;

    const result = analyzeEmailSecurityAndContent(subject, from, text, html);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal menganalisa email' }, { status: 500 });
  }
}
