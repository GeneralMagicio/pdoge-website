"use client";

import { useEffect, useMemo, useState } from 'react';
import { EASNetworks } from '@/app/ai/components/EAS';
import Header from '../header';
import type { Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, polygon, sepolia } from 'wagmi/chains';

type AttestationItem = {
  uid: string;
  time: number;
  attester: string;
  contractAddress: string | null;
};

type Votes = Record<string, 'up' | 'down' | null>;
type VoteCounts = Record<string, { up: number; down: number }>; // local-only counts

const shorten = (addr: string, size = 4) => `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;

const CHAIN_BY_ID: Record<number, typeof polygon | typeof mainnet | typeof sepolia> = {
  1: mainnet,
  137: polygon,
  11155111: sepolia,
};

const ERC20_NAME_ABI = [{ name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] }] as const;

export default function CommunityPage() {
  const schemaUid = (process.env.NEXT_PUBLIC_EAS_SCHEMA_UID || '').trim();
  const desiredChainId = Number((process.env.NEXT_PUBLIC_EAS_CHAIN_ID || '137').trim());
  const easConfig = EASNetworks[desiredChainId];

  const [items, setItems] = useState<AttestationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCursor, setPageCursor] = useState({ first: 20, skip: 0 });
  const [hasMore, setHasMore] = useState(true);

  const [ensCache, setEnsCache] = useState<Record<string, string>>({});
  const [tokenNameCache, setTokenNameCache] = useState<Record<string, string>>({});

  const [votes, setVotes] = useState<Votes>({});
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});

  // Public client for token name resolution (ERC20 name())
  const viemClient = useMemo(() => {
    const chain = CHAIN_BY_ID[desiredChainId] || polygon;
    return createPublicClient({ chain, transport: http() });
  }, [desiredChainId]);

  useEffect(() => {
    try {
      const savedVotes = JSON.parse(localStorage.getItem('pdoge_votes') || '{}') as Votes;
      const savedCounts = JSON.parse(localStorage.getItem('pdoge_vote_counts') || '{}') as VoteCounts;
      setVotes(savedVotes);
      setVoteCounts(savedCounts);
    } catch {
      // ignore
    }
  }, []);

  const persistVotes = (nextVotes: Votes, nextCounts: VoteCounts) => {
    setVotes(nextVotes);
    setVoteCounts(nextCounts);
    try {
      localStorage.setItem('pdoge_votes', JSON.stringify(nextVotes));
      localStorage.setItem('pdoge_vote_counts', JSON.stringify(nextCounts));
    } catch {
      // ignore
    }
  };

  const onVote = (uid: string, direction: 'up' | 'down') => {
    const prev = votes[uid] || null;
    const counts = { up: voteCounts[uid]?.up || 0, down: voteCounts[uid]?.down || 0 };
    let next: 'up' | 'down' | null = direction;

    if (prev === direction) {
      // toggle off
      if (direction === 'up') counts.up = Math.max(0, counts.up - 1);
      else counts.down = Math.max(0, counts.down - 1);
      next = null;
    } else {
      // switch or set
      if (prev === 'up') counts.up = Math.max(0, counts.up - 1);
      if (prev === 'down') counts.down = Math.max(0, counts.down - 1);
      if (direction === 'up') counts.up += 1; else counts.down += 1;
    }

    const nextVotes = { ...votes, [uid]: next };
    const nextCounts = { ...voteCounts, [uid]: counts };
    persistVotes(nextVotes, nextCounts);
  };

  const fetchAttestations = async (first: number, skip: number) => {
    if (!schemaUid || !/^0x[0-9a-fA-F]{64}$/.test(schemaUid)) {
      throw new Error('Missing or invalid NEXT_PUBLIC_EAS_SCHEMA_UID');
    }
    if (!easConfig?.gqlUrl) {
      throw new Error('EAS GraphQL not configured for this chain');
    }

    const query = `
      query FetchAttestations($schemaId: String!, $take: Int!, $skip: Int!) {
        attestations(
          where: { schemaId: { equals: $schemaId }, revoked: { equals: false } }
          orderBy: [{ time: desc }]
          take: $take
          skip: $skip
        ) {
          id
          time
          attester
          decodedDataJson
        }
      }
    `;

    const res = await fetch(easConfig.gqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { schemaId: schemaUid, take: first, skip } }),
    });
    if (!res.ok) {
      throw new Error(`EAS GraphQL error: ${res.status}`);
    }
    const json = await res.json();
    if (json.errors) {
      throw new Error('EAS GraphQL returned errors');
    }
    const rows = (json.data?.attestations || []) as Array<{
      id: string;
      time: number;
      attester: string;
      decodedDataJson?: string | null;
    }>;
    
    console.log("decodedDataJson", rows.map((r) => r.decodedDataJson));

    const parsed: AttestationItem[] = rows.map((r) => {
      let contractAddress: string | null = null;
      try {
        if (r.decodedDataJson) {
          const arr = JSON.parse(r.decodedDataJson) as Array<{ name?: string; value?: {name: string; value: string, type: string} }>;
          const found = arr.find((x) => x?.name === 'contractAddress');
          if (found && found.value && found.value.value && /^0x[0-9a-fA-F]{40}$/.test(found.value.value)) {
            contractAddress = found.value.value.toLowerCase();
          }
        }
      } catch {
        // ignore JSON errors
      }
      return {
        uid: r.id,
        time: Number(r.time || 0),
        attester: r.attester,
        contractAddress,
      };
    });
    return parsed;
  };

  const loadMore = async () => {
    try {
      setLoading(true);
      setError(null);
      const batch = await fetchAttestations(pageCursor.first, pageCursor.skip);
      setItems((prev) => [...prev, ...batch]);
      setPageCursor((p) => ({ first: p.first, skip: p.skip + p.first }));
      if (batch.length < pageCursor.first) setHasMore(false);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load attestations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve ENS names (best-effort, mainnet)
  useEffect(() => {
    const unresolved = Array.from(new Set(items.map((i) => i.attester.toLowerCase()))).filter((a) => !ensCache[a]);
    if (unresolved.length === 0) return;

    let cancelled = false;
    const run = async () => {
      const updates: Record<string, string> = {};
      await Promise.all(
        unresolved.slice(0, 25).map(async (addr) => {
          try {
            const r = await fetch(`https://api.ensideas.com/ens/resolve/${addr}`);
            if (!r.ok) return;
            const j = await r.json();
            const name = (j?.name || '').toString();
            if (name) updates[addr] = name;
          } catch {
            // ignore
          }
        })
      );
      if (!cancelled && Object.keys(updates).length > 0) {
        setEnsCache((prev) => ({ ...prev, ...updates }));
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [items, ensCache]);

  // Resolve token names via local tokens.json API first (fast path)
  useEffect(() => {
    const unresolved = Array.from(
      new Set(
        items
          .map((i) => (i.contractAddress || '').toLowerCase())
          .filter(Boolean)
      )
    ).filter((a) => !tokenNameCache[a]);
    if (unresolved.length === 0) return;

    let cancelled = false;
    const run = async () => {
      const updates: Record<string, string> = {};
      await Promise.all(
        unresolved.slice(0, 30).map(async (addr) => {
          try {
            const r = await fetch(`/api/token-display-name/${addr}`);
            if (!r.ok) return;
            const j = await r.json();
            const name = (j?.displayName || '').toString().trim();
            if (name) updates[addr] = name;
          } catch {
            // ignore
          }
        })
      );
      if (!cancelled && Object.keys(updates).length > 0) {
        setTokenNameCache((prev) => ({ ...prev, ...updates }));
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [items, tokenNameCache]);

  // Resolve token names via ERC20 name() on target chain (best-effort)
  useEffect(() => {
    const unresolved = Array.from(new Set(items.map((i) => (i.contractAddress || '').toLowerCase()).filter(Boolean))).filter((a) => !tokenNameCache[a]);
    if (unresolved.length === 0) return;

    let cancelled = false;
    const run = async () => {
      const updates: Record<string, string> = {};
      await Promise.all(
        unresolved.slice(0, 20).map(async (addr) => {
          try {
            const name = await viemClient.readContract({
              address: addr as Address,
              abi: ERC20_NAME_ABI,
              functionName: 'name',
            });
            if (typeof name === 'string' && name.trim()) {
              updates[addr] = name.trim();
            }
          } catch {
            // ignore non-ERC20 or failures
          }
        })
      );
      if (!cancelled && Object.keys(updates).length > 0) {
        setTokenNameCache((prev) => ({ ...prev, ...updates }));
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [items, viemClient, tokenNameCache]);

  const title = 'Community Flags';
  const subtitle = 'Attestations submitted to EAS by the community';

  return (
    <div className="relative">
      <div className="sticky top-0 z-[8]">
        <Header />
      </div>
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-gray-400 mt-1">{subtitle}</p>
        </div>

        {!schemaUid || !/^0x[0-9a-fA-F]{64}$/.test(schemaUid) ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-red-400">
            Missing or invalid NEXT_PUBLIC_EAS_SCHEMA_UID
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-red-400">{error}</div>
        ) : null}

        <div className="space-y-3">
          {items.map((it) => {
            const attester = it.attester.toLowerCase();
            const ens = ensCache[attester];
            const ca = (it.contractAddress || '').toLowerCase();
            const tokenName = ca ? tokenNameCache[ca] : undefined;
            const voted = votes[it.uid] || null;
            const counts = voteCounts[it.uid] || { up: 0, down: 0 };
            const time = it.time ? new Date(it.time * 1000) : null;
            const timeText = time ? time.toLocaleString() : '';

            return (
              <div key={it.uid} className="rounded-lg border border-gray-800 bg-gray-950/60 hover:bg-gray-900/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="text-sm text-gray-400">Contract</div>
                      <div className="text-sm font-mono">
                        {ca ? (
                          <a
                            href={`${easConfig?.explorer?.startsWith('http') ? easConfig.explorer : ''}/address/${ca}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:text-[#9654d2]"
                          >
                            {shorten(ca)}
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 hidden sm:block">•</div>
                      <div className="text-sm text-gray-400">Attestor</div>
                      <div className="text-sm truncate max-w-[200px]">
                        {ens ? (
                          <span title={attester}>{ens}</span>
                        ) : (
                          <span className="font-mono" title={attester}>{shorten(attester)}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 hidden sm:block">•</div>
                      <div className="text-sm text-gray-400">Token</div>
                      <div className="text-sm truncate max-w-[240px]">
                        {tokenName ? (
                          <span>{tokenName}</span>
                        ) : ca ? (
                          <span className="text-gray-500">Unknown</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                    {timeText ? (
                      <div className="text-xs text-gray-500 mt-1">{timeText}</div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onVote(it.uid, 'up')}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                        voted === 'up'
                          ? 'border-[#115701] bg-[#115701] text-white'
                          : 'border-gray-700 bg-black hover:bg-gray-900 text-gray-200'
                      }`}
                      aria-label="Thumbs up"
                      title="Thumbs up"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M2 10a2 2 0 0 1 2-2h4.28l.82-3.28A3 3 0 0 1 12.99 2h.76c.89 0 1.6.72 1.6 1.6V8h3.64a2 2 0 0 1 1.98 2.32l-1 6A2 2 0 0 1 18 18H9a2 2 0 0 1-2-2v-6H4a2 2 0 0 1-2-2Z"/>
                      </svg>
                      <span>{counts.up}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onVote(it.uid, 'down')}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                        voted === 'down'
                          ? 'border-red-500 bg-red-600 text-white'
                          : 'border-gray-700 bg-black hover:bg-gray-900 text-gray-200'
                      }`}
                      aria-label="Thumbs down"
                      title="Thumbs down"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M22 14a2 2 0 0 1-2 2h-4.28l-.82 3.28A3 3 0 0 1 11.01 22h-.76a1.6 1.6 0 0 1-1.6-1.6V16H4.99a2 2 0 0 1-1.98-2.32l1-6A2 2 0 0 1 6 6h9a2 2 0 0 1 2 2v6h3a2 2 0 0 1 2 2Z"/>
                      </svg>
                      <span>{counts.down}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loading}
              className={`rounded-md bg-[#9654d2] hover:bg-[#8548c8] px-4 py-2 font-semibold text-white transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          ) : (
            <div className="text-sm text-gray-500">No more attestations</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}


