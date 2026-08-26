import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSingleAmPremium } from '@/lib/alightMotion';

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

// Background handler for processing AM Premium without blocking Telegram Webhook HTTP 200 response
async function processAmPremiumBackground(
  botToken: string,
  chatId: string | number,
  userId: string | undefined,
  count: number,
  customAlias: string | undefined,
  primaryDomain: string
) {
  const mainReplyKeyboard = {
    keyboard: [
      [{ text: '⚡ Buat AM Premium Otomatis' }, { text: '🎲 Buat Email Acak' }],
      [{ text: '✏️ Buat Alias Kustom' }, { text: '📬 Cek Inbox Terakhir' }],
      [{ text: '📧 Email Aktif Saya' }],
    ],
    resize_keyboard: true,
    persistent: true,
  };

  await sendTelegramMessage(
    botToken,
    chatId,
    `🚀 <b>MEMULAI PEMBUATAN OTOMATIS ${count} AKUN ALIGHT MOTION PREMIUM...</b>\n\n` +
      `⚙️ Sistem akan otomatis:\n` +
      `1. Membuat email sementara di <code>@${primaryDomain}</code>\n` +
      `2. Meminta Magic Link ke server generator Alight Motion\n` +
      `3. Menangkap email masuk &amp; menyalin tautan Sign In\n` +
      `4. Memverifikasi &amp; mengaktifkan status Premium 1 Tahun!\n\n` +
      `⏳ <i>Mohon tunggu sebentar, proses sedang berjalan...</i>`
  );

  const successfulAccounts: Array<{ email: string; duration: string }> = [];

  for (let i = 0; i < count; i++) {
    const currentAlias = count === 1 ? customAlias : undefined;
    await sendTelegramMessage(
      botToken,
      chatId,
      `⏳ <b>[${i + 1}/${count}] Mengenerate &amp; Memverifikasi Akun AM Premium...</b>`
    );

    const result = await createSingleAmPremium(currentAlias, primaryDomain);

    if (result.success) {
      successfulAccounts.push({
        email: result.email,
        duration: result.duration || '1 Tahun Premium',
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

      const singleSuccessMsg =
        `🎉 <b>AKUN AM PREMIUM [${i + 1}/${count}] BERHASIL AKTIF!</b> ✨\n\n` +
        `📧 <b>Email:</b> <code>${result.email}</code>\n` +
        `✨ <b>Masa Aktif:</b> <code>${escapeTgHtml(result.duration || '1 Tahun (Aktif)')}</code>\n` +
        `✅ <b>Status:</b> Premium Activated\n\n` +
        `<i>(Ketuk alamat email di atas untuk menyalin dan login di aplikasi Alight Motion)</i>`;

      await sendTelegramMessage(botToken, chatId, singleSuccessMsg);
    } else {
      await sendTelegramMessage(
        botToken,
        chatId,
        `⚠️ <b>[${i + 1}/${count}] Gagal:</b> ${escapeTgHtml(result.error || result.statusText)}`
      );
    }

    if (i < count - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Final Batch Summary
  if (successfulAccounts.length > 0) {
    let summaryText = `📋 <b>REKAP AKUN AM PREMIUM SELESAI (${successfulAccounts.length}/${count} Berhasil)</b>\n\n`;
    successfulAccounts.forEach((acc, idx) => {
      summaryText += `${idx + 1}. <code>${acc.email}</code> (${acc.duration})\n`;
    });
    summaryText += `\n💡 <i>Semua akun di atas sudah 100% Premium dan siap digunakan login di Alight Motion!</i>`;

    const summaryKeyboard = {
      inline_keyboard: [
        [
          { text: '⚡ Buat 1 Lagi', callback_data: 'cb_amprem' },
          { text: '⚡ Buat 3 Akun', callback_data: 'cb_amprem_3' },
        ],
        [
          { text: '📬 Cek Inbox', callback_data: 'cb_inbox' },
        ],
      ],
    };

    await sendTelegramMessage(botToken, chatId, summaryText, summaryKeyboard);
  } else {
    await sendTelegramMessage(
      botToken,
      chatId,
      `❌ Maaf, pembuatan akun AM Premium gagal diproses oleh server generator. Silakan coba beberapa saat lagi.`,
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

    // Standard Reply Keyboard for 1-tap usage in Telegram
    const mainReplyKeyboard = {
      keyboard: [
        [{ text: '⚡ Buat AM Premium Otomatis' }, { text: '🎲 Buat Email Acak' }],
        [{ text: '✏️ Buat Alias Kustom' }, { text: '📬 Cek Inbox Terakhir' }],
        [{ text: '📧 Email Aktif Saya' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };

    // 1. COMMAND: /start or /help
    if (text === '/start' || text === '/help' || text.startsWith('/start')) {
      const welcomeText =
        `👋 <b>Halo! Selamat datang di Bot TempMail &amp; AM Premium Auto Creator!</b> 🚀\n\n` +
        `Domain Utama: <code>@${primaryDomain}</code>\n\n` +
        `<b>⚡ Fitur Otomatis Alight Motion (AM) Premium:</b>\n` +
        `• <code>/amprem</code> ➡️ Buat 1 akun AM Premium otomatis sampai aktif!\n` +
        `• <code>/amprem &lt;jumlah&gt;</code> (Contoh: <code>/amprem 3</code>) ➡️ Buat beberapa akun sekaligus secara berurutan!\n` +
        `• <code>/amprem &lt;alias&gt;</code> (Contoh: <code>/amprem ravenedit</code>) ➡️ Buat akun AM dengan nama custom!\n\n` +
        `<b>📋 Perintah TempMail Lainnya:</b>\n` +
        `• <code>/new</code> ➡️ Buat email acak baru\n` +
        `• <code>/custom nama_alias</code> ➡️ Buat email kustom\n` +
        `• <code>/inbox</code> ➡️ Cek pesan &amp; kode OTP\n` +
        `• <code>/myemail</code> ➡️ Lihat daftar email aktif\n\n` +
        `<i>Pilih tombol di bawah untuk mulai:</i>`;

      // Return fast to Telegram
      sendTelegramMessage(botToken, chatId, welcomeText, mainReplyKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 2. COMMAND: /amprem [count|alias] or '⚡ Buat AM Premium Otomatis' or callback 'cb_amprem'
    if (text.startsWith('/amprem') || text === '⚡ Buat AM Premium Otomatis' || text === 'cb_amprem' || text.startsWith('cb_amprem_')) {
      let param = text.replace(/^\/amprem/i, '').replace(/^cb_amprem_?/, '').trim();
      let count = 1;
      let customAlias: string | undefined = undefined;

      if (param) {
        const num = parseInt(param, 10);
        if (!isNaN(num) && num > 0) {
          count = Math.min(num, 5); // Max 5 per Telegram batch
        } else if (param.length >= 2) {
          customAlias = param;
        }
      }

      // Run asynchronously without blocking Telegram webhook response
      processAmPremiumBackground(botToken, chatId, user?.id, count, customAlias, primaryDomain);
      return NextResponse.json({ ok: true });
    }

    // 3. COMMAND: /new, /random, '🎲 Buat Email Acak', or callback 'cb_new'
    if (text === '/new' || text === '/random' || text === '🎲 Buat Email Acak' || text === 'cb_new') {
      const alias = getRandomAlias();
      const emailAddress = `${alias}@${primaryDomain}`;

      // Create mailbox in DB
      db.createOrGetMailbox(emailAddress, user?.id);

      // Associate with user
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

    // 4. COMMAND: /custom <alias>, /alias <alias>, or '✏️ Buat Alias Kustom'
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

      // Clean the alias
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

      // Create mailbox in DB
      db.createOrGetMailbox(emailAddress, user?.id);

      // Associate with user
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
        `✅ <b>Status:</b> Siap menerima verifikasi &amp; Sign In dari aplikasi/layanan (misal Alight Motion).\n` +
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

    // 5. COMMAND: /myemail, '📧 Email Aktif Saya', or 'cb_myemail'
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
          [
            { text: '⚡ Buat AM Premium', callback_data: 'cb_amprem' },
            { text: '🎲 Buat Acak Baru', callback_data: 'cb_new' },
          ],
          [
            { text: '📬 Cek Inbox', callback_data: 'cb_inbox' },
          ],
        ],
      };

      sendTelegramMessage(botToken, chatId, listText, inlineKeyboard);
      return NextResponse.json({ ok: true });
    }

    // 6. COMMAND: /inbox, '📬 Cek Inbox Terakhir', or callback 'cb_inbox' / 'inbox_<alias>'
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
        // Extract OTP
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

    // Default fallback: if user just types any word like "alightmotion" or "netflix"
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
