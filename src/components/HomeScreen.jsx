import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

function HomeScreen({ onSelectMode, coins, onShowSettings, onShowStats, onShowLeaderboard }) {
  return (
    <div className="home-screen">
      <div className="home-header">
        <h1 className="game-title">TicTacThree</h1>
        <p className="game-subtitle">Only 3 Marks Rule!</p>
      </div>

      <div className="coin-display-large">
        <span className="coin-icon">🪙</span>
        <span className="coin-amount">{coins}</span>
      </div>

      <div className="mode-selection">
        <h2>Select Game Mode</h2>

        <div className="mode-grid">
          {/* Bot Mode */}
          <div className="mode-card">
            <div className="mode-icon">🤖</div>
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
                  <span className="coin-reward">+{info.coinReward} 🪙</span>
                </button>
              ))}
            </div>
          </div>

          {/* Local Mode */}
          <div className="mode-card" onClick={() => onSelectMode('local')}>
            <div className="mode-icon">👥</div>
            <h3>Local 1v1</h3>
            <p>Play with a friend</p>
            <div className="coin-reward-small">+5 🪙 per win</div>
          </div>

          {/* Online Mode */}
          <div className="mode-card" onClick={() => onSelectMode('online')}>
            <div className="mode-icon">🌐</div>
            <h3>Online 1v1</h3>
            <p>Play online multiplayer</p>
            <div className="coin-reward-small">+30 🪙 per win</div>
          </div>
        </div>
      </div>

      <div className="home-footer">
        <button className="footer-btn" onClick={onShowStats}>
          📊 Stats
        </button>
        <button className="footer-btn" onClick={onShowLeaderboard}>
          🏆 Leaderboard
        </button>
        <button className="footer-btn" onClick={onShowSettings}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;
