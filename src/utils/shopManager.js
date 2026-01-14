// Shop items and avatar system - SIMPLIFIED VERSION
export const SHOP_ITEMS = {
  avatarFrames: [
    // ========== SIMPLE AVATARS (3 only) ==========
    {
      id: 'frame_basic',
      name: 'Basic Frame',
      type: 'frame',
      tier: 'free',
      price: 0,
      color: '#667eea',
      description: 'Default avatar frame',
      image: 'basic'
    },
    {
      id: 'frame_clean',
      name: 'Clean Frame',
      type: 'frame',
      tier: 'free',
      price: 0,
      color: '#e0e0e0',
      description: 'Simple clean border',
      image: 'clean'
    },
    {
      id: 'frame_minimal',
      name: 'Minimal Frame',
      type: 'frame',
      tier: 'free',
      price: 0,
      color: '#9e9e9e',
      description: 'Minimalist style',
      image: 'minimal'
    }
  ],
  
  avatarBackgrounds: [
    {
      id: 'bg_none',
      name: 'No Background',
      type: 'background',
      tier: 'free',
      price: 0,
      color: 'transparent',
      description: 'Default transparent',
      image: 'none'
    },
    {
      id: 'bg_purple',
      name: 'Purple Glow',
      type: 'background',
      tier: 'basic',
      price: 50,
      color: '#667eea',
      description: 'Purple gradient glow',
      image: 'purple'
    },
    {
      id: 'bg_green',
      name: 'Green Glow',
      type: 'background',
      tier: 'basic',
      price: 50,
      color: '#00e676',
      description: 'Green gradient glow',
      image: 'green'
    },
    {
      id: 'bg_red',
      name: 'Red Glow',
      type: 'background',
      tier: 'basic',
      price: 50,
      color: '#ff4b5c',
      description: 'Red gradient glow',
      image: 'red'
    }
  ]
};

// ========== CUSTOM UPLOADED AVATARS SYSTEM ==========
// This is populated from Firestore where admin can upload avatars
let customUploadedAvatars = [];

/**
 * Load custom uploaded avatars from Firestore
 * Only admin users can add/modify these
 */
export const loadCustomAvatars = (avatars) => {
  customUploadedAvatars = avatars;
};

/**
 * Get all avatars including custom uploaded ones
 */
export const getAllAvatarFrames = () => {
  return [...SHOP_ITEMS.avatarFrames, ...customUploadedAvatars];
};

/**
 * Add a new custom avatar (admin only)
 * @param {Object} avatar - Avatar object with id, name, price, imageUrl, etc.
 */
export const addCustomAvatar = async (avatar, db) => {
  const { doc, setDoc } = await import('firebase/firestore');
  
  const customAvatar = {
    id: avatar.id || `custom_${Date.now()}`,
    name: avatar.name,
    type: 'frame',
    tier: 'custom',
    price: avatar.price || 0,
    color: avatar.color || '#667eea',
    description: avatar.description || '',
    imageUrl: avatar.imageUrl, // This is the uploaded image URL
    image: 'custom',
    custom: true,
    createdAt: Date.now()
  };
  
  // Save to Firestore
  const avatarRef = doc(db, 'customAvatars', customAvatar.id);
  await setDoc(avatarRef, customAvatar);
  
  // Add to local array
  customUploadedAvatars.push(customAvatar);
  
  return customAvatar;
};

/**
 * Update a custom avatar (admin only)
 */
export const updateCustomAvatar = async (avatarId, updates, db) => {
  const { doc, updateDoc } = await import('firebase/firestore');
  
  const avatarRef = doc(db, 'customAvatars', avatarId);
  await updateDoc(avatarRef, {
    ...updates,
    updatedAt: Date.now()
  });
  
  // Update local array
  const index = customUploadedAvatars.findIndex(a => a.id === avatarId);
  if (index !== -1) {
    customUploadedAvatars[index] = { ...customUploadedAvatars[index], ...updates };
  }
};

/**
 * Delete a custom avatar (admin only)
 */
export const deleteCustomAvatar = async (avatarId, db) => {
  const { doc, deleteDoc } = await import('firebase/firestore');
  
  const avatarRef = doc(db, 'customAvatars', avatarId);
  await deleteDoc(avatarRef);
  
  // Remove from local array
  customUploadedAvatars = customUploadedAvatars.filter(a => a.id !== avatarId);
};

/**
 * Fetch all custom avatars from Firestore
 */
export const fetchCustomAvatars = async (db) => {
  const { collection, getDocs } = await import('firebase/firestore');
  
  const avatarsRef = collection(db, 'customAvatars');
  const snapshot = await getDocs(avatarsRef);
  
  const avatars = [];
  snapshot.forEach((doc) => {
    avatars.push({ id: doc.id, ...doc.data() });
  });
  
  customUploadedAvatars = avatars;
  return avatars;
};

// Get all shop items
export const getAllShopItems = () => {
  return [...getAllAvatarFrames(), ...SHOP_ITEMS.avatarBackgrounds];
};

// Get items by tier
export const getItemsByTier = (tier, type = null) => {
  let items = getAllShopItems();
  if (type === 'frame') items = getAllAvatarFrames();
  if (type === 'background') items = SHOP_ITEMS.avatarBackgrounds;
  return items.filter(item => item.tier === tier);
};

// Get items by element (not used anymore, but keeping for compatibility)
export const getItemsByElement = (element) => {
  return getAllShopItems().filter(item => item.element === element);
};

// Check if item is rank-locked (simplified - no rank-locked items now)
export const isRankLocked = (item) => {
  return false; // No rank-locked items in simplified version
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
