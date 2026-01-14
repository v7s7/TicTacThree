// Animation Effects System
// Modular, toggleable, and stackable animation effects for avatars and backgrounds

/**
 * ANIMATION EFFECT REGISTRY
 * Each effect defines CSS class names and configuration for rendering
 */
export const ANIMATION_EFFECTS = {
  // ========== FIRE EFFECTS ==========
  fireParticles: {
    id: 'fireParticles',
    name: 'Fire Particles',
    type: 'particle',
    className: 'effect-fire-particles',
    particleCount: 12,
    duration: '2s',
    description: 'Floating ember particles with upward motion'
  },
  
  heatDistortion: {
    id: 'heatDistortion',
    name: 'Heat Distortion',
    type: 'distortion',
    className: 'effect-heat-distortion',
    duration: '1.5s',
    description: 'Wavy heat distortion effect'
  },
  
  flames: {
    id: 'flames',
    name: 'Flames',
    type: 'background',
    className: 'effect-flames',
    duration: '3s',
    description: 'Flowing flame background animation'
  },
  
  embers: {
    id: 'embers',
    name: 'Embers',
    type: 'particle',
    className: 'effect-embers',
    particleCount: 8,
    duration: '4s',
    description: 'Slow rising ember particles'
  },
  
  // ========== ICE EFFECTS ==========
  frostShimmer: {
    id: 'frostShimmer',
    name: 'Frost Shimmer',
    type: 'overlay',
    className: 'effect-frost-shimmer',
    duration: '2s',
    description: 'Shimmering frost overlay'
  },
  
  iceCracks: {
    id: 'iceCracks',
    name: 'Ice Cracks',
    type: 'overlay',
    className: 'effect-ice-cracks',
    duration: '3s',
    description: 'Subtle ice crack animation'
  },
  
  snowDrift: {
    id: 'snowDrift',
    name: 'Snow Drift',
    type: 'particle',
    className: 'effect-snow-drift',
    particleCount: 20,
    duration: '6s',
    description: 'Drifting snow particles'
  },
  
  iceShimmer: {
    id: 'iceShimmer',
    name: 'Ice Shimmer',
    type: 'glow',
    className: 'effect-ice-shimmer',
    duration: '2.5s',
    description: 'Crystalline shimmer effect'
  },
  
  crystals: {
    id: 'crystals',
    name: 'Crystals',
    type: 'particle',
    className: 'effect-crystals',
    particleCount: 6,
    duration: '4s',
    description: 'Floating ice crystal particles'
  },
  
  // ========== LIGHTNING EFFECTS ==========
  electricArcs: {
    id: 'electricArcs',
    name: 'Electric Arcs',
    type: 'overlay',
    className: 'effect-electric-arcs',
    duration: '0.8s',
    description: 'Intermittent electric arcs'
  },
  
  sparks: {
    id: 'sparks',
    name: 'Sparks',
    type: 'particle',
    className: 'effect-sparks',
    particleCount: 10,
    duration: '1.2s',
    description: 'Electric spark particles'
  },
  
  lightningFlash: {
    id: 'lightningFlash',
    name: 'Lightning Flash',
    type: 'flash',
    className: 'effect-lightning-flash',
    duration: '0.3s',
    description: 'Sudden lightning flash'
  },
  
  clouds: {
    id: 'clouds',
    name: 'Clouds',
    type: 'background',
    className: 'effect-clouds',
    duration: '20s',
    description: 'Slow moving cloud layers'
  },
  
  // ========== SHADOW/DARK EFFECTS ==========
  smokeDrift: {
    id: 'smokeDrift',
    name: 'Smoke Drift',
    type: 'particle',
    className: 'effect-smoke-drift',
    particleCount: 8,
    duration: '5s',
    description: 'Drifting smoke wisps'
  },
  
  darkPulse: {
    id: 'darkPulse',
    name: 'Dark Pulse',
    type: 'glow',
    className: 'effect-dark-pulse',
    duration: '2s',
    description: 'Pulsing dark glow'
  },
  
  voidParticles: {
    id: 'voidParticles',
    name: 'Void Particles',
    type: 'particle',
    className: 'effect-void-particles',
    particleCount: 15,
    duration: '4s',
    description: 'Void energy particles'
  },
  
  darkEnergy: {
    id: 'darkEnergy',
    name: 'Dark Energy',
    type: 'aura',
    className: 'effect-dark-energy',
    duration: '3s',
    description: 'Swirling dark energy'
  },
  
  // ========== NATURE EFFECTS ==========
  floatingLeaves: {
    id: 'floatingLeaves',
    name: 'Floating Leaves',
    type: 'particle',
    className: 'effect-floating-leaves',
    particleCount: 10,
    duration: '8s',
    description: 'Gently floating leaves'
  },
  
  natureGlow: {
    id: 'natureGlow',
    name: 'Nature Glow',
    type: 'glow',
    className: 'effect-nature-glow',
    duration: '2s',
    description: 'Vibrant nature energy glow'
  },
  
  // ========== LIGHT EFFECTS ==========
  lightRays: {
    id: 'lightRays',
    name: 'Light Rays',
    type: 'overlay',
    className: 'effect-light-rays',
    duration: '4s',
    description: 'Radiant light rays'
  },
  
  holyGlow: {
    id: 'holyGlow',
    name: 'Holy Glow',
    type: 'glow',
    className: 'effect-holy-glow',
    duration: '2s',
    description: 'Divine holy glow'
  },
  
  floatingMotes: {
    id: 'floatingMotes',
    name: 'Floating Light Motes',
    type: 'particle',
    className: 'effect-floating-motes',
    particleCount: 15,
    duration: '6s',
    description: 'Floating light particles'
  },
  
  // ========== SPACE/COSMIC EFFECTS ==========
  starParticles: {
    id: 'starParticles',
    name: 'Star Particles',
    type: 'particle',
    className: 'effect-star-particles',
    particleCount: 20,
    duration: '10s',
    description: 'Twinkling star particles'
  },
  
  cosmicGlow: {
    id: 'cosmicGlow',
    name: 'Cosmic Glow',
    type: 'glow',
    className: 'effect-cosmic-glow',
    duration: '3s',
    description: 'Cosmic nebula glow'
  },
  
  nebula: {
    id: 'nebula',
    name: 'Nebula',
    type: 'background',
    className: 'effect-nebula',
    duration: '15s',
    description: 'Swirling nebula clouds'
  },
  
  parallax: {
    id: 'parallax',
    name: 'Parallax Stars',
    type: 'background',
    className: 'effect-parallax',
    duration: '30s',
    description: 'Multi-layer parallax star field'
  },
  
  // ========== ENERGY EFFECTS ==========
  energyRings: {
    id: 'energyRings',
    name: 'Energy Rings',
    type: 'orbital',
    className: 'effect-energy-rings',
    duration: '3s',
    description: 'Orbiting energy rings'
  },
  
  masterAura: {
    id: 'masterAura',
    name: 'Master Aura',
    type: 'aura',
    className: 'effect-master-aura',
    duration: '2.5s',
    description: 'Powerful master rank aura'
  },
  
  gmAura: {
    id: 'gmAura',
    name: 'Grandmaster Aura',
    type: 'aura',
    className: 'effect-gm-aura',
    duration: '2s',
    description: 'Ultimate grandmaster aura'
  },
  
  crownParticles: {
    id: 'crownParticles',
    name: 'Crown Particles',
    type: 'particle',
    className: 'effect-crown-particles',
    particleCount: 12,
    duration: '4s',
    description: 'Royal crown sparkles'
  },
  
  // ========== MYTHIC EFFECTS ==========
  dragonFlames: {
    id: 'dragonFlames',
    name: 'Dragon Flames',
    type: 'particle',
    className: 'effect-dragon-flames',
    particleCount: 15,
    duration: '3s',
    description: 'Intense dragon fire'
  },
  
  phoenixFlames: {
    id: 'phoenixFlames',
    name: 'Phoenix Flames',
    type: 'particle',
    className: 'effect-phoenix-flames',
    particleCount: 20,
    duration: '2.5s',
    description: 'Rebirth flames'
  },
  
  // ========== WATER EFFECTS ==========
  waves: {
    id: 'waves',
    name: 'Waves',
    type: 'background',
    className: 'effect-waves',
    duration: '8s',
    description: 'Undulating water waves'
  },
  
  lightRefraction: {
    id: 'lightRefraction',
    name: 'Light Refraction',
    type: 'overlay',
    className: 'effect-light-refraction',
    duration: '4s',
    description: 'Underwater light caustics'
  },
  
  bubbles: {
    id: 'bubbles',
    name: 'Bubbles',
    type: 'particle',
    className: 'effect-bubbles',
    particleCount: 12,
    duration: '5s',
    description: 'Rising water bubbles'
  },
  
  // ========== PREMIUM EFFECTS ==========
  galaxyCore: {
    id: 'galaxyCore',
    name: 'Galaxy Core',
    type: 'background',
    className: 'effect-galaxy-core',
    duration: '20s',
    description: 'Rotating galaxy center'
  },
  
  auroraWaves: {
    id: 'auroraWaves',
    name: 'Aurora Waves',
    type: 'background',
    className: 'effect-aurora-waves',
    duration: '10s',
    description: 'Flowing aurora borealis'
  },
  
  lavaFlow: {
    id: 'lavaFlow',
    name: 'Lava Flow',
    type: 'background',
    className: 'effect-lava-flow',
    duration: '12s',
    description: 'Flowing molten lava'
  },
  
  // ========== RANK MEDAL EFFECTS ==========
  diamondShine: {
    id: 'diamondShine',
    name: 'Diamond Shine',
    type: 'glow',
    className: 'effect-diamond-shine',
    duration: '2s',
    description: 'Diamond sparkle effect'
  },
  
  gemGlow: {
    id: 'gemGlow',
    name: 'Gem Glow',
    type: 'glow',
    className: 'effect-gem-glow',
    duration: '2.5s',
    description: 'Precious gem glow'
  },
  
  // ========== ADDITIONAL MEDAL EFFECTS ==========
  subtleGlow: {
    id: 'subtleGlow',
    name: 'Subtle Glow',
    type: 'glow',
    className: 'effect-subtle-glow',
    duration: '2s',
    description: 'Gentle subtle glow'
  },
  
  metalShine: {
    id: 'metalShine',
    name: 'Metal Shine',
    type: 'glow',
    className: 'effect-metal-shine',
    duration: '2.5s',
    description: 'Metallic shine effect'
  },
  
  goldGlow: {
    id: 'goldGlow',
    name: 'Gold Glow',
    type: 'glow',
    className: 'effect-gold-glow',
    duration: '2s',
    description: 'Golden radiance'
  },
  
  platinumGlow: {
    id: 'platinumGlow',
    name: 'Platinum Glow',
    type: 'glow',
    className: 'effect-platinum-glow',
    duration: '2.5s',
    description: 'Platinum shimmer'
  },
  
  subtleParticles: {
    id: 'subtleParticles',
    name: 'Subtle Particles',
    type: 'particle',
    className: 'effect-subtle-particles',
    particleCount: 8,
    duration: '3s',
    description: 'Gentle floating particles'
  },
  
  prismGlow: {
    id: 'prismGlow',
    name: 'Prism Glow',
    type: 'glow',
    className: 'effect-prism-glow',
    duration: '2s',
    description: 'Prismatic light refraction'
  },
  
  sparkles: {
    id: 'sparkles',
    name: 'Sparkles',
    type: 'particle',
    className: 'effect-sparkles',
    particleCount: 10,
    duration: '2s',
    description: 'Twinkling sparkles'
  },
  
  masterShine: {
    id: 'masterShine',
    name: 'Master Shine',
    type: 'glow',
    className: 'effect-master-shine',
    duration: '2.5s',
    description: 'Master rank metallic shine'
  },
  
  flamingGlow: {
    id: 'flamingGlow',
    name: 'Flaming Glow',
    type: 'glow',
    className: 'effect-flaming-glow',
    duration: '2s',
    description: 'Fiery glowing aura'
  },
  
  gmShine: {
    id: 'gmShine',
    name: 'Grandmaster Shine',
    type: 'glow',
    className: 'effect-gm-shine',
    duration: '2s',
    description: 'Ultimate grandmaster shine'
  },
  
  supremeGlow: {
    id: 'supremeGlow',
    name: 'Supreme Glow',
    type: 'glow',
    className: 'effect-supreme-glow',
    duration: '2s',
    description: 'Supreme prestige glow'
  },
  
  // ========== MYTHIC EFFECTS ==========
  scales: {
    id: 'scales',
    name: 'Dragon Scales',
    type: 'overlay',
    className: 'effect-scales',
    duration: '3s',
    description: 'Shimmering dragon scales'
  },
  
  rebirth: {
    id: 'rebirth',
    name: 'Rebirth',
    type: 'flash',
    className: 'effect-rebirth',
    duration: '2s',
    description: 'Phoenix rebirth flash'
  },
  
  // ========== SEASONAL EFFECTS ==========
  snowfall: {
    id: 'snowfall',
    name: 'Snowfall',
    type: 'particle',
    className: 'effect-snowfall',
    particleCount: 25,
    duration: '8s',
    description: 'Falling snowflakes'
  },
  
  frostCrystals: {
    id: 'frostCrystals',
    name: 'Frost Crystals',
    type: 'particle',
    className: 'effect-frost-crystals',
    particleCount: 12,
    duration: '4s',
    description: 'Floating frost crystals'
  },
  
  ghostWisps: {
    id: 'ghostWisps',
    name: 'Ghost Wisps',
    type: 'particle',
    className: 'effect-ghost-wisps',
    particleCount: 8,
    duration: '5s',
    description: 'Spooky ghost wisps'
  },
  
  pumpkinGlow: {
    id: 'pumpkinGlow',
    name: 'Pumpkin Glow',
    type: 'glow',
    className: 'effect-pumpkin-glow',
    duration: '2s',
    description: 'Orange pumpkin glow'
  },
  
  // ========== ADDITIONAL BACKGROUND EFFECTS ==========
  heatWaves: {
    id: 'heatWaves',
    name: 'Heat Waves',
    type: 'distortion',
    className: 'effect-heat-waves',
    duration: '3s',
    description: 'Rippling heat waves'
  },
  
  thunder: {
    id: 'thunder',
    name: 'Thunder',
    type: 'flash',
    className: 'effect-thunder',
    duration: '0.5s',
    description: 'Thunder flash effect'
  },
  
  stars: {
    id: 'stars',
    name: 'Stars',
    type: 'background',
    className: 'effect-stars',
    duration: '30s',
    description: 'Twinkling star background'
  },
  
  starfield: {
    id: 'starfield',
    name: 'Star Field',
    type: 'background',
    className: 'effect-starfield',
    duration: '40s',
    description: 'Dense star field'
  },
  
  cameraPan: {
    id: 'cameraPan',
    name: 'Camera Pan',
    type: 'background',
    className: 'effect-camera-pan',
    duration: '30s',
    description: 'Slow camera panning motion'
  },
  
  colorShift: {
    id: 'colorShift',
    name: 'Color Shift',
    type: 'background',
    className: 'effect-color-shift',
    duration: '10s',
    description: 'Gradual color shifting'
  },
  
  starry: {
    id: 'starry',
    name: 'Starry',
    type: 'background',
    className: 'effect-starry',
    duration: '20s',
    description: 'Starry night background'
  },
  
  volcanoSmoke: {
    id: 'volcanoSmoke',
    name: 'Volcano Smoke',
    type: 'particle',
    className: 'effect-volcano-smoke',
    particleCount: 15,
    duration: '6s',
    description: 'Rising volcanic smoke'
  },
  
  dramaMoment: {
    id: 'dramaMoment',
    name: 'Drama Moment',
    type: 'flash',
    className: 'effect-drama-moment',
    duration: '1s',
    description: 'Dramatic lighting moment'
  }
};

