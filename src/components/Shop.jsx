import React, { useMemo, useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../utils/shopManager';
import { soundManager } from '../utils/soundManager';

const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
const meetsRank = (needed, current) => {
  if (!needed) return true;
  const needIdx = rankOrder.indexOf(needed);
  const curIdx = rankOrder.indexOf(current || 'Bronze');
  return curIdx >= needIdx;
};

function Shop({ onClose, coins, inventory, onPurchase, equippedItems, rankInfo, initialView = 'store', onEquip }) {
  const [selectedTab, setSelectedTab] = useState('frames');
  const [mode, setMode] = useState(initialView); // 'store' | 'collection'

  useEffect(() => {
    setMode(initialView);
  }, [initialView]);

  const handlePurchase = (item) => {
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
  const sortedItems = useMemo(() => {
    const list = [...items];
    const filtered = mode === 'collection' ? list.filter((item) => isOwned(item.id)) : list;
    if (mode === 'collection') {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [items, mode, inventory]);

  const lockReason = (item) => {
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

        <div className="shop-items-grid">
          {sortedItems.length === 0 && mode === 'collection' && (
            <div className="shop-empty">You have not unlocked anything yet.</div>
          )}
          {sortedItems.map((item) => {
            const owned = isOwned(item.id);
            const locked = lockReason(item);
            return (
              <div key={item.id} className={`shop-item ${locked ? 'locked' : ''}`}>
              <div
                className="shop-item-preview"
                style={{
                  background: selectedTab === 'backgrounds' ? item.color : 'rgba(26, 26, 46, 0.6)',
                  border: selectedTab === 'frames' ? `3px solid ${item.color}` : 'none'
                }}
              >
                <div className="shop-item-letter">A</div>
                {item.animated && <div className="item-badge glow">Animated</div>}
                {locked && <div className="item-badge lock">{locked}</div>}
                {owned && !locked && <div className="item-badge owned">Owned</div>}
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
                      disabled={coins < item.price || !!locked || mode === 'collection'}
                    >
                      {locked ? locked : `Buy - ${item.price} coins`}
                    </button>
                  )}
                </div>
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
