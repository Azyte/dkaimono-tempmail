export interface LiveSmsMessage {
  id: string;
  from: string;
  body: string;
  otpCode?: string;
  serviceDetected?: string;
  receivedTime: string;
}

export interface LivePhoneNumber {
  id: string;
  number: string;
  rawNumber: string;
  country: string;
  countryCode: string;
  flag: string;
  status: 'online' | 'busy';
  activeMessages: LiveSmsMessage[];
  updatedAt: string;
}

export function extractOtpFromMessage(text: string): { otp?: string; service?: string } {
  // Common OTP regex patterns
  const otpMatch = text.match(/\b(?:\d{4,8}|[A-Z0-9]{5,8})\b/i);
  let service: string | undefined;

  const lower = text.toLowerCase();
  if (lower.includes('whatsapp')) service = 'WhatsApp';
  else if (lower.includes('telegram')) service = 'Telegram';
  else if (lower.includes('google') || lower.includes('g-')) service = 'Google';
  else if (lower.includes('tiktok')) service = 'TikTok';
  else if (lower.includes('shopee')) service = 'Shopee';
  else if (lower.includes('facebook') || lower.includes('meta')) service = 'Facebook';
  else if (lower.includes('discord')) service = 'Discord';
  else if (lower.includes('microsoft')) service = 'Microsoft';
  else if (lower.includes('apple')) service = 'Apple';
  else if (lower.includes('netflix')) service = 'Netflix';
  else if (lower.includes('spotify')) service = 'Spotify';

  return {
    otp: otpMatch ? otpMatch[0] : undefined,
    service,
  };
}

export function getLivePhoneNumbersDatabase(): LivePhoneNumber[] {
  const now = new Date();
  const formatTimeAgo = (minutes: number) => {
    const t = new Date(now.getTime() - minutes * 60000);
    return t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return [
    {
      id: 'num_us_01',
      number: '+1 (206) 555-0194',
      rawNumber: '12065550194',
      country: 'United States',
      countryCode: '+1',
      flag: '🇺🇸',
      status: 'online',
      updatedAt: 'Baru saja',
      activeMessages: [
        {
          id: 'msg_us_1',
          from: 'WhatsApp',
          body: 'Your WhatsApp Business code: 492-817. Do not share this code with anyone.',
          otpCode: '492817',
          serviceDetected: 'WhatsApp',
          receivedTime: formatTimeAgo(1),
        },
        {
          id: 'msg_us_2',
          from: 'Telegram',
          body: 'Telegram code: 83912. You can also tap this link to log in: https://t.me/login',
          otpCode: '83912',
          serviceDetected: 'Telegram',
          receivedTime: formatTimeAgo(4),
        },
        {
          id: 'msg_us_3',
          from: 'Google',
          body: 'G-728194 is your Google verification code for account recovery.',
          otpCode: '728194',
          serviceDetected: 'Google',
          receivedTime: formatTimeAgo(9),
        },
      ],
    },
    {
      id: 'num_uk_02',
      number: '+44 7911 123456',
      rawNumber: '447911123456',
      country: 'United Kingdom',
      countryCode: '+44',
      flag: '🇬🇧',
      status: 'online',
      updatedAt: 'Aktif',
      activeMessages: [
        {
          id: 'msg_uk_1',
          from: 'TikTok',
          body: '[TikTok] 501928 is your verification code. Valid for 5 minutes.',
          otpCode: '501928',
          serviceDetected: 'TikTok',
          receivedTime: formatTimeAgo(2),
        },
        {
          id: 'msg_uk_2',
          from: 'Discord',
          body: 'Your Discord security verification code is: 938471',
          otpCode: '938471',
          serviceDetected: 'Discord',
          receivedTime: formatTimeAgo(8),
        },
      ],
    },
    {
      id: 'num_id_03',
      number: '+62 821-9482-1093',
      rawNumber: '6282194821093',
      country: 'Indonesia',
      countryCode: '+62',
      flag: '🇮🇩',
      status: 'online',
      updatedAt: 'Aktif',
      activeMessages: [
        {
          id: 'msg_id_1',
          from: 'Shopee',
          body: 'Kode OTP Shopee Anda adalah 839201. JANGAN BERIKAN KODE INI KE SIAPAPUN TERMASUK PIHAK SHOPEE.',
          otpCode: '839201',
          serviceDetected: 'Shopee',
          receivedTime: formatTimeAgo(3),
        },
        {
          id: 'msg_id_2',
          from: 'GoPay',
          body: '7192 adalah kode verifikasi login Anda. Berlaku selama 2 menit.',
          otpCode: '7192',
          serviceDetected: 'GoPay',
          receivedTime: formatTimeAgo(12),
        },
      ],
    },
    {
      id: 'num_de_04',
      number: '+49 1522 3456789',
      rawNumber: '4915223456789',
      country: 'Germany',
      countryCode: '+49',
      flag: '🇩🇪',
      status: 'online',
      updatedAt: 'Aktif',
      activeMessages: [
        {
          id: 'msg_de_1',
          from: 'Netflix',
          body: 'Netflix: Your temporary access code is 638192.',
          otpCode: '638192',
          serviceDetected: 'Netflix',
          receivedTime: formatTimeAgo(5),
        },
      ],
    },
  ];
}
