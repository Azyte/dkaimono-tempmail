import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper random mailbox name generator
const ADJECTIVES = ['fast', 'hyper', 'swift', 'cyber', 'ninja', 'silent', 'pixel', 'vivid', 'cosmic', 'zen', 'turbo', 'spark'];
const NOUNS = ['fox', 'eagle', 'tiger', 'falcon', 'ghost', 'storm', 'wolf', 'matrix', 'beacon', 'orbit', 'pulse', 'spark'];

function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}_${noun}${num}`;
}

// GET all mailboxes
export async function GET() {
  try {
    const mailboxes = db.getMailboxes();
    return NextResponse.json({ success: true, mailboxes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create or get mailbox
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { address, name, domain, generateRandom } = body;

    const settings = db.getSettings();
    const targetDomain = (domain || settings.defaultDomain || 'yourdomain.com').toLowerCase().trim().replace(/^@/, '');

    if (generateRandom || (!address && !name)) {
      name = generateRandomName();
      address = `${name}@${targetDomain}`;
    } else if (!address && name) {
      const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
      address = `${cleanName}@${targetDomain}`;
    }

    const mailbox = db.createOrGetMailbox(address);
    return NextResponse.json({ success: true, mailbox });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
