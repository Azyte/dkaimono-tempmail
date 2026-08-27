import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyExistingAmAccount } from '@/lib/alightMotion';
import { createMultiServiceAccount, SUPPORTED_SERVICES, ServiceType } from '@/lib/accountGenerator';

function escapeTgHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRandomAlias(): string {
  const adjectives = ['swift', 'fast', 'ninja', 'shadow', 'cool', 'pro', 'star', 'hyper', 'lucky', 'prime'];
  const nouns = ['fox', 'tiger', 'dragon', 'hawk', 'storm', 'rider', 'wave', 'cloud', 'cyber', 'flash'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}_${noun}${num}`;
}

async function sendTelegramMessage(botToken: string, chatId: string | number, text: string, replyMarkup?: any) {
  try {
    const cleanToken = String(botToken).trim().replace(/^bot/i, '');
    const cleanChatId = String(chatId).trim().replace(/^@/, '');

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    return await res.json().catch(() => ({}));
  } catch (err) {
    console.error('sendTelegramMessage error:', err);
    return null;
  }
}

// Background handler for processing multi-service accounts without blocking Telegram Webhook HTTP 200 response
async function processAccountGenerationBackground(
  botToken: string,
  chatId: string | number,
  userId: string | undefined,
  serviceType: ServiceType,
  count: number,
  customAlias: string | undefined,
  primaryDomain: string
) {
  const serviceDef = SUPPORTED_SERVICES[serviceType] || SUPPORTED_SERVICES.custom;

  const mainReplyKeyboard = {
    keyboard: [
      [{ text: '⚡ Buat Akun Pro / Trial' }, { text: '🎲 Buat Email Acak' }],
      [{ text: '✏️ Buat Alias Kustom' }, { text: '📬 Cek Inbox Terakhir' }],
      [{ text: '📧 Email Aktif Saya' }],
    ],
    resize_keyboard: true,
    persistent: true,
  };

  await sendTelegramMessage(
    botToken,
    chatId,
    `🚀 <b>MEMULAI PEMBUATAN OTOMATIS ${count} AKUN ${serviceDef.name.toUpperCase()}...</b>\n\n` +
      `⚡ <i>Auto-Mailbox + Secure Password Generator diaktifkan!</i>\n` +
      `⚙️ <b>Tahapan Otomatis:</b>\n` +
      `1. Generate email baru di <code>@${primaryDomain}</code>\n` +
      `2. Buat password acak yang kuat &amp; aman\n` +
      `3. Aktifkan kotak masuk penerima OTP &amp; verifikasi realtime\n` +
      `${serviceType === 'alight_motion' ? '4. Eksekusi aktivasi lisensi 1 Tahun via Magic Link\n\n' : '\n'}` +
      `⏳ <i>Mohon tunggu sebentar, proses sedang berjalan...</i>`
  );

  const successfulAccounts: Array<{ email: string; password?: string; inboxUrl: string; duration: string; isPending?: boolean; id: string }> = [];

  for (let i = 0; i < count; i++) {
    const currentAlias = count === 1 ? customAlias : undefined;
    await sendTelegramMessage(
      botToken,
      chatId,
      `⏳ <b>[${i + 1}/${count}] Mengenerate Akun ${serviceDef.name}...</b>`
    );

    const result = await createMultiServiceAccount(serviceType, currentAlias, undefined, primaryDomain, userId);

    if (result.success) {
      successfulAccounts.push({
        id: result.id,
        email: result.email,
        password: result.password,
        inboxUrl: result.inboxUrl,
        duration: result.duration || serviceDef.defaultDuration,
        isPending: result.isPending,
      });

      // Save to user
      if (userId) {
        const u = db.getUserById(userId);
        if (u) {
          const saved = u.savedMailboxes || [];
          if (!saved.includes(result.email)) saved.unshift(result.email);
          const monitored = u.monitoredAliases || [];
          const local = result.email.split('@')[0];
          if (!monitored.includes(local)) monitored.unshift(local);
          db.updateUser(u.id, { savedMailboxes: saved.slice(0, 30), monitoredAliases: monitored.slice(0, 30) });
        }
      }

      if (result.isPending) {
        const pendingMsg =
          `⏳ <b>AKUN [${i + 1}/${count}] EMAIL &amp; MAGIC LINK SIAP!</b> ✨\n\n` +
          `🏷️ <b>Layanan:</b> ${serviceDef.icon} ${serviceDef.name}\n` +
          `📧 <b>Email:</b> <code>${result.email}</code>\n` +
          `${result.password ? `🔑 <b>Password:</b> <code>${result.password}</code>\n` : ''}` +
          `🔗 <b>Link Inbox:</b> ${result.inboxUrl}\n` +
          `⚠️ <b>Status:</b> <code>Siap Diaktivasi (Server Antrean Cooldown)</code>\n\n` +
          `<i>Magic link sudah tertangkap di kotak masuk. Tekan tombol aktivasi di bawah ini:</i>`;

        const pendingButtons = {
          inline_keyboard: [
            [{ text: '⚡ Aktivasi Akun Ini Sekarang', callback_data: `cb_retry_am_${result.id}` }],
            [{ text: '📬 Buka Inbox Email Ini', url: result.inboxUrl }],
          ],
        };

        await sendTelegramMessage(botToken, chatId, pendingMsg, pendingButtons);
      } else {
        let singleSuccessMsg = '';
        const inlineButtons: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];

        if (serviceType === 'alight_motion') {
          singleSuccessMsg =
            `🎉 <b>AKUN ALIGHT MOTION 1 TAHUN PREMIUM AKTIF!</b> ✨\n\n` +
            `🏷️ <b>Layanan:</b> 🎬 Alight Motion Premium\n` +
            `📧 <b>Email:</b> <code>${result.email}</code>\n` +
            `🔑 <b>Metode Login:</b> ✉️ <i>Magic Link (Tanpa Password)</i>\n` +
            `✨ <b>Masa Aktif:</b> <code>1 Tahun Premium (Aktif)</code>\n` +
            `🔗 <b>Link Inbox:</b> ${result.inboxUrl}\n\n` +
            `📱 <b>Cara Login di HP:</b>\n` +
            `1. Buka aplikasi Alight Motion di HP\n` +
            `2. Pilih <b>Masuk dengan Email</b> ➔ Masukkan email di atas\n` +
            `3. Buka kotak masuk bot ini ➔ Klik link login yang masuk!`;

          inlineButtons.push([
            { text: '📬 Buka Inbox Login', url: result.inboxUrl },
          ]);
        } else if (serviceType === 'warp_plus') {
          singleSuccessMsg =
            `🛡️ <b>CLOUDFLARE WARP+ LICENSE PREMIUM AKTIF!</b> ✨\n\n` +
            `🏷️ <b>Layanan:</b> 🛡️ Cloudflare WARP+ / WireGuard VPN\n` +
            `🔑 <b>License Key:</b> <code>${result.licenseKey}</code>\n` +
            `✨ <b>Kuota:</b> <code>Unlimited WARP+ High Speed</code>\n` +
            `🌐 <b>Endpoint:</b> <code>engage.cloudflareclient.com:2408</code>\n\n` +
            `📱 <b>Cara Pakai di HP / PC:</b>\n` +
            `1. Buka aplikasi <b>1.1.1.1: Faster Internet</b>\n` +
            `2. Masuk ke <b>Settings ⚙️ ➔ Account ➔ Key</b>\n` +
            `3. Masukkan License Key di atas ➔ Status langsung WARP+ Unlimited!\n\n` +
            `<i>(Bisa juga unduh file .conf WireGuard dari dashboard web)</i>`;

          inlineButtons.push([
            { text: '🌐 Buka di Web Dashboard', url: result.inboxUrl },
          ]);
        } else if (serviceType === 'nextdns_pro') {
          singleSuccessMsg =
            `🌐 <b>PROFIL NEXTDNS PRO ADBLOCK AKTIF!</b> ✨\n\n` +
            `🏷️ <b>Profil:</b> ${result.serviceName}\n` +
            `📱 <b>Android Private DNS:</b>\n<code>${result.dotEndpoint}</code>\n\n` +
            `🌐 <b>DoH URL (iOS/Windows):</b>\n<code>${result.dohUrl}</code>\n\n` +
            `✨ <b>Proteksi:</b> <code>300K Queries / Bulan (AdBlock 100%)</code>\n\n` +
            `📱 <b>Cara Pasang di HP:</b>\n` +
            `1. Buka <b>Pengaturan HP ➔ Jaringan & Internet ➔ Private DNS</b>\n` +
            `2. Masukkan hostname di atas ➔ Simpan\n` +
            `3. Semua iklan web, game, & aplikasi otomatis bersih tanpa iklan!`;

          inlineButtons.push([
            { text: '🌐 Buka di Web Dashboard', url: result.inboxUrl },
          ]);
        } else if (serviceType === 'ai_tokens') {
          singleSuccessMsg =
            `🤖 <b>AI PRO API KEY SIAP DIGUNAKAN!</b> ✨\n\n` +
            `🏷️ <b>Provider:</b> Groq & DeepSeek AI Engine\n` +
            `🔑 <b>API Key:</b>\n<code>${result.apiKey}</code>\n\n` +
            `🌐 <b>Base URL:</b> <code>${result.baseUrl}</code>\n` +
            `⚡ <b>Model Rekomendasi:</b> <code>llama-3.3-70b-versatile</code> & <code>deepseek-r1-distill-llama-70b</code>\n` +
            `✨ <b>Batas Penggunaan:</b> <code>Unlimited 14.400 Req/Hari</code>\n\n` +
            `💡 <i>Kompatibel dengan Chatbox AI, NextChat, VS Code Cline/Roo, Cursor, dll!</i>`;

          inlineButtons.push([
            { text: '🌐 Buka di Web Dashboard', url: result.inboxUrl },
          ]);
        } else if (serviceType === 'deezer_hifi') {
          singleSuccessMsg =
            `🎵 <b>DEEZER HI-FI FLAC ARL TOKEN AKTIF!</b> ✨\n\n` +
            `🏷️ <b>Layanan:</b> Deezer Hi-Fi Master Quality\n` +
            `🔑 <b>ARL Cookie Token:</b>\n<code>${result.arlToken}</code>\n\n` +
            `✨ <b>Kualitas Audio:</b> <code>FLAC 1411kbps Lossless CD Quality</code>\n` +
            `⏳ <b>Masa Aktif:</b> <code>3 Bulan Hi-Fi Session</code>\n\n` +
            `📱 <b>Cara Pakai:</b>\n` +
            `1. Salin ARL Token di atas\n` +
            `2. Masukkan pada User Cookie di <b>Freezer / Deezloader / Lucida.to</b>\n` +
            `3. Langsung download jutaan lagu FLAC original tanpa batas!`;

          inlineButtons.push([
            { text: '🌐 Buka di Web Dashboard', url: result.inboxUrl },
          ]);
        } else if (serviceType === 'proxy_nodes') {
          singleSuccessMsg =
            `⚡ <b>NODE ${result.serviceName.toUpperCase()} SIAP KONEK!</b> ✨\n\n` +
            `🏷️ <b>Server:</b> ${result.serviceName}\n` +
            `✨ <b>Status:</b> <code>${result.duration}</code>\n` +
            `🔗 <b>URL Node:</b>\n<code>${result.configUri}</code>\n\n` +
            `📱 <b>Cara Pakai:</b>\n` +
            `1. Ketuk teks URL di atas untuk menyalin\n` +
            `2. Buka aplikasi <b>v2rayNG / Nekobox / Clash / Shadowrocket / Hiddify</b>\n` +
            `3. Pilih <b>Import from clipboard</b> ➔ Langsung konek internet cepat bebas blokir!`;

          inlineButtons.push([
            { text: '🌐 Buka di Web Dashboard', url: result.inboxUrl },
          ]);
        } else {
          singleSuccessMsg =
            `🎉 <b>AKUN ${serviceDef.name.toUpperCase()} [${i + 1}/${count}] SIAP!</b> ✨\n\n` +
            `🏷️ <b>Layanan:</b> ${serviceDef.icon} ${serviceDef.name}\n` +
            `📧 <b>Email:</b> <code>${result.email}</code>\n` +
            `🔑 <b>Password:</b> <code>${result.password}</code>\n` +
            `📋 <b>Format Cepat:</b> <code>${result.email}:${result.password}</code>\n` +
            `✨ <b>Status:</b> <code>${escapeTgHtml(result.duration || serviceDef.defaultDuration)}</code>\n` +
            `🔗 <b>Link Inbox:</b> ${result.inboxUrl}\n\n` +
            `💡 <i>Kode OTP / Link verifikasi akan otomatis muncul di chat Telegram ini begitu kamu mendaftar!</i>`;

          const row1: Array<{ text: string; url?: string; callback_data?: string }> = [];
          if (serviceDef.signupUrl) {
            row1.push({ text: `🚀 Buka Sign-Up ${serviceDef.name.split(' ')[0]}`, url: serviceDef.signupUrl });
          }
          row1.push({ text: '📬 Buka Inbox OTP', url: result.inboxUrl });
          inlineButtons.push(row1);
        }

        await sendTelegramMessage(botToken, chatId, singleSuccessMsg, { inline_keyboard: inlineButtons });
      }
    } else {
      await sendTelegramMessage(
        botToken,
        chatId,
        `⚠️ <b>[${i + 1}/${count}] Gagal:</b> ${escapeTgHtml(result.error || result.statusText)}`
      );
    }
  }

  // Final Batch Summary
  if (successfulAccounts.length > 0) {
    let summaryText = `📋 <b>REKAP AKUN ${serviceDef.name.toUpperCase()} SELESAI (${successfulAccounts.length}/${count} Akun)</b>\n\n`;
    successfulAccounts.forEach((acc, idx) => {
      summaryText += `<b>${idx + 1}.</b> <code>${acc.email}</code>\n`;
      if (acc.password) summaryText += `   🔑 Pass: <code>${acc.password}</code>\n`;
      summaryText += `   🔗 Inbox: ${acc.inboxUrl}\n`;
      summaryText += `   ✨ Status: ${acc.isPending ? '⏳ Siap Diaktivasi' : '✅ ' + acc.duration}\n\n`;
    });
    summaryText += `💡 <i>Semua akun di atas tersimpan aman di menu <b>🎬 Riwayat Akun</b> web TempMail!</i>`;

    const summaryKeyboard = {
      inline_keyboard: [
        [
          { text: '⚡ Buat 1 Lagi', callback_data: `cb_exec_${serviceType}_1` },
          { text: '⚡ Buat 3 Akun', callback_data: `cb_exec_${serviceType}_3` },
          { text: '⚡ Buat 5 Akun', callback_data: `cb_exec_${serviceType}_5` },
        ],
        [
          { text: '⚡ Ganti Layanan', callback_data: 'cb_hub_services' },
          { text: '📬 Cek Inbox', callback_data: 'cb_inbox' },
        ],
      ],
    };

    await sendTelegramMessage(botToken, chatId, summaryText, summaryKeyboard);
  } else {
    await sendTelegramMessage(
      botToken,
      chatId,
      `❌ Maaf, pembuatan akun gagal diproses. Silakan coba beberapa saat lagi.`,
      mainReplyKeyboard
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json().catch(() => ({}));
    const tokenParam = req.nextUrl.searchParams.get('token');

    // Extract message or callback query
    const message = update.message || update.edited_message;
    const callbackQuery = update.callback_query;

    const from = message?.from || callbackQuery?.from;
    const chat = message?.chat || callbackQuery?.message?.chat;
    const chatId = chat?.id || from?.id;
    const text = (message?.text || callbackQuery?.data || '').trim();

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // Find the associated user by Bot Token or Chat ID
    const users = db.getUsers();
    let user = users.find(
      (u) =>
        (tokenParam && u.telegramBotToken && u.telegramBotToken.replace(/^bot/i, '') === tokenParam.replace(/^bot/i, '')) ||
        (u.telegramChatId && String(u.telegramChatId).trim() === String(chatId).trim())
    );

    // Fallback: If user is not found by chatId but tokenParam matches, save chatId to user!
    if (!user && tokenParam) {
      user = users.find(
        (u) => u.telegramBotToken && u.telegramBotToken.replace(/^bot/i, '') === tokenParam.replace(/^bot/i, '')
      );
      if (user) {
        user = db.updateUser(user.id, {
          telegramChatId: String(chatId),
          telegramEnabled: true,
        }) || user;
      }
    }

    // Secondary Fallback: If user is still not found and there is only 1 PRO user with a bot token in DB
    if (!user) {
      const proUserWithBot = users.find((u) => u.telegramBotToken);
      if (proUserWithBot) {
        user = db.updateUser(proUserWithBot.id, {
          telegramChatId: String(chatId),
          telegramEnabled: true,
        }) || proUserWithBot;
      }
    }

    const botToken = user?.telegramBotToken || tokenParam;
    if (!botToken) {
      return NextResponse.json({ ok: true });
    }

    const primaryDomain = db.getSettings().defaultDomain || 'loginptn.xyz';

    // Standard Reply Keyboard
    const mainReplyKeyboard = {
      keyboard: [
        user?.isPro ? [{ text: '⚡ Buat Akun Pro / Trial' }, { text: '🎲 Buat Email Acak' }] : [{ text: '🎲 Buat Email Acak' }],
        [{ text: '✏️ Buat Alias Kustom' }, { text: '📬 Cek Inbox Terakhir' }],
        [{ text: '📧 Email Aktif Saya' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };

    // 1. COMMAND: /start or /help
    if (text === '/start' || text === '/help' || text.startsWith('/start')) {
      let welcomeText =
        `👋 <b>Halo! Selamat datang di Bot TempMail Realtime!</b> 🚀\n\n` +
        `Domain Utama: <code>@${primaryDomain}</code>\n\n`;

      if (user?.isPro) {
        welcomeText +=
          `<b>👑 Status Member: PRO / VIP AKTIF</b>\n\n` +
          `<b>⚡ Fitur Generator Akun Premium &amp; Password:</b>\n` +
          `• <code>/pro</code> ➡️ Buka Hub Generator Akun (AM, Canva, ElevenLabs, Cursor)\n` +
          `• <code>/amprem</code> ➡️ Buat Akun Alight Motion 1 Tahun\n` +
          `• <code>/elevenlabs</code> ➡️ Buat Akun ElevenLabs (10K Voice)\n` +
          `• <code>/cursor</code> ➡️ Buat Akun Cursor AI Pro (14 Hari)\n` +
          `• <code>/canva</code> ➡️ Buat Akun Canva Pro\n\n`;
      }

      welcomeText +=
        `<b>📋 Perintah TempMail:</b>\n` +
        `• <code>/new</code> ➡️ Buat email acak baru\n` +
        `• <code>/custom nama_alias</code> ➡️ Buat email kustom\n` +
        `• <code>/inbox</code> ➡️ Cek pesan &amp; kode OTP\n` +
        `• <code>/myemail</code> ➡️ Lihat daftar email aktif\n\n` +
        `<i>Pilih tombol di bawah untuk mulai:</i>`;

      sendTelegramMessage(botToken, chatId, welcomeText, mainReplyKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 2. COMMAND: Service Picker Hub (/pro, '⚡ Buat Akun Pro / Trial', 'cb_hub_services')
    if (
      text === '⚡ Buat Akun Pro / Trial' ||
      text === '⚡ Buat AM Premium Otomatis' ||
      text === '/pro' ||
      text === '/generator' ||
      text === 'cb_hub_services'
    ) {
      if (!user?.isPro) {
        const proOnlyText =
          `👑 <b>FITUR KHUSUS PENGGUNA PRO / VIP</b>\n\n` +
          `Fitur <b>Auto Pro &amp; Trial Generator</b> hanya dapat digunakan oleh member yang memiliki status PRO/VIP.\n\n` +
          `💡 <i>Cara Mengaktifkan:</i>\n` +
          `1. Buka website TempMail\n` +
          `2. Masuk ke menu <b>Pengaturan ⚙️ ➡️ Tab PRO</b>\n` +
          `3. Masukkan kode voucher lisensi: <code>VIP-PRO-2026</code>\n` +
          `4. Klik tombol <b>⚡ Hubungkan &amp; Aktifkan Bot</b>`;

        sendTelegramMessage(botToken, chatId, proOnlyText, mainReplyKeyboard);
        return NextResponse.json({ ok: true });
      }

      const hubText =
        `🚀 <b>AUTO PRO &amp; TRIAL ACCOUNT GENERATOR</b> ✨\n\n` +
        `<b>⚡ 100% TERIMA JADI (Auto Server / Key / Token):</b>\n` +
        `• 🎬 <b>Alight Motion:</b> 1 Tahun Full Auto Magic Link\n` +
        `• 🛡️ <b>Cloudflare WARP+:</b> Unlimited VPN Key &amp; Config WireGuard\n` +
        `• 🌐 <b>NextDNS Pro:</b> 300K Queries Blokir 100% Iklan &amp; Malware\n` +
        `• 🤖 <b>AI Pro API Key:</b> Llama 3.3 70B &amp; DeepSeek R1 Key\n` +
        `• 🎵 <b>Deezer Hi-Fi:</b> Lossless FLAC &amp; 320kbps ARL Token\n` +
        `• ⚡ <b>Hysteria 2 &amp; V2Ray:</b> Ultra Low-Ping Node (SG, ID, JP, US)\n\n` +
        `<b>✉️ PRO TRIAL &amp; OTP HELPER:</b>\n` +
        `• 🎨 <b>Canva Pro:</b> Akun Tim Canva Pro\n` +
        `• 🤖 <b>ElevenLabs:</b> 10K Voice Text-to-Speech\n` +
        `• 💻 <b>Cursor AI:</b> 14 Hari Pro Trial OTP\n` +
        `• ✨ <b>Leonardo AI:</b> 150 Token Daily OTP\n` +
        `• ⚡ <b>Kustom:</b> Email + Password acak siap pakai\n\n` +
        `<i>Pilih layanan di bawah ini:</i>`;

      const hubKeyboard = {
        inline_keyboard: [
          [
            { text: '🎬 Alight Motion (Auto)', callback_data: 'cb_pick_srv_alight_motion' },
            { text: '🛡️ WARP+ VPN (Auto)', callback_data: 'cb_pick_srv_warp_plus' },
          ],
          [
            { text: '🌐 NextDNS AdBlock (Auto)', callback_data: 'cb_pick_srv_nextdns_pro' },
            { text: '🤖 AI Pro API Key (Auto)', callback_data: 'cb_pick_srv_ai_tokens' },
          ],
          [
            { text: '🎵 Deezer FLAC ARL (Auto)', callback_data: 'cb_pick_srv_deezer_hifi' },
            { text: '⚡ Hysteria 2 & V2Ray', callback_data: 'cb_pick_srv_proxy_nodes' },
          ],
          [
            { text: '🎨 Canva Pro Team', callback_data: 'cb_pick_srv_canva_pro' },
            { text: '🤖 ElevenLabs Voice', callback_data: 'cb_pick_srv_elevenlabs' },
          ],
          [
            { text: '💻 Cursor AI Pro', callback_data: 'cb_pick_srv_cursor_ai' },
            { text: '✨ Leonardo AI', callback_data: 'cb_pick_srv_leonardo_ai' },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, hubText, hubKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 3. SERVICE COUNT SELECTION: cb_pick_srv_<serviceType> OR direct shortcuts
    let selectedServiceType: ServiceType | null = null;
    if (text.startsWith('cb_pick_srv_')) {
      selectedServiceType = text.replace('cb_pick_srv_', '').trim() as ServiceType;
    } else if (text === '/amprem' || text === 'cb_ask_amprem' || text === 'cb_amprem') {
      selectedServiceType = 'alight_motion';
    } else if (text === '/warp' || text === '/vpn') {
      selectedServiceType = 'warp_plus';
    } else if (text === '/nextdns' || text === '/adblock' || text === '/dns') {
      selectedServiceType = 'nextdns_pro';
    } else if (text === '/aikey' || text === '/ai' || text === '/groq') {
      selectedServiceType = 'ai_tokens';
    } else if (text === '/deezer' || text === '/flac' || text === '/music') {
      selectedServiceType = 'deezer_hifi';
    } else if (text === '/v2ray' || text === '/vless' || text === '/hy2' || text === '/proxy') {
      selectedServiceType = 'proxy_nodes';
    } else if (text === '/elevenlabs' || text === '/voice') {
      selectedServiceType = 'elevenlabs';
    } else if (text === '/cursor' || text === '/cursorai') {
      selectedServiceType = 'cursor_ai';
    } else if (text === '/canva' || text === '/canvapro') {
      selectedServiceType = 'canva_pro';
    }

    if (selectedServiceType) {
      if (!user?.isPro) {
        sendTelegramMessage(botToken, chatId, '👑 Fitur ini khusus member PRO / VIP.', mainReplyKeyboard);
        return NextResponse.json({ ok: true });
      }

      const sDef = SUPPORTED_SERVICES[selectedServiceType] || SUPPORTED_SERVICES.custom;
      const countPrompt =
        `⚡ <b>GENERATOR AKUN ${sDef.name.toUpperCase()}</b> ${sDef.icon}\n\n` +
        `Deskripsi: <i>${sDef.description}</i>\n\n` +
        `Berapa jumlah akun yang ingin dibuat?\n` +
        `<i>(Password akan digenerate otomatis secara acak dan aman)</i>`;

      const countKeyboard = {
        inline_keyboard: [
          [
            { text: '⚡ 1 Akun', callback_data: `cb_exec_${selectedServiceType}_1` },
            { text: '⚡ 2 Akun', callback_data: `cb_exec_${selectedServiceType}_2` },
            { text: '⚡ 3 Akun', callback_data: `cb_exec_${selectedServiceType}_3` },
          ],
          [
            { text: '⚡ 5 Akun', callback_data: `cb_exec_${selectedServiceType}_5` },
            { text: '⚡ 10 Akun (Batch)', callback_data: `cb_exec_${selectedServiceType}_10` },
          ],
          [
            { text: '⬅️ Kembali Pilih Layanan', callback_data: 'cb_hub_services' },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, countPrompt, countKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 4. RETRY ACTIVATION: cb_retry_am_<id>
    if (text.startsWith('cb_retry_am_')) {
      const accountId = text.replace('cb_retry_am_', '').trim();
      const retryResult = await verifyExistingAmAccount(accountId, user?.id);

      if (retryResult.success && retryResult.account) {
        const acc = retryResult.account;
        const msg =
          `🎉 <b>AKUN ALIGHT MOTION BERHASIL DIAKTIVASI!</b> ✨\n\n` +
          `📧 <b>Email:</b> <code>${acc.email}</code>\n` +
          `${acc.password ? `🔑 <b>Password:</b> <code>${acc.password}</code>\n` : ''}` +
          `🔗 <b>Link Inbox:</b> ${acc.inboxUrl}\n` +
          `✨ <b>Masa Aktif:</b> <code>${escapeTgHtml(acc.duration || '1 Tahun Premium (Aktif)')}</code>\n` +
          `✅ <b>Status:</b> Premium Activated\n\n` +
          `<i>(Akun sudah dapat langsung digunakan login di Alight Motion!)</i>`;

        const btn = {
          inline_keyboard: [
            [{ text: '📬 Buka Kotak Masuk', url: acc.inboxUrl }],
          ],
        };
        sendTelegramMessage(botToken, chatId, msg, btn);
      } else {
        const failMsg =
          `⏳ <b>Server Aktivasi Masih Dalam Antrean / Cooldown</b>\n\n` +
          `Keterangan: ${escapeTgHtml(retryResult.error || 'Silakan tunggu sebentar.')}\n\n` +
          `<i>Tautan magic link Anda tersimpan aman. Tekan tombol di bawah untuk mencoba aktivasi lagi:</i>`;

        const retryBtn = {
          inline_keyboard: [
            [{ text: '⚡ Coba Aktivasi Lagi Sekarang', callback_data: `cb_retry_am_${accountId}` }],
          ],
        };
        sendTelegramMessage(botToken, chatId, failMsg, retryBtn);
      }
      return NextResponse.json({ ok: true });
    }

    // 5. EXECUTE GENERATION: cb_exec_<serviceType>_<count> OR legacy cb_do_amprem_<count>
    if (text.startsWith('cb_exec_') || text.startsWith('cb_do_amprem_') || text.startsWith('/amprem ')) {
      if (!user?.isPro) {
        sendTelegramMessage(botToken, chatId, '👑 Fitur ini khusus member PRO / VIP.', mainReplyKeyboard);
        return NextResponse.json({ ok: true });
      }

      let serviceType: ServiceType = 'alight_motion';
      let count = 1;
      let customAlias: string | undefined = undefined;

      if (text.startsWith('cb_exec_')) {
        const parts = text.replace('cb_exec_', '').split('_');
        const countStr = parts.pop();
        serviceType = parts.join('_') as ServiceType;
        count = parseInt(countStr || '1', 10) || 1;
      } else if (text.startsWith('cb_do_amprem_')) {
        serviceType = 'alight_motion';
        count = parseInt(text.replace('cb_do_amprem_', ''), 10) || 1;
      } else if (text.startsWith('/amprem ')) {
        serviceType = 'alight_motion';
        const param = text.replace(/^\/amprem\s*/i, '').trim();
        const num = parseInt(param, 10);
        if (!isNaN(num) && num > 0) {
          count = Math.min(num, 10);
        } else if (param.length >= 2) {
          customAlias = param;
        }
      }

      // Run background generator
      processAccountGenerationBackground(botToken, chatId, user?.id, serviceType, Math.min(count, 10), customAlias, primaryDomain);
      return NextResponse.json({ ok: true });
    }

    // 6. COMMAND: /new, /random, '🎲 Buat Email Acak', or callback 'cb_new'
    if (text === '/new' || text === '/random' || text === '🎲 Buat Email Acak' || text === 'cb_new') {
      const alias = getRandomAlias();
      const emailAddress = `${alias}@${primaryDomain}`;

      // Create mailbox in DB
      db.createOrGetMailbox(emailAddress, user?.id);

      if (user) {
        const saved = user.savedMailboxes || [];
        if (!saved.includes(emailAddress)) saved.unshift(emailAddress);
        const monitored = user.monitoredAliases || [];
        if (!monitored.includes(alias)) monitored.unshift(alias);
        db.updateUser(user.id, { savedMailboxes: saved.slice(0, 20), monitoredAliases: monitored.slice(0, 20) });
      }

      const responseText =
        `✨ <b>EMAIL SEMENTARA BARU AKTIF!</b> 🎉\n\n` +
        `📧 <b>Alamat Email:</b>\n<code>${emailAddress}</code>\n<i>(Ketuk teks di atas untuk menyalin)</i>\n\n` +
        `✅ <b>Status:</b> Siap menerima email, OTP, &amp; tautan Sign In.\n` +
        `Setiap ada pesan masuk ke alamat ini, bot akan langsung mengirimkan notifikasinya ke sini! 🚀`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📬 Cek Inbox', callback_data: `inbox_${alias}` },
            { text: '🎲 Buat Acak Lagi', callback_data: 'cb_new' },
          ],
          [
            {
              text: '🌐 Buka di Web Browser',
              url: `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(alias)}`,
            },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, responseText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 7. COMMAND: /custom <alias>, /alias <alias>, or '✏️ Buat Alias Kustom'
    if (text.startsWith('/custom') || text.startsWith('/alias') || text === '✏️ Buat Alias Kustom') {
      let customName = text.replace(/^\/(custom|alias)/i, '').trim();

      if (!customName || text === '✏️ Buat Alias Kustom') {
        const promptText =
          `✏️ <b>Cara Membuat Email Kustom (Custom Alias):</b>\n\n` +
          `Ketik perintah:\n<code>/custom nama_yang_kamu_mau</code>\n\n` +
          `<b>Contoh:</b>\n` +
          `• <code>/custom alightmotion</code> ➡️ <code>alightmotion@${primaryDomain}</code>\n` +
          `• <code>/custom netflixku</code> ➡️ <code>netflixku@${primaryDomain}</code>\n` +
          `• <code>/custom canvapro</code> ➡️ <code>canvapro@${primaryDomain}</code>\n\n` +
          `<i>Silakan ketik perintahnya sekarang!</i>`;
        sendTelegramMessage(botToken, chatId, promptText, mainReplyKeyboard);
        return NextResponse.json({ ok: true });
      }

      const cleanAlias = customName.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      if (cleanAlias.length < 2) {
        sendTelegramMessage(
          botToken,
          chatId,
          '⚠️ Nama alias minimal 2 karakter (hanya huruf, angka, titik, strip).',
          mainReplyKeyboard
        );
        return NextResponse.json({ ok: true });
      }

      const emailAddress = `${cleanAlias}@${primaryDomain}`;
      db.createOrGetMailbox(emailAddress, user?.id);

      if (user) {
        const saved = user.savedMailboxes || [];
        if (!saved.includes(emailAddress)) saved.unshift(emailAddress);
        const monitored = user.monitoredAliases || [];
        if (!monitored.includes(cleanAlias)) monitored.unshift(cleanAlias);
        db.updateUser(user.id, { savedMailboxes: saved.slice(0, 20), monitoredAliases: monitored.slice(0, 20) });
      }

      const responseText =
        `🎯 <b>EMAIL ALIAS KUSTOM BERHASIL DIBUAT!</b> 🎉\n\n` +
        `📧 <b>Alamat Email:</b>\n<code>${emailAddress}</code>\n<i>(Ketuk teks di atas untuk menyalin)</i>\n\n` +
        `✅ <b>Status:</b> Siap menerima verifikasi &amp; Sign In.\n` +
        `Pesan masuk akan langsung dikirimkan ke chat ini secara realtime! 🚀`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📬 Cek Inbox', callback_data: `inbox_${cleanAlias}` },
            {
              text: '🌐 Buka di Web',
              url: `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`,
            },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, responseText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 8. COMMAND: /myemail, '📧 Email Aktif Saya', or 'cb_myemail'
    if (text === '/myemail' || text === '/email' || text === '📧 Email Aktif Saya' || text === 'cb_myemail') {
      const saved = user?.savedMailboxes || [];
      const primaryEmail = saved[0] || `${user?.username || 'user'}@${primaryDomain}`;

      let listText = `📧 <b>DAFTAR EMAIL AKTIF ANDA:</b>\n\n`;
      listText += `🌟 <b>Email Utama:</b>\n<code>${primaryEmail}</code>\n\n`;

      if (saved.length > 1) {
        listText += `<b>Riwayat Alias Lainnya:</b>\n`;
        saved.slice(1, 6).forEach((addr, i) => {
          listText += `${i + 1}. <code>${addr}</code>\n`;
        });
        listText += `\n`;
      }

      listText += `<i>Gunakan salah satu alamat email di atas untuk mendaftar akun atau menerima kode OTP.</i>`;

      const inlineKeyboard = {
        inline_keyboard: [
          user?.isPro ? [{ text: '⚡ Generator Akun', callback_data: 'cb_hub_services' }, { text: '🎲 Buat Acak Baru', callback_data: 'cb_new' }] : [{ text: '🎲 Buat Acak Baru', callback_data: 'cb_new' }],
          [
            { text: '📬 Cek Inbox', callback_data: 'cb_inbox' },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, listText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 9. COMMAND: /inbox, '📬 Cek Inbox Terakhir', or callback 'cb_inbox' / 'inbox_<alias>'
    if (text === '/inbox' || text === '📬 Cek Inbox Terakhir' || text === 'cb_inbox' || text.startsWith('inbox_')) {
      let targetAlias = '';
      if (text.startsWith('inbox_')) {
        targetAlias = text.replace('inbox_', '').trim();
      }

      let targetAddress = targetAlias
        ? `${targetAlias}@${primaryDomain}`
        : user?.savedMailboxes?.[0] || `${user?.username || 'user'}@${primaryDomain}`;

      const messages = db.getMessages(targetAddress);

      if (messages.length === 0) {
        const emptyText =
          `📬 <b>KOTAK MASUK MASIH KOSONG</b>\n\n` +
          `📧 <b>Mailbox:</b> <code>${targetAddress}</code>\n\n` +
          `Belum ada email yang masuk ke alamat ini. Silakan kirim email atau lakukan verifikasi/Sign In sekarang, pesan akan otomatis muncul begitu tiba!`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🔄 Refresh Inbox', callback_data: `inbox_${targetAddress.split('@')[0]}` },
              { text: '🎲 Buat Email Lain', callback_data: 'cb_new' },
            ],
          ],
        };

        sendTelegramMessage(botToken, chatId, emptyText, inlineKeyboard);
        return NextResponse.json({ ok: true });
      }

      let inboxText = `📬 <b>INBOX TERAKHIR (${targetAddress})</b>\n\n`;

      messages.slice(0, 3).forEach((m, idx) => {
        const time = new Date(m.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const combined = `${m.subject} ${m.text}`;
        const otpMatch =
          combined.match(/(?:code|kode|otp|token|pin|verification|verifikasi)[^\d]{1,15}(\d{4,8})\b/i) ||
          combined.match(/\b(\d{6})\b/);

        inboxText += `<b>${idx + 1}. ${escapeTgHtml(m.subject || '(Tanpa Subjek)')}</b> [${time}]\n`;
        inboxText += `👤 Dari: ${escapeTgHtml(m.from.name || m.from.address)}\n`;
        if (otpMatch) {
          inboxText += `🔑 <b>OTP: <code>${otpMatch[1]}</code></b>\n`;
        }
        inboxText += `\n`;
      });

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Refresh', callback_data: `inbox_${targetAddress.split('@')[0]}` },
            {
              text: '🌐 Buka Email Lengkap',
              url: `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(
                targetAddress.split('@')[0]
              )}`,
            },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, inboxText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // Default fallback
    if (text.length >= 2 && text.length <= 30 && !text.includes(' ') && !text.startsWith('/')) {
      const cleanAlias = text.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      const emailAddress = `${cleanAlias}@${primaryDomain}`;

      db.createOrGetMailbox(emailAddress, user?.id);

      if (user) {
        const saved = user.savedMailboxes || [];
        if (!saved.includes(emailAddress)) saved.unshift(emailAddress);
        const monitored = user.monitoredAliases || [];
        if (!monitored.includes(cleanAlias)) monitored.unshift(cleanAlias);
        db.updateUser(user.id, { savedMailboxes: saved.slice(0, 20), monitoredAliases: monitored.slice(0, 20) });
      }

      const responseText =
        `✨ <b>EMAIL ALIAS DIBUAT DARI PESAN ANDA!</b> 🎉\n\n` +
        `📧 <b>Alamat Email:</b>\n<code>${emailAddress}</code>\n<i>(Ketuk untuk menyalin)</i>\n\n` +
        `Siap menerima kode OTP &amp; link Sign In dari aplikasi pilihan Anda!`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📬 Cek Inbox', callback_data: `inbox_${cleanAlias}` },
            {
              text: '🌐 Buka di Web',
              url: `https://dkaimono-tempmail-production-51e8.up.railway.app/?mail=${encodeURIComponent(cleanAlias)}`,
            },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, responseText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram Webhook Handler Error:', err);
    return NextResponse.json({ ok: true });
  }
}
