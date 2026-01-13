import React from 'react';

function Controls({ gameStarted, roomId, resetBoardFull, setGameState, setHostRoomId, setShowHostModal, setJoinRoomId, setShowJoinModal, handleLeaveGame, onBackToHome, gameMode }) {
  return (
    <div className="controls">
      {gameStarted && roomId ? (
        <button style={{ backgroundColor: '#f44336', color: 'white' }} onClick={handleLeaveGame}>
          Leave Game
        </button>
      ) : (
        <>
          {gameMode === 'bot' || gameMode === 'local' ? (
            <>
              <button onClick={resetBoardFull}>New Game</button>
              <button onClick={() => setGameState(prev => ({ ...prev, showRules: true }))}>Show Rules</button>
              <button className="back-btn" onClick={onBackToHome}>Back to Home</button>
            </>
          ) : gameMode === 'online' ? (
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
              <button className="back-btn" onClick={onBackToHome}>Back to Home</button>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

export default Controls;
