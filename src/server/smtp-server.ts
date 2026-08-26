import net from 'net';
import { parseRawEmail } from '../lib/email-parser';
import { db } from '../lib/db';

const PORT = parseInt(process.env.SMTP_PORT || '2525', 10);
const HOST = process.env.SMTP_HOST || '0.0.0.0';

export function startSmtpServer(port = PORT, host = HOST) {
  const server = net.createServer((socket) => {
    let state = 'INIT';
    let rawData = '';
    let recipients: string[] = [];
    let sender = '';
    const clientIp = socket.remoteAddress || 'unknown';

    socket.setEncoding('utf-8');

    // Send greeting
    socket.write(`220 tempmail.local ESMTP TempMail Service Ready\r\n`);

    socket.on('data', async (chunk: string) => {
      if (state === 'DATA') {
        rawData += chunk;
        if (rawData.includes('\r\n.\r\n') || rawData.endsWith('\n.\n') || rawData.endsWith('\n.\r\n')) {
          // Finished receiving message data
          const cleanRaw = rawData.replace(/\r\n\.\r\n$/, '').replace(/\n\.\n$/, '');
          state = 'IDLE';

          try {
            for (const rcpt of recipients) {
              const msg = await parseRawEmail(cleanRaw, rcpt, 'smtp');
              db.saveMessage(msg);
              console.log(`[SMTP] Received message for: ${rcpt} (Subject: ${msg.subject})`);
            }
            socket.write(`250 2.0.0 Ok: queued\r\n`);
          } catch (err: any) {
            console.error('[SMTP] Error parsing email:', err);
            socket.write(`451 4.3.0 Error processing message\r\n`);
          }

          rawData = '';
          recipients = [];
          sender = '';
        }
        return;
      }

      const lines = chunk.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;

        const [command, ...args] = line.trim().split(/\s+/);
        const cmdUpper = command.toUpperCase();

        switch (cmdUpper) {
          case 'HELO':
          case 'EHLO':
            socket.write(`250-tempmail.local Hello [${clientIp}]\r\n250-SIZE 35880000\r\n250-8BITMIME\r\n250 OK\r\n`);
            state = 'IDLE';
            break;

          case 'MAIL':
            const mailMatch = line.match(/FROM:\s*<([^>]*)>/i) || line.match(/FROM:\s*(\S+)/i);
            sender = mailMatch ? mailMatch[1] : 'unknown@sender.com';
            socket.write(`250 2.1.0 Ok\r\n`);
            break;

          case 'RCPT':
            const rcptMatch = line.match(/TO:\s*<([^>]*)>/i) || line.match(/TO:\s*(\S+)/i);
            if (rcptMatch && rcptMatch[1]) {
              const targetRcpt = rcptMatch[1].toLowerCase().trim();
              recipients.push(targetRcpt);
              socket.write(`250 2.1.5 Ok: recipient accepted (Catch-All)\r\n`);
            } else {
              socket.write(`501 5.1.3 Bad recipient address syntax\r\n`);
            }
            break;

          case 'DATA':
            if (recipients.length === 0) {
              socket.write(`503 5.5.1 Error: need RCPT command\r\n`);
            } else {
              state = 'DATA';
              rawData = '';
              socket.write(`354 End data with <CR><LF>.<CR><LF>\r\n`);
            }
            break;

          case 'RSET':
            state = 'IDLE';
            rawData = '';
            recipients = [];
            sender = '';
            socket.write(`250 2.0.0 Ok\r\n`);
            break;

          case 'NOOP':
            socket.write(`250 2.0.0 Ok\r\n`);
            break;

          case 'QUIT':
            socket.write(`221 2.0.0 Bye\r\n`);
            socket.end();
            break;

          default:
            socket.write(`500 5.5.2 Error: command not recognized\r\n`);
            break;
        }
      }
    });

    socket.on('error', (err) => {
      console.error('[SMTP] Socket error:', err.message);
    });
  });

  server.listen(port, host, () => {
    console.log(`🚀 [SMTP Inbound Server] Listening on ${host}:${port}`);
  });

  return server;
}

// Standalone execution check
if (require.main === module) {
  startSmtpServer();
}
