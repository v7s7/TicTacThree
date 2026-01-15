import React, { useEffect } from 'react';
import Cell from './Cell';
import { db } from '../firebase';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { soundManager } from '../utils/soundManager';

function Board({ gameState, setGameState, playerSymbol, roomId, gameMode, onGameEnd, playerXName, playerOName, isBotThinking }) {
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'gameRooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setGameState(prev => ({
          ...prev,
          board: data.board,
          currentPlayer: data.currentPlayer,
          gameActive: data.status === 'playing' || data.status === 'full',
          showWinModal: data.status === 'finished',
          winMessage: data.winner === 'draw'
            ? "It's a draw!"
            : data.winner ? `${data.winner === 'X' ? (playerXName || 'Player X') : (playerOName || 'Player O')} wins!` : '',
          playerXMarks: data.playerXMarks || [],
          playerOMarks: data.playerOMarks || [],
          markToRemoveIndex: data.markToRemoveIndex ?? null
        }));
      }
    });
    return () => unsubscribe();
  }, [roomId, setGameState, playerXName, playerOName]);

  const handleCellClick = async (index) => {
    if (!gameState.gameActive || gameState.board[index]) return;
    // Lock input while bot is thinking or when it's bot's turn
    if (gameMode === 'bot' && (isBotThinking || gameState.currentPlayer === 'O')) return;

    soundManager.playMove();

    const updateLocalState = (updatedBoard, newPlayerXMarks, newPlayerOMarks) => {
      const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      let winner = null;
      let winningLine = [];
      for (const pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (updatedBoard[a] && updatedBoard[a] === updatedBoard[b] && updatedBoard[a] === updatedBoard[c]) {
          winner = updatedBoard[a];
          winningLine = pattern;
          break;
        }
      }

      const isDraw = !winner && updatedBoard.every(cell => cell !== null);

      // Only call onGameEnd once when game ends
      if (onGameEnd && (winner || isDraw)) {
        onGameEnd(winner, isDraw);
      }

      setGameState(prev => ({
        ...prev,
        board: updatedBoard,
        playerXMarks: newPlayerXMarks,
        playerOMarks: newPlayerOMarks,
        markToRemoveIndex:
          (prev.currentPlayer === 'X' && newPlayerXMarks.length === 3) ? newPlayerXMarks[0] :
          (prev.currentPlayer === 'O' && newPlayerOMarks.length === 3) ? newPlayerOMarks[0] :
          null,
        currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
        gameActive: !winner && !isDraw,
        showWinModal: false, // Don't show immediately
        winMessage: winner
          ? gameMode === 'bot'
            ? `${winner === 'X' ? 'You' : 'Bot'} win${winner === 'O' ? 's' : ''}!`
            : `${winner === 'X' ? (playerXName || 'Player X') : (playerOName || 'Player O')} wins!`
          : isDraw ? "It's a draw!" : '',
        winningLine: winningLine,
        lastWinner: winner || (isDraw ? 'draw' : null)
      }));

      // Delay showing modal to let winning line animation play
      if (winner || isDraw) {
        setTimeout(() => {
          setGameState(prev => ({ ...prev, showWinModal: true }));
        }, 1200); // Show modal after line animation completes (1s animation + 200ms buffer)
      }
    };

    if (!roomId || gameMode === 'bot' || gameMode === 'local') {
      const updatedBoard = [...gameState.board];
      updatedBoard[index] = gameState.currentPlayer;

      let newPlayerXMarks = [...gameState.playerXMarks];
      let newPlayerOMarks = [...gameState.playerOMarks];

      if (gameState.currentPlayer === 'X') {
        newPlayerXMarks.push(index);
        if (newPlayerXMarks.length > 3) {
          const removed = newPlayerXMarks.shift();
          updatedBoard[removed] = null;
        }
      } else {
        newPlayerOMarks.push(index);
        if (newPlayerOMarks.length > 3) {
          const removed = newPlayerOMarks.shift();
          updatedBoard[removed] = null;
        }
      }

      updateLocalState(updatedBoard, newPlayerXMarks, newPlayerOMarks);
      return;
    }

    if (gameState.currentPlayer !== playerSymbol) return;

    const roomRef = doc(db, 'gameRooms', roomId);

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists()) return;

      const data = roomSnap.data();
      if (!data || data.status !== 'playing') return;
      if (data.currentPlayer !== playerSymbol) return;
      if (data.board?.[index]) return;

      const updatedBoard = [...data.board];
      updatedBoard[index] = playerSymbol;

      let newPlayerXMarks = data.playerXMarks || [];
      let newPlayerOMarks = data.playerOMarks || [];

      if (playerSymbol === 'X') {
        newPlayerXMarks = [...newPlayerXMarks, index];
        if (newPlayerXMarks.length > 3) {
          const removed = newPlayerXMarks.shift();
          updatedBoard[removed] = null;
        }
      } else {
        newPlayerOMarks = [...newPlayerOMarks, index];
        if (newPlayerOMarks.length > 3) {
          const removed = newPlayerOMarks.shift();
          updatedBoard[removed] = null;
        }
      }

      const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      let winner = null;
      for (const [a,b,c] of winPatterns) {
        if (updatedBoard[a] && updatedBoard[a] === updatedBoard[b] && updatedBoard[a] === updatedBoard[c]) {
          winner = updatedBoard[a];
          break;
        }
      }

      const isDraw = updatedBoard.every(cell => cell !== null);

      transaction.update(roomRef, {
        board: updatedBoard,
        playerXMarks: newPlayerXMarks,
        playerOMarks: newPlayerOMarks,
        markToRemoveIndex:
          (playerSymbol === 'X' && newPlayerXMarks.length === 3) ? newPlayerXMarks[0] :
          (playerSymbol === 'O' && newPlayerOMarks.length === 3) ? newPlayerOMarks[0] :
          null,
        currentPlayer: playerSymbol === 'X' ? 'O' : 'X',
        status: winner || isDraw ? 'finished' : 'playing',
        winner: winner || (isDraw ? 'draw' : null),
      });
    });
  };

  return (
    <div className="board-container">
      {playerSymbol && (
        <div className="you-are">YOU ARE {playerSymbol}</div>
      )}
      <div className="board" style={{ position: 'relative' }}>
        {gameState.board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onClick={() => handleCellClick(index)}
            isPulsing={index === gameState.markToRemoveIndex}
          />
        ))}
        {gameState.winningLine && gameState.winningLine.length === 3 && (
          <div className="winning-line-overlay">
            <svg className="winning-line-svg" viewBox="0 0 300 300" preserveAspectRatio="none">
              <line
                className="winning-line-animation"
                x1={getLineCoordinates(gameState.winningLine).x1}
                y1={getLineCoordinates(gameState.winningLine).y1}
                x2={getLineCoordinates(gameState.winningLine).x2}
                y2={getLineCoordinates(gameState.winningLine).y2}
                stroke="#ffd700"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate line coordinates based on winning pattern
function getLineCoordinates(winningLine) {
  const cellSize = 100; // 100 units per cell in viewBox
  const offset = 50; // Center of each cell
  
  const positions = winningLine.map(index => ({
    x: (index % 3) * cellSize + offset,
    y: Math.floor(index / 3) * cellSize + offset
  }));
  
  return {
    x1: positions[0].x,
    y1: positions[0].y,
    x2: positions[2].x,
    y2: positions[2].y
  };
}

export default Board;
