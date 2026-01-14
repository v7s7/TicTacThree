import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

function Leaderboard({ onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('coins'); // 'coins' or 'winrate'

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Order by a stable numeric field; for win rate we still fetch top wins then sort locally
      const q = query(
        usersRef,
        orderBy(sortBy === 'coins' ? 'coins' : 'wins', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);

      const players = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Online-only stats: prefer seasonStats, fall back to top-level wins/losses/draws (which are online in this app)
        const onlineWins = data.seasonStats?.wins ?? data.wins ?? 0;
        const onlineLosses = data.seasonStats?.losses ?? data.losses ?? 0;
        const onlineDraws = data.seasonStats?.draws ?? data.draws ?? 0;
        const totalOnlineGames = onlineWins + onlineLosses + onlineDraws;
        const winRate = totalOnlineGames > 0 ? ((onlineWins / totalOnlineGames) * 100).toFixed(1) : '0.0';

        players.push({
          id: doc.id,
          displayName: data.displayName || 'Unknown',
          coins: data.coins || 0,
          wins: onlineWins,
          winRate
        });
      });

      // If sorting by win rate, re-sort locally
      if (sortBy === 'winrate') {
        players.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
      }

      setLeaderboardData(players);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
    setLoading(false);
  };

  return (
    <div className="modal">
      <div className="modal-content leaderboard-modal">
        <h2>LEADERBOARD</h2>
        <p className="leaderboard-subtitle">Top Players</p>

        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab ${sortBy === 'coins' ? 'active' : ''}`}
            onClick={() => setSortBy('coins')}
          >
            Most Coins
          </button>
          <button
            className={`leaderboard-tab ${sortBy === 'winrate' ? 'active' : ''}`}
            onClick={() => setSortBy('winrate')}
          >
            Best Online Win Rate
          </button>
        </div>

        {loading ? (
          <div className="leaderboard-loading">Loading...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="leaderboard-info">
            <p>No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboardData.map((player, index) => (
              <div key={player.id} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="username">{player.displayName}</span>
                <span className="stats">
                  {sortBy === 'coins' ? (
                    <>
                      <span className="coins">{player.coins} coins</span>
                      <span className="wins-small">{player.wins}W</span>
                    </>
                  ) : (
                    <>
                      <span className="winrate">{player.winRate}%</span>
                      <span className="wins-small">{player.wins}W (online)</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
