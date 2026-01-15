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
  local: 0,
  online: 25,
  online_loss: 10,
  draw: 5
};

const BOT_DAILY_LIMIT = 100;
const BOT_DAILY_KEY = 'tictacthree_bot_daily';

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

// Track daily bot earnings to enforce reset at midnight
const getBotDailyState = () => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const stored = localStorage.getItem(BOT_DAILY_KEY);
  if (!stored) return { date: today, earned: 0 };

  try {
    const parsed = JSON.parse(stored);
    if (parsed.date !== today) {
      return { date: today, earned: 0 };
    }
    return { date: parsed.date, earned: parsed.earned || 0 };
  } catch (e) {
    return { date: today, earned: 0 };
  }
};

const saveBotDailyState = (state) => {
  localStorage.setItem(BOT_DAILY_KEY, JSON.stringify(state));
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
  const defaults = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDraw: 0,
    botGamesWon: { easy: 0, medium: 0, hard: 0 },
    onlineGamesWon: 0,
    totalCoinsEarned: 0,
    botCoinsEarned: 0,
    winStreak: 0,
    bestWinStreak: 0
  };

  const stats = localStorage.getItem(STATS_KEY);
  if (!stats) return defaults;

  try {
    const parsed = JSON.parse(stats);
    return {
      ...defaults,
      ...parsed,
      botGamesWon: { ...defaults.botGamesWon, ...(parsed.botGamesWon || {}) },
      botCoinsEarned: parsed.botCoinsEarned ?? defaults.botCoinsEarned
    };
  } catch (e) {
    return defaults;
  }
};

// Update stats
export const updateStats = (result, gameMode, difficulty = null) => {
  const stats = getStats();
  const isOnline = gameMode === 'online';

  // Only count competitive stats (wins/losses/draws/streak) for online games
  if (isOnline) {
    stats.gamesPlayed++;

    if (result === 'win') {
      stats.gamesWon++;
      stats.winStreak++;
      if (stats.winStreak > stats.bestWinStreak) {
        stats.bestWinStreak = stats.winStreak;
      }
      stats.onlineGamesWon++;
    } else if (result === 'loss') {
      stats.gamesLost++;
      stats.winStreak = 0;
    } else if (result === 'draw') {
      stats.gamesDraw++;
    }
  }

  // Track bot victories separately without affecting competitive counters
  if (gameMode === 'bot' && result === 'win' && difficulty) {
    stats.botGamesWon[difficulty] = (stats.botGamesWon[difficulty] || 0) + 1;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
};

// Award coins for game result
export const awardCoins = (result, gameMode, difficulty = null) => {
  let coinsToAdd = 0;
  const stats = getStats();

  if (result === 'win') {
    if (gameMode === 'bot') {
      coinsToAdd = COIN_REWARDS[`bot_${difficulty}`] || 10;
    } else if (gameMode === 'online') {
      coinsToAdd = COIN_REWARDS.online;
    } else {
      coinsToAdd = 0; // local wins give zero
    }
  } else if (result === 'loss') {
    if (gameMode === 'online') {
      coinsToAdd = COIN_REWARDS.online_loss;
    }
  } else if (result === 'draw') {
    coinsToAdd = gameMode === 'local' ? 0 : COIN_REWARDS.draw;
  }

  // Cap daily bot earnings to BOT_DAILY_LIMIT and reset at midnight
  if (gameMode === 'bot') {
    const daily = getBotDailyState();
    const remainingToday = Math.max(0, BOT_DAILY_LIMIT - daily.earned);
    coinsToAdd = Math.min(coinsToAdd, remainingToday);
    if (coinsToAdd > 0) {
      saveBotDailyState({ date: daily.date, earned: daily.earned + coinsToAdd });
    }
  }

  if (coinsToAdd > 0) {
    const newCoins = addCoins(coinsToAdd);
    const updatedStats = {
      ...stats,
      totalCoinsEarned: (stats.totalCoinsEarned || 0) + coinsToAdd,
      botCoinsEarned: gameMode === 'bot'
        ? (stats.botCoinsEarned || 0) + coinsToAdd
        : (stats.botCoinsEarned || 0)
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    return { coinsAdded: coinsToAdd, totalCoins: newCoins };
  }

  // Persist stats even if no coins added (to keep defaults applied)
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
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
