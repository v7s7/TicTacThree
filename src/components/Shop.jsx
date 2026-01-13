import React, { useState } from 'react';
import { SHOP_ITEMS } from '../utils/shopManager';
import { soundManager } from '../utils/soundManager';

function Shop({ onClose, coins, inventory, onPurchase, equippedItems }) {
  const [selectedTab, setSelectedTab] = useState('frames');

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
    onPurchase(item, true);
  };

  const items = selectedTab === 'frames' ? SHOP_ITEMS.avatarFrames : SHOP_ITEMS.avatarBackgrounds;
  const isOwned = (itemId) => inventory.includes(itemId);
  const isEquipped = (itemId) => {
    if (selectedTab === 'frames') {
      return equippedItems.frame === itemId;
    }
    return equippedItems.background === itemId;
  };

  return (
    <div className="modal">
      <div className="modal-content shop-modal">
        <h2>SHOP</h2>
        <p className="shop-subtitle">Customize your avatar</p>

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
          {items.map((item) => (
            <div key={item.id} className="shop-item">
              <div
                className="shop-item-preview"
                style={{
                  background: selectedTab === 'backgrounds' ? item.color : 'rgba(26, 26, 46, 0.6)',
                  border: selectedTab === 'frames' ? `3px solid ${item.color}` : 'none'
                }}
              >
                <div className="shop-item-letter">A</div>
              </div>

              <div className="shop-item-info">
                <h4>{item.name}</h4>
                <p className="shop-item-desc">{item.description}</p>

                <div className="shop-item-actions">
                  {isOwned(item.id) ? (
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
                      disabled={coins < item.price}
                    >
                      Buy - {item.price} coins
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Shop;
