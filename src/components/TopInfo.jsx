import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';
import { getAvatarRenderInfo } from '../utils/shopManager';

const renderAvatarChip = (name = 'P', avatar) => {
  const letter = name.charAt(0).toUpperCase();
  const avatarRender = getAvatarRenderInfo(avatar, { borderWidth: 3, contentScale: 0.72 });

  return (
    <div
      className="avatar-chip"
      style={avatarRender.style}
    >
      <span className="avatar-chip-letter" style={{ position: 'relative', zIndex: 1 }}>
        {letter}
      </span>
      {avatarRender.ringUrl && (
        <img
          src={avatarRender.ringUrl}
          alt="Avatar Ring"
          style={avatarRender.ringStyle}
          draggable={false}
        />
      )}
    </div>
  );
};

function TopInfo({
  roomId,
  localXScore,
  localOScore,
  onlineXScore,
  onlineOScore,
  gameState,
  opponentLeft,
  gameMode,
  botDifficulty,
  playerXName,
  playerOName,
  playerXAvatar,
  playerOAvatar
}) {
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
          <div className="score-row">
            {renderAvatarChip(playerXName, playerXAvatar)}
            <span className="score-name">{playerXName || 'Player X'}:</span>
            <span className="score-value">{onlineXScore}</span>
          </div>
          <div className="score-row">
            {renderAvatarChip(playerOName, playerOAvatar)}
            <span className="score-name">{playerOName || 'Player O'}:</span>
            <span className="score-value">{onlineOScore}</span>
          </div>
        </>
      ) : gameMode === 'bot' ? (
        <>
          <div className="score-row">
            {renderAvatarChip('You', playerXAvatar)}
            <span className="score-name">You (X):</span>
            <span className="score-value">{localXScore}</span>
          </div>
          <div className="score-row">
            {renderAvatarChip('Bot', playerOAvatar)}
            <span className="score-name">Bot (O):</span>
            <span className="score-value">{localOScore}</span>
          </div>
        </>
      ) : (
        <>
          <div className="score-row">
            {renderAvatarChip(playerXName, playerXAvatar)}
            <span className="score-name">{playerXName || 'Player X'}:</span>
            <span className="score-value">{localXScore}</span>
          </div>
          <div className="score-row">
            {renderAvatarChip(playerOName, playerOAvatar)}
            <span className="score-name">{playerOName || 'Player O'}:</span>
            <span className="score-value">{localOScore}</span>
          </div>
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
