import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

function HomeScreen({ onSelectMode, coins, onShowSettings, onShowStats, onShowLeaderboard, onShowShop, onShowFriends, user }) {
  const isGuest = !user || user.isAnonymous;

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="user-info">
          {!isGuest ? (
            <div className="logged-in-user">
              <span className="user-name">{user.displayName || user.email}</span>
            </div>
          ) : (
            <div className="guest-user">
              <span className="guest-badge">Guest Mode</span>
            </div>
          )}
        </div>

        <h1 className="game-title">TicTacThree</h1>
        <p className="game-subtitle">Only 3 Marks Rule!</p>
      </div>

      <div className="coin-display-large">
        <span className="coin-label">Coins:</span>
        <span className="coin-amount">{coins}</span>
      </div>

      <div className="mode-selection">
        <h2>Select Game Mode</h2>

        <div className="mode-grid">
          {/* Bot Mode */}
          <div className="mode-card">
            <div className="mode-icon-text">BOT</div>
            <h3>Play vs Bot</h3>
            <p>Challenge AI opponents</p>
            <div className="difficulty-buttons">
              {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                <button
                  key={key}
                  className="difficulty-btn"
                  style={{ borderColor: info.color }}
                  onClick={() => onSelectMode('bot', key)}
                >
                  <span className="difficulty-label">{info.label}</span>
                  <span className="coin-reward">+{info.coinReward} coins</span>
                </button>
              ))}
            </div>
          </div>

          {/* Local Mode */}
          <div className="mode-card" onClick={() => onSelectMode('local')}>
            <div className="mode-icon-text">1v1</div>
            <h3>Local 1v1</h3>
            <p>Play with a friend locally</p>
            <div className="coin-reward-small">+5 coins per win</div>
          </div>

          {/* Online Mode */}
          <div className="mode-card" onClick={() => onSelectMode('online')}>
            <div className="mode-icon-text">ONLINE</div>
            <h3>Online Multiplayer</h3>
            <p>Play against players worldwide</p>
            <div className="coin-reward-small">+30 coins per win</div>
          </div>
        </div>
      </div>

      <div className="home-footer">
        {!isGuest && (
          <>
            <button className="footer-btn" onClick={onShowShop}>
              Shop
            </button>
            <button className="footer-btn" onClick={onShowFriends}>
              Friends
            </button>
          </>
        )}
        <button className="footer-btn" onClick={onShowStats}>
          Stats
        </button>
        <button className="footer-btn" onClick={onShowLeaderboard}>
          Leaderboard
        </button>
        <button className="footer-btn" onClick={onShowSettings}>
          Settings
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;
