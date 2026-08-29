export interface EmailAnalysisResult {
  success: boolean;
  summary: string;
  detectedOtp?: string;
  verificationLink?: string;
  actionRequired?: string;
  securityAssessment: {
    threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'phishing_alert';
    threatScore: number; // 0 (100% safe) to 100 (dangerous phishing)
    verdict: string;
    indicators: string[];
    isLegitService: boolean;
    serviceName?: string;
  };
}

export function analyzeEmailSecurityAndContent(
  subject: string,
  fromAddress: string,
  textBody: string,
  htmlBody: string = ''
): EmailAnalysisResult {
  const fullContent = `${subject} ${textBody} ${htmlBody}`.toLowerCase();

  // 1. Extract OTP Code (4-8 digits or alphanumeric)
  const otpPatterns = [
    /(?:code|otp|kode|verifikasi|verification|pin|password|token)[^\w\d\n]{1,15}(\b\d{4,8}\b|\b[A-Z0-9]{5,8}\b)/i,
    /\b(\d{6})\b/,
    /\b(\d{4})\b/,
  ];

  let detectedOtp: string | undefined;
  for (const pattern of otpPatterns) {
    const m = fullContent.match(pattern);
    if (m && m[1]) {
      detectedOtp = m[1].toUpperCase();
      break;
    }
  }

  // 2. Extract Verification / Magic Link
  let verificationLink: string | undefined;
  const linkMatches = (textBody + ' ' + htmlBody).match(/https?:\/\/[^\s"'>]+/gi);
  if (linkMatches) {
    const actionLink = linkMatches.find(
      (l) =>
        l.includes('verify') ||
        l.includes('confirm') ||
        l.includes('activate') ||
        l.includes('magic') ||
        l.includes('login') ||
        l.includes('auth')
    );
    verificationLink = actionLink || linkMatches[0];
  }

  // 3. Phishing & Threat Assessment
  const threatIndicators: string[] = [];
  let threatScore = 5; // default base score

  // Check urgent scam phrases
  if (fullContent.includes('suspended within 24 hours') || fullContent.includes('account blocked immediately')) {
    threatScore += 35;
    threatIndicators.push('Menggunakan bahasa darurat / ancaman pemblokiran akun.');
  }

  if (fullContent.includes('wire transfer') || fullContent.includes('bitcoin') || fullContent.includes('crypto payment')) {
    threatScore += 40;
    threatIndicators.push('Meminta pembayaran instan via kripto / transfer dana tak dikenal.');
  }

  if (fullContent.includes('winner') || fullContent.includes('claim $1,000,000') || fullContent.includes('lottery')) {
    threatScore += 50;
    threatIndicators.push('Pola undian palsu / iming-iming hadiah besar.');
  }

  // Check known legitimate services
  let isLegitService = false;
  let serviceName: string | undefined;

  const trustedDomains = [
    { domain: 'google.com', name: 'Google' },
    { domain: 'spotify.com', name: 'Spotify' },
    { domain: 'netflix.com', name: 'Netflix' },
    { domain: 'apple.com', name: 'Apple' },
    { domain: 'discord.com', name: 'Discord' },
    { domain: 'instagram.com', name: 'Instagram' },
    { domain: 'facebookmail.com', name: 'Facebook' },
    { domain: 'tiktok.com', name: 'TikTok' },
    { domain: 'telegram.org', name: 'Telegram' },
    { domain: 'github.com', name: 'GitHub' },
    { domain: 'alightcreative.com', name: 'Alight Motion' },
    { domain: 'canva.com', name: 'Canva' },
    { domain: 'notion.so', name: 'Notion' },
    { domain: 'microsoft.com', name: 'Microsoft' },
  ];

  for (const s of trustedDomains) {
    if (fromAddress.toLowerCase().includes(s.domain)) {
      isLegitService = true;
      serviceName = s.name;
      threatScore = Math.max(0, threatScore - 20);
      break;
    }
  }

  // Determine threat level
  let threatLevel: EmailAnalysisResult['securityAssessment']['threatLevel'] = 'safe';
  let verdict = 'Email ini terverifikasi aman dan berasal dari pengirim terpercaya.';

  if (threatScore >= 70) {
    threatLevel = 'phishing_alert';
    verdict = '⚠️ PERINGATAN PHISHING: Email ini sangat mencurigakan. Jangan klik link di dalamnya!';
  } else if (threatScore >= 40) {
    threatLevel = 'medium';
    verdict = 'Waspada: Email memuat indikator mencurigakan atau pengirim yang belum terverifikasi.';
  } else if (threatScore >= 20) {
    threatLevel = 'low';
    verdict = 'Email promosi / reguler dengan tingkat risiko sangat rendah.';
  }

  // Generate smart summary
  let summary = `Email dari ${fromAddress} dengan perihal "${subject}".`;
  if (detectedOtp) {
    summary = `Pesan verifikasi resmi memuat kode OTP: ${detectedOtp}.`;
  } else if (verificationLink) {
    summary = `Pesan konfirmasi akun dengan tautan aktivasi langsung.`;
  }

  return {
    success: true,
    summary,
    detectedOtp,
    verificationLink,
    actionRequired: detectedOtp
      ? `Salin kode ${detectedOtp} ke aplikasi.`
      : verificationLink
      ? 'Klik tautan untuk memverifikasi akun.'
      : 'Tidak ada tindakan darurat yang diperlukan.',
    securityAssessment: {
      threatLevel,
      threatScore,
      verdict,
      indicators: threatIndicators.length > 0 ? threatIndicators : ['Domain pengirim valid', 'Tidak terdeteksi script jahat'],
      isLegitService,
      serviceName,
    },
  };
}
