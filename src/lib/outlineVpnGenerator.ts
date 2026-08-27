import crypto from 'crypto';

export interface OutlineKeyResult {
  success: boolean;
  serverName: string;
  country: string;
  flag: string;
  accessKey: string;
  port: number;
  cipher: string;
  ping: string;
  duration: string;
  clientUrl: string;
}

export function generateOutlineAccessKey(countryCode?: string): OutlineKeyResult {
  const servers = [
    {
      country: 'Singapore',
      flag: '🇸🇬',
      host: 'sg-outline.openvpn.id',
      port: 8443,
      cipher: 'chacha20-ietf-poly1305',
      ping: '8ms (Ultra Fast)',
    },
    {
      country: 'Indonesia (Jakarta)',
      flag: '🇮🇩',
      host: 'id-outline.openvpn.id',
      port: 8443,
      cipher: 'chacha20-ietf-poly1305',
      ping: '11ms (Local Gaming)',
    },
    {
      country: 'Japan (Tokyo)',
      flag: '🇯🇵',
      host: 'jp-outline.freevpn.me',
      port: 9443,
      cipher: 'aes-256-gcm',
      ping: '62ms',
    },
    {
      country: 'United States (Los Angeles)',
      flag: '🇺🇸',
      host: 'us-outline.freevpn.me',
      port: 9443,
      cipher: 'aes-256-gcm',
      ping: '145ms (Streaming Netflix/Hulu)',
    },
    {
      country: 'Germany (Frankfurt)',
      flag: '🇩🇪',
      host: 'de-outline.freevpn.me',
      port: 8443,
      cipher: 'chacha20-ietf-poly1305',
      ping: '160ms (EU Privacy)',
    },
  ];

  const picked = servers[Math.floor(Math.random() * servers.length)];
  const secretKey = crypto.randomBytes(16).toString('base64url');
  const credentials = Buffer.from(`${picked.cipher}:${secretKey}`).toString('base64');
  const serverTag = encodeURIComponent(`${picked.flag} DKAIMONO-${picked.country.toUpperCase()}-VIP`);
  const accessKey = `ss://${credentials}@${picked.host}:${picked.port}#${serverTag}`;

  return {
    success: true,
    serverName: `Outline ${picked.flag} ${picked.country}`,
    country: picked.country,
    flag: picked.flag,
    accessKey,
    port: picked.port,
    cipher: picked.cipher,
    ping: picked.ping,
    duration: '30 Hari (Unlimited Bandwidth)',
    clientUrl: 'https://getoutline.org/get-started/#step-3',
  };
}
