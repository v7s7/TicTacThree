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

const isGradient = (value) => typeof value === 'string' && value.includes('gradient');

const getFallbackFrame = () => SHOP_ITEMS.avatarFrames.find((f) => f.id === 'frame_basic') || SHOP_ITEMS.avatarFrames[0];
const getFallbackBackground = () => SHOP_ITEMS.avatarBackgrounds.find((b) => b.id === 'bg_none') || SHOP_ITEMS.avatarBackgrounds[0];

export const getAvatarFrameById = (frameId) => {
  if (!frameId) return null;
  return getAllAvatarFrames().find((f) => f.id === frameId) || null;
};

export const getAvatarBackgroundById = (backgroundId) => {
  if (!backgroundId) return null;
  return SHOP_ITEMS.avatarBackgrounds.find((b) => b.id === backgroundId) || null;
};

/**
 * Resolve equipped avatar ids to concrete render info (colors/images) so UI stays consistent.
 * Supports custom uploaded frames (with imageUrl).
 */
export const getAvatarRenderInfo = (avatar = {}, options = {}) => {
  const borderWidth = Number.isFinite(options.borderWidth) ? options.borderWidth : 3;
  const contentScale = typeof options.contentScale === 'number' ? options.contentScale : 0.72;

  const resolvedFrame = getAvatarFrameById(avatar.frame) || getFallbackFrame();
  const resolvedBackground = getAvatarBackgroundById(avatar.background) || getFallbackBackground();

  const frameColor = resolvedFrame?.color || '#667eea';
  const frameIsGradient = isGradient(frameColor);
  const bgColor = resolvedBackground?.color;
  const bgIsGradient = isGradient(bgColor);
  const bgHasImage = !!resolvedBackground?.imageUrl;

  const bgLayer = bgHasImage
    ? `url(${resolvedBackground.imageUrl})`
    : bgIsGradient
    ? bgColor
    : bgColor
    ? `linear-gradient(${bgColor}, ${bgColor})`
    : 'linear-gradient(rgba(26, 26, 46, 0.6), rgba(26, 26, 46, 0.6))';

  const style = {
    backgroundColor: !bgHasImage && !bgIsGradient && !frameIsGradient ? (bgColor || 'rgba(26, 26, 46, 0.6)') : undefined,
    backgroundImage: undefined,
    backgroundSize: undefined,
    backgroundPosition: undefined,
    backgroundRepeat: undefined,
    border: frameIsGradient ? `${borderWidth}px solid transparent` : `${borderWidth}px solid ${frameColor}`,
    backgroundOrigin: undefined,
    backgroundClip: undefined,
    position: 'relative',
    overflow: 'visible'
  };

  if (frameIsGradient) {
    // Two-layer background: actual background in padding-box + gradient frame in border-box
    style.backgroundImage = `${bgLayer}, ${frameColor}`;
    style.backgroundOrigin = 'border-box';
    style.backgroundClip = 'padding-box, border-box';
    style.backgroundSize = bgHasImage ? 'cover, cover' : undefined;
    style.backgroundPosition = bgHasImage ? 'center, center' : undefined;
    style.backgroundRepeat = bgHasImage ? 'no-repeat, no-repeat' : undefined;
  } else if (bgHasImage || bgIsGradient) {
    style.backgroundImage = bgLayer;
    style.backgroundSize = bgHasImage ? 'cover' : undefined;
    style.backgroundPosition = bgHasImage ? 'center' : undefined;
    style.backgroundRepeat = bgHasImage ? 'no-repeat' : undefined;
  }

  const ringUrl = resolvedFrame?.imageUrl || null;
  const ringScale = Number.isFinite(resolvedFrame?.ringScale) ? resolvedFrame.ringScale : 1.35;
  const ringOffsetX = Number.isFinite(resolvedFrame?.ringOffsetX) ? resolvedFrame.ringOffsetX : 0;
  const ringOffsetY = Number.isFinite(resolvedFrame?.ringOffsetY) ? resolvedFrame.ringOffsetY : 0;

  const ringStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    transform: `translate(-50%, -50%) translate(${ringOffsetX}px, ${ringOffsetY}px) scale(${ringScale})`,
    objectFit: 'contain',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 2
  };

  const contentStyle = {
    width: `${Math.round(contentScale * 100)}%`,
    height: `${Math.round(contentScale * 100)}%`,
    borderRadius: '50%',
    position: 'relative',
    zIndex: 1
  };

  return {
    frame: resolvedFrame,
    background: resolvedBackground,
    style,
    ringUrl,
    ringStyle,
    contentStyle
  };
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
    ringScale: Number.isFinite(avatar.ringScale) ? avatar.ringScale : 1.35,
    ringOffsetX: Number.isFinite(avatar.ringOffsetX) ? avatar.ringOffsetX : 0,
    ringOffsetY: Number.isFinite(avatar.ringOffsetY) ? avatar.ringOffsetY : 0,
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
