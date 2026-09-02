import dns from 'dns';
const dnsPromises = dns.promises;

export interface DnsCheckResult {
  domain: string;
  isConfigured: boolean;
  mxStatus: 'valid' | 'missing' | 'warning';
  mxRecords: Array<{ exchange: string; priority: number }>;
  spfStatus: 'valid' | 'missing' | 'warning';
  spfRecord?: string;
  dmarcStatus: 'valid' | 'missing';
  dmarcRecord?: string;
  aRecords: string[];
  recommendations: string[];
  lastChecked: string;
}

// Fallback DoH (DNS over HTTPS) to bypass container/OS DNS resolving issues on Railway/Vercel
async function queryDoh(name: string, type: string): Promise<any[]> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.Answer) ? data.Answer : [];
  } catch {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.Answer) ? data.Answer : [];
    } catch {
      return [];
    }
  }
}

export async function checkDomainDns(domain: string): Promise<DnsCheckResult> {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^@/, '');
  const recommendations: string[] = [];
  let mxStatus: 'valid' | 'missing' | 'warning' = 'missing';
  let mxRecords: Array<{ exchange: string; priority: number }> = [];
  let spfStatus: 'valid' | 'missing' | 'warning' = 'missing';
  let spfRecord: string | undefined;
  let dmarcStatus: 'valid' | 'missing' = 'missing';
  let dmarcRecord: string | undefined;
  let aRecords: string[] = [];

  // 1. Check MX Records (Node DNS + DoH Fallback)
  try {
    const mx = await dnsPromises.resolveMx(cleanDomain);
    mxRecords = mx.sort((a, b) => a.priority - b.priority);
    if (mxRecords.length > 0) {
      mxStatus = 'valid';
    }
  } catch {
    // Query Cloudflare/Google DoH Fallback
    const dohMx = await queryDoh(cleanDomain, 'MX');
    if (dohMx.length > 0) {
      mxRecords = dohMx.map((ans) => {
        const parts = (ans.data || '').trim().split(/\s+/);
        return {
          priority: parseInt(parts[0], 10) || 10,
          exchange: (parts[1] || '').replace(/\.$/, ''),
        };
      }).sort((a, b) => a.priority - b.priority);
      mxStatus = 'valid';
    }
  }

  if (mxRecords.length === 0) {
    mxStatus = 'missing';
    recommendations.push(`MX Record belum terdeteksi untuk ${cleanDomain}. Pastikan fitur Cloudflare Email Routing atau MX server sudah aktif.`);
  }

  // 2. Check SPF (TXT records)
  try {
    const txts = await dnsPromises.resolveTxt(cleanDomain);
    const flattened = txts.map((t) => t.join(''));
    const spf = flattened.find((t) => t.startsWith('v=spf1'));
    if (spf) {
      spfStatus = 'valid';
      spfRecord = spf;
    }
  } catch {
    const dohTxt = await queryDoh(cleanDomain, 'TXT');
    const spfAns = dohTxt.find((ans) => (ans.data || '').includes('v=spf1'));
    if (spfAns) {
      spfStatus = 'valid';
      spfRecord = (spfAns.data || '').replace(/^"|"$/g, '');
    }
  }

  if (!spfRecord) {
    spfStatus = 'missing';
    recommendations.push(`Disarankan menambahkan TXT Record SPF: "v=spf1 include:_spf.mx.cloudflare.net ~all" agar email lolos filter spam.`);
  }

  // 3. Check DMARC (_dmarc.domain)
  try {
    const dmarcTxts = await dnsPromises.resolveTxt(`_dmarc.${cleanDomain}`);
    const flattened = dmarcTxts.map((t) => t.join(''));
    const dmarc = flattened.find((t) => t.startsWith('v=DMARC1'));
    if (dmarc) {
      dmarcStatus = 'valid';
      dmarcRecord = dmarc;
    }
  } catch {
    const dohDmarc = await queryDoh(`_dmarc.${cleanDomain}`, 'TXT');
    const dmarcAns = dohDmarc.find((ans) => (ans.data || '').includes('v=DMARC1'));
    if (dmarcAns) {
      dmarcStatus = 'valid';
      dmarcRecord = (dmarcAns.data || '').replace(/^"|"$/g, '');
    }
  }

  // 4. Check A Records
  try {
    aRecords = await dnsPromises.resolve4(cleanDomain);
  } catch {
    const dohA = await queryDoh(cleanDomain, 'A');
    aRecords = dohA.map((ans) => ans.data).filter(Boolean);
  }

  const isConfigured = mxStatus === 'valid';

  return {
    domain: cleanDomain,
    isConfigured,
    mxStatus,
    mxRecords,
    spfStatus,
    spfRecord,
    dmarcStatus,
    dmarcRecord,
    aRecords,
    recommendations,
    lastChecked: new Date().toISOString(),
  };
}
