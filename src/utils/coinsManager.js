// Coins management system with localStorage and Firestore sync

import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COINS_KEY = 'tictacthree_coins';
const STATS_KEY = 'tictacthree_stats';

// Coin rewards for different game types
export const COIN_REWARDS = {
  bot_easy: 10,
  bot_medium: 25,
  bot_hard: 50,
  local: 5,
  online: 30,
  draw: 5
};

// Get current coins from localStorage
export const getCoins = () => {
  const coins = localStorage.getItem(COINS_KEY);
  return coins ? parseInt(coins, 10) : 0;
};

// Set coins in localStorage
export const setCoins = (amount) => {
  localStorage.setItem(COINS_KEY, amount.toString());
  return amount;
};

// Add coins
export const addCoins = (amount) => {
  const currentCoins = getCoins();
  const newCoins = currentCoins + amount;
  setCoins(newCoins);
  return newCoins;
};

// Spend coins
export const spendCoins = (amount) => {
  const currentCoins = getCoins();
  if (currentCoins >= amount) {
    const newCoins = currentCoins - amount;
    setCoins(newCoins);
    return { success: true, newCoins };
  }
  return { success: false, newCoins: currentCoins };
};

// Get user stats
export const getStats = () => {
  const stats = localStorage.getItem(STATS_KEY);
  return stats ? JSON.parse(stats) : {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDraw: 0,
    botGamesWon: { easy: 0, medium: 0, hard: 0 },
    onlineGamesWon: 0,
    totalCoinsEarned: 0,
    winStreak: 0,
    bestWinStreak: 0
  };
};

// Update stats
export const updateStats = (result, gameMode, difficulty = null) => {
  const stats = getStats();

  stats.gamesPlayed++;

  if (result === 'win') {
    stats.gamesWon++;
    stats.winStreak++;
    if (stats.winStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.winStreak;
    }

    if (gameMode === 'bot' && difficulty) {
      stats.botGamesWon[difficulty] = (stats.botGamesWon[difficulty] || 0) + 1;
    } else if (gameMode === 'online') {
      stats.onlineGamesWon++;
    }
  } else if (result === 'loss') {
    stats.gamesLost++;
    stats.winStreak = 0;
  } else if (result === 'draw') {
    stats.gamesDraw++;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
};

// Award coins for game result
export const awardCoins = (result, gameMode, difficulty = null) => {
  let coinsToAdd = 0;

  if (result === 'win') {
    if (gameMode === 'bot') {
      coinsToAdd = COIN_REWARDS[`bot_${difficulty}`] || 10;
    } else if (gameMode === 'online') {
      coinsToAdd = COIN_REWARDS.online;
    } else {
      coinsToAdd = COIN_REWARDS.local;
    }
  } else if (result === 'draw') {
    coinsToAdd = COIN_REWARDS.draw;
  }

  if (coinsToAdd > 0) {
    const newCoins = addCoins(coinsToAdd);
    const stats = getStats();
    stats.totalCoinsEarned += coinsToAdd;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return { coinsAdded: coinsToAdd, totalCoins: newCoins };
  }

  return { coinsAdded: 0, totalCoins: getCoins() };
};

// Sync coins to Firestore (optional, for leaderboard)
export const syncCoinsToFirestore = async (userId, username) => {
  if (!userId) return;

  try {
    const coins = getCoins();
    const stats = getStats();

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      username,
      coins,
      stats,
      lastUpdated: new Date()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error syncing coins to Firestore:', error);
    return false;
  }
};

// Reset all stats and coins
export const resetAllData = () => {
  localStorage.removeItem(COINS_KEY);
  localStorage.removeItem(STATS_KEY);
  return {
    coins: 0,
    stats: getStats()
  };
};
