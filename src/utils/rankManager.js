import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const RANKS = [
  { id: 'Bronze', min: 0 },
  { id: 'Silver', min: 600 },
  { id: 'Gold', min: 1200 },
  { id: 'Platinum', min: 1800 },
  { id: 'Diamond', min: 2400 },
  { id: 'Master', min: 3200 },
  { id: 'Grandmaster', min: 4000 }
];

export const getCurrentSeasonId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
};

const getRankFromScore = (score) => {
  let current = RANKS[0].id;
  for (const tier of RANKS) {
    if (score >= tier.min) current = tier.id;
  }
  return current;
};

const softDropRank = (rank) => {
  const idx = RANKS.findIndex((r) => r.id === rank);
  if (idx <= 0) return RANKS[0].id;
  return RANKS[idx - 1].id;
};

const getRankIndex = (rank) => RANKS.findIndex((r) => r.id === rank);

const defaultSeasonStats = (seasonId) => ({
  seasonId,
  wins: 0,
  losses: 0,
  gamesPlayed: 0,
  seasonScore: 0,
  lossStreak: 0,
  winRate: 0
});

export const ensureSeasonForUser = async (userId) => {
  if (!userId) return null;
  const seasonId = getCurrentSeasonId();
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data() || {};
  const currentRank = data.rank || 'Bronze';
  const seasonStats = data.seasonStats || defaultSeasonStats(seasonId);

  // Reset on new season
  if (seasonStats.seasonId !== seasonId) {
    const dropped = softDropRank(currentRank);
    await updateDoc(userRef, {
      lastSeasonRank: currentRank,
      rank: dropped,
      seasonStats: defaultSeasonStats(seasonId),
      seasonScore: 0
    });
    return {
      rank: dropped,
      lastSeasonRank: currentRank,
      seasonStats: defaultSeasonStats(seasonId),
      seasonScore: 0
    };
  }

  // Ensure fields exist
  const mergedStats = {
    ...defaultSeasonStats(seasonId),
    ...seasonStats
  };
  const needsUpdate =
    data.rank !== currentRank ||
    seasonStats.seasonId !== seasonId ||
    data.seasonScore === undefined;

  if (needsUpdate) {
    await updateDoc(userRef, {
      rank: currentRank,
      seasonStats: mergedStats,
      seasonScore: mergedStats.seasonScore ?? 0
    });
  }

  return {
    rank: currentRank,
    lastSeasonRank: data.lastSeasonRank || null,
    seasonStats: mergedStats,
    seasonScore: data.seasonScore ?? mergedStats.seasonScore ?? 0
  };
};

export const updateRankAfterOnlineMatch = async (userId, result) => {
  if (!userId) return null;
  const seasonId = getCurrentSeasonId();
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    // create minimal doc if missing
    await setDoc(userRef, {
      rank: 'Bronze',
      seasonStats: defaultSeasonStats(seasonId),
      seasonScore: 0,
      lastSeasonRank: null
    }, { merge: true });
  }
  const data = (await getDoc(userRef)).data() || {};

  // Ensure season is current
  const ensured = await ensureSeasonForUser(userId);
  const rankBefore = ensured?.rank || data.rank || 'Bronze';
  const seasonStats = ensured?.seasonStats || data.seasonStats || defaultSeasonStats(seasonId);

  const updatedStats = { ...seasonStats };
  if (result === 'win') {
    updatedStats.wins = (updatedStats.wins || 0) + 1;
    updatedStats.lossStreak = 0;
  } else {
    updatedStats.losses = (updatedStats.losses || 0) + 1;
    updatedStats.lossStreak = (updatedStats.lossStreak || 0) + 1;
  }
  updatedStats.gamesPlayed = (updatedStats.wins || 0) + (updatedStats.losses || 0);
  updatedStats.winRate = updatedStats.gamesPlayed > 0
    ? updatedStats.wins / updatedStats.gamesPlayed
    : 0;
  updatedStats.seasonScore = Math.round((updatedStats.wins * 100) + (updatedStats.winRate * 500));

  const candidateRank = getRankFromScore(updatedStats.seasonScore);
  const candidateIdx = getRankIndex(candidateRank);
  const currentIdx = getRankIndex(rankBefore);
  const canDrop = updatedStats.lossStreak >= 3;
  const newRank = candidateIdx < currentIdx && !canDrop ? rankBefore : candidateRank;

  await updateDoc(userRef, {
    rank: newRank,
    seasonScore: updatedStats.seasonScore,
    seasonStats: {
      ...updatedStats,
      seasonId
    }
  });

  return {
    rank: newRank,
    previousRank: rankBefore,
    seasonStats: updatedStats,
    seasonScore: updatedStats.seasonScore,
    seasonId,
    rankUp: getRankIndex(newRank) > getRankIndex(rankBefore)
  };
};

export const rankLabelColor = {
  Bronze: '#c47b39',
  Silver: '#b0bec5',
  Gold: '#ffca28',
  Platinum: '#80deea',
  Diamond: '#7e57c2',
  Master: '#ef6c00',
  Grandmaster: '#ff4081'
};
