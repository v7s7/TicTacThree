import React from 'react';
import { nanoid } from 'nanoid';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';

function HostJoinModals({ showHostModal, showJoinModal, hostRoomId, setHostRoomId, joinRoomId, setJoinRoomId, setRoomId, setPlayerSymbol, setShowHostModal, setShowJoinModal, setOnlineXScore, setOnlineOScore, setGameStarted, setGameMode, user, setPlayerXName, setPlayerOName }) {

  const handleCreateGame = async () => {
    const roomRef = doc(db, 'gameRooms', hostRoomId);
    const hostName = user?.displayName || 'Host';
    await setDoc(roomRef, {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      playerX: 'host',
      playerO: null,
      playerXName: hostName,
      playerOName: 'Waiting...',
      status: 'waiting',
      readyX: true,
      readyO: false,
      startedAt: null,
      round: 1,
      rematchRequested: null,
      rematchRequestedBy: null,
      rematchNonce: null,
      rematchHandled: null,
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
    setGameStarted(false);
    if (setGameMode) setGameMode('online');

    onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      if (data && data.status === 'playing') {
        if (data.playerOName) setPlayerOName(data.playerOName);
        setGameStarted(true);
      }
    });
  };

  const handleJoinGame = async () => {
    if (!joinRoomId) return;
    const roomRef = doc(db, 'gameRooms', joinRoomId);
    const guestName = user?.displayName || 'Guest';

    try {
      const result = await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) return { success: false, error: 'Room not found.' };

        const data = roomSnap.data();
        if (data.private) return { success: false, error: 'This room is private.' };
        if (data.playerO) return { success: false, error: 'Room is already full.' };
        if (data.status === 'left') return { success: false, error: 'Room is no longer available.' };

        const playerXName = data.playerXName || 'Player X';
        transaction.update(roomRef, {
          playerO: 'guest',
          playerOName: guestName,
          readyO: true,
          status: data.readyX ? 'playing' : 'waiting',
          startedAt: data.readyX ? Date.now() : null
        });

        return { success: true, playerXName };
      });

      if (!result.success) {
        alert(result.error || 'Unable to join room.');
        return;
      }

      setPlayerXName(result.playerXName || 'Player X');
      setPlayerOName(guestName);
      setRoomId(joinRoomId);
      setPlayerSymbol('O');
      setShowJoinModal(false);
      setOnlineXScore(0);
      setOnlineOScore(0);
      setGameStarted(false);
      if (setGameMode) setGameMode('online');
    } catch (error) {
      console.error('Join room failed:', error);
      alert('Failed to join room.');
    }
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
