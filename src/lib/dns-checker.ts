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

  // 1. Check MX Records
  try {
    const mx = await dnsPromises.resolveMx(cleanDomain);
    mxRecords = mx.sort((a, b) => a.priority - b.priority);
    if (mxRecords.length > 0) {
      mxStatus = 'valid';
    } else {
      mxStatus = 'missing';
      recommendations.push('Tambahkan MX Record di DNS registrar domain Anda (misal Cloudflare / Hostinger / Niagahoster).');
    }
  } catch (err: any) {
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      mxStatus = 'missing';
      recommendations.push(`MX Record belum ditemukan untuk ${cleanDomain}. Pastikan sudah diarahkan ke server email atau Cloudflare Email Routing.`);
    } else {
      mxStatus = 'warning';
      recommendations.push(`Gagal query MX: ${err.message}`);
    }
  }

  // 2. Check SPF (TXT records)
  try {
    const txts = await dnsPromises.resolveTxt(cleanDomain);
    const flattened = txts.map(t => t.join(''));
    const spf = flattened.find(t => t.startsWith('v=spf1'));
    if (spf) {
      spfStatus = 'valid';
      spfRecord = spf;
    } else {
      spfStatus = 'missing';
      recommendations.push(`Disarankan menambahkan TXT Record SPF: "v=spf1 ~all" agar email tidak mudah di-reject server pengirim.`);
    }
  } catch (err) {
    spfStatus = 'missing';
  }

  // 3. Check DMARC (_dmarc.domain)
  try {
    const dmarcTxts = await dnsPromises.resolveTxt(`_dmarc.${cleanDomain}`);
    const flattened = dmarcTxts.map(t => t.join(''));
    const dmarc = flattened.find(t => t.startsWith('v=DMARC1'));
    if (dmarc) {
      dmarcStatus = 'valid';
      dmarcRecord = dmarc;
    }
  } catch (err) {
    dmarcStatus = 'missing';
  }

  // 4. Check A Records
  try {
    aRecords = await dnsPromises.resolve4(cleanDomain);
  } catch (err) {
    // Optional
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
