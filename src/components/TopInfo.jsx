import React from 'react';
import { DIFFICULTY_INFO } from '../utils/botAI';

const frameColors = {
  frame_basic: '#667eea',
  frame_gold: '#ffd700',
  frame_rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  frame_fire: '#ff4500',
  frame_ice: '#00f5ff',
  frame_diamond: '#b9f2ff'
};

const backgroundColors = {
  bg_none: 'rgba(26, 26, 46, 0.6)',
  bg_purple: '#667eea',
  bg_green: '#00e676',
  bg_red: '#ff4b5c',
  bg_galaxy: '#1a1a2e'
};

const renderAvatarChip = (name = 'P', avatar) => {
  const letter = name.charAt(0).toUpperCase();
  const frame = avatar?.frame && frameColors[avatar.frame] ? frameColors[avatar.frame] : '#667eea';
  const background = avatar?.background && backgroundColors[avatar.background]
    ? backgroundColors[avatar.background]
    : 'rgba(26, 26, 46, 0.6)';

  return (
    <div
      className="avatar-chip"
      style={{
        background,
        border: avatar?.frame === 'frame_rainbow' ? '3px solid transparent' : `3px solid ${frame}`,
        backgroundImage: avatar?.frame === 'frame_rainbow' ? frame : undefined
      }}
    >
      <span className="avatar-chip-letter">{letter}</span>
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
          <p className="score-row">
            {renderAvatarChip(playerXName, playerXAvatar)}
            <span className="score-name">{playerXName || 'Player X'}:</span>
            <span className="score-value">{onlineXScore}</span>
          </p>
          <p className="score-row">
            {renderAvatarChip(playerOName, playerOAvatar)}
            <span className="score-name">{playerOName || 'Player O'}:</span>
            <span className="score-value">{onlineOScore}</span>
          </p>
        </>
      ) : gameMode === 'bot' ? (
        <>
          <p className="score-row">
            {renderAvatarChip('You', playerXAvatar)}
            <span className="score-name">You (X):</span>
            <span className="score-value">{localXScore}</span>
          </p>
          <p className="score-row">
            {renderAvatarChip('Bot', playerOAvatar)}
            <span className="score-name">Bot (O):</span>
            <span className="score-value">{localOScore}</span>
          </p>
        </>
      ) : (
        <>
          <p className="score-row">
            {renderAvatarChip(playerXName, playerXAvatar)}
            <span className="score-name">{playerXName || 'Player X'}:</span>
            <span className="score-value">{localXScore}</span>
          </p>
          <p className="score-row">
            {renderAvatarChip(playerOName, playerOAvatar)}
            <span className="score-name">{playerOName || 'Player O'}:</span>
            <span className="score-value">{localOScore}</span>
          </p>
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
