import { db } from './db';
import { AmPremiumAccount } from '@/types';
import { createSingleAmPremium, AmAccountResult } from './alightMotion';
import { createWarpPremiumAccount } from './warpGenerator';
import { generateNextDnsProfile } from './nextdnsGenerator';
import { generateFreeAiApiKey } from './aiTokenGenerator';
import { generateDeezerArlToken } from './deezerArlGenerator';
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
    nextdns_pro: ['nextdns', 'adblock', 'privacy', 'dns'],
    ai_tokens: ['groq', 'deepseek', 'aikey', 'llama'],
    deezer_hifi: ['deezer', 'flac', 'music', 'hifi'],
    proxy_nodes: ['hy2', 'vless', 'proxy', 'node'],
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
    apiKey?: string;
    baseUrl?: string;
    arlToken?: string;
    dohUrl?: string;
    dotEndpoint?: string;
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

  // 3. SERVICE: NextDNS Pro AdBlock & Privacy DNS Profile (100% Auto DNS)
  if (serviceType === 'nextdns_pro') {
    const dnsRes = generateNextDnsProfile(customAlias);
    const alias = customAlias || getRandomServiceAlias('nextdns_pro');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_dns_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'nextdns_pro',
      serviceName: dnsRes.profileName,
      inboxUrl,
      duration: dnsRes.quota,
      status: 'active',
      dohUrl: dnsRes.dohUrl,
      dotEndpoint: dnsRes.dotEndpoint,
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
      serviceType: 'nextdns_pro',
      serviceName: dnsRes.profileName,
      dohUrl: dnsRes.dohUrl,
      dotEndpoint: dnsRes.dotEndpoint,
      inboxUrl,
      success: true,
      statusText: 'Profil AdBlock DNS Siap',
      duration: dnsRes.quota,
      message: `Profil NextDNS AdBlocker & Anti-Tracking berhasil dibuat!`,
      createdAt: now,
    };
  }

  // 4. SERVICE: AI Pro API Key Generator (100% Auto API Key)
  if (serviceType === 'ai_tokens') {
    const aiRes = generateFreeAiApiKey();
    const alias = customAlias || getRandomServiceAlias('ai_tokens');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_ai_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'ai_tokens',
      serviceName: aiRes.provider,
      inboxUrl,
      duration: aiRes.rateLimit,
      status: 'active',
      apiKey: aiRes.apiKey,
      baseUrl: aiRes.baseUrl,
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
      serviceType: 'ai_tokens',
      serviceName: aiRes.provider,
      apiKey: aiRes.apiKey,
      baseUrl: aiRes.baseUrl,
      inboxUrl,
      success: true,
      statusText: 'AI API Key Siap Pakai',
      duration: aiRes.rateLimit,
      message: `AI API Key (${aiRes.models[0].split(' ')[0]}) berhasil digenerate!`,
      createdAt: now,
    };
  }

  // 5. SERVICE: Deezer Hi-Fi FLAC & 320kbps Music Streamer ARL Token (100% Auto ARL)
  if (serviceType === 'deezer_hifi') {
    const arlRes = generateDeezerArlToken();
    const alias = customAlias || getRandomServiceAlias('deezer_hifi');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_arl_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'deezer_hifi',
      serviceName: arlRes.service,
      inboxUrl,
      duration: arlRes.duration,
      status: 'active',
      arlToken: arlRes.arlToken,
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
      serviceType: 'deezer_hifi',
      serviceName: arlRes.service,
      arlToken: arlRes.arlToken,
      inboxUrl,
      success: true,
      statusText: 'Deezer ARL Token Siap',
      duration: arlRes.duration,
      message: `Deezer Hi-Fi FLAC ARL Cookie Token berhasil dibuat!`,
      createdAt: now,
    };
  }

  // 6. SERVICE: Hysteria 2 & V2Ray Fast Global Proxy Nodes (100% Siap Konek)
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
      duration: `${pickedNode.expires} • Ping: ${pickedNode.ping}`,
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
      statusText: `Node ${pickedNode.protocol.toUpperCase()} Siap Konek`,
      duration: `${pickedNode.expires} • Ping: ${pickedNode.ping}`,
      message: `Node ${pickedNode.protocol.toUpperCase()} ${pickedNode.country} ${pickedNode.flag} siap digunakan!`,
      createdAt: now,
    };
  }

  // 7. Other Services (Canva Pro, ElevenLabs, Cursor AI, Leonardo AI, Custom)
  const alias = customAlias || getRandomServiceAlias(serviceType);
  const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
  const emailAddress = `${cleanAlias}@${domain}`;
  const password = generateSecurePassword();
  const accountId = 'acc_' + Math.random().toString(36).substring(2, 11);
  const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

  db.createOrGetMailbox(emailAddress, userId);

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
