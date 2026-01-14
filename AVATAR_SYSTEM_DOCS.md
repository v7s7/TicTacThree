# Avatar & Background System - Technical Documentation

## Overview
This document describes the enhanced Avatar & Background system with animations, progression logic, and rank-based rewards for TicTacThree.

---

## System Architecture

### 1. Data Structure (`src/utils/shopManager.js`)

#### Avatar Frames
Frames are categorized into tiers:
- **Free Avatars**: Basic, clean, static frames (no cost)
- **Animated Avatars**: Subtle idle animations (pulse, shimmer, rainbow)
- **Elemental Avatars**: Fire, ice, lightning, shadow, nature, light with particle effects
- **Mythic/Fantasy Avatars**: Dragon, phoenix, celestial, void with premium effects
- **Rank-Locked Avatars**: Diamond, Master, Grandmaster (cannot be purchased)
- **Seasonal/Event Avatars**: Winter, Halloween (limited time availability)

#### Backgrounds
Backgrounds are also tiered:
- **Static Minimal**: Transparent, dark, light (free)
- **Animated Gradients**: Color-shifting backgrounds with pulse effects
- **Elemental Animated**: Fire, ice, lightning, water, space with complex animations
- **Premium Cinematic**: Galaxy, aurora, volcanic, heavenly with camera motion

#### Item Properties
```javascript
{
  id: 'unique_id',              // Unique identifier
  name: 'Display Name',          // User-facing name
  type: 'frame' | 'background',  // Item type
  tier: 'free' | 'animated' | 'elemental' | 'mythic' | 'premium' | 'seasonal' | 'rank-locked',
  price: 0,                      // Cost in coins (0 for rank-locked)
  color: '#hex' | 'gradient',    // Visual color/gradient
  description: 'Item desc',      // User-facing description
  image: 'image_key',            // Image identifier (future use)
  animated: true | false,        // Whether item has animation
  animationType: 'animation_key',// Animation type identifier
  rankRequired: 'Gold',          // Minimum rank to unlock (optional)
  rankLocked: true | false,      // True if cannot be purchased (optional)
  element: 'fire' | 'ice' | ..., // Element type (optional)
  season: 'winter' | 'halloween',// Season identifier (optional)
  effects: ['effect1', 'effect2'] // List of animation effects (optional)
}
```

---

### 2. Animation Effects System (`src/utils/animationEffects.js`)

#### Effect Registry
The `ANIMATION_EFFECTS` object contains all available effects:

```javascript
{
  id: 'fireParticles',
  name: 'Fire Particles',
  type: 'particle',              // particle | overlay | glow | aura | flash | background | orbital
  className: 'effect-fire-particles', // CSS class to apply
  particleCount: 12,             // Number of particles (for particle type)
  duration: '2s',                // Animation duration
  description: 'Effect description'
}
```

#### Effect Types
- **particle**: Floating/moving particles (embers, snow, sparks)
- **overlay**: Layer effects (frost, electric arcs, light rays)
- **glow**: Pulsing glow effects (holy glow, dark pulse)
- **aura**: Surrounding energy effects (master aura, cosmic glow)
- **flash**: Brief flash effects (lightning flash)
- **background**: Background layer animations (flames, nebula, waves)
- **orbital**: Orbiting elements (energy rings)

#### Performance Optimization
- `getOptimizedParticleCount()`: Reduces particles on low-end devices
- `detectDevicePerformance()`: Detects device capability (low/medium/high)
- All effects use GPU-accelerated CSS properties (transform, opacity, filter)

---

### 3. CSS Animations (`src/styles/animations.css`)

#### Frame Animations
- **pulse**: Subtle scaling and glow pulse
- **shimmer**: Sweeping shine effect
- **rainbow**: Hue-rotating gradient
- **fireFlicker**: Flickering fire with glow
- **iceShimmer**: Cold crystalline shimmer
- **lightningPulse**: Intermittent electric bursts
- **shadowDrift**: Drifting darkness
- **natureGlow**: Organic pulsing glow
- **holyGlow**: Radiant light energy
- **diamondSparkle**: Multi-level sparkle
- **masterAura**: Powerful energy aura
- **grandmasterSupreme**: Ultimate prestige animation

