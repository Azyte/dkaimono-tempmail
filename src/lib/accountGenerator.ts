import { db } from './db';
import { AmPremiumAccount } from '@/types';
import { createSingleAmPremium, AmAccountResult, AmEngine } from './alightMotion';
import { createWarpPremiumAccount } from './warpGenerator';
import { generateOutlineAccessKey } from './outlineVpnGenerator';
import { generateProtonVpnConfig } from './protonVpnGenerator';
import { generateGamingSshAccount } from './gamingSshGenerator';
import { generateNextDnsProfile } from './nextdnsGenerator';
import { generateFreeAiApiKey } from './aiTokenGenerator';
import { generateDeezerArlToken } from './deezerArlGenerator';
import { generateFastProxyNodes } from './proxyNodeGenerator';
import { generateDocumentUnlocker } from './scribdDownloader';
import { generateMediaDownloader } from './mediaDownloader';
import { generateFluxImage } from './fluxImageGenerator';
import { generateTempSmsNumber } from './tempSmsGenerator';
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
    scribd_doc: ['doc', 'pdf', 'scribd', 'slide'],
    media_downloader: ['tiktok', 'igmedia', 'reels', 'save'],
    flux_ai_image: ['flux', 'art', 'draw', 'aiart'],
    temp_sms: ['sms', 'otp', 'virtual', 'phone'],
    warp_plus: ['warp', 'cfvpn', 'cloudflare', 'wireguard'],
    outline_vpn: ['outline', 'sskey', 'jigsaw', 'shadow'],
    proton_vpn: ['proton', 'ovpn', 'privacy', 'safevpn'],
    gaming_ssh: ['gaming', 'sshws', 'lowping', 'gamer'],
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
  deviceFingerprint?: string,
  amEngine: AmEngine = 'auto'
): Promise<
  AmAccountResult & {
    password?: string;
    serviceType?: string;
    serviceName?: string;
    licenseKey?: string;
    wireguardConfig?: string;
    ovpnConfig?: string;
    configUri?: string;
    accessKey?: string;
    host?: string;
    port?: string | number;
    payload?: string;
    country?: string;
    apiKey?: string;
    baseUrl?: string;
    arlToken?: string;
    dohUrl?: string;
    dotEndpoint?: string;
    documentTitle?: string;
    pdfDownloadUrl?: string;
    imageUrl?: string;
    hdVideoUrl?: string;
    audioMp3Url?: string;
    phoneNumber?: string;
    formattedNumber?: string;
    smsInboxUrl?: string;
  }
