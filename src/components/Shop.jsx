import React, { useMemo, useState, useEffect } from 'react';
import { SHOP_ITEMS, isRankLocked } from '../utils/shopManager';
import { soundManager } from '../utils/soundManager';

const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
const meetsRank = (needed, current) => {
  if (!needed) return true;
  const needIdx = rankOrder.indexOf(needed);
  const curIdx = rankOrder.indexOf(current || 'Bronze');
  return curIdx >= needIdx;
};

const TIER_ORDER = ['free', 'animated', 'elemental', 'mythic', 'premium', 'seasonal', 'rank-locked'];
const TIER_NAMES = {
  free: 'Free Avatars',
  animated: 'Animated Avatars',
  elemental: 'Elemental Avatars',
  mythic: 'Mythic & Fantasy',
  premium: 'Premium Collection',
  seasonal: 'Seasonal & Event',
  'rank-locked': 'Rank-Locked Exclusive'
};

function Shop({ onClose, coins, inventory, onPurchase, equippedItems, rankInfo, initialView = 'store', onEquip }) {
  const [selectedTab, setSelectedTab] = useState('frames');
  const [mode, setMode] = useState(initialView); // 'store' | 'collection'

  useEffect(() => {
    setMode(initialView);
  }, [initialView]);

  const handlePurchase = (item) => {
    if (isRankLocked(item)) {
      soundManager.playError();
      alert('This item is rank-locked and cannot be purchased!');
      return;
    }
    
    if (coins < item.price) {
      soundManager.playError();
      alert('Not enough coins!');
      return;
    }

    if (inventory.includes(item.id)) {
      soundManager.playError();
      alert('You already own this item!');
      return;
    }

    soundManager.playCoin();
    onPurchase(item);
  };

  const handleEquip = (item) => {
    soundManager.playClick();
    if (onEquip) {
      onEquip({
        frame: item.type === 'frame' ? item.id : equippedItems.frame,
        background: item.type === 'background' ? item.id : equippedItems.background
      });
    } else {
      onPurchase(item, true);
    }
  };

  const items = selectedTab === 'frames' ? SHOP_ITEMS.avatarFrames : SHOP_ITEMS.avatarBackgrounds;
  const isOwned = (itemId) => inventory.includes(itemId);
  
  const groupedItems = useMemo(() => {
    const list = [...items];
    const filtered = mode === 'collection' ? list.filter((item) => isOwned(item.id)) : list;
    
    // Group by tier
    const groups = {};
    TIER_ORDER.forEach(tier => {
      groups[tier] = filtered.filter(item => item.tier === tier);
    });
    
    return groups;
  }, [items, mode, inventory]);

  const lockReason = (item) => {
    if (isRankLocked(item) && !meetsRank(item.rankRequired, rankInfo?.rank)) {
      return `Requires ${item.rankRequired} Rank`;
    }
    if (item.rankRequired && !meetsRank(item.rankRequired, rankInfo?.rank)) {
      return `Requires ${item.rankRequired}`;
    }
    return null;
  };

  const isEquipped = (itemId) => {
    if (selectedTab === 'frames') {
      return equippedItems.frame === itemId;
    }
    return equippedItems.background === itemId;
  };

  const getAnimationClass = (item) => {
    if (!item.animated || !item.animationType) return '';
    return `frame-${item.animationType}`;
  };

  return (
    <div className="modal">
      <div className="modal-content shop-modal">
        <h2>{mode === 'collection' ? 'YOUR COLLECTION' : 'SHOP'}</h2>
        <p className="shop-subtitle">{mode === 'collection' ? 'Items you own and can equip' : 'Unlock new frames and backgrounds'}</p>

        <div className="shop-mode-toggle">
          <button
            className={`shop-mode-btn ${mode === 'collection' ? 'active' : ''}`}
            onClick={() => setMode('collection')}
          >
            Collection
          </button>
          <button
            className={`shop-mode-btn ${mode === 'store' ? 'active' : ''}`}
            onClick={() => setMode('store')}
          >
            Store
          </button>
        </div>

        <div className="shop-coins">
          <span className="coin-label">Your Coins:</span>
          <span className="coin-amount">{coins}</span>
        </div>

        <div className="shop-tabs">
          <button
            className={`shop-tab ${selectedTab === 'frames' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playClick();
              setSelectedTab('frames');
            }}
          >
            Avatar Frames
          </button>
          <button
            className={`shop-tab ${selectedTab === 'backgrounds' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playClick();
              setSelectedTab('backgrounds');
            }}
          >
            Backgrounds
          </button>
        </div>

        <div className="shop-items-container">
          {mode === 'collection' && Object.values(groupedItems).flat().length === 0 && (
            <div className="shop-empty">You have not unlocked anything yet.</div>
          )}
          
          {TIER_ORDER.map(tier => {
            const tierItems = groupedItems[tier];
            if (!tierItems || tierItems.length === 0) return null;
            
            return (
              <div key={tier} className="shop-tier-section">
                <h3 className="shop-tier-title">{TIER_NAMES[tier]}</h3>
                <div className="shop-items-grid">
                  {tierItems.map((item) => {
                    const owned = isOwned(item.id);
                    const locked = lockReason(item);
                    const animClass = getAnimationClass(item);
                    
                    return (
                      <div key={item.id} className={`shop-item ${locked ? 'item-locked' : ''} ${animClass}`}>
                        <div
                          className={`shop-item-preview ${animClass}`}
                          style={{
                            background: selectedTab === 'backgrounds' ? item.color : 'rgba(26, 26, 46, 0.6)',
                            border: selectedTab === 'frames' ? `3px solid ${item.color}` : 'none'
                          }}
                        >
                          <div className="shop-item-letter">A</div>
                          {item.animated && <div className="item-badge glow">Animated</div>}
                          {item.element && <div className="item-badge element">{item.element}</div>}
                          {locked && <div className="item-badge lock">🔒 {locked}</div>}
                          {owned && !locked && <div className="item-badge owned">✓ Owned</div>}
                          {isRankLocked(item) && <div className="item-badge rank-locked">Rank Exclusive</div>}
                        </div>

                        <div className="shop-item-info">
                          <h4>{item.name}</h4>
                          <p className="shop-item-desc">{item.description}</p>
                          {item.rankRequired && (
                            <div className="shop-item-rank">Unlocks at {item.rankRequired}</div>
                          )}

                          <div className="shop-item-actions">
                            {owned ? (
                              isEquipped(item.id) ? (
                                <button className="shop-btn equipped" disabled>
                                  Equipped
                                </button>
                              ) : (
                                <button className="shop-btn equip" onClick={() => handleEquip(item)}>
                                  Equip
                                </button>
                              )
                            ) : (
                              <button
                                className="shop-btn buy"
                                onClick={() => handlePurchase(item)}
                                disabled={coins < item.price || !!locked || mode === 'collection' || isRankLocked(item)}
                              >
                                {isRankLocked(item) ? 'Rank Exclusive' : locked ? locked : `Buy - ${item.price} coins`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Shop;
