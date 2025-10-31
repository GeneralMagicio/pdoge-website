import { NextResponse } from 'next/server';
import tokensMap from '../../../../../tokens.json';

type TokensMap = Record<string, string>;

function normalizeAddress(address: string): string | null {
  if (!address) return null;
  const a = address.toLowerCase();
  return /^0x[0-9a-f]{40}$/.test(a) ? a : null;
}

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const normalized = normalizeAddress(params.address);
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const map = tokensMap as TokensMap;
    const displayName = map[normalized] || null;
    if (!displayName) {
      return NextResponse.json({ address: normalized, displayName: null, found: false }, { status: 404 });
    }

    return NextResponse.json({ address: normalized, displayName, found: true });
  } catch (err) {
    console.error('token-display-name API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


