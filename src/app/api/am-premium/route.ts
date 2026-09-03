import { NextRequest, NextResponse } from 'next/server';
import { verifyExistingAmAccount, createBatchAmPremium } from '@/lib/alightMotion';
import { createMultiServiceAccount, ServiceType } from '@/lib/accountGenerator';
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

// 1. GET /api/am-premium -> List history of Premium & Trial accounts
export async function GET(req: NextRequest) {
  try {
    const { user, deviceId } = await extractUserAndDevice(req);

    if (!user?.isPro) {
      return NextResponse.json(
        {
          error: 'Fitur Auto Premium Creator eksklusif untuk member PRO/VIP.',
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
    return NextResponse.json({ error: err.message || 'Gagal mengambil riwayat akun' }, { status: 500 });
  }
}

// 2. POST /api/am-premium -> Generate Premium accounts or retry activation
export async function POST(req: NextRequest) {
  try {
    const { user, deviceId } = await extractUserAndDevice(req);

    // PRO Check: ONLY PRO users can use this feature
    if (!user?.isPro) {
      return NextResponse.json(
        {
          error: 'Fitur Auto Premium Creator eksklusif untuk member PRO/VIP. Silakan klaim voucher VIP terlebih dahulu.',
          isProRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Action: Retry single account
    if (body.action === 'retry' && body.id) {
      const retryRes = await verifyExistingAmAccount(body.id, user.id);
      if (retryRes.success) {
        return NextResponse.json({
          success: true,
          message: 'Akun berhasil diaktivasi menjadi Premium 1 Tahun!',
          account: retryRes.account,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: retryRes.error || 'Aktivasi masih dalam antrean cooldown server. Silakan coba sebentar lagi.',
          },
          { status: 429 }
        );
      }
    }

    // Action: Retry all pending accounts
    if (body.action === 'retry_all') {
      const accounts = db.getAmAccounts(user.id, deviceId);
      const pendingAccounts = accounts.filter((a) => a.status === 'pending');
      const results = [];

      for (const acc of pendingAccounts) {
        const res = await verifyExistingAmAccount(acc.id, user.id);
        if (res.success) {
          results.push(res.account);
        }
      }

      return NextResponse.json({
        success: true,
        activatedCount: results.length,
        totalPending: pendingAccounts.length,
        accounts: results,
      });
    }

    // Multi-Service Batch Generation
    let count = parseInt(body.count || '1', 10);
    const serviceType: ServiceType = body.serviceType || 'alight_motion';
    const customAlias = body.customAlias ? String(body.customAlias).trim() : undefined;
    const inviteUrl = body.inviteUrl ? String(body.inviteUrl).trim() : undefined;
    const amEngine = body.amEngine || 'auto';
    const domain = body.domain || db.getSettings().defaultDomain || 'sharklasers.com';

    if (serviceType === 'alight_motion' && amEngine === 'all4') {
      const all4Results = await createBatchAmPremium(4, domain, user.id, deviceId, 'all4' as any);
      for (const r of all4Results) {
        if (r.success) {
          const saved = user.savedMailboxes || [];
          if (!saved.includes(r.email)) saved.unshift(r.email);
          const monitored = user.monitoredAliases || [];
          const local = r.email.split('@')[0];
          if (!monitored.includes(local)) monitored.unshift(local);
          db.updateUser(user.id, { savedMailboxes: saved.slice(0, 30), monitoredAliases: monitored.slice(0, 30) });
        }
      }
      return NextResponse.json({
        success: true,
        totalRequested: all4Results.length,
        successCount: all4Results.filter((r) => r.success && !r.isPending).length,
        pendingCount: all4Results.filter((r) => r.isPending).length,
        accounts: all4Results,
      });
    }

    if (isNaN(count) || count < 1) count = 1;
    if (count > 10) count = 10; // Max 10 per batch

    const results = [];

    for (let i = 0; i < count; i++) {
      const alias = count === 1 ? customAlias : undefined;
      const result = await createMultiServiceAccount(serviceType, alias, inviteUrl, domain, user.id, deviceId, amEngine);
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

    const successCount = results.filter((r) => r.success && !r.isPending).length;
    const pendingCount = results.filter((r) => r.isPending).length;

    return NextResponse.json({
      success: true,
      totalRequested: count,
      successCount,
      pendingCount,
      accounts: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memproses pembuatan akun' }, { status: 500 });
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
      return NextResponse.json({ success: true, message: 'Semua riwayat akun berhasil dihapus.' });
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
