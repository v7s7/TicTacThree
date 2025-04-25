import React from 'react';

function GameInfo({ gameState }) {
  return (
    <div className="scores">
      <div className="score">
        <span className="X">Player X</span>: {gameState.xScore}
      </div>
      <div className="score">
        <span className="O">Player O</span>: {gameState.oScore}
      </div>
    </div>
  );
}

export default GameInfo;