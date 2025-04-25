import React from 'react';

function TopInfo({ roomId, localXScore, localOScore, onlineXScore, onlineOScore, gameState, opponentLeft }) {
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <p>The classic game with a twist!</p>

      {roomId && (
        <p>Room Code: <strong style={{ color: '#0ff' }}>{roomId}</strong></p>
      )}

      {!roomId ? (
        <>
          <p>Player X (Local): {localXScore}</p>
          <p>Player O (Local): {localOScore}</p>
        </>
      ) : (
        <>
          <p>Player X (Online): {onlineXScore}</p>
          <p>Player O (Online): {onlineOScore}</p>
        </>
      )}

      <p className="turn-indicator">Player {gameState.currentPlayer}'s turn</p>

      {opponentLeft && <p style={{ color: 'orange' }}>Opponent left the game. Returning to home...</p>}
    </>
  );
}

export default TopInfo;
