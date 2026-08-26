import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkDomainDns } from '@/lib/dns-checker';

// GET all domains
export async function GET() {
  try {
    const domains = db.getDomains();
    return NextResponse.json({ success: true, domains });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST add a new domain
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim().toLowerCase();
    const isCatchAll = body.isCatchAll !== false;

    if (!name || !name.includes('.')) {
      return NextResponse.json({ error: 'Format nama domain tidak valid (contoh: yourdomain.com atau mail.yourdomain.com)' }, { status: 400 });
    }

    const domain = db.addDomain(name, isCatchAll);

    // Run quick background DNS check
    checkDomainDns(domain.name).then(res => {
      db.updateDomain(domain.id, {
        status: res.isConfigured ? 'active' : 'unverified',
        mxRecords: res.mxRecords.map(m => `${m.priority} ${m.exchange}`),
        spfRecord: res.spfRecord,
        lastChecked: res.lastChecked,
      });
    }).catch(console.error);

    return NextResponse.json({ success: true, domain });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update / set primary
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    if (action === 'set-primary') {
      const ok = db.setPrimaryDomain(id);
      return NextResponse.json({ success: ok });
    }

    if (updates) {
      const updated = db.updateDomain(id, updates);
      return NextResponse.json({ success: true, domain: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE domain
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    const deleted = db.deleteDomain(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
