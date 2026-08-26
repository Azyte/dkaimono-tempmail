import { NextRequest, NextResponse } from 'next/server';
import { checkDomainDns } from '@/lib/dns-checker';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const domainId = searchParams.get('id');

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    const result = await checkDomainDns(domain);

    // If domainId provided, update status in DB
    if (domainId) {
      db.updateDomain(domainId, {
        status: result.isConfigured ? 'active' : 'unverified',
        mxRecords: result.mxRecords.map(m => `${m.priority} ${m.exchange}`),
        spfRecord: result.spfRecord,
        lastChecked: result.lastChecked,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
