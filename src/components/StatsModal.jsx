import React from 'react';

function StatsModal({ stats, coins, onClose }) {
  const winRate = stats.gamesPlayed > 0
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : 0;

  return (
    <div className="modal">
      <div className="modal-content stats-modal">
        <h2>📊 Your Statistics</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{coins}</div>
            <div className="stat-label">Total Coins</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.gamesPlayed}</div>
            <div className="stat-label">Online Games Played</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.gamesWon}</div>
            <div className="stat-label">Online Wins</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">Online Win Rate</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.gamesLost}</div>
            <div className="stat-label">Online Losses</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.gamesDraw}</div>
            <div className="stat-label">Online Draws</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.winStreak}</div>
            <div className="stat-label">Current Online Streak</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.bestWinStreak}</div>
            <div className="stat-label">Best Online Streak</div>
          </div>
        </div>

        <div className="bot-stats">
          <h3>🤖 Bot Victories</h3>
          <div className="bot-stats-row">
            <div className="bot-stat">
              <span className="difficulty-badge easy">Easy</span>
              <span className="bot-wins">{stats.botGamesWon.easy || 0} wins</span>
            </div>
            <div className="bot-stat">
              <span className="difficulty-badge medium">Medium</span>
              <span className="bot-wins">{stats.botGamesWon.medium || 0} wins</span>
            </div>
            <div className="bot-stat">
              <span className="difficulty-badge hard">Hard</span>
              <span className="bot-wins">{stats.botGamesWon.hard || 0} wins</span>
            </div>
          </div>
        </div>

        <div className="total-earnings">
          <span>🪙 Total Coins Earned: </span>
          <strong>{stats.totalCoinsEarned}</strong>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;
