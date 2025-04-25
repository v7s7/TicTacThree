import React from 'react';
import Cell from './Cell';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';

function Board({ gameState, setGameState, playerSymbol, roomId }) {
  React.useEffect(() => {
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
        }));
      }
    });

    return () => unsubscribe();
  }, [roomId, setGameState]);

  const handleCellClick = async (index) => {
    if (!roomId || !playerSymbol) return;
    if (gameState.board[index] !== null || gameState.currentPlayer !== playerSymbol) return;
    if (!gameState.gameActive) return;

    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    const data = roomSnap.data();

    const updatedBoard = [...data.board];
    updatedBoard[index] = playerSymbol;

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
      currentPlayer: playerSymbol === 'X' ? 'O' : 'X',
      status: winner || isDraw ? 'finished' : 'playing',
      winner: winner || (isDraw ? 'draw' : null),
    });
  };

  return (
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
  );
}

export default Board;
