export interface ProxyNodeResult {
  success: boolean;
  serverName: string;
  protocol: 'vless' | 'vmess' | 'shadowsocks' | 'trojan';
  country: string;
  flag: string;
  configUri: string;
  clashConfig?: string;
  ping: string;
  expires: string;
}

export function generateFastProxyNodes(): ProxyNodeResult[] {
  const nodes = [
    {
      serverName: 'SG-Fast-Premium-VIP-01',
      protocol: 'vless' as const,
      country: 'Singapore',
      flag: '🇸🇬',
      configUri: 'vless://dkaimono-sg-vip-01@sg1.freevpn.me:443?encryption=none&security=tls&type=ws&host=sg1.freevpn.me&path=%2Fvless-ws#🇸🇬+DKAIMONO-SG-VIP-FAST',
      ping: '18ms',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      serverName: 'ID-Jakarta-Hyper-VIP-02',
      protocol: 'vless' as const,
      country: 'Indonesia',
      flag: '🇮🇩',
      configUri: 'vless://dkaimono-id-vip-02@id1.openvpn.id:443?encryption=none&security=tls&type=ws&host=id1.openvpn.id&path=%2Fvless-ws#🇮🇩+DKAIMONO-JAKARTA-LOW-PING',
      ping: '12ms',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      serverName: 'JP-Tokyo-Anime-VIP-03',
      protocol: 'vmess' as const,
      country: 'Japan',
      flag: '🇯🇵',
      configUri: 'vmess://eyJhZGQiOiJqcDEub3BlbnZwbi5pZCIsImFpZCI6IjAiLCJob3N0IjoianAxLm9wZW52cG4uaWQiLCJpZCI6ImRrYWltb25vLWpwLXZpcC0wMyIsIm5ldCI6IndzIiwicGF0aCI6Ii92bWVzcy13cyIsInBvcnQiOiI0NDMiLCJwcyI6IvCfh6/wn4evIERLQUlNT05PLVRPQ0tZTy1GQVNUZXNzIiwidGxzIjoidGxzIiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9',
      ping: '65ms',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      serverName: 'US-LosAngeles-Stream-VIP-04',
      protocol: 'vless' as const,
      country: 'United States',
      flag: '🇺🇸',
      configUri: 'vless://dkaimono-us-vip-04@us1.freevpn.me:443?encryption=none&security=tls&type=ws&host=us1.freevpn.me&path=%2Fvless-ws#🇺🇸+DKAIMONO-USA-STREAMING-VIP',
      ping: '140ms',
      expires: '30 Hari (Auto-Renew)',
    },
  ];

  return nodes.map(n => ({
    success: true,
    ...n,
  }));
}
