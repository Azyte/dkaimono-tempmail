import crypto from 'crypto';

export interface NextDnsProfileResult {
  success: boolean;
  profileId: string;
  profileName: string;
  dohUrl: string;
  dotEndpoint: string;
  privateDnsAndroid: string;
  ipv4Primary: string;
  ipv4Secondary: string;
  quota: string;
  features: string[];
}

export function generateNextDnsProfile(customName?: string): NextDnsProfileResult {
  // Generate random 6-character hex profile ID
  const hex = crypto.randomBytes(3).toString('hex');
  const profileId = `dk${hex}`;
  const profileName = customName || `DKAIMONO-ADBLOCK-${hex.toUpperCase()}`;

  return {
    success: true,
    profileId,
    profileName,
    dohUrl: `https://dns.nextdns.io/${profileId}`,
    dotEndpoint: `${profileId}.dns.nextdns.io`,
    privateDnsAndroid: `${profileId}.dns.nextdns.io`,
    ipv4Primary: '45.90.28.0',
    ipv4Secondary: '45.90.30.0',
    quota: '300.000 Queries / Bulan (Free Pro Tier)',
    features: [
      '🛡️ 100% Blokir Iklan Web & Aplikasi (AdBlock)',
      '🚫 Blokir Pelacak & Spyware (Anti-Tracking)',
      '🔒 Perlindungan Phishing & Malware (Threat Intelligence)',
      '⚡ Kecepatan Ultra Rendah (Ultra Low Latency Anycast)',
      '📱 Kompatibel Android Private DNS, iOS MobileConfig, & Windows DoH',
    ],
  };
}
