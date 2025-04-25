import React from 'react';

function Modals({ gameState, setGameState }) {
  return (
    <>
      {gameState.showRules && (
        <div className="modal" onClick={() => setGameState(prev => ({ ...prev, showRules: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Game Rules</h2>
            <ol>
              <li>Players take turns placing X and O marks</li>
              <li>After placing 3 marks, your oldest mark will blink</li>
              <li>When placing the 4th mark, the oldest one moves to the new position</li>
              <li>First to get 3 in a row wins</li>
            </ol>
            <button onClick={() => setGameState(prev => ({ ...prev, showRules: false }))}>
              Got it
            </button>
          </div>
        </div>
      )}

      {gameState.showWinModal && (
        <div className="modal" onClick={() => setGameState(prev => ({ ...prev, showWinModal: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className={gameState.winMessage.includes('X') ? 'X' : 'O'}>
              {gameState.winMessage}
            </h2>
            <div className="modal-buttons">
            <button onClick={() => {
  const nextStartingPlayer = gameState.startingPlayer === 'X' ? 'O' : 'X';
  setGameState(prev => ({
    ...prev,
    board: Array(9).fill(null),
    currentPlayer: nextStartingPlayer,
    startingPlayer: nextStartingPlayer,
    gameActive: true,
    playerXMarks: [],
    playerOMarks: [],
    markToRemoveIndex: null,
    showWinModal: false
  }));
}}>

                Play Again
              </button>
              <button onClick={() => setGameState(prev => ({ ...prev, showWinModal: false }))}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Modals;