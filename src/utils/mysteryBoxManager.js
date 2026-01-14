import { getAllShopItems } from './shopManager';

const BOX_KEY = 'tictacthree_mbox_count';
const BOX_PROGRESS_KEY = 'tictacthree_mbox_progress';
const BOX_LAST_CLAIM_KEY = 'tictacthree_mbox_last_claim';
const BOX_DAILY_OPEN_KEY = 'tictacthree_mbox_daily_open';

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD for midnight resets

// Normalize a saved daily open record against "today"
export const normalizeDailyBoxOpenState = (date, count) => {
  const today = todayKey();
  if (date !== today) {
    return { date: today, count: 0 };
  }
  return { date: today, count: count || 0 };
};

export const getDailyBoxOpenState = () => {
  const today = todayKey();
  const stored = localStorage.getItem(BOX_DAILY_OPEN_KEY);
  if (!stored) return { date: today, count: 0 };

  try {
    const parsed = JSON.parse(stored);
    return normalizeDailyBoxOpenState(parsed.date, parsed.count);
  } catch (e) {
    return { date: today, count: 0 };
  }
};

export const saveDailyBoxOpenState = (state) => {
  localStorage.setItem(BOX_DAILY_OPEN_KEY, JSON.stringify(state));
};

export const getLocalBoxState = () => {
  const boxes = parseInt(localStorage.getItem(BOX_KEY) || '0', 10);
  const progress = parseInt(localStorage.getItem(BOX_PROGRESS_KEY) || '0', 10);
  const lastClaimRaw = localStorage.getItem(BOX_LAST_CLAIM_KEY);
  const lastClaim = lastClaimRaw ? parseInt(lastClaimRaw, 10) : null;
  const dailyOpens = getDailyBoxOpenState();
  return { boxes, progress, lastClaim, dailyOpens };
};

export const saveLocalBoxState = (boxes, progress, lastClaim, dailyOpens = null) => {
  localStorage.setItem(BOX_KEY, String(boxes));
  localStorage.setItem(BOX_PROGRESS_KEY, String(progress));
  if (lastClaim) localStorage.setItem(BOX_LAST_CLAIM_KEY, String(lastClaim));
  // Persist the daily open counter when provided
  if (dailyOpens) saveDailyBoxOpenState(dailyOpens);
};

export const canClaimDailyBox = (lastClaim) => {
  if (!lastClaim) return true;
  const oneDay = 24 * 60 * 60 * 1000;
  return Date.now() - lastClaim >= oneDay;
};

export const dailyCooldownMs = (lastClaim) => {
  if (!lastClaim) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.max(0, oneDay - (Date.now() - lastClaim));
};

const randomCoinReward = () => 50 + Math.floor(Math.random() * 101); // 50-150

export const rollMysteryReward = (ownedIds = []) => {
  const items = getAllShopItems();
  const unowned = items.filter((item) => !ownedIds.includes(item.id));

  if (unowned.length > 0 && Math.random() < 0.7) {
    const choice = unowned[Math.floor(Math.random() * unowned.length)];
    return { type: 'cosmetic', item: choice };
  }

  return { type: 'coins', coins: randomCoinReward() };
};

export const duplicateToCoins = () => ({ type: 'coins', coins: randomCoinReward() });
