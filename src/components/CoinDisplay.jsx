import React from 'react';

function CoinDisplay({ coins, coinsEarned }) {
  return (
    <div className="coin-display-header">
      <div className="coin-container">
        <span className="coin-icon">🪙</span>
        <span className="coin-count">{coins}</span>
        {coinsEarned > 0 && (
          <span className="coin-earned animate-coin">+{coinsEarned}</span>
        )}
      </div>
    </div>
  );
}

export default CoinDisplay;
