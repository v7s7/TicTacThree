// Online matchmaking system for TicTacThree
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

const MATCHMAKING_COLLECTION = 'matchmaking_queue';
const ACTIVE_GAMES_COLLECTION = 'gameRooms';
const QUEUE_TIMEOUT = 60000; // 60 seconds

// Join matchmaking queue
export const joinQueue = async (userId, displayName = 'Guest') => {
  try {
    const queueRef = doc(db, MATCHMAKING_COLLECTION, userId);
    await setDoc(queueRef, {
      userId,
      displayName,
      joinedAt: serverTimestamp(),
      status: 'searching',
      timestamp: Date.now(),
      roomId: null,
      assignedSymbol: null,
      opponentId: null,
      opponentName: null,
      playerXName: null,
      playerOName: null
    });
    return { success: true };
  } catch (error) {
    console.error('Error joining queue:', error);
    return { success: false, error: error.message };
  }
};

// Leave matchmaking queue
export const leaveQueue = async (userId) => {
  try {
    await deleteDoc(doc(db, MATCHMAKING_COLLECTION, userId));
    return { success: true };
  } catch (error) {
    console.error('Error leaving queue:', error);
    return { success: false, error: error.message };
  }
};

// Get active players count in queue
export const getActivePlayersCount = async () => {
  try {
    const q = query(
      collection(db, MATCHMAKING_COLLECTION),
      where('status', '==', 'searching')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting active players:', error);
    return 0;
  }
};

// Listen to active players count
export const listenToActivePlayersCount = (callback) => {
  const q = query(
    collection(db, MATCHMAKING_COLLECTION),
    where('status', '==', 'searching')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
};

// Try to find a match
export const findMatch = async (userId, displayName = 'Guest') => {
  try {
    // Get all players in queue except current user
    const q = query(
      collection(db, MATCHMAKING_COLLECTION),
      where('status', '==', 'searching')
    );
    const snapshot = await getDocs(q);

    // Find the earliest opponent
    let opponent = null;
    snapshot.forEach((snap) => {
      if (snap.id === userId) return;
      const data = snap.data();
      if (!opponent) {
        opponent = { id: snap.id, ...data };
        return;
      }
      const opponentTs = typeof opponent.timestamp === 'number' ? opponent.timestamp : 0;
      const candidateTs = typeof data.timestamp === 'number' ? data.timestamp : 0;
      if (candidateTs < opponentTs) {
        opponent = { id: snap.id, ...data };
      }
    });

    if (opponent) {
      const roomId = nanoid(6).toUpperCase();
      const roomRef = doc(db, ACTIVE_GAMES_COLLECTION, roomId);
      const userRef = doc(db, MATCHMAKING_COLLECTION, userId);
      const opponentRef = doc(db, MATCHMAKING_COLLECTION, opponent.id);

      const transactionResult = await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const opponentSnap = await transaction.get(opponentRef);

        if (!userSnap.exists() || !opponentSnap.exists()) return { matched: false };
        const userData = userSnap.data() || {};
        const opponentData = opponentSnap.data() || {};

        if (userData.status !== 'searching' || opponentData.status !== 'searching') return { matched: false };
        if (userData.roomId || opponentData.roomId) return { matched: false };

        transaction.set(roomRef, {
          board: Array(9).fill(null),
          currentPlayer: 'X',
          playerX: userId,
          playerO: opponent.id,
          playerXName: displayName,
          playerOName: opponent.displayName,
          status: 'waiting',
          readyX: false,
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

        transaction.update(userRef, {
          status: 'matched',
          roomId,
          assignedSymbol: 'X',
          opponentId: opponent.id,
          opponentName: opponent.displayName,
          playerXName: displayName,
          playerOName: opponent.displayName
        });

        transaction.update(opponentRef, {
          status: 'matched',
          roomId,
          assignedSymbol: 'O',
          opponentId: userId,
          opponentName: displayName,
          playerXName: displayName,
          playerOName: opponent.displayName
        });

        return { matched: true };
      });

      if (transactionResult?.matched) {
        return {
          success: true,
          roomId,
          opponentId: opponent.id,
          opponentName: opponent.displayName,
          playerSymbol: 'X',
          playerXName: displayName,
          playerOName: opponent.displayName
        };
      }
    }

    return { success: false, message: 'No opponent found' };
  } catch (error) {
    console.error('Error finding match:', error);
    return { success: false, error: error.message };
  }
};

// Listen for match found (for the second player)
export const listenForMatch = (userId, onMatchFound) => {
  let handled = false;
  const userRef = doc(db, MATCHMAKING_COLLECTION, userId);

  return onSnapshot(userRef, async (snap) => {
    if (handled) return;
    if (!snap.exists()) return;

    const data = snap.data() || {};
    if (data.status !== 'matched' || !data.roomId) return;

    handled = true;
    const roomId = data.roomId;
    const playerSymbol = data.assignedSymbol || 'O';
    let opponentId = data.opponentId;
    let opponentName = data.opponentName;
    let playerXName = data.playerXName;
    let playerOName = data.playerOName;

    if (!opponentId || !opponentName || !playerXName || !playerOName) {
      try {
        const roomSnap = await getDoc(doc(db, ACTIVE_GAMES_COLLECTION, roomId));
        if (roomSnap.exists()) {
          const roomData = roomSnap.data() || {};
          playerXName = roomData.playerXName || playerXName || 'Player X';
          playerOName = roomData.playerOName || playerOName || 'Player O';
          opponentId = playerSymbol === 'X' ? roomData.playerO : roomData.playerX;
          opponentName = playerSymbol === 'X' ? roomData.playerOName : roomData.playerXName;
        }
      } catch (error) {
        console.error('Error fetching room for match:', error);
      }
    }

    onMatchFound({
      roomId,
      opponentId,
      opponentName: opponentName || 'Opponent',
      playerSymbol,
      playerXName: playerXName || 'Player X',
      playerOName: playerOName || 'Player O'
    });

    try {
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error cleaning up queue doc:', error);
    }
  });
};

// Clean up old queue entries (remove entries older than QUEUE_TIMEOUT)
export const cleanupOldQueueEntries = async () => {
  try {
    const snapshot = await getDocs(collection(db, MATCHMAKING_COLLECTION));
    const now = Date.now();
    const deletePromises = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp && now - data.timestamp > QUEUE_TIMEOUT && data.status === 'searching') {
        deletePromises.push(deleteDoc(doc.ref));
      }
    });

    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up queue:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is in queue
export const isInQueue = async (userId) => {
  try {
    const queueDoc = await getDoc(doc(db, MATCHMAKING_COLLECTION, userId));
    return queueDoc.exists();
  } catch (error) {
    console.error('Error checking queue status:', error);
    return false;
  }
};
