import { getAllShopItems } from './shopManager';

const BOX_KEY = 'tictacthree_mbox_count';
const BOX_PROGRESS_KEY = 'tictacthree_mbox_progress';
const BOX_LAST_CLAIM_KEY = 'tictacthree_mbox_last_claim';

export const getLocalBoxState = () => {
  const boxes = parseInt(localStorage.getItem(BOX_KEY) || '0', 10);
  const progress = parseInt(localStorage.getItem(BOX_PROGRESS_KEY) || '0', 10);
  const lastClaimRaw = localStorage.getItem(BOX_LAST_CLAIM_KEY);
  const lastClaim = lastClaimRaw ? parseInt(lastClaimRaw, 10) : null;
  return { boxes, progress, lastClaim };
};

export const saveLocalBoxState = (boxes, progress, lastClaim) => {
  localStorage.setItem(BOX_KEY, String(boxes));
  localStorage.setItem(BOX_PROGRESS_KEY, String(progress));
  if (lastClaim) localStorage.setItem(BOX_LAST_CLAIM_KEY, String(lastClaim));
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
