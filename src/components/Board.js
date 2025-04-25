import React from 'react';
import Cell from './Cell';

function Board({ gameState, setGameState }) {
  const handleCellClick = (index) => {
    if (gameState.board[index] || !gameState.gameActive) return;
  
    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;
  
    let newPlayerXMarks = [...gameState.playerXMarks];
    let newPlayerOMarks = [...gameState.playerOMarks];
    let newMarkToRemoveIndex = null;
  
    if (gameState.currentPlayer === 'X') {
      newPlayerXMarks.push(index);
  
      if (newPlayerXMarks.length > 3) {
        const removed = newPlayerXMarks.shift(); // Remove the oldest
        newBoard[removed] = null;
      }
  
      // Pulse the oldest (if 3 marks are present)
      if (newPlayerXMarks.length === 3) {
        newMarkToRemoveIndex = newPlayerXMarks[0];
      }
  
    } else {
      newPlayerOMarks.push(index);
  
      if (newPlayerOMarks.length > 3) {
        const removed = newPlayerOMarks.shift();
        newBoard[removed] = null;
      }
  
      if (newPlayerOMarks.length === 3) {
        newMarkToRemoveIndex = newPlayerOMarks[0];
      }
    }
  
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
  
    const isWin = winPatterns.some(([a, b, c]) =>
      newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]
    );
  
    const isDraw = newBoard.every(cell => cell !== null);
  
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      playerXMarks: newPlayerXMarks,
      playerOMarks: newPlayerOMarks,
      markToRemoveIndex: newMarkToRemoveIndex,
      gameActive: !isWin && !isDraw,
      currentPlayer: isWin || isDraw ? prev.currentPlayer : prev.currentPlayer === 'X' ? 'O' : 'X',
      xScore: isWin && prev.currentPlayer === 'X' ? prev.xScore + 1 : prev.xScore,
      oScore: isWin && prev.currentPlayer === 'O' ? prev.oScore + 1 : prev.oScore,
      showWinModal: isWin || isDraw,
      winMessage: isWin ? `Player ${prev.currentPlayer} wins!` : "It's a draw!"
    }));
  };
  

  return (
    <div className="board-container">
      <div className="turn-indicator">
        Player {gameState.currentPlayer}'s turn
        <div
  className={`warning ${
    (gameState.currentPlayer === 'X' && gameState.playerXMarks.length >= 3) ||
    (gameState.currentPlayer === 'O' && gameState.playerOMarks.length >= 3)
      ? 'visible'
      : 'hidden'
  }`}
>
  Your oldest mark will move when you place the next one!
</div>

      </div>
      
      <div className="board">
        {gameState.board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            isPulsing={index === gameState.markToRemoveIndex}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Board;