import React from 'react';

function Controls({ gameStarted, roomId, resetBoardFull, setGameState, setHostRoomId, setShowHostModal, setJoinRoomId, setShowJoinModal, handleLeaveGame }) {
  return (
    <div className="controls">
      {gameStarted && roomId ? (
        <button style={{ backgroundColor: '#f44336', color: 'white' }} onClick={handleLeaveGame}>
          Leave Game
        </button>
      ) : (
        <>
          <button onClick={resetBoardFull}>New Game</button>
          <button onClick={() => setGameState(prev => ({ ...prev, showRules: true }))}>Show Rules</button>
          <button onClick={() => {
            setHostRoomId();
            setShowHostModal(true);
          }}>Host a Game</button>
          <button onClick={() => {
            setJoinRoomId('');
            setShowJoinModal(true);
          }}>Join a Game</button>
          <button onClick={() => setGameState(prev => ({ ...prev, xScore: 0, oScore: 0 }))}>Reset Points</button>
        </>
      )}
    </div>
  );
}

export default Controls;
