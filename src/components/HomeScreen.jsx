import React, { useState } from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

function HomeScreen({ onSelectMode, coins, onShowSettings, onShowStats, onShowLeaderboard, onShowShop, onShowFriends, user }) {
  const isGuest = !user || user.isAnonymous;
  const [view, setView] = useState('main'); // main -> play -> bot

  return (
    <div className="home-screen">
      <div className="top-bar">
        <div className="top-bar-spacer" aria-hidden="true" />
        <button
          className="icon-btn"
          onClick={onShowSettings}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

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

      {view === 'main' && (
        <div className="action-row">
          <button
            className="action-btn primary"
            onClick={() => {
              setView('play');
            }}
          >
            Play
          </button>
          <button className="action-btn" onClick={onShowLeaderboard}>
            Leaderboard
          </button>
          <button className="action-btn" onClick={onShowShop}>
            Shop
          </button>
          <div className="coin-long-btn" aria-label="Coins">
            <span className="coin-emoji">🪙</span> Coins: {coins}
          </div>
        </div>
      )}

      {view === 'play' && (
        <div className="play-view slide-panel">
          <div className="play-view-header">
            <button
              className="back-btn-ghost"
              onClick={() => {
                setView('main');
              }}
            >
              ← Back
            </button>
            <div className="play-view-title">Choose a mode</div>
          </div>

          <div className="play-options">
            <button
              className="mode-option-btn"
              onClick={() => setView('bot')}
            >
              <div className="mode-option-title">Play vs Bot</div>
              <div className="mode-option-sub">Tap to choose difficulty</div>
            </button>

            <button
              className="mode-option-btn"
              onClick={() => {
                onSelectMode('local');
                setView('main');
              }}
            >
              <div className="mode-option-title">Local 1v1</div>
              <div className="mode-option-sub">Two players on one device</div>
            </button>

            <button
              className="mode-option-btn"
              onClick={() => {
                onSelectMode('online');
                setView('main');
              }}
            >
              <div className="mode-option-title">Online</div>
              <div className="mode-option-sub">Match with players online</div>
            </button>
          </div>
        </div>
      )}

      {view === 'bot' && (
        <div className="play-view slide-panel">
          <div className="play-view-header">
            <button
              className="back-btn-ghost"
              onClick={() => setView('play')}
            >
              ← Back
            </button>
            <div className="play-view-title">Select Difficulty</div>
          </div>

          <div className="mode-grid compact single">
            <div className="mode-card bot-card open">
              <div className="bot-toggle">
                <div>
                  <div className="mode-icon-text small">BOT</div>
                  <h3>Choose Difficulty</h3>
                </div>
              </div>

              <div className="difficulty-buttons">
                {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    className="difficulty-btn compact"
                    style={{ borderColor: info.color }}
                    onClick={() => {
                      onSelectMode('bot', key);
                      setView('main');
                    }}
                  >
                    <span className="difficulty-label">{info.label}</span>
                    <span className="coin-reward">+{info.coinReward} coins</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
