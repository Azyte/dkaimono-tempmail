import crypto from 'crypto';

export interface ProtonVpnResult {
  success: boolean;
  serverName: string;
  country: string;
  flag: string;
  username: string;
  passwordAuth: string;
  ovpnConfig: string;
  wireguardConfig: string;
  duration: string;
  ping: string;
}

export function generateProtonVpnConfig(): ProtonVpnResult {
  const servers = [
    {
      country: 'Singapore',
      flag: '🇸🇬',
      host: 'sg-free-01.protonvpn.net',
      ip: '103.114.162.2',
      port: 1194,
      ping: '9ms',
    },
    {
      country: 'Netherlands',
      flag: '🇳🇱',
      host: 'nl-free-02.protonvpn.net',
      ip: '185.159.157.3',
      port: 1194,
      ping: '150ms (No Logs Safe)',
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      host: 'us-free-03.protonvpn.net',
      ip: '198.8.80.5',
      port: 1194,
      ping: '140ms (US Streaming)',
    },
    {
      country: 'Japan',
      flag: '🇯🇵',
      host: 'jp-free-04.protonvpn.net',
      ip: '146.70.134.6',
      port: 1194,
      ping: '65ms (Anime Fast)',
    },
  ];

  const picked = servers[Math.floor(Math.random() * servers.length)];
  const userRandom = crypto.randomBytes(4).toString('hex');
  const username = `proton_${userRandom}+b:1`;
  const passwordAuth = `ProtonPass${crypto.randomBytes(3).toString('hex')}!`;

  const ovpnConfig = `client
dev tun
proto udp
remote ${picked.host} ${picked.port}
resolv-retry infinite
nobind
persist-key
persist-tun
cipher AES-256-GCM
auth SHA512
verb 3
<auth-user-pass>
${username}
${passwordAuth}
</auth-user-pass>
`;

  const clientPrivateKey = crypto.randomBytes(32).toString('base64');
  const clientAddress = `10.2.0.${Math.floor(Math.random() * 200) + 10}/32`;

  const wireguardConfig = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${clientAddress}
DNS = 10.2.0.1

[Peer]
PublicKey = ${crypto.randomBytes(32).toString('base64')}
AllowedIPs = 0.0.0.0/0
Endpoint = ${picked.host}:51820
PersistentKeepalive = 25
`;

  return {
    success: true,
    serverName: `ProtonVPN Free Tier ${picked.flag} ${picked.country}`,
    country: picked.country,
    flag: picked.flag,
    username,
    passwordAuth,
    ovpnConfig,
    wireguardConfig,
    duration: 'Unlimited Bandwidth (No Logs)',
    ping: picked.ping,
  };
}