#### Background Animations
- **gradientPulse**: Breathing gradient effect
- **gradientShift**: Slow color shift
- **fireBackground**: Flowing flames with heat distortion
- **iceBackground**: Drifting crystalline field
- **lightningBackground**: Storm clouds movement
- **waterFlow**: Wave motion
- **spaceParallax**: Multi-layer star parallax
- **galaxyPan**: Slow camera pan across galaxy
- **aurora**: Flowing aurora borealis

#### Particle Effects
- **fireParticleFloat**: Rising embers
- **snowDrift**: Falling snow with rotation
- **sparkBurst**: Electric spark bursts
- **energyRing**: Orbiting energy rings
- **floatMote**: Floating light particles

#### Performance Features
- GPU acceleration hints (`translateZ(0)`)
- Reduced motion support for accessibility
- Mobile optimizations (reduced particles)
- Dark/light mode support

---

### 4. Rank Medal System (`src/utils/rankManager.js`)

#### Rank Medals
Each rank has a corresponding medal with unique visual properties:

```javascript
{
  id: 'medal_bronze',
  rank: 'Bronze',
  name: 'Bronze Medal',
  color: '#c47b39',           // Primary medal color
  metallic: true,             // Metallic finish
  glow: 'rgba(...)',          // Glow color
  description: 'Medal description',
  effects: ['subtleGlow'],    // Applied effects
  autoEquip: false            // Auto-equip on rank achievement
}
```

#### Rank-Locked Logic
- **canEquipRankMedal(medalRank, currentRank)**: Check if user can equip medal
- **shouldUnequipFrame(frameId, currentRank)**: Check if frame should auto-unequip
- **handleRankChange(oldRank, newRank, equippedFrame)**: Handle rank change logic

#### Auto-Unequip Feature
When a player's rank drops below the requirement for a rank-locked frame:
1. System detects rank change
2. Checks equipped frame against new rank
3. Auto-unequips if no longer eligible
4. Reverts to basic frame
5. Updates both state and Firestore

---

### 5. Shop UI (`src/components/Shop.jsx`)

#### Features
- **Tier Grouping**: Items grouped by tier for easy browsing
- **Dual Mode**: Store mode (purchase) and Collection mode (equip)
- **Visual Indicators**:
  - Animated badge for animated items
  - Element badge for elemental items
  - Lock badge for rank-required items
  - Rank-locked badge for exclusive items
  - Owned badge for purchased items
- **Preview**: Live animation previews in shop
- **Rank Filtering**: Items locked by rank show requirement

#### UI States
- **Purchasable**: Can buy with coins
- **Locked**: Rank requirement not met
- **Rank-Locked**: Cannot be purchased, earned through rank
- **Owned**: Already in inventory
- **Equipped**: Currently active

---

## Integration Guide

### Adding New Avatars/Backgrounds

1. **Add to shopManager.js**:
```javascript
{
  id: 'frame_new',
  name: 'New Frame',
  type: 'frame',
  tier: 'elemental',
  element: 'water',
  price: 300,
  color: '#0077be',
  description: 'Water-themed frame',
  animated: true,
  animationType: 'water',
  rankRequired: 'Silver',
  effects: ['waterDrop', 'ripple']
}
```

2. **Add animation to animations.css**:
```css
@keyframes water {
  0%, 100% { /* start state */ }
  50% { /* mid state */ }
}

.frame-water {
  animation: water 3s ease-in-out infinite;
  will-change: transform, filter;
}
```

3. **Add effects to animationEffects.js** (if new):
```javascript
waterDrop: {
  id: 'waterDrop',
  name: 'Water Drop',
  type: 'particle',
  className: 'effect-water-drop',
  particleCount: 10,
  duration: '4s',
  description: 'Falling water droplets'
}
```

4. **Add effect CSS**:
```css
@keyframes waterDropFall {
  /* animation keyframes */
}

.effect-water-drop {
  /* effect styles */
}
```

### Testing Checklist

