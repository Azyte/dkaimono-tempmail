export function generateCloudflareWorkerCode(webhookUrl: string, webhookSecret: string): string {
  return `/**
 * Cloudflare Email Worker for TempMail Pro
 * Tangkap SEMUA email masuk (@domain-anda) dan teruskan ke Webhook TempMail.
 * 
 * Cara pasang di Cloudflare:
 * 1. Buka Cloudflare Dashboard -> Compute (Workers & Pages) -> Create Worker
 * 2. Paste kode di bawah ini dan klik Deploy.
 * 3. Buka menu "Email Routing" di domain Anda -> Routing Rules -> Catch-all Rule
 * 4. Pilih Action: "Send to a Worker", lalu pilih Worker yang baru dibuat ini.
 */

export default {
  async email(message, env, ctx) {
    const rawEmail = await new Response(message.raw).text();
    const recipient = message.to;
    const sender = message.from;
    const subject = message.headers.get("subject") || "(Tanpa Subjek)";

    const payload = {
      recipient: recipient,
      sender: sender,
      subject: subject,
      raw: rawEmail,
      source: "cloudflare",
      receivedAt: new Date().toISOString()
    };

    const webhookEndpoint = "${webhookUrl}";
    const secretKey = "${webhookSecret}";

    try {
      const response = await fetch(webhookEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": secretKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("Gagal forward email ke TempMail:", await response.text());
      }
    } catch (err) {
      console.error("Error mengirim email ke webhook:", err);
    }
  }
};
`;
}