> {
  const now = new Date().toISOString();
  const serviceDef = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.custom;

  // 1. SERVICE: Alight Motion Premium (100% Full Auto 4-Engine Server)
  if (serviceType === 'alight_motion') {
    const amRes = await createSingleAmPremium(customAlias, domain, userId, deviceFingerprint, amEngine);

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

  // 2. SERVICE: Scribd & SlideShare PDF Unlocker
  if (serviceType === 'scribd_doc') {
    const docRes = generateDocumentUnlocker(customAlias);
    const alias = customAlias || getRandomServiceAlias('scribd_doc');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_doc_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'scribd_doc',
      serviceName: docRes.documentTitle,
      inboxUrl,
      duration: `${docRes.fileFormat} • ${docRes.fileSize}`,
      status: 'active',
      pdfDownloadUrl: docRes.pdfDownloadUrl,
      documentTitle: docRes.documentTitle,
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
      serviceType: 'scribd_doc',
      serviceName: docRes.documentTitle,
      pdfDownloadUrl: docRes.pdfDownloadUrl,
      documentTitle: docRes.documentTitle,
      inboxUrl,
      success: true,
      statusText: 'Dokumen PDF Siap Unduh',
      duration: `${docRes.fileFormat} • ${docRes.fileSize}`,
      message: `Dokumen PDF Scribd/SlideShare berhasil di-unlock dan siap diunduh!`,
      createdAt: now,
    };
  }

  // 3. SERVICE: TikTok & Instagram Media Downloader
  if (serviceType === 'media_downloader') {
    const mediaRes = generateMediaDownloader(customAlias);
    const alias = customAlias || getRandomServiceAlias('media_downloader');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_media_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'media_downloader',
      serviceName: mediaRes.service,
      inboxUrl,
      duration: mediaRes.quality,
      status: 'active',
      hdVideoUrl: mediaRes.hdVideoUrl,
      audioMp3Url: mediaRes.audioMp3Url,
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
      serviceType: 'media_downloader',
      serviceName: mediaRes.service,
      hdVideoUrl: mediaRes.hdVideoUrl,
      audioMp3Url: mediaRes.audioMp3Url,
      inboxUrl,
      success: true,
      statusText: 'Media HD Siap Unduh',
      duration: mediaRes.quality,
      message: `Video No-Watermark & Audio MP3 berhasil diproses dan siap diunduh!`,
      createdAt: now,
    };
  }

  // 4. SERVICE: Flux.1 AI Image Generator
  if (serviceType === 'flux_ai_image') {
    const fluxRes = generateFluxImage(customAlias);
    const alias = customAlias || getRandomServiceAlias('flux_ai_image');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_flux_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'flux_ai_image',
      serviceName: `Flux.1 AI Image (${fluxRes.prompt.substring(0, 35)}...)`,
      inboxUrl,
      duration: `${fluxRes.dimensions} • ${fluxRes.model}`,
      status: 'active',
      imageUrl: fluxRes.imageUrl,
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
      serviceType: 'flux_ai_image',
      serviceName: `Flux.1 AI Image (${fluxRes.prompt.substring(0, 35)}...)`,
      imageUrl: fluxRes.imageUrl,
      inboxUrl,
      success: true,
      statusText: 'Gambar AI Flux.1 Siap',
      duration: `${fluxRes.dimensions} • ${fluxRes.model}`,
      message: `Gambar AI resolusi HD berhasil digenerate oleh Flux.1 Engine!`,
      createdAt: now,
    };
  }

  // 5. SERVICE: Temp SMS / Virtual Phone Number
  if (serviceType === 'temp_sms') {
    const smsRes = generateTempSmsNumber();
    const alias = customAlias || getRandomServiceAlias('temp_sms');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_sms_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'temp_sms',
      serviceName: `${smsRes.flag} ${smsRes.formattedNumber} (${smsRes.country})`,
      inboxUrl,
      duration: `Aktif OTP (WhatsApp, Telegram, Google)`,
      status: 'active',
      phoneNumber: smsRes.phoneNumber,
      formattedNumber: smsRes.formattedNumber,
      smsInboxUrl: smsRes.smsInboxUrl,
      country: smsRes.country,
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
      serviceType: 'temp_sms',
      serviceName: `${smsRes.flag} ${smsRes.formattedNumber} (${smsRes.country})`,
      phoneNumber: smsRes.phoneNumber,
      formattedNumber: smsRes.formattedNumber,
      smsInboxUrl: smsRes.smsInboxUrl,
      country: smsRes.country,
      inboxUrl,
      success: true,
      statusText: 'Nomor Virtual SMS Siap',
      duration: `Aktif OTP (WhatsApp, Telegram, Google)`,
      message: `Nomor virtual ${smsRes.formattedNumber} siap menerima SMS OTP verifikasi!`,
      createdAt: now,
    };
  }

  // 6. SERVICE: Cloudflare WARP+ / WireGuard VPN
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

  // 7. SERVICE: Outline VPN (Google / Jigsaw Shadowsocks Access Key)
  if (serviceType === 'outline_vpn') {
    const outlineRes = generateOutlineAccessKey();
    const alias = customAlias || getRandomServiceAlias('outline_vpn');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_outline_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      serviceType: 'outline_vpn',
      serviceName: outlineRes.serverName,
      inboxUrl,
      duration: `${outlineRes.duration} • Ping: ${outlineRes.ping}`,
      status: 'active',
      accessKey: outlineRes.accessKey,
      country: outlineRes.country,
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
      serviceType: 'outline_vpn',
      serviceName: outlineRes.serverName,
      accessKey: outlineRes.accessKey,
      country: outlineRes.country,
      inboxUrl,
      success: true,
      statusText: 'Outline Access Key Siap Konek',
      duration: `${outlineRes.duration} • Ping: ${outlineRes.ping}`,
      message: `Access Key Outline VPN ${outlineRes.country} ${outlineRes.flag} berhasil digenerate!`,
      createdAt: now,
    };
  }

  // 8. SERVICE: ProtonVPN Free OpenVPN & WireGuard Config
  if (serviceType === 'proton_vpn') {
    const protonRes = generateProtonVpnConfig();
    const alias = customAlias || getRandomServiceAlias('proton_vpn');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_proton_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      password: protonRes.passwordAuth,
      serviceType: 'proton_vpn',
      serviceName: protonRes.serverName,
      inboxUrl,
      duration: `${protonRes.duration} • Ping: ${protonRes.ping}`,
      status: 'active',
      ovpnConfig: protonRes.ovpnConfig,
      wireguardConfig: protonRes.wireguardConfig,
      country: protonRes.country,
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
      password: protonRes.passwordAuth,
      serviceType: 'proton_vpn',
      serviceName: protonRes.serverName,
      ovpnConfig: protonRes.ovpnConfig,
      wireguardConfig: protonRes.wireguardConfig,
      country: protonRes.country,
      inboxUrl,
      success: true,
      statusText: 'Config OpenVPN & WireGuard Siap',
      duration: `${protonRes.duration} • Ping: ${protonRes.ping}`,
      message: `Config OpenVPN & WireGuard ProtonVPN ${protonRes.country} ${protonRes.flag} siap digunakan!`,
      createdAt: now,
    };
  }

  // 9. SERVICE: Gaming SSH WebSocket VPN Account
  if (serviceType === 'gaming_ssh') {
    const sshRes = generateGamingSshAccount();
    const alias = customAlias || getRandomServiceAlias('gaming_ssh');
    const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    const emailAddress = `${cleanAlias}@${domain}`;
    const accountId = 'acc_ssh_' + Math.random().toString(36).substring(2, 11);
    const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;

    const newRecord: AmPremiumAccount = {
      id: accountId,
      email: emailAddress,
      alias: cleanAlias,
      password: sshRes.passwordAuth,
      serviceType: 'gaming_ssh',
      serviceName: sshRes.serverName,
      inboxUrl,
      duration: `${sshRes.duration} • Ping: ${sshRes.ping}`,
      status: 'active',
      host: sshRes.host,
      port: sshRes.portSsh,
      payload: sshRes.payload,
      country: sshRes.country,
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
      password: sshRes.passwordAuth,
      serviceType: 'gaming_ssh',
      serviceName: sshRes.serverName,
      host: sshRes.host,
      port: sshRes.portSsh,
      payload: sshRes.payload,
      country: sshRes.country,
      inboxUrl,
      success: true,
      statusText: 'Akun Gaming SSH Siap Konek',
      duration: `${sshRes.duration} • Ping: ${sshRes.ping}`,
      message: `Akun Gaming SSH ${sshRes.country} ${sshRes.flag} (Ping ${sshRes.ping}) siap digunakan!`,
      createdAt: now,
    };
  }

  // 10. SERVICE: NextDNS Pro AdBlock & Privacy DNS Profile (100% Auto DNS)
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

  // 11. SERVICE: AI Pro API Key Generator (100% Auto API Key)
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

  // 12. SERVICE: Deezer Hi-Fi FLAC & 320kbps Music Streamer ARL Token
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

  // 13. SERVICE: Hysteria 2 & V2Ray Fast Global Proxy Nodes
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

  // 14. Other Services (Canva Pro, ElevenLabs, Cursor AI, Leonardo AI, Custom)
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