- [ ] Item appears in correct tier section
- [ ] Animation plays smoothly on desktop
- [ ] Animation plays smoothly on mobile
- [ ] Rank lock works correctly
- [ ] Purchase flow works
- [ ] Equip/unequip works
- [ ] Auto-unequip on rank loss works
- [ ] Effects are GPU-accelerated
- [ ] Reduced motion is respected

---

## Performance Considerations

### GPU Optimization
- Use `transform`, `opacity`, and `filter` for animations (GPU-accelerated)
- Avoid `width`, `height`, `top`, `left` changes (CPU-intensive)
- Add `will-change` hint for animated properties
- Use `translateZ(0)` for hardware acceleration

### Mobile Optimization
- Reduce particle counts on mobile devices
- Simplify complex animations for lower-end devices
- Use CSS media queries to disable heavy effects on small screens
- Test on actual devices, not just browser DevTools

### Battery Efficiency
- Keep animation durations reasonable (2-4s typical)
- Avoid too many simultaneous animations
- Use `animation-iteration-count: 1` for one-time effects
- Respect `prefers-reduced-motion` for accessibility

### Memory Management
- Use CSS animations instead of JavaScript when possible
- Reuse effect classes instead of creating new elements
- Clean up effects when components unmount
- Avoid memory leaks with proper event listener cleanup

---

## Future Enhancements

### Planned Features
1. **Avatar Customization**: Mix and match effects on avatars
2. **Seasonal Rotation**: Automatically show/hide seasonal items
3. **Achievement Avatars**: Unlock via specific achievements
4. **Animated Backgrounds**: More complex multi-layer backgrounds
5. **Sound Effects**: Audio feedback for equip/unequip
6. **Preview Mode**: Full-screen preview with live animations
7. **Trading System**: Trade cosmetics with friends (excluding rank-locked)
8. **Battle Pass**: Season-exclusive cosmetics
9. **Daily/Weekly Rotations**: Rotating featured items in shop
10. **Rarity System**: Common, Rare, Epic, Legendary classifications

### Technical Improvements
- Pre-load animations for smoother transitions
- Add animation state machine for complex sequences
- Implement WebGL for ultra-premium effects
- Add particle system library for advanced effects
- Create animation editor for designers
- Add A/B testing framework for new cosmetics

---

## API Reference

### shopManager.js
- `SHOP_ITEMS.avatarFrames`: Array of frame items
- `SHOP_ITEMS.avatarBackgrounds`: Array of background items
- `getAllShopItems()`: Get all items
- `getItemsByTier(tier, type)`: Filter by tier
- `getItemsByElement(element)`: Filter by element
- `isRankLocked(item)`: Check if item is rank-locked
- `getDefaultInventory()`: Get starter items
- `getDefaultAvatarConfig()`: Get default config

### animationEffects.js
- `ANIMATION_EFFECTS`: Effect registry
- `getEffect(effectId)`: Get effect by ID
- `getItemEffects(item)`: Get all effects for item
- `isGPUFriendly(effect)`: Check GPU compatibility
- `getEffectDuration(effect)`: Get duration in ms
- `getOptimizedParticleCount(effect, devicePerformance)`: Get optimized count
- `detectDevicePerformance()`: Detect device tier

### rankManager.js
- `RANK_MEDALS`: Medal registry
- `getRankMedal(rankName)`: Get medal by rank
- `canEquipRankMedal(medalRank, currentRank)`: Check eligibility
- `getRankLockedFrame(currentRank)`: Get rank-exclusive frame
- `shouldUnequipFrame(frameId, currentRank)`: Check if should unequip
- `handleRankChange(oldRank, newRank, equippedFrame)`: Handle rank change

---

## Credits & License

### Design Inspiration
- Discord profile customization system
- League of Legends ranked system
- Premium mobile games (CODM, PUBG Mobile)
- Modern gamified apps

### Implementation
- React 19.1.0
- CSS3 Animations
- GPU-accelerated transforms
- Mobile-first responsive design

---

**Last Updated**: 2026-01-14
**Version**: 1.0.0
**Maintainer**: TicTacThree Development Team
