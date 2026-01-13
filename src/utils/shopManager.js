// Shop items and avatar system
export const SHOP_ITEMS = {
  avatarFrames: [
    {
      id: 'frame_basic',
      name: 'Basic Frame',
      type: 'frame',
      price: 0,
      color: '#667eea',
      description: 'Default avatar frame',
      image: 'basic'
    },
    {
      id: 'frame_gold',
      name: 'Gold Frame',
      type: 'frame',
      price: 100,
      color: '#ffd700',
      description: 'Shiny gold border',
      image: 'gold'
    },
    {
      id: 'frame_rainbow',
      name: 'Rainbow Frame',
      type: 'frame',
      price: 250,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      description: 'Animated rainbow effect',
      image: 'rainbow'
    },
    {
      id: 'frame_fire',
      name: 'Fire Frame',
      type: 'frame',
      price: 300,
      color: '#ff4500',
      description: 'Blazing fire effect',
      image: 'fire'
    },
    {
      id: 'frame_ice',
      name: 'Ice Frame',
      type: 'frame',
      price: 300,
      color: '#00f5ff',
      description: 'Frozen ice effect',
      image: 'ice'
    },
    {
      id: 'frame_diamond',
      name: 'Diamond Frame',
      type: 'frame',
      price: 500,
      color: '#b9f2ff',
      description: 'Rare diamond border',
      image: 'diamond'
    }
  ],
  avatarBackgrounds: [
    {
      id: 'bg_none',
      name: 'No Background',
      type: 'background',
      price: 0,
      color: 'transparent',
      description: 'Default transparent',
      image: 'none'
    },
    {
      id: 'bg_purple',
      name: 'Purple Glow',
      type: 'background',
      price: 50,
      color: '#667eea',
      description: 'Purple gradient glow',
      image: 'purple'
    },
    {
      id: 'bg_green',
      name: 'Green Glow',
      type: 'background',
      price: 50,
      color: '#00e676',
      description: 'Green gradient glow',
      image: 'green'
    },
    {
      id: 'bg_red',
      name: 'Red Glow',
      type: 'background',
      price: 50,
      color: '#ff4b5c',
      description: 'Red gradient glow',
      image: 'red'
    },
    {
      id: 'bg_galaxy',
      name: 'Galaxy',
      type: 'background',
      price: 200,
      color: '#1a1a2e',
      description: 'Starry galaxy background',
      image: 'galaxy'
    }
  ]
};

// Get all shop items
export const getAllShopItems = () => {
  return [...SHOP_ITEMS.avatarFrames, ...SHOP_ITEMS.avatarBackgrounds];
};

// Get default inventory for new users
export const getDefaultInventory = () => {
  return ['frame_basic', 'bg_none'];
};

// Get default avatar config
export const getDefaultAvatarConfig = () => {
  return {
    frame: 'frame_basic',
    background: 'bg_none',
    letter: 'A'
  };
};

// Generate avatar letter from display name
export const getAvatarLetter = (displayName) => {
  if (!displayName) return 'G';
  return displayName.charAt(0).toUpperCase();
};

// Check if display name is unique
export const isDisplayNameUnique = async (displayName, currentUserId, db) => {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('displayName', '==', displayName));
  const snapshot = await getDocs(q);

  // Allow if it's the user's current name
  if (snapshot.size === 1 && snapshot.docs[0].id === currentUserId) {
    return true;
  }

  return snapshot.empty;
};

// Check if user can change display name (7 day cooldown)
export const canChangeDisplayName = (lastChanged) => {
  if (!lastChanged) return true;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - lastChanged > sevenDays;
};

// Get time until next name change
export const getTimeUntilNameChange = (lastChanged) => {
  if (!lastChanged) return 0;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const timeLeft = sevenDays - (Date.now() - lastChanged);
  return Math.max(0, timeLeft);
};

// Format time remaining
export const formatTimeRemaining = (milliseconds) => {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''}`;
};
