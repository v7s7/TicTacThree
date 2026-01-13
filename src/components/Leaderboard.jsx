import React from 'react';

function Leaderboard({ onClose }) {
  // Placeholder for leaderboard - would need backend implementation
  const placeholderData = [
    { rank: 1, username: 'Player1', coins: 1250, wins: 45 },
    { rank: 2, username: 'Player2', coins: 1100, wins: 38 },
    { rank: 3, username: 'Player3', coins: 950, wins: 32 },
  ];

  return (
    <div className="modal">
      <div className="modal-content leaderboard-modal">
        <h2>LEADERBOARD</h2>
        <p className="leaderboard-subtitle">Top Players</p>

        <div className="leaderboard-list">
          {placeholderData.map((player) => (
            <div key={player.rank} className="leaderboard-item">
              <span className="rank">#{player.rank}</span>
              <span className="username">{player.username}</span>
              <span className="stats">
                <span className="wins">{player.wins}W</span>
                <span className="coins">{player.coins} coins</span>
              </span>
            </div>
          ))}
        </div>

        <div className="leaderboard-info">
          <p>Full leaderboard coming soon!</p>
          <p>Keep playing to earn more coins!</p>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
