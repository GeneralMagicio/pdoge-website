import { NextResponse } from 'next/server';
import { getMockLeaderboard, type TimeRange } from '@/server/leaderboardData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get('range') || '24h') as TimeRange;
    const valid: TimeRange[] = ['24h', '7d', '30d'];
    if (!valid.includes(rangeParam)) {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
    }

    const items = getMockLeaderboard(rangeParam).slice(0, 20);
    return NextResponse.json({ range: rangeParam, items });
  } catch (err) {
    console.error('Leaderboard API error:', err);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}


