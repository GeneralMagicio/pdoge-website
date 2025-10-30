export type TimeRange = '24h' | '7d' | '30d';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  correctFlags: number;
  avatarUrl?: string;
}

const leaderboard24h: LeaderboardEntry[] = [
  { userId: 'u1', username: 'MemeCopMax', correctFlags: 4 },
  { userId: 'u2', username: 'SilverShibe', correctFlags: 4 },
  { userId: 'u3', username: 'BronzeBork', correctFlags: 3 },
  { userId: 'u4', username: 'DogeDetective', correctFlags: 3 },
  { userId: 'u5', username: 'ChainSniffer', correctFlags: 3 },
  { userId: 'u6', username: 'RugBuster', correctFlags: 3 },
  { userId: 'u7', username: 'ShibeScout', correctFlags: 3 },
  { userId: 'u8', username: 'WoofWatcher', correctFlags: 2 },
  { userId: 'u9', username: 'MemeMarshal', correctFlags: 2 },
  { userId: 'u10', username: 'PolydogePal', correctFlags: 2 },
  { userId: 'u11', username: 'ByteBarker', correctFlags: 2 },
  { userId: 'u12', username: 'AlphaHowl', correctFlags: 2 },
  { userId: 'u13', username: 'TokenTail', correctFlags: 2 },
  { userId: 'u14', username: 'Furensics', correctFlags: 2 },
  { userId: 'u15', username: 'HashHound', correctFlags: 2 },
  { userId: 'u16', username: 'SnoutScout', correctFlags: 2 },
  { userId: 'u17', username: 'LedgerLabrador', correctFlags: 2 },
  { userId: 'u18', username: 'AuditAkita', correctFlags: 1 },
  { userId: 'u19', username: 'DegenDoberman', correctFlags: 1 },
  { userId: 'u20', username: 'SchnauzerSec', correctFlags: 1 },
  { userId: 'u21', username: 'BarkBits', correctFlags: 1 },
  { userId: 'u22', username: 'PawsProtocol', correctFlags: 1 },
  { userId: 'u23', username: 'MuzzleMonitor', correctFlags: 1 },
];

const leaderboard7d: LeaderboardEntry[] = [
  { userId: 'u8', username: 'WoofWatcher', correctFlags: 19 },
  { userId: 'u1', username: 'MemeCopMax', correctFlags: 18 },
  { userId: 'u2', username: 'SilverShibe', correctFlags: 17 },
  { userId: 'u4', username: 'DogeDetective', correctFlags: 17 },
  { userId: 'u5', username: 'ChainSniffer', correctFlags: 16 },
  { userId: 'u3', username: 'BronzeBork', correctFlags: 16 },
  { userId: 'u6', username: 'RugBuster', correctFlags: 15 },
  { userId: 'u7', username: 'ShibeScout', correctFlags: 15 },
  { userId: 'u11', username: 'ByteBarker', correctFlags: 14 },
  { userId: 'u10', username: 'PolydogePal', correctFlags: 14 },
  { userId: 'u12', username: 'AlphaHowl', correctFlags: 13 },
  { userId: 'u13', username: 'TokenTail', correctFlags: 13 },
  { userId: 'u14', username: 'Furensics', correctFlags: 13 },
  { userId: 'u15', username: 'HashHound', correctFlags: 12 },
  { userId: 'u16', username: 'SnoutScout', correctFlags: 12 },
  { userId: 'u17', username: 'LedgerLabrador', correctFlags: 11 },
  { userId: 'u18', username: 'AuditAkita', correctFlags: 11 },
  { userId: 'u19', username: 'DegenDoberman', correctFlags: 10 },
  { userId: 'u20', username: 'SchnauzerSec', correctFlags: 10 },
  { userId: 'u21', username: 'BarkBits', correctFlags: 9 },
  { userId: 'u22', username: 'PawsProtocol', correctFlags: 9 },
  { userId: 'u23', username: 'MuzzleMonitor', correctFlags: 9 },
];

const leaderboard30d: LeaderboardEntry[] = [
  { userId: 'u1', username: 'MemeCopMax', correctFlags: 88 },
  { userId: 'u4', username: 'DogeDetective', correctFlags: 86 },
  { userId: 'u8', username: 'WoofWatcher', correctFlags: 85 },
  { userId: 'u2', username: 'SilverShibe', correctFlags: 83 },
  { userId: 'u3', username: 'BronzeBork', correctFlags: 82 },
  { userId: 'u5', username: 'ChainSniffer', correctFlags: 81 },
  { userId: 'u6', username: 'RugBuster', correctFlags: 79 },
  { userId: 'u7', username: 'ShibeScout', correctFlags: 77 },
  { userId: 'u10', username: 'PolydogePal', correctFlags: 75 },
  { userId: 'u11', username: 'ByteBarker', correctFlags: 73 },
  { userId: 'u12', username: 'AlphaHowl', correctFlags: 72 },
  { userId: 'u13', username: 'TokenTail', correctFlags: 71 },
  { userId: 'u14', username: 'Furensics', correctFlags: 69 },
  { userId: 'u15', username: 'HashHound', correctFlags: 68 },
  { userId: 'u16', username: 'SnoutScout', correctFlags: 66 },
  { userId: 'u17', username: 'LedgerLabrador', correctFlags: 65 },
  { userId: 'u18', username: 'AuditAkita', correctFlags: 63 },
  { userId: 'u19', username: 'DegenDoberman', correctFlags: 62 },
  { userId: 'u20', username: 'SchnauzerSec', correctFlags: 61 },
  { userId: 'u21', username: 'BarkBits', correctFlags: 60 },
  { userId: 'u22', username: 'PawsProtocol', correctFlags: 58 },
  { userId: 'u23', username: 'MuzzleMonitor', correctFlags: 57 },
];
export function getMockLeaderboard(range: TimeRange): LeaderboardEntry[] {
  const data = range === '24h' ? leaderboard24h : range === '7d' ? leaderboard7d : leaderboard30d;
  // Return a copy and ensure descending order by correctFlags
  return [...data].sort((a, b) => b.correctFlags - a.correctFlags);
}


