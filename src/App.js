import React, { useState } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Modals from './components/Modals';
import './styles/App.css';

function App() {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    startingPlayer: 'X', 
    gameActive: true,
    xScore: 0,
    oScore: 0,
    playerXMarks: [],
    playerOMarks: [],
    markToRemoveIndex: null,
    showRules: false,
    showWinModal: false,
    winMessage: ''
  });

  return (
    <div className="app-container">
      <div className="app">
        <h1>Tic Tac Toe</h1>
        <p>The classic game with a twist!</p>
        
        <div className="game-area">
          <GameInfo gameState={gameState} />
          <Board gameState={gameState} setGameState={setGameState} />
          
          <div className="controls">
            <button onClick={() => setGameState(prev => ({ ...prev, showRules: true }))}>
              Show Rules
            </button>
            <button onClick={() => {
              setGameState({
                board: Array(9).fill(null),
                currentPlayer: 'X',
                gameActive: true,
                xScore: gameState.xScore,
                oScore: gameState.oScore,
                playerXMarks: [],
                playerOMarks: [],
                markToRemoveIndex: null,
                showRules: false,
                showWinModal: false,
                winMessage: ''
              });
            }}>
              New Game
            </button>
          </div>
        </div>
        
        <Modals gameState={gameState} setGameState={setGameState} />
      </div>
    </div>
  );
}

export default App;