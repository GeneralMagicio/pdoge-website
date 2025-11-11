import { NextResponse } from 'next/server';
import axios from 'axios';
// Fallback token list (address -> name) for when CoinGecko has no EVM contracts trending
import tokens from '../../../../tokens.json';

function isEthAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

// CoinGecko "search/trending" response types (subset needed for this route)
interface PriceChangePercentage {
  [currency: string]: number;
}
interface CoinContent {
  title: string;
  description: string;
}
interface CoinData {
  price: number;
  price_btc: string;
  price_change_percentage_24h: PriceChangePercentage;
  market_cap: string;
  market_cap_btc: string;
  total_volume: string;
  total_volume_btc: string;
  sparkline: string;
  content: CoinContent | null;
}
interface CoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: CoinData;
}
interface Coin {
  item: CoinItem;
}
interface ApiResponse {
  coins: Coin[];
  nfts: unknown[];
  categories: unknown[];
}

// coins/{id} minimal details needed to map to EVM contract addresses
interface CoinDetailMinimal {
  id: string;
  symbol: string;
  name: string;
  platforms?: Record<string, string | null>;
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const PREFERRED_PLATFORMS: string[] = [
  'ethereum',
  'polygon-pos',
  'polygon',
  'base',
  'arbitrum-one',
  'optimistic-ethereum',
  'binance-smart-chain',
  'avalanche',
  'fantom',
  'linea', // some projects may use this key
  'zksync',
  'zksync-era', // CoinGecko commonly uses zksync-era
  'scroll',
  'celo',
  'cronos',
  'moonbeam',
  'boba',
  'pulsechain',
];

async function fetchTrendingCoins(apiKey?: string): Promise<Coin[]> {
  const headers: Record<string, string> = {};
  if (apiKey) headers['x-cg-pro-api-key'] = apiKey;
  const { data } = await axios.get<ApiResponse>(`${COINGECKO_BASE}/search/trending`, { headers });
  return Array.isArray(data?.coins) ? data.coins : [];
}

async function fetchCoinDetail(coinId: string, apiKey?: string): Promise<CoinDetailMinimal | null> {
  const headers: Record<string, string> = {};
  if (apiKey) headers['x-cg-pro-api-key'] = apiKey;
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(
    coinId
  )}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
  try {
    const { data } = await axios.get<CoinDetailMinimal>(url, { headers });
    return data || null;
  } catch {
    return null;
  }
}

function pickAddressFromPlatforms(platforms?: Record<string, string | null>): string | null {
  if (!platforms || typeof platforms !== 'object') return null;
  for (const key of PREFERRED_PLATFORMS) {
    const addr = platforms[key];
    if (isEthAddress(addr)) return addr;
  }
  for (const val of Object.values(platforms)) {
    if (isEthAddress(val)) return val;
  }
  return null;
}

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'COINGECKO_API_KEY is not configured' }, { status: 500 });
    }

    const coins = await fetchTrendingCoins(apiKey);
    if (!coins.length) {
      return NextResponse.json({ error: 'No trending coins found' }, { status: 502 });
    }

    const shuffled = [...coins].sort(() => Math.random() - 0.5);
    let pickedAddress: string | null = null;
    // Try all trending coins to maximize the chance of finding an EVM address
    for (const coin of shuffled) {
      const coinId = coin?.item?.id;
      if (!coinId) continue;
      const detail = await fetchCoinDetail(coinId, apiKey);
      const addr = pickAddressFromPlatforms(detail?.platforms || undefined);
      if (addr) {
        pickedAddress = addr;
        break;
      }
    }

    // Fallback: If trending has no EVM tokens (can happen), pick a random known token address
    if (!pickedAddress) {
      try {
        const allAddresses = Object.keys(tokens || {}).filter(isEthAddress);
        if (allAddresses.length > 0) {
          pickedAddress = allAddresses[Math.floor(Math.random() * allAddresses.length)];
        }
      } catch {
        // ignore JSON issues
      }
    }
    if (!pickedAddress) return NextResponse.json({ error: 'No contract address found for trending coins' }, { status: 502 });

    return NextResponse.json(
      { address: pickedAddress, source: 'coingecko' },
      {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('Unexpected error fetching trending token', e?.message || e);
    return NextResponse.json({ error: 'Unexpected error fetching trending token' }, { status: 500 });
  }
} 


