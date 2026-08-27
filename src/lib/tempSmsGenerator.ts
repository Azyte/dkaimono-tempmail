export interface TempSmsResult {
  success: boolean;
  country: string;
  flag: string;
  phoneNumber: string;
  formattedNumber: string;
  smsInboxUrl: string;
  supportedApps: string[];
  instructions: string[];
}

export function generateTempSmsNumber(countryCode?: string): TempSmsResult {
  const numbers = [
    {
      country: 'United States',
      flag: '🇺🇸',
      code: '+1',
      number: `+1 (${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 899) + 100}-${Math.floor(Math.random() * 8999) + 1000}`,
      raw: `1${Math.floor(Math.random() * 8000000000) + 2000000000}`,
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      code: '+44',
      number: `+44 7${Math.floor(Math.random() * 899) + 100} ${Math.floor(Math.random() * 899999) + 100000}`,
      raw: `447${Math.floor(Math.random() * 800000000) + 100000000}`,
    },
    {
      country: 'Indonesia',
      flag: '🇮🇩',
      code: '+62',
      number: `+62 8${Math.floor(Math.random() * 89) + 11}-${Math.floor(Math.random() * 8999) + 1000}-${Math.floor(Math.random() * 8999) + 1000}`,
      raw: `628${Math.floor(Math.random() * 800000000) + 100000000}`,
    },
    {
      country: 'Malaysia',
      flag: '🇲🇾',
      code: '+60',
      number: `+60 1${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 899) + 100} ${Math.floor(Math.random() * 8999) + 1000}`,
      raw: `601${Math.floor(Math.random() * 80000000) + 10000000}`,
    },
  ];

  const picked = numbers[Math.floor(Math.random() * numbers.length)];

  return {
    success: true,
    country: picked.country,
    flag: picked.flag,
    phoneNumber: picked.raw,
    formattedNumber: picked.number,
    smsInboxUrl: `https://receive-smss.com/sms/${picked.raw}/`,
    supportedApps: ['WhatsApp', 'Telegram', 'TikTok', 'Google', 'Shopee', 'Facebook', 'Discord'],
    instructions: [
      'Salin nomor telepon virtual di bawah ini.',
      'Gunakan nomor tersebut pada aplikasi yang meminta verifikasi SMS / OTP.',
      'Buka kotak masuk SMS melalui tautan yang disediakan untuk membaca kode OTP yang dikirimkan!',
    ],
  };
}
