export interface ProxyNodeResult {
  id: string;
  serverName: string;
  protocol: 'hysteria2' | 'vless' | 'vmess' | 'shadowsocks' | 'trojan';
  country: string;
  flag: string;
  configUri: string;
  ping: string;
  expires: string;
  speed: string;
}

export function generateFastProxyNodes(): ProxyNodeResult[] {
  const nodes = [
    {
      id: 'node_sg_01',
      serverName: '🇸🇬 SG-Hysteria2-Gaming-LowPing-01',
      protocol: 'hysteria2' as const,
      country: 'Singapore',
      flag: '🇸🇬',
      configUri: 'hy2://dkaimono-sg-hy2@sg1.freevpn.me:443?insecure=1&sni=sg1.freevpn.me#🇸🇬+DKAIMONO-SG-HYSTERIA2-LOW-PING',
      ping: '8ms (Ultra Fast)',
      speed: '1 Gbps Dedicated',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      id: 'node_id_02',
      serverName: '🇮🇩 ID-Jakarta-Telkom-Direct-02',
      protocol: 'vless' as const,
      country: 'Indonesia',
      flag: '🇮🇩',
      configUri: 'vless://dkaimono-id-vip-02@id1.openvpn.id:443?encryption=none&security=tls&type=ws&host=id1.openvpn.id&path=%2Fvless-ws#🇮🇩+DKAIMONO-JAKARTA-DIRECT-WS',
      ping: '12ms',
      speed: '500 Mbps Local',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      id: 'node_jp_03',
      serverName: '🇯🇵 JP-Tokyo-FastStream-VIP-03',
      protocol: 'vmess' as const,
      country: 'Japan',
      flag: '🇯🇵',
      configUri: 'vmess://eyJhZGQiOiJqcDEub3BlbnZwbi5pZCIsImFpZCI6IjAiLCJob3N0IjoianAxLm9wZW52cG4uaWQiLCJpZCI6ImRrYWltb25vLWpwLXZpcC0wMyIsIm5ldCI6IndzIiwicGF0aCI6Ii92bWVzcy13cyIsInBvcnQiOiI0NDMiLCJwcyI6IvCfh6/wn4evIERLQUlNT05PLVRPQ0tZTy1GQVNUZXNzIiwidGxzIjoidGxzIiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9',
      ping: '65ms',
      speed: '1 Gbps Cloud',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      id: 'node_us_04',
      serverName: '🇺🇸 US-LosAngeles-Netflix-Bypass-04',
      protocol: 'vless' as const,
      country: 'United States',
      flag: '🇺🇸',
      configUri: 'vless://dkaimono-us-vip-04@us1.freevpn.me:443?encryption=none&security=tls&type=ws&host=us1.freevpn.me&path=%2Fvless-ws#🇺🇸+DKAIMONO-USA-STREAMING-VIP',
      ping: '140ms',
      speed: '1 Gbps Unmetered',
      expires: '30 Hari (Auto-Renew)',
    },
    {
      id: 'node_sg_05',
      serverName: '🇸🇬 SG-Shadowsocks-UDP-05',
      protocol: 'shadowsocks' as const,
      country: 'Singapore',
      flag: '🇸🇬',
      configUri: 'ss://YWVzLTI1Ni1nY206ZGthaW1vbm8tc2ctc3M=@sg2.openvpn.id:8388#🇸🇬+DKAIMONO-SG-SHADOWSOCKS-GAMING',
      ping: '15ms',
      speed: '1 Gbps Gaming',
      expires: '30 Hari (Auto-Renew)',
    },
  ];

  return nodes;
}

/**
 * Generate standard Base64 subscription string
 * (Compatible with v2rayNG, Nekobox, Shadowrocket, Quantumult X, Clash)
 */
export function generateBase64Subscription(): string {
  const nodes = generateFastProxyNodes();
  const rawUris = nodes.map((n) => n.configUri).join('\n');
  return Buffer.from(rawUris).toString('base64');
}

/**
 * Generate Clash Meta / Mihomo YAML Configuration
 */
export function generateClashYamlConfig(): string {
  return `port: 7890
socks-port: 7891
allow-lan: true
mode: Rule
log-level: info
external-controller: 127.0.0.1:9090

proxies:
  - name: "🇸🇬 SG-Hysteria2-Gaming"
    type: hysteria2
    server: sg1.freevpn.me
    port: 443
    password: dkaimono-sg-hy2
    sni: sg1.freevpn.me
    skip-cert-verify: true

  - name: "🇮🇩 ID-Jakarta-VLESS"
    type: vless
    server: id1.openvpn.id
    port: 443
    uuid: dkaimono-id-vip-02
    tls: true
    network: ws
    ws-opts:
      path: /vless-ws
      headers:
        Host: id1.openvpn.id

  - name: "🇺🇸 US-LosAngeles-VLESS"
    type: vless
    server: us1.freevpn.me
    port: 443
    uuid: dkaimono-us-vip-04
    tls: true
    network: ws
    ws-opts:
      path: /vless-ws
      headers:
        Host: us1.freevpn.me

proxy-groups:
  - name: "🚀 PROXY"
    type: select
    proxies:
      - "AUTO - LOW PING"
      - "🇸🇬 SG-Hysteria2-Gaming"
      - "🇮🇩 ID-Jakarta-VLESS"
      - "🇺🇸 US-LosAngeles-VLESS"
      - DIRECT

  - name: "AUTO - LOW PING"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
      - "🇸🇬 SG-Hysteria2-Gaming"
      - "🇮🇩 ID-Jakarta-VLESS"
      - "🇺🇸 US-LosAngeles-VLESS"

rules:
  - MATCH,🚀 PROXY
`;
}
