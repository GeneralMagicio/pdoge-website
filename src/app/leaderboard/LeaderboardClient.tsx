"use client";

import { useEffect, useMemo, useState } from 'react';

type TimeRange = '24h' | '7d' | '30d';

interface LeaderboardEntry {
  userId: string;
  username: string;
  correctFlags: number;
  avatarUrl?: string;
}

interface ApiResponse {
  range: TimeRange;
  items: LeaderboardEntry[];
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getBadgeForRank(rank: number): { label: string; color: string; text: string } | null {
  if (rank === 1) return { label: 'Meme Cop', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'text-yellow-700' };
  if (rank === 2) return { label: 'Silver Doge', color: 'bg-gray-100 text-gray-800 border-gray-300', text: 'text-gray-700' };
  if (rank === 3) return { label: 'Bronze Doge', color: 'bg-orange-100 text-orange-800 border-orange-300', text: 'text-orange-700' };
  return null;
}

function RangeToggle({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  const btn = (label: string, val: TimeRange) => (
    <button
      key={val}
      onClick={() => onChange(val)}
      className={classNames(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        value === val
          ? 'bg-primary text-white shadow'
          : 'bg-black text-white border border-gray-700 hover:border-gray-500'
      )}
      aria-pressed={value === val}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex items-center gap-2">
      {btn('24h', '24h')}
      {btn('7d', '7d')}
      {btn('30d', '30d')}
    </div>
  );
}

function Row({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const rank = index + 1;
  const badge = getBadgeForRank(rank);

  const rankColor = useMemo(() => {
    if (rank === 1) return 'border-yellow-400';
    if (rank === 2) return 'border-gray-400';
    if (rank === 3) return 'border-orange-500';
    return 'border-transparent';
  }, [rank]);

  return (
    <div className={classNames(
      'bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-between',
      'dark:bg-gray-900 dark:border-gray-800',
      'relative',
      'pl-4'
    )}> 
      <div className={classNames('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', rankColor)} />
      <div className="flex items-center gap-4">
        <div className={classNames(
          'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
          rank <= 3
            ? 'bg-[#9654d21a] text-[#9654d2] dark:bg-[#9654d233]'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
        )}>
          {rank}
        </div>
        <div>
          <div className="text-gray-900 dark:text-gray-100 font-semibold">{entry.username}</div>
          {badge && (
            <div className={classNames('inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs mt-1', badge.color)}>
              <span>
                {badge.label === 'Meme Cop' ? '🚔' : badge.label === 'Silver Doge' ? '🥈' : '🥉'}
              </span>
              <span>{badge.label}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Correct flags</span>
        <span className="text-gray-900 dark:text-gray-100 font-bold text-lg">{entry.correctFlags}</span>
      </div>
    </div>
  );
}

export default function LeaderboardClient() {
  const [range, setRange] = useState<TimeRange>('24h');
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/leaderboard?range=${range}`);
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const data: ApiResponse = await res.json();
        if (!cancelled) setItems(data.items || []);
      } catch {
        if (!cancelled) setError('Could not load leaderboard. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-primary">Meme Court Leaderboard</h1>
        <p className="text-gray-700 text-sm my-2 inline-flex items-center gap-2">
          <span>Active usernames and number of correct flags</span>
          <span className="relative group inline-flex">
            <button
              type="button"
              aria-label="What is a correct flag?"
              className="text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm0-12a1.25 1.25 0 1 0-1.25-1.25A1.25 1.25 0 0 0 12 8Zm1.25 8.5h-2.5a.75.75 0 0 1 0-1.5h.5V12h-.5a.75.75 0 0 1 0-1.5h1.25A1.25 1.25 0 0 1 13.25 11v4h.5a.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black text-gray-200 text-xs border border-gray-700 px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shadow-lg">
              A correct flag is a user report confirmed by moderators/community.
            </span>
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <RangeToggle value={range} onChange={setRange} />
        <div className="text-xs text-gray-500">Top 20</div>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {items.map((entry, idx) => (
            <Row key={entry.userId} entry={entry} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}


