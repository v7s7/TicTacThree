import React from 'react';
import { nanoid } from 'nanoid';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

function HostJoinModals({ showHostModal, showJoinModal, hostRoomId, setHostRoomId, joinRoomId, setJoinRoomId, setRoomId, setPlayerSymbol, setShowHostModal, setShowJoinModal, setOnlineXScore, setOnlineOScore, setGameStarted, setGameMode, user, setPlayerXName, setPlayerOName }) {

  const handleCreateGame = async () => {
    const roomRef = doc(db, 'rooms', hostRoomId);
    const hostName = user?.displayName || 'Host';
    await setDoc(roomRef, {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      playerX: 'host',
      playerO: null,
      playerXName: hostName,
      playerOName: 'Waiting...',
      status: 'waiting',
      winner: null,
      private: false,
      createdAt: Date.now(),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null
    });
    setPlayerXName(hostName);
    setPlayerOName('Waiting...');
    setRoomId(hostRoomId);
    setPlayerSymbol('X');
    setShowHostModal(false);
    setOnlineXScore(0);
    setOnlineOScore(0);
    if (setGameMode) setGameMode('online');

    onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (data && data.playerO) {
        if (data.playerOName) setPlayerOName(data.playerOName);
        setGameStarted(true);
      }
    });
  };

  const handleJoinGame = async () => {
    if (!joinRoomId) return;
    const roomRef = doc(db, 'rooms', joinRoomId);
    const roomSnap = await getDoc(roomRef);
    const data = roomSnap.data();
    if (!data) return alert('Room not found.');
    if (data.private) return alert('This room is private.');

    const guestName = user?.displayName || 'Guest';
    await updateDoc(roomRef, {
      playerO: 'guest',
      playerOName: guestName,
      status: 'full'
    });
    setPlayerXName(data.playerXName || 'Player X');
    setPlayerOName(guestName);
    setRoomId(joinRoomId);
    setPlayerSymbol('O');
    setShowJoinModal(false);
    setOnlineXScore(0);
    setOnlineOScore(0);
    setGameStarted(true);
    if (setGameMode) setGameMode('online');
  };

  return (
    <>
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
              <button onClick={handleCreateGame}>Create Game</button>
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
              <button onClick={handleJoinGame}>Join</button>
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HostJoinModals;
