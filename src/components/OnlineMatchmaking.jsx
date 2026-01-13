import React, { useState, useEffect } from 'react';
import {
  joinQueue,
  leaveQueue,
  findMatch,
  listenForMatch,
  listenToActivePlayersCount
} from '../utils/matchmaking';
import { soundManager } from '../utils/soundManager';

function OnlineMatchmaking({ userId, displayName, onMatchFound, onCancel, onCreateRoom, onJoinRoom }) {
  const [searching, setSearching] = useState(false);
  const [activePlayers, setActivePlayers] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [showManualOptions, setShowManualOptions] = useState(false);

  useEffect(() => {
    // Listen to active players count
    const unsubscribe = listenToActivePlayersCount((count) => {
      setActivePlayers(count);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (searching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [searching]);

  const handleStartSearch = async () => {
    soundManager.playClick();
    setSearching(true);

    // Join the queue
    await joinQueue(userId, displayName);

    // Try to find a match immediately
    const matchResult = await findMatch(userId, displayName);
    if (matchResult.success) {
      soundManager.playCoin();
      onMatchFound(matchResult);
      return;
    }

    // Listen for match if another player finds us
    const unsubscribe = listenForMatch(userId, (matchData) => {
      soundManager.playCoin();
      setSearching(false);
      unsubscribe();
      onMatchFound(matchData);
    });

    // Try to find match every 3 seconds
    const searchInterval = setInterval(async () => {
      const result = await findMatch(userId, displayName);
      if (result.success) {
        soundManager.playCoin();
        setSearching(false);
        clearInterval(searchInterval);
        unsubscribe();
        onMatchFound(result);
      }
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearInterval(searchInterval);
      unsubscribe();
    };
  };

  const handleCancelSearch = async () => {
    soundManager.playClick();
    await leaveQueue(userId);
    setSearching(false);
    setSearchTime(0);
  };

  const handleCancel = () => {
    soundManager.playClick();
    if (searching) {
      handleCancelSearch();
    }
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="matchmaking-screen">
      <div className="matchmaking-container">
        <h2>Online Multiplayer</h2>

        <div className="players-online">
          <div className="players-count">
            <div className="count-circle">{activePlayers}</div>
            <span>Players Online</span>
          </div>
        </div>

        {!searching ? (
          <>
            <div className="matchmaking-options">
              <button className="matchmaking-btn primary" onClick={handleStartSearch}>
                Search for Opponent
              </button>

              <div className="divider-with-text">
                <span>OR</span>
              </div>

              <button
                className="matchmaking-btn secondary"
                onClick={() => setShowManualOptions(!showManualOptions)}
              >
                {showManualOptions ? 'Hide Manual Options' : 'Create/Join Room'}
              </button>

              {showManualOptions && (
                <div className="manual-options">
                  <button className="manual-option-btn" onClick={onCreateRoom}>
                    Create Private Room
                  </button>
                  <button className="manual-option-btn" onClick={onJoinRoom}>
                    Join Room with Code
                  </button>
                </div>
              )}
            </div>

            <button className="cancel-btn" onClick={handleCancel}>
              Back to Home
            </button>
          </>
        ) : (
          <div className="searching-container">
            <div className="searching-animation">
              <div className="spinner"></div>
              <p className="searching-text">Searching for opponent...</p>
            </div>

            <div className="search-info">
              <p className="search-time">Time: {formatTime(searchTime)}</p>
              <p className="search-tip">
                {activePlayers > 1
                  ? 'Matching you with an opponent...'
                  : 'Waiting for more players...'}
              </p>
            </div>

            <button className="cancel-search-btn" onClick={handleCancelSearch}>
              Cancel Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnlineMatchmaking;
