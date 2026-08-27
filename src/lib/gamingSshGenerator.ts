import crypto from 'crypto';

export interface GamingSshResult {
  success: boolean;
  serverName: string;
  country: string;
  flag: string;
  host: string;
  portSsh: string;
  portWs: string;
  portUdp: string;
  username: string;
  passwordAuth: string;
  payload: string;
  ping: string;
  duration: string;
}

export function generateGamingSshAccount(): GamingSshResult {
  const servers = [
    {
      country: 'Indonesia (Jakarta)',
      flag: '🇮🇩',
      host: 'id1-gaming.openvpn.id',
      ping: '8ms (Zero Lag MLBB/FF)',
    },
    {
      country: 'Singapore (Direct SGIX)',
      flag: '🇸🇬',
      host: 'sg1-gaming.openvpn.id',
      ping: '10ms (Game Booster)',
    },
  ];

  const picked = servers[Math.floor(Math.random() * servers.length)];
  const userNum = Math.floor(Math.random() * 8999) + 1000;
  const username = `dkgamer_${userNum}`;
  const passwordAuth = `GamerPass${Math.floor(Math.random() * 899) + 100}!`;

  return {
    success: true,
    serverName: `Gaming SSH WebSocket ${picked.flag} ${picked.country}`,
    country: picked.country,
    flag: picked.flag,
    host: picked.host,
    portSsh: '22, 443 (SSL), 80 (WS)',
    portWs: '80, 8080, 8880',
    portUdp: '7100, 7200, 7300 (BadVPN UDPGW)',
    username,
    passwordAuth,
    payload: `GET / HTTP/1.1[crlf]Host: ${picked.host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]`,
    ping: picked.ping,
    duration: '30 Hari (Gaming High Speed)',
  };
}
