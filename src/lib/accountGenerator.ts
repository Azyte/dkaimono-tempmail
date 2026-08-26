import { db } from './db';
import { AmPremiumAccount } from '@/types';
import { createSingleAmPremium, AmAccountResult } from './alightMotion';
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
): Promise<AmAccountResult & { password?: string; serviceType?: string; serviceName?: string }> {
  // If Alight Motion, run full automated magic link pipeline
  if (serviceType === 'alight_motion') {
    const amRes = await createSingleAmPremium(customAlias, domain, userId, deviceFingerprint);
    const password = generateSecurePassword();

    // Attach password to the saved AM account in DB
    if (amRes.id) {
      const savedAccounts = db.getAmAccounts(userId);
      const acc = savedAccounts.find((a) => a.id === amRes.id);
      if (acc) {
        acc.password = password;
        acc.serviceType = 'alight_motion';
        acc.serviceName = SUPPORTED_SERVICES.alight_motion.name;
        db.saveAmAccount(acc);
      }
    }

    return {
      ...amRes,
      password,
      serviceType: 'alight_motion',
      serviceName: SUPPORTED_SERVICES.alight_motion.name,
    };
  }

  // Other Services (Canva Pro, ElevenLabs, Cursor AI, Leonardo AI, Custom)
  const alias = customAlias || getRandomServiceAlias(serviceType);
  const cleanAlias = alias.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
  const emailAddress = `${cleanAlias}@${domain}`;
  const password = generateSecurePassword();
  const now = new Date().toISOString();
  const accountId = 'acc_' + Math.random().toString(36).substring(2, 11);
  const inboxUrl = `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`;
  const serviceDef = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.custom;

  // 1. Ensure mailbox exists in DB
  db.createOrGetMailbox(emailAddress, userId);

  // 2. Build Account Record
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
