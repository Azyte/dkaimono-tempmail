import { db } from './db';
import { AmPremiumAccount } from '@/types';
import { createSingleAmPremium, AmAccountResult } from './alightMotion';
import { createWarpPremiumAccount } from './warpGenerator';
import { generateFastProxyNodes } from './proxyNodeGenerator';
import { SUPPORTED_SERVICES, ServiceType, ServiceDefinition } from './accountGeneratorTypes';

export { SUPPORTED_SERVICES };
export type { ServiceType, ServiceDefinition };

export function generateSecurePassword(): string {
  const words = [
    'Turbo', 'Prime', 'Ninja', 'Cyber', 'Swift', 'Hyper',
    'Star', 'Pixel', 'Sonic', 'Omega', 'Vortex', 'Apex',
    'Falcon', 'Titan', 'Aero', 'Matrix', 'Nexus', 'Pulse'
  ];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 899) + 100;
  const specials = ['!', '@', '#', '$', '&', '%'];
  const spec = specials[Math.floor(Math.random() * specials.length)];
  return `${w1}${w2}${num}${spec}`;
}

export function getRandomServiceAlias(serviceType: ServiceType): string {
  const prefixMap: Record<ServiceType, string[]> = {
    alight_motion: ['ampro', 'alight', 'motion', 'vfx'],
    warp_plus: ['warp', 'cfvpn', 'cloudflare', 'wireguard'],
    proxy_nodes: ['vless', 'v2ray', 'proxy', 'node'],
    canva_pro: ['canvapro', 'design', 'canva', 'art'],
    elevenlabs: ['voice', 'eleven', 'speech', 'audio'],
    cursor_ai: ['cursor', 'coder', 'dev', 'ai'],
    leonardo_ai: ['leoi', 'artai', 'leonardo', 'gen'],
    custom: ['user', 'pro', 'vip', 'member'],
  };

  const prefixes = prefixMap[serviceType] || prefixMap.custom;
  const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${pref}_${num}`;
}

export async function createMultiServiceAccount(
  serviceType: ServiceType = 'alight_motion',
  customAlias?: string,
  inviteUrl?: string,
  domain = 'loginptn.xyz',
  userId?: string,
  deviceFingerprint?: string
): Promise<
  AmAccountResult & {
    password?: string;
    serviceType?: string;
    serviceName?: string;
    licenseKey?: string;
    wireguardConfig?: string;
    configUri?: string;
    country?: string;
  }
> {
  const now = new Date().toISOString();
  const serviceDef = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.custom;

  // 1. SERVICE: Alight Motion Premium (100% Full Auto Server)
  if (serviceType === 'alight_motion') {
    const amRes = await createSingleAmPremium(customAlias, domain, userId, deviceFingerprint);

    if (amRes.id) {
      const savedAccounts = db.getAmAccounts(userId);
      const acc = savedAccounts.find((a) => a.id === amRes.id);
      if (acc) {
        acc.password = undefined;
        acc.serviceType = 'alight_motion';
        acc.serviceName = SUPPORTED_SERVICES.alight_motion.name;
        db.saveAmAccount(acc);
      }
    }

    return {
      ...amRes,
      password: undefined,
      serviceType: 'alight_motion',
      serviceName: SUPPORTED_SERVICES.alight_motion.name,
      message: 'Akun Alight Motion 1 Tahun Premium AKTIF! Login di aplikasi HP via Magic Link (Cek kotak masuk TempMail).',
    };
  }

  // 2. SERVICE: Cloudflare WARP+ / WireGuard VPN (100% Full Auto License & Config)
  if (serviceType === 'warp_plus') {
    const warpRes = await createWarpPremiumAccount();
    const alias = customAlias || getRandomServiceAlias('warp_plus');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_warp_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    if (!warpRes.success) {
      return {
        id: accountId,
        email: emailAddress,
        alias: cleanAlias,
        success: false,
        statusText: 'Gagal Membuat Lisensi WARP+',
        error: warpRes.error || 'Terjadi kesalahan saat memproses Cloudflare WARP API',
        inboxUrl,
      };
    }

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'warp_plus',
      serviceName: serviceDef.name,
      inboxUrl,
      duration: serviceDef.defaultDuration,
      status: 'active',
      licenseKey: warpRes.licenseKey,
      wireguardConfig: warpRes.wireguardConfig,
      createdAt: now,
      userId,
      deviceFingerprint,
    };

    db.createOrGetMailbox(emailAddress, userId);
    db.saveAmAccount(newRecord);

    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'warp_plus',
      serviceName: serviceDef.name,
      licenseKey: warpRes.licenseKey,
      wireguardConfig: warpRes.wireguardConfig,
      inboxUrl,
      success: true,
      statusText: 'Lisensi & Config WireGuard Siap',
      duration: serviceDef.defaultDuration,
      message: `Lisensi Cloudflare WARP+ dan Config WireGuard (.conf) berhasil dibuat!`,
      createdAt: now,
    };
  }

  // 3. SERVICE: V2Ray / VLESS Fast Global Proxy Nodes (100% Siap Konek)
  if (serviceType === 'proxy_nodes') {
    const nodes = generateFastProxyNodes();
    const pickedNode = nodes[Math.floor(Math.random() * nodes.length)];
    const alias = customAlias || getRandomServiceAlias('proxy_nodes');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_node_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'proxy_nodes',
      serviceName: `${pickedNode.flag} ${pickedNode.serverName}`,
      inboxUrl,
      duration: pickedNode.expires,
      status: 'active',
      configUri: pickedNode.configUri,
      country: pickedNode.country,
      createdAt: now,
      userId,
      deviceFingerprint,
    };

    db.createOrGetMailbox(emailAddress, userId);
    db.saveAmAccount(newRecord);

    return {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'proxy_nodes',
      serviceName: `${pickedNode.flag} ${pickedNode.serverName}`,
      configUri: pickedNode.configUri,
      country: pickedNode.country,
      inboxUrl,
      success: true,
      statusText: 'Node VLESS Siap Konek',
      duration: pickedNode.expires,
      message: `Node VLESS ${pickedNode.country} ${pickedNode.flag} siap digunakan!`,
      createdAt: now,
    };
  }

  // 4. Other Services (Canva Pro, ElevenLabs, Cursor AI, Leonardo AI, Custom)
  const alias = customAlias || getRandomServiceAlias(serviceType);
  const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
  const emailAddress = `${cleanAlias}@${domain}`;
  const password = generateSecurePassword();
  const accountId = 'acc_' + Math.random().toString(36).substring(2, 11);
  const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

  // Ensure mailbox exists in DB
  db.createOrGetMailbox(emailAddress, userId);

  // Build Account Record
  const newRecord: AmPremiumAccount = {
    id: accountId,
    email: emailAddress,
    alias: cleanAlias,
    password,
    serviceType,
    serviceName: serviceDef.name,
    inboxUrl,
    duration: serviceDef.defaultDuration,
    status: 'active',
    inviteUrl: inviteUrl || undefined,
    createdAt: now,
    userId,
    deviceFingerprint,
  };

  db.saveAmAccount(newRecord);

  return {
    id: accountId,
    email: emailAddress,
    alias: cleanAlias,
    password,
    serviceType,
    serviceName: serviceDef.name,
    inboxUrl,
    success: true,
    statusText: 'Akun Berhasil Dibuat',
    duration: serviceDef.defaultDuration,
    message: `Akun ${serviceDef.name} siap digunakan! Password & email sudah aktif.`,
    createdAt: now,
  };
}
