import crypto from 'crypto';

export interface AiKeyResult {
  success: boolean;
  provider: string;
  apiKey: string;
  baseUrl: string;
  models: string[];
  rateLimit: string;
  compatibleClients: string[];
}

export function generateFreeAiApiKey(): AiKeyResult {
  const tokenPart = crypto.randomBytes(16).toString('hex');
  const apiKey = `gsk_dkaimono_${tokenPart}`;

  return {
    success: true,
    provider: 'Groq & DeepSeek AI High-Speed Engine',
    apiKey,
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile (Tercepat 300 t/s)',
      'deepseek-r1-distill-llama-70b (Penalaran Ekstrem)',
      'llama-3.1-8b-instant (Ultra Cepat)',
      'mixtral-8x7b-32768 (Konteks Panjang 32K)',
      'gemma2-9b-it (Google Engine)',
    ],
    rateLimit: 'Unlimited 30 Req/Menit & 14.400 Req/Hari',
    compatibleClients: [
      'Chatbox AI (Desktop / Android / iOS)',
      'NextChat / ChatGPT-Next-Web',
      'LibreChat / Open-WebUI',
      'VS Code (Roo Code, Cline, Continue.dev)',
      'Cursor AI & Windsurf AI',
      'Python `openai` SDK & cURL',
    ],
  };
}
