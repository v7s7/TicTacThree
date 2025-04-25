import React, { useState } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Modals from './components/Modals';
import './styles/App.css';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { nanoid } from 'nanoid';

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
    winningLine: [],
    showRules: false,
    showWinModal: false,
    winMessage: ''
  });

  const [showHostModal, setShowHostModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hostRoomId, setHostRoomId] = useState(nanoid(4).toUpperCase());
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const resetBoard = () => {
    const next = gameState.startingPlayer === 'X' ? 'O' : 'X';
    setGameState({
      ...gameState,
      board: Array(9).fill(null),
      currentPlayer: next,
      startingPlayer: next,
      gameActive: true,
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      winningLine: [],
      showRules: false,
      showWinModal: false,
      winMessage: ''
    });
  };

  return (
    <div className="app-container">
      <div className="app">
        <h1>Tic Tac Toe</h1>
        <p>The classic game with a twist!</p>

        {roomId && (
          <p>Room Code: <strong style={{ color: '#0ff' }}>{roomId}</strong></p>
        )}

        <p>Player X: {gameState.xScore}</p>
        <p>Player O: {gameState.oScore}</p>
        <p className="turn-indicator">Player {gameState.currentPlayer}'s turn</p>

        <Board gameState={gameState} setGameState={setGameState} playerSymbol={playerSymbol} roomId={roomId} />

        {!gameStarted && (
          <div className="controls">
            <button onClick={resetBoard}>New Game</button>
            <button onClick={() => setGameState({ ...gameState, showRules: true })}>Show Rules</button>
            <button onClick={() => {
              setHostRoomId(nanoid(4).toUpperCase());
              setShowHostModal(true);
            }}>Host a Game</button>
            <button onClick={() => {
              setJoinRoomId('');
              setShowJoinModal(true);
            }}>Join a Game</button>
            <button onClick={() => setGameState({ ...gameState, xScore: 0, oScore: 0 })}>Reset Points</button>
          </div>
        )}

        <Modals gameState={gameState} setGameState={setGameState} />

        {showHostModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Host a new game</h3>
              <input
                value={hostRoomId}
                onChange={(e) => setHostRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
              />
              <p>
                Enter an ID that people will use to join your game.{' '}
                <span
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0ff' }}
                  onClick={() => setHostRoomId(nanoid(4).toUpperCase())}
                >
                  Use a random ID
                </span>
              </p>
              <div className="modal-buttons">
                <button
                  onClick={async () => {
                    const roomRef = doc(db, 'rooms', hostRoomId);
                    await setDoc(roomRef, {
                      board: Array(9).fill(null),
                      currentPlayer: 'X',
                      playerX: 'host',
                      playerO: null,
                      status: 'waiting',
                      winner: null,
                      private: false,
                      createdAt: Date.now()
                    });
                    setRoomId(hostRoomId);
                    setPlayerSymbol('X');
                    setShowHostModal(false);
                    setIsHosting(true);

                    onSnapshot(roomRef, (docSnap) => {
                      const data = docSnap.data();
                      if (data && data.playerO) {
                        setIsHosting(false);
                        setGameStarted(true);
                        
                      }
                    });
                  }}
                >
                  Create Game
                </button>
                <button onClick={() => setShowHostModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Join an existing game</h3>
              <input
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                placeholder="Type a game ID to join"
              />
              <p>To join an existing game, enter its ID and click Join.</p>
              <div className="modal-buttons">
                <button
                  onClick={async () => {
                    if (!joinRoomId) return;
                    const roomRef = doc(db, 'rooms', joinRoomId);
                    const roomSnap = await getDoc(roomRef);
                    const data = roomSnap.data();
                    if (!data) return alert('Room not found.');
                    if (data.private) return alert('This room is private.');
                    await updateDoc(roomRef, { playerO: 'guest', status: 'full' });
                    setRoomId(joinRoomId);
                    setPlayerSymbol('O');
                    setShowJoinModal(false);
                    setGameStarted(true);
                  }}
                >
                  Join
                </button>
                <button onClick={() => setShowJoinModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
