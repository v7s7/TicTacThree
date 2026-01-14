// Shop items and avatar system
export const SHOP_ITEMS = {
  avatarFrames: [
    // ========== FREE AVATARS ==========
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
    },
    
    // ========== ANIMATED AVATARS ==========
    {
      id: 'frame_pulse',
      name: 'Pulse Frame',
      type: 'frame',
      tier: 'animated',
      price: 150,
      color: '#00bcd4',
      description: 'Subtle pulsing glow',
      image: 'pulse',
      animated: true,
      animationType: 'pulse'
    },
    {
      id: 'frame_shimmer',
      name: 'Shimmer Frame',
      type: 'frame',
      tier: 'animated',
      price: 180,
      color: '#e1bee7',
      description: 'Gentle shimmer effect',
      image: 'shimmer',
      animated: true,
      animationType: 'shimmer'
    },
    {
      id: 'frame_rainbow',
      name: 'Rainbow Frame',
      type: 'frame',
      tier: 'animated',
      price: 400,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      description: 'Animated rainbow effect',
      image: 'rainbow',
      animated: true,
      animationType: 'rainbow',
      rankRequired: 'Gold'
    },
    
    // ========== ELEMENTAL AVATARS ==========
    {
      id: 'frame_fire',
      name: 'Fire Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'fire',
      price: 350,
      color: '#ff4500',
      description: 'Blazing flames with ember particles',
      image: 'fire',
      animated: true,
      animationType: 'fire',
      rankRequired: 'Platinum',
      effects: ['fireParticles', 'heatDistortion']
    },
    {
      id: 'frame_ice',
      name: 'Ice Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'ice',
      price: 320,
      color: '#00f5ff',
      description: 'Frozen crystals with frost shimmer',
      image: 'ice',
      animated: true,
      animationType: 'ice',
      rankRequired: 'Gold',
      effects: ['frostShimmer', 'iceCracks']
    },
    {
      id: 'frame_lightning',
      name: 'Lightning Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'lightning',
      price: 380,
      color: '#ffeb3b',
      description: 'Electric arcs and sparks',
      image: 'lightning',
      animated: true,
      animationType: 'lightning',
      rankRequired: 'Platinum',
      effects: ['electricArcs', 'sparks']
    },
    {
      id: 'frame_shadow',
      name: 'Shadow Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'shadow',
      price: 360,
      color: '#424242',
      description: 'Smoke drift with pulsing glow',
      image: 'shadow',
      animated: true,
      animationType: 'shadow',
      rankRequired: 'Gold',
      effects: ['smokeDrift', 'darkPulse']
    },
    {
      id: 'frame_nature',
      name: 'Nature Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'nature',
      price: 340,
      color: '#4caf50',
      description: 'Leaves and nature energy',
      image: 'nature',
      animated: true,
      animationType: 'nature',
      rankRequired: 'Gold',
      effects: ['floatingLeaves', 'natureGlow']
    },
    {
      id: 'frame_light',
      name: 'Light Frame',
      type: 'frame',
      tier: 'elemental',
      element: 'light',
      price: 370,
      color: '#fff9c4',
      description: 'Radiant light energy',
      image: 'light',
      animated: true,
      animationType: 'light',
      rankRequired: 'Platinum',
      effects: ['lightRays', 'holyGlow']
    },
    
    // ========== MYTHIC/FANTASY AVATARS ==========
    {
      id: 'frame_dragon',
      name: 'Dragon Frame',
      type: 'frame',
      tier: 'mythic',
      price: 600,
      color: '#d32f2f',
      description: 'Legendary dragon aura',
      image: 'dragon',
      animated: true,
      animationType: 'dragon',
      rankRequired: 'Diamond',
      effects: ['dragonFlames', 'scales']
    },
    {
      id: 'frame_phoenix',
      name: 'Phoenix Frame',
      type: 'frame',
      tier: 'mythic',
      price: 650,
      color: '#ff6f00',
      description: 'Rising phoenix with rebirth flames',
      image: 'phoenix',
      animated: true,
      animationType: 'phoenix',
      rankRequired: 'Diamond',
      effects: ['phoenixFlames', 'rebirth']
    },
    {
      id: 'frame_celestial',
      name: 'Celestial Frame',
      type: 'frame',
      tier: 'mythic',
      price: 700,
      color: '#9c27b0',
      description: 'Cosmic celestial energy',
      image: 'celestial',
      animated: true,
      animationType: 'celestial',
      rankRequired: 'Master',
      effects: ['starParticles', 'cosmicGlow']
    },
    {
      id: 'frame_void',
      name: 'Void Frame',
      type: 'frame',
      tier: 'mythic',
      price: 720,
      color: '#1a237e',
      description: 'Dark void energy',
      image: 'void',
      animated: true,
      animationType: 'void',
      rankRequired: 'Master',
      effects: ['voidParticles', 'darkEnergy']
    },
    
    // ========== RANK-LOCKED AVATARS ==========
    {
      id: 'frame_diamond',
      name: 'Diamond Frame',
      type: 'frame',
      tier: 'rank-locked',
      price: 0,
      color: '#b9f2ff',
      description: 'Diamond rank exclusive',
      image: 'diamond',
      animated: true,
      animationType: 'diamond',
      rankRequired: 'Diamond',
      rankLocked: true,
      effects: ['diamondShine', 'gemGlow']
    },
    {
      id: 'frame_master',
      name: 'Master Frame',
      type: 'frame',
      tier: 'rank-locked',
      price: 0,
      color: '#ef6c00',
      description: 'Master rank exclusive',
      image: 'master',
      animated: true,
      animationType: 'master',
      rankRequired: 'Master',
      rankLocked: true,
      effects: ['masterAura', 'energyRings']
    },
    {
      id: 'frame_grandmaster',
      name: 'Grandmaster Frame',
      type: 'frame',
      tier: 'rank-locked',
      price: 0,
      color: '#ff4081',
      description: 'Grandmaster rank exclusive - ultimate prestige',
      image: 'grandmaster',
      animated: true,
      animationType: 'grandmaster',
      rankRequired: 'Grandmaster',
      rankLocked: true,
      effects: ['gmAura', 'crownParticles', 'energyRings']
    },
    
    // ========== SEASONAL/EVENT AVATARS ==========
    {
      id: 'frame_winter',
      name: 'Winter Frost',
      type: 'frame',
      tier: 'seasonal',
      season: 'winter',
      price: 250,
      color: '#b3e5fc',
      description: 'Winter season exclusive',
      image: 'winter',
      animated: true,
      animationType: 'winterFrost',
      effects: ['snowfall', 'frostCrystals']
    },
    {
      id: 'frame_halloween',
      name: 'Spooky Frame',
      type: 'frame',
      tier: 'seasonal',
      season: 'halloween',
      price: 300,
      color: '#ff6f00',
      description: 'Halloween special',
      image: 'halloween',
      animated: true,
      animationType: 'spooky',
      effects: ['ghostWisps', 'pumpkinGlow']
    },
    {
      id: 'frame_gold',
      name: 'Gold Frame',
      type: 'frame',
      tier: 'premium',
      price: 100,
      color: '#ffd700',
      description: 'Shiny gold border',
      image: 'gold'
    }
  ],
  
  avatarBackgrounds: [
    // ========== STATIC MINIMAL BACKGROUNDS (FREE) ==========
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
      id: 'bg_dark',
      name: 'Dark',
      type: 'background',
      tier: 'free',
      price: 0,
      color: '#1a1a2e',
      description: 'Simple dark background',
      image: 'dark'
    },
    {
      id: 'bg_light',
      name: 'Light',
      type: 'background',
      tier: 'free',
      price: 0,
      color: '#f5f5f5',
      description: 'Simple light background',
      image: 'light'
    },
    
    // ========== ANIMATED GRADIENT BACKGROUNDS ==========
    {
      id: 'bg_purple',
      name: 'Purple Glow',
      type: 'background',
      tier: 'animated',
      price: 50,
      color: '#667eea',
      description: 'Purple gradient glow',
      image: 'purple',
      animated: true,
      animationType: 'gradientPulse'
    },
    {
      id: 'bg_green',
      name: 'Green Glow',
      type: 'background',
      tier: 'animated',
      price: 50,
      color: '#00e676',
      description: 'Green gradient glow',
      image: 'green',
      animated: true,
      animationType: 'gradientPulse'
    },
    {
      id: 'bg_red',
      name: 'Red Glow',
      type: 'background',
      tier: 'animated',
      price: 50,
      color: '#ff4b5c',
      description: 'Red gradient glow',
      image: 'red',
      animated: true,
      animationType: 'gradientPulse'
    },
    {
      id: 'bg_blue',
      name: 'Blue Glow',
      type: 'background',
      tier: 'animated',
      price: 50,
      color: '#2196f3',
      description: 'Blue gradient glow',
      image: 'blue',
      animated: true,
      animationType: 'gradientPulse'
    },
    {
      id: 'bg_sunset',
      name: 'Sunset Gradient',
      type: 'background',
      tier: 'animated',
      price: 120,
      color: 'linear-gradient(135deg, #ff6b6b, #ee5a6f, #c44569)',
      description: 'Warm sunset colors',
      image: 'sunset',
      animated: true,
      animationType: 'gradientShift'
    },
    {
      id: 'bg_ocean',
      name: 'Ocean Gradient',
      type: 'background',
      tier: 'animated',
      price: 120,
      color: 'linear-gradient(135deg, #0abfbc, #1c92d2, #2575fc)',
      description: 'Deep ocean colors',
      image: 'ocean',
      animated: true,
      animationType: 'gradientShift'
    },
    
    // ========== ELEMENTAL ANIMATED BACKGROUNDS ==========
    {
      id: 'bg_fire',
      name: 'Blazing Inferno',
      type: 'background',
      tier: 'elemental',
      element: 'fire',
      price: 280,
      color: 'linear-gradient(135deg, #ff0000, #ff4500, #ff8c00)',
      description: 'Flowing flames with heat distortion',
      image: 'fire',
      animated: true,
      animationType: 'fire',
      rankRequired: 'Silver',
      effects: ['flames', 'heatWaves', 'embers']
    },
    {
      id: 'bg_ice',
      name: 'Frozen Tundra',
      type: 'background',
      tier: 'elemental',
      element: 'ice',
      price: 270,
      color: 'linear-gradient(135deg, #e0f7fa, #b2ebf2, #80deea)',
      description: 'Drifting snow with crystalline shimmer',
      image: 'ice',
      animated: true,
      animationType: 'ice',
      rankRequired: 'Silver',
      effects: ['snowDrift', 'iceShimmer', 'crystals']
    },
    {
      id: 'bg_lightning',
      name: 'Storm Clouds',
      type: 'background',
      tier: 'elemental',
      element: 'lightning',
      price: 300,
      color: 'linear-gradient(135deg, #1e3c72, #2a5298, #7e22ce)',
      description: 'Slow cloud movement with lightning flashes',
      image: 'lightning',
      animated: true,
      animationType: 'lightning',
      rankRequired: 'Gold',
      effects: ['clouds', 'lightningFlash', 'thunder']
    },
    {
      id: 'bg_water',
      name: 'Deep Ocean',
      type: 'background',
      tier: 'elemental',
      element: 'water',
      price: 260,
      color: 'linear-gradient(135deg, #0c4160, #1e5f8b, #2575fc)',
      description: 'Wave motion with light refraction',
      image: 'water',
      animated: true,
      animationType: 'water',
      rankRequired: 'Silver',
      effects: ['waves', 'lightRefraction', 'bubbles']
    },
    {
      id: 'bg_space',
      name: 'Cosmic Nebula',
      type: 'background',
      tier: 'elemental',
      element: 'space',
      price: 320,
      color: 'linear-gradient(135deg, #0a0e27, #1a1a2e, #16213e)',
      description: 'Parallax stars with nebula drift',
      image: 'space',
      animated: true,
      animationType: 'space',
      rankRequired: 'Gold',
      effects: ['stars', 'nebula', 'parallax']
    },
    
    // ========== PREMIUM CINEMATIC BACKGROUNDS ==========
    {
      id: 'bg_galaxy',
      name: 'Galaxy Panorama',
      type: 'background',
      tier: 'premium',
      price: 450,
      color: '#1a1a2e',
      description: 'Starry galaxy with slow camera motion',
      image: 'galaxy',
      animated: true,
      animationType: 'galaxyPan',
      rankRequired: 'Platinum',
      effects: ['galaxyCore', 'starfield', 'cameraPan']
    },
    {
      id: 'bg_aurora',
      name: 'Aurora Borealis',
      type: 'background',
      tier: 'premium',
      price: 480,
      color: 'linear-gradient(135deg, #00c9ff, #92fe9d, #b721ff)',
      description: 'Flowing northern lights',
      image: 'aurora',
      animated: true,
      animationType: 'aurora',
      rankRequired: 'Diamond',
      effects: ['auroraWaves', 'colorShift', 'starry']
    },
    {
      id: 'bg_volcanic',
      name: 'Volcanic Eruption',
      type: 'background',
      tier: 'premium',
      price: 500,
      color: 'linear-gradient(135deg, #2c003e, #c2164d, #ff4500)',
      description: 'Molten lava with dramatic lighting',
      image: 'volcanic',
      animated: true,
      animationType: 'volcanic',
      rankRequired: 'Diamond',
      effects: ['lavaFlow', 'volcanoSmoke', 'dramaMoment']
    },
    {
      id: 'bg_heavenly',
      name: 'Heavenly Realm',
      type: 'background',
      tier: 'premium',
      price: 550,
      color: 'linear-gradient(135deg, #fff9c4, #ffeb3b, #fdd835)',
      description: 'Celestial clouds with divine light',
      image: 'heavenly',
      animated: true,
      animationType: 'heavenly',
      rankRequired: 'Master',
      effects: ['clouds', 'lightRays', 'floatingMotes']
    }
  ]
};

// Get all shop items
export const getAllShopItems = () => {
  return [...SHOP_ITEMS.avatarFrames, ...SHOP_ITEMS.avatarBackgrounds];
};

// Get items by tier
export const getItemsByTier = (tier, type = null) => {
  let items = getAllShopItems();
  if (type === 'frame') items = SHOP_ITEMS.avatarFrames;
  if (type === 'background') items = SHOP_ITEMS.avatarBackgrounds;
  return items.filter(item => item.tier === tier);
};

// Get items by element
export const getItemsByElement = (element) => {
  return getAllShopItems().filter(item => item.element === element);
};

// Check if item is rank-locked (cannot be bought)
export const isRankLocked = (item) => {
  return item.rankLocked === true;
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
