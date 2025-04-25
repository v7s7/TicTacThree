import React, { useEffect, useState } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Modals from './components/Modals';
import TopInfo from './components/TopInfo';
import Controls from './components/Controls';
import HostJoinModals from './components/HostJoinModals';
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

  const [localXScore, setLocalXScore] = useState(0);
  const [localOScore, setLocalOScore] = useState(0);
  const [onlineXScore, setOnlineXScore] = useState(0);
  const [onlineOScore, setOnlineOScore] = useState(0);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hostRoomId, setHostRoomId] = useState(nanoid(4).toUpperCase());
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      const data = docSnap.data();
      if (!data) return;

      if (data.status === 'left' && data.leftBy !== playerSymbol) {
        setOpponentLeft(true);
        setTimeout(() => {
          leaveGameCleanup();
        }, 2000);
      }

      if (data.rematchRequested) {
        handleRematch(data.winner);
      
        updateDoc(doc(db, 'rooms', roomId), {
          rematchRequested: null,
          winner: null
        });
      }
      
    });
    return () => unsub();
  }, [roomId, playerSymbol]);

  const leaveGameCleanup = () => {
    setRoomId(null);
    setPlayerSymbol(null);
    setGameStarted(false);
    setOpponentLeft(false);
    resetBoardFull();
  };

  const resetBoardFull = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      winningLine: [],
      showRules: false,
      showWinModal: false,
      winMessage: '',
      gameActive: true
    }));
  };

  const handleRematch = async (lastWinner) => {
    const nextStarter = lastWinner === 'X' ? 'O' : 'X';
    let newXScore = 0;
    let newOScore = 0;

    if (!roomId) {
      newXScore = lastWinner === 'X' ? localXScore + 1 : localXScore;
      newOScore = lastWinner === 'O' ? localOScore + 1 : localOScore;
      setLocalXScore(newXScore);
      setLocalOScore(newOScore);
    } else {
      newXScore = lastWinner === 'X' ? onlineXScore + 1 : onlineXScore;
      newOScore = lastWinner === 'O' ? onlineOScore + 1 : onlineOScore;
      setOnlineXScore(newXScore);
      setOnlineOScore(newOScore);
    }

    if (roomId) {
      await updateDoc(doc(db, 'rooms', roomId), {
        rematchRequested: null,
        board: Array(9).fill(null),
        winner: null,
        currentPlayer: nextStarter,
        playerXMarks: [],
        playerOMarks: [],
        markToRemoveIndex: null
      });
    }

    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      winningLine: [],
      winMessage: '',
      showWinModal: false,
      gameActive: true,
      xScore: newXScore,
      oScore: newOScore,
      currentPlayer: nextStarter,
      startingPlayer: nextStarter
    }));
  };

  const handlePlayAgain = async () => {
    if (roomId) {
      const lastWinner = gameState.winMessage.includes('X') ? 'X' :
                         gameState.winMessage.includes('O') ? 'O' : null;
  
      await updateDoc(doc(db, 'rooms', roomId), {
        rematchRequested: true,
        winner: lastWinner || null
      });
    } else {
      const lastWinner = gameState.winMessage.includes('X') ? 'X' :
                         gameState.winMessage.includes('O') ? 'O' : null;
  
      if (lastWinner === 'X') setLocalXScore(prev => prev + 1);
      if (lastWinner === 'O') setLocalOScore(prev => prev + 1);
  
      resetBoardFull();
    }
  };
  

  const handleLeaveGame = async () => {
    if (roomId) {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'left',
        leftBy: playerSymbol
      });
    }
    leaveGameCleanup();
  };

  return (
    <div className="app-container">
      <div className="app">
        <TopInfo
          roomId={roomId}
          localXScore={localXScore}
          localOScore={localOScore}
          onlineXScore={onlineXScore}
          onlineOScore={onlineOScore}
          gameState={gameState}
          opponentLeft={opponentLeft}
        />

        <Board
          gameState={gameState}
          setGameState={setGameState}
          playerSymbol={playerSymbol}
          roomId={roomId}
        />

        <Controls
          gameStarted={gameStarted}
          roomId={roomId}
          resetBoardFull={resetBoardFull}
          setGameState={setGameState}
          setHostRoomId={() => setHostRoomId(nanoid(4).toUpperCase())}
          setShowHostModal={setShowHostModal}
          setJoinRoomId={setJoinRoomId}
          setShowJoinModal={setShowJoinModal}
          handleLeaveGame={handleLeaveGame}
        />

        <Modals
          gameState={{ ...gameState, roomId }}
          setGameState={setGameState}
          onPlayAgain={handlePlayAgain}
          onLeaveGame={handleLeaveGame}
        />

        <HostJoinModals
          showHostModal={showHostModal}
          showJoinModal={showJoinModal}
          hostRoomId={hostRoomId}
          setHostRoomId={setHostRoomId}
          joinRoomId={joinRoomId}
          setJoinRoomId={setJoinRoomId}
          setRoomId={setRoomId}
          setPlayerSymbol={setPlayerSymbol}
          setShowHostModal={setShowHostModal}
          setShowJoinModal={setShowJoinModal}
          setOnlineXScore={setOnlineXScore}
          setOnlineOScore={setOnlineOScore}
          setIsHosting={setIsHosting}
          setGameStarted={setGameStarted}
        />
      </div>
    </div>
  );
}

export default App;
