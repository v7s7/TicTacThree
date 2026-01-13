import React, { useEffect } from 'react';
import Cell from './Cell';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { soundManager } from '../utils/soundManager';

function Board({ gameState, setGameState, playerSymbol, roomId, gameMode, onGameEnd }) {
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);
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
            : data.winner ? `Player ${data.winner} wins!` : '',
          playerXMarks: data.playerXMarks || [],
          playerOMarks: data.playerOMarks || [],
          markToRemoveIndex: data.markToRemoveIndex ?? null
        }));
      }
    });
    return () => unsubscribe();
  }, [roomId, setGameState]);

  const handleCellClick = async (index) => {
    if (!gameState.gameActive || gameState.board[index]) return;

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

      if (onGameEnd) {
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
        showWinModal: winner || isDraw,
        winMessage: winner ? `Player ${winner} wins!` : isDraw ? "It's a draw!" : '',
        winningLine: winningLine
      }));
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

    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    const data = roomSnap.data();

    const updatedBoard = [...data.board];
    updatedBoard[index] = playerSymbol;

    let newPlayerXMarks = data.playerXMarks || [];
    let newPlayerOMarks = data.playerOMarks || [];

    if (playerSymbol === 'X') {
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

    await updateDoc(roomRef, {
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
  };

  return (
    <div className="board-container">
      {playerSymbol && (
        <div className="you-are">YOU ARE {playerSymbol}</div>
      )}
      <div className="board">
        {gameState.board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onClick={() => handleCellClick(index)}
            isPulsing={index === gameState.markToRemoveIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default Board;
