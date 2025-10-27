import { NextResponse } from 'next/server';
import { performAnalysis } from '@/server/contractAnalysis';

// Very strict API-key allowlist from env, comma-separated
function getAllowedApiKeys(): string[] {
  const raw = process.env.PUBLIC_API_KEYS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Simple in-memory rate limit store (per key) for this server instance
// Note: For multi-instance deployments, back this with Redis or KV
const lastCallByKey: Map<string, number> = new Map();
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const last = lastCallByKey.get(key) || 0;
  const delta = now - last;
  if (delta < RATE_LIMIT_WINDOW_MS) {
    return { ok: false, retryAfterMs: RATE_LIMIT_WINDOW_MS - delta };
  }
  lastCallByKey.set(key, now);
  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key') || '';
    const allowed = getAllowedApiKeys();
    if (!apiKey || !allowed.includes(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = checkRateLimit(apiKey);
    if (!rl.ok) {
      const seconds = Math.ceil((rl.retryAfterMs || 0) / 1000);
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${seconds}s.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(seconds),
            'X-RateLimit-Limit': '1 per 1m',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { content, messages } = await req.json();
    const result = await performAnalysis({ content, messages });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error (public-analyze):', error);
    return NextResponse.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}


