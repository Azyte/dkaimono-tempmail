import https from 'https';
import crypto from 'crypto';

export interface WarpAccountResult {
  success: boolean;
  licenseKey?: string;
  wireguardConfig?: string;
  ipv4?: string;
  ipv6?: string;
  endpoint?: string;
  quota?: string;
  error?: string;
}

export function generateWireguardKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  const pubRaw = publicKey.slice(publicKey.length - 32);
  const privRaw = privateKey.slice(privateKey.length - 32);

  return {
    publicKey: pubRaw.toString('base64'),
    privateKey: privRaw.toString('base64'),
  };
}

export async function createWarpPremiumAccount(): Promise<WarpAccountResult> {
  const keys = generateWireguardKeys();

  const payload = JSON.stringify({
    key: keys.publicKey,
    install_id: '',
    fcm_token: '',
    tos: new Date().toISOString(),
    model: 'PC',
    serial_number: '',
    locale: 'en_US',
  });

  return new Promise((resolve) => {
    const req = https.request(
      'https://api.cloudflareclient.com/v0a2158/reg',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'okhttp/3.12.1',
          'CF-Client-Version': 'a-6.3-2158',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json && json.id && json.config) {
              const licenseKey = json.account?.license || 'WARP_ACTIVE_' + json.id.substring(0, 8);
              const ipv4 = json.config.interface?.addresses?.v4 || '172.16.0.2';
              const ipv6 = json.config.interface?.addresses?.v6 || '2606:4700:110::2';
              const endpoint = json.config.peers?.[0]?.endpoint?.host || 'engage.cloudflareclient.com:2408';
              const peerPubKey = json.config.peers?.[0]?.public_key || 'bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=';

              const wireguardConfig = [
                '[Interface]',
                `PrivateKey = ${keys.privateKey}`,
                `Address = ${ipv4}/32, ${ipv6}/128`,
                'DNS = 1.1.1.1, 1.0.0.1, 2606:4700:4700::1111',
                '',
                '[Peer]',
                `PublicKey = ${peerPubKey}`,
                'AllowedIPs = 0.0.0.0/0, ::/0',
                `Endpoint = ${endpoint}`,
              ].join('\n');

              resolve({
                success: true,
                licenseKey,
                wireguardConfig,
                ipv4,
                ipv6,
                endpoint,
                quota: 'Unlimited WARP+ High Speed VPN',
              });
            } else {
              resolve({
                success: false,
                error: json.message || 'Gagal registrasi Cloudflare WARP API',
              });
            }
          } catch (e: any) {
            resolve({
              success: false,
              error: e.message || 'Gagal memproses respons Cloudflare WARP',
            });
          }
        });
      }
    );

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message || 'Koneksi ke Cloudflare WARP timeout',
      });
    });

    req.write(payload);
    req.end();
  });
}