/**
 * Get effect configuration by ID
 */
export const getEffect = (effectId) => {
  return ANIMATION_EFFECTS[effectId];
};

/**
 * Get all effects for an item
 */
export const getItemEffects = (item) => {
  if (!item.effects || !Array.isArray(item.effects)) return [];
  return item.effects.map(effectId => ANIMATION_EFFECTS[effectId]).filter(Boolean);
};

/**
 * Check if effect is GPU-friendly
 * Effects using transform, opacity, and filter are GPU-accelerated
 */
export const isGPUFriendly = (effect) => {
  // All our effects use GPU-accelerated properties
  return true;
};

/**
 * Get animation duration in milliseconds
 */
export const getEffectDuration = (effect) => {
  if (!effect.duration) return 2000;
  const match = effect.duration.match(/(\d+\.?\d*)s/);
  return match ? parseFloat(match[1]) * 1000 : 2000;
};

/**
 * Check if an effect should be active based on conditions
 */
export const shouldEffectBeActive = (effect, context = {}) => {
  // Future: Add logic for conditional effects (e.g., only in certain modes)
  return true;
};

/**
 * Performance optimization: reduce particle counts on low-end devices
 */
export const getOptimizedParticleCount = (effect, devicePerformance = 'high') => {
  if (!effect.particleCount) return 0;
  
  const counts = {
    low: Math.ceil(effect.particleCount * 0.5),
    medium: Math.ceil(effect.particleCount * 0.75),
    high: effect.particleCount
  };
  
  return counts[devicePerformance] || counts.high;
};

/**
 * Detect device performance tier
 */
export const detectDevicePerformance = () => {
  // Simple heuristic based on hardware concurrency and device memory
  if (typeof navigator === 'undefined') return 'high';
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
};

export default ANIMATION_EFFECTS;
