import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

function TopInfo({ roomId, localXScore, localOScore, onlineXScore, onlineOScore, gameState, opponentLeft, gameMode, botDifficulty, playerXName, playerOName }) {
  const getDifficultyBadge = () => {
    if (gameMode === 'bot' && botDifficulty) {
      const info = DIFFICULTY_INFO[botDifficulty];
      return (
        <div style={{
          display: 'inline-block',
          padding: '5px 12px',
          borderRadius: '15px',
          backgroundColor: info.color,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          marginLeft: '10px'
        }}>
          {info.label}
        </div>
      );
    }
    return null;
  };

  const getGameModeTitle = () => {
    if (gameMode === 'bot') return 'VS BOT';
    if (gameMode === 'local') return 'LOCAL 1V1';
    if (gameMode === 'online') return 'ONLINE MULTIPLAYER';
    return 'TICTACTHREE';
  };

  return (
    <>
      <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>
        {getGameModeTitle()}
      </h1>

      {gameMode === 'bot' && botDifficulty && (
        <p style={{ marginTop: '5px', color: '#a0a0a0' }}>
          Difficulty: {getDifficultyBadge()}
        </p>
      )}

      {roomId && (
        <p>Room Code: <strong style={{ color: '#667eea' }}>{roomId}</strong></p>
      )}

      {gameMode === 'online' ? (
        <>
          <p>{playerXName || 'Player X'}: {onlineXScore}</p>
          <p>{playerOName || 'Player O'}: {onlineOScore}</p>
        </>
      ) : gameMode === 'bot' ? (
        <>
          <p>You (X): {localXScore}</p>
          <p>Bot (O): {localOScore}</p>
        </>
      ) : (
        <>
          <p>{playerXName || 'Player X'}: {localXScore}</p>
          <p>{playerOName || 'Player O'}: {localOScore}</p>
        </>
      )}

      <p className="turn-indicator">
        {gameMode === 'bot'
          ? (gameState.currentPlayer === 'X' ? "Your turn" : "Bot is thinking...")
          : gameMode === 'online'
          ? `${gameState.currentPlayer === 'X' ? (playerXName || 'Player X') : (playerOName || 'Player O')}'s turn`
          : `${gameState.currentPlayer === 'X' ? (playerXName || 'Player X') : (playerOName || 'Player O')}'s turn`}
      </p>

      {opponentLeft && <p style={{ color: 'orange' }}>Opponent left the game. Returning to home...</p>}
    </>
  );
}

export default TopInfo;
