import { NextRequest, NextResponse } from 'next/server';
import { createSingleAmPremium, AmAccountResult } from '@/lib/alightMotion';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

async function extractUserAndDevice(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const customHeader = req.headers.get('x-session-token');
  const deviceId = req.headers.get('x-device-id') || req.nextUrl.searchParams.get('deviceId') || undefined;
  let headerToken: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7).trim();
  } else if (customHeader) {
    headerToken = customHeader.trim();
  }

  const user = await getCurrentUser(headerToken);
  return { user, deviceId };
}

// 1. GET /api/am-premium -> List history of AM Premium accounts
export async function GET(req: NextRequest) {
  try {
    const { user, deviceId } = await extractUserAndDevice(req);

    if (!user?.isPro) {
      return NextResponse.json(
        {
          error: 'Fitur Auto AM Premium Creator eksklusif untuk member PRO/VIP.',
          isProRequired: true,
        },
        { status: 403 }
      );
    }

    const accounts = db.getAmAccounts(user.id, deviceId);
    return NextResponse.json({
      success: true,
      total: accounts.length,
      accounts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil riwayat akun AM' }, { status: 500 });
  }
}

// 2. POST /api/am-premium -> Generate AM Premium accounts
export async function POST(req: NextRequest) {
  try {
    const { user, deviceId } = await extractUserAndDevice(req);

    // PRO Check: ONLY PRO users can use this feature
    if (!user?.isPro) {
      return NextResponse.json(
        {
          error: 'Fitur Auto AM Premium Creator eksklusif untuk member PRO/VIP. Silakan klaim voucher VIP terlebih dahulu.',
          isProRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let count = parseInt(body.count || '1', 10);
    const customAlias = body.customAlias ? String(body.customAlias).trim() : undefined;

    if (isNaN(count) || count < 1) count = 1;
    if (count > 10) count = 10; // Max 10 per batch to avoid rate-limits

    const domain = db.getSettings().defaultDomain || 'loginptn.xyz';
    const results: AmAccountResult[] = [];

    for (let i = 0; i < count; i++) {
      const alias = count === 1 ? customAlias : undefined;
      const result = await createSingleAmPremium(alias, domain, user.id, deviceId);
      results.push(result);

      if (result.success) {
        const saved = user.savedMailboxes || [];
        if (!saved.includes(result.email)) saved.unshift(result.email);
        const monitored = user.monitoredAliases || [];
        const local = result.email.split('@')[0];
        if (!monitored.includes(local)) monitored.unshift(local);
        db.updateUser(user.id, { savedMailboxes: saved.slice(0, 30), monitoredAliases: monitored.slice(0, 30) });
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

// 3. DELETE /api/am-premium -> Delete single account or clear history
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await extractUserAndDevice(req);
    if (!user?.isPro) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const id = body.id || req.nextUrl.searchParams.get('id');

    if (id === 'all' || body.clearAll) {
      db.clearAmAccounts(user.id);
      return NextResponse.json({ success: true, message: 'Semua riwayat akun AM berhasil dihapus.' });
    }

    if (id) {
      const ok = db.deleteAmAccount(id, user.id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: 'ID akun tidak ditemukan.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghapus riwayat akun' }, { status: 500 });
  }
}
