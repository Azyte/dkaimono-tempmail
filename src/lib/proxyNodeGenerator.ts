export interface ProxyNodeResult {
  success: boolean;
  serverName: string;
  protocol: 'hysteria2' | 'vless' | 'vmess' | 'shadowsocks' | 'trojan';
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
      serverName: 'SG-Hysteria2-Extreme-VIP-01',
      protocol: 'hysteria2' as const,
      country: 'Singapore',
      flag: '🇸🇬',
      configUri: 'hy2://dkaimono-sg-hy2@sg1.freevpn.me:443?insecure=1&sni=sg1.freevpn.me#🇸🇬+DKAIMONO-SG-HYSTERIA2-EXTREME-LOW-PING',
      ping: '8ms (Ultra Fast)',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      serverName: 'ID-Jakarta-LowPing-VIP-02',
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
    {
      serverName: 'SG-Shadowsocks-Fast-VIP-05',
      protocol: 'shadowsocks' as const,
      country: 'Singapore',
      flag: '🇸🇬',
      configUri: 'ss://YWVzLTI1Ni1nY206ZGthaW1vbm8tc2ctc3M=@sg2.openvpn.id:8388#🇸🇬+DKAIMONO-SG-SHADOWSOCKS-GAMING',
      ping: '15ms',
      expires: '30 Hari (Auto-Renew)',
    },
  ];

  return nodes.map((n) => ({
    success: true,
    ...n,
  }));
}
