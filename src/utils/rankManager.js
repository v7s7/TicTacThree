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

/**
 * RANK MEDAL SYSTEM
 * Rank medals are prestigious, rank-locked avatars that cannot be purchased
 */

export const RANK_MEDALS = {
  Bronze: {
    id: 'medal_bronze',
    rank: 'Bronze',
    name: 'Bronze Medal',
    color: '#c47b39',
    metallic: true,
    glow: 'rgba(196, 123, 57, 0.4)',
    description: 'Bronze rank achievement medal',
    effects: ['subtleGlow'],
    autoEquip: false
  },
  Silver: {
    id: 'medal_silver',
    rank: 'Silver',
    name: 'Silver Medal',
    color: '#b0bec5',
    metallic: true,
    glow: 'rgba(176, 190, 197, 0.5)',
    description: 'Silver rank achievement medal',
    effects: ['metalShine', 'subtleGlow'],
    autoEquip: false
  },
  Gold: {
    id: 'medal_gold',
    rank: 'Gold',
    name: 'Gold Medal',
    color: '#ffca28',
    metallic: true,
    glow: 'rgba(255, 202, 40, 0.6)',
    description: 'Gold rank achievement medal',
    effects: ['metalShine', 'goldGlow'],
    autoEquip: false
  },
  Platinum: {
    id: 'medal_platinum',
    rank: 'Platinum',
    name: 'Platinum Medal',
    color: '#80deea',
    metallic: true,
    glow: 'rgba(128, 222, 234, 0.7)',
    description: 'Platinum rank achievement medal',
    effects: ['metalShine', 'platinumGlow', 'subtleParticles'],
    autoEquip: false
  },
  Diamond: {
    id: 'medal_diamond',
    rank: 'Diamond',
    name: 'Diamond Medal',
    color: '#7e57c2',
    metallic: true,
    glow: 'rgba(126, 87, 194, 0.8)',
    description: 'Diamond rank achievement medal',
    effects: ['diamondShine', 'prismGlow', 'sparkles'],
    autoEquip: false
  },
  Master: {
    id: 'medal_master',
    rank: 'Master',
    name: 'Master Medal',
    color: '#ef6c00',
    metallic: true,
    glow: 'rgba(239, 108, 0, 0.9)',
    description: 'Master rank achievement medal',
    effects: ['masterShine', 'flamingGlow', 'energyRings'],
    autoEquip: false
  },
  Grandmaster: {
    id: 'medal_grandmaster',
    rank: 'Grandmaster',
    name: 'Grandmaster Medal',
    color: '#ff4081',
    metallic: true,
    glow: 'rgba(255, 64, 129, 1.0)',
    description: 'Grandmaster rank achievement medal - ultimate prestige',
    effects: ['gmShine', 'supremeGlow', 'crownParticles', 'energyRings'],
    autoEquip: false
  }
};

/**
 * Get rank medal by rank name
 */
export const getRankMedal = (rankName) => {
  return RANK_MEDALS[rankName];
};

/**
 * Check if user can equip a rank medal
 * Medals can only be equipped if user currently holds that rank or higher
 */
export const canEquipRankMedal = (medalRank, currentRank) => {
  const medalIdx = getRankIndex(medalRank);
  const currentIdx = getRankIndex(currentRank);
  return currentIdx >= medalIdx;
};

/**
 * Get the appropriate rank-locked frame for current rank
 * Returns null if no rank-locked frame available
 */
export const getRankLockedFrame = (currentRank) => {
  const frameMap = {
    'Diamond': 'frame_diamond',
    'Master': 'frame_master',
    'Grandmaster': 'frame_grandmaster'
  };
  return frameMap[currentRank] || null;
};

/**
 * Check if a frame should be auto-unequipped due to rank loss
 */
export const shouldUnequipFrame = (frameId, currentRank) => {
  const rankLockedFrames = {
    'frame_diamond': 'Diamond',
    'frame_master': 'Master',
    'frame_grandmaster': 'Grandmaster'
  };
  
  const requiredRank = rankLockedFrames[frameId];
  if (!requiredRank) return false;
  
  return !canEquipRankMedal(requiredRank, currentRank);
};

/**
 * Handle rank change - auto unequip rank-locked items if needed
 */
export const handleRankChange = (oldRank, newRank, equippedFrame) => {
  const result = {
    rankChanged: oldRank !== newRank,
    rankUp: getRankIndex(newRank) > getRankIndex(oldRank),
    rankDown: getRankIndex(newRank) < getRankIndex(oldRank),
    shouldUnequipFrame: false,
    newFrame: equippedFrame
  };
  
  // Check if equipped frame should be unequipped
  if (equippedFrame && shouldUnequipFrame(equippedFrame, newRank)) {
    result.shouldUnequipFrame = true;
    result.newFrame = 'frame_basic'; // Revert to basic
  }
  
  return result;
};
