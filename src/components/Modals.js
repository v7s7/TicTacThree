import React from 'react';

function Modals({ gameState, setGameState, onPlayAgain, onLeaveGame }) {
  return (
    <>
      {gameState.showRules && (
        <div className="modal">
          <div className="modal-content">
            <h2>Rules</h2>
            <ul className="rules-list">
              <li>Each player can have only 3 active marks at any time.</li>
              <li>Once a 4th mark is placed, the oldest mark disappears.</li>
              <li>First player to align 3 of their marks wins.</li>
            </ul>
            <div className="modal-buttons">
              <button onClick={() => setGameState(prev => ({ ...prev, showRules: false }))}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState.showWinModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{gameState.winMessage}</h2>
            <div className="modal-buttons">
              <button onClick={onPlayAgain}>Play Again</button>
              {gameState.roomId && (
                <button onClick={onLeaveGame}>Leave Game</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Modals;
