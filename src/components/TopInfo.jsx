import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

function TopInfo({ roomId, localXScore, localOScore, onlineXScore, onlineOScore, gameState, opponentLeft, gameMode, botDifficulty }) {
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

  return (
    <>
      <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>
        {gameMode === 'bot' ? '🤖 vs Bot' : gameMode === 'local' ? '👥 Local 1v1' : '🌐 Online 1v1'}
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
          <p>Player X (Online): {onlineXScore}</p>
          <p>Player O (Online): {onlineOScore}</p>
        </>
      ) : gameMode === 'bot' ? (
        <>
          <p>You (X): {localXScore}</p>
          <p>Bot (O): {localOScore}</p>
        </>
      ) : (
        <>
          <p>Player X: {localXScore}</p>
          <p>Player O: {localOScore}</p>
        </>
      )}

      <p className="turn-indicator">
        {gameMode === 'bot'
          ? (gameState.currentPlayer === 'X' ? "Your turn" : "Bot is thinking...")
          : `Player ${gameState.currentPlayer}'s turn`}
      </p>

      {opponentLeft && <p style={{ color: 'orange' }}>Opponent left the game. Returning to home...</p>}
    </>
  );
}

export default TopInfo;
