import { NextRequest, NextResponse } from 'next/server';
import { createSingleAmPremium, AmAccountResult } from '@/lib/alightMotion';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const customHeader = req.headers.get('x-session-token');
    let headerToken: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7).trim();
    } else if (customHeader) {
      headerToken = customHeader.trim();
    }

    const user = await getCurrentUser(headerToken);
    const body = await req.json().catch(() => ({}));
    let count = parseInt(body.count || '1', 10);
    const customAlias = body.customAlias ? String(body.customAlias).trim() : undefined;

    if (isNaN(count) || count < 1) count = 1;
    if (count > 10) count = 10; // Max 10 per batch to avoid rate-limits

    const domain = db.getSettings().defaultDomain || 'loginptn.xyz';
    const results: AmAccountResult[] = [];

    for (let i = 0; i < count; i++) {
      const alias = count === 1 ? customAlias : undefined;
      const result = await createSingleAmPremium(alias, domain);
      results.push(result);

      if (user && result.success) {
        const saved = user.savedMailboxes || [];
        if (!saved.includes(result.email)) saved.unshift(result.email);
        const monitored = user.monitoredAliases || [];
        const local = result.email.split('@')[0];
        if (!monitored.includes(local)) monitored.unshift(local);
        db.updateUser(user.id, { savedMailboxes: saved.slice(0, 30), monitoredAliases: monitored.slice(0, 30) });
      }

      // Small delay between requests to be polite to the generator server
      if (i < count - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      totalRequested: count,
      successCount,
      accounts: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memproses pembuatan akun AM' }, { status: 500 });
  }
}
