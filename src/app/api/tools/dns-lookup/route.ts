import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ success: false, error: 'Parameter domain wajib diisi.' }, { status: 400 });
  }

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  try {
    const results: Record<string, any> = {
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
    };

    // 1. Resolve A (IPv4)
    try {
      results.a = await dns.resolve4(cleanDomain);
    } catch {
      results.a = [];
    }

    // 2. Resolve AAAA (IPv6)
    try {
      results.aaaa = await dns.resolve6(cleanDomain);
    } catch {
      results.aaaa = [];
    }

    // 3. Resolve MX (Mail Exchange)
    try {
      results.mx = await dns.resolveMx(cleanDomain);
      results.mx.sort((a: any, b: any) => a.priority - b.priority);
    } catch {
      results.mx = [];
    }

    // 4. Resolve TXT (SPF, verification, etc.)
    try {
      const rawTxt = await dns.resolveTxt(cleanDomain);
      results.txt = rawTxt.map((chunks) => chunks.join(' '));
      results.spf = results.txt.filter((t: string) => t.startsWith('v=spf1'));
    } catch {
      results.txt = [];
      results.spf = [];
    }

    // 5. Resolve DMARC
    try {
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${cleanDomain}`);
      results.dmarc = dmarcTxt.map((chunks) => chunks.join(' '));
    } catch {
      results.dmarc = [];
    }

    // 6. Resolve NS (Name Servers)
    try {
      results.ns = await dns.resolveNs(cleanDomain);
    } catch {
      results.ns = [];
    }

    // 7. Resolve CNAME
    try {
      results.cname = await dns.resolveCname(cleanDomain);
    } catch {
      results.cname = [];
    }

    return NextResponse.json({
      success: true,
      records: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal melakukan DNS lookup' }, { status: 500 });
  }
}
