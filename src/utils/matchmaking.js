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
      timestamp: Date.now()
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
    const q = query(collection(db, MATCHMAKING_COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting active players:', error);
    return 0;
  }
};

// Listen to active players count
export const listenToActivePlayersCount = (callback) => {
  const q = query(collection(db, MATCHMAKING_COLLECTION));
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

    // Find an opponent
    let opponent = null;
    snapshot.forEach((doc) => {
      if (doc.id !== userId && !opponent) {
        opponent = { id: doc.id, ...doc.data() };
      }
    });

    if (opponent) {
      // Create game room
      const roomId = nanoid(6).toUpperCase();
      const roomRef = doc(db, ACTIVE_GAMES_COLLECTION, roomId);

      await setDoc(roomRef, {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        playerX: userId,
        playerO: opponent.id,
        playerXName: displayName,
        playerOName: opponent.displayName,
        status: 'playing',
        winner: null,
        private: false,
        createdAt: Date.now(),
        playerXMarks: [],
        playerOMarks: [],
        markToRemoveIndex: null
      });

      // Remove both players from queue
      await deleteDoc(doc(db, MATCHMAKING_COLLECTION, userId));
      await deleteDoc(doc(db, MATCHMAKING_COLLECTION, opponent.id));

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

    return { success: false, message: 'No opponent found' };
  } catch (error) {
    console.error('Error finding match:', error);
    return { success: false, error: error.message };
  }
};

// Listen for match found (for the second player)
export const listenForMatch = (userId, onMatchFound) => {
  // Check if user was matched by another player
  // eslint-disable-next-line no-unused-vars
  const checkForRoom = async () => {
    try {
      // Check rooms where user is playerO
      const q = query(
        collection(db, ACTIVE_GAMES_COLLECTION),
        where('playerO', '==', userId),
        where('status', '==', 'playing')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const roomDoc = snapshot.docs[0];
        const roomData = roomDoc.data();
        onMatchFound({
          roomId: roomDoc.id,
          opponentId: roomData.playerX,
          opponentName: roomData.playerXName || 'Opponent',
          playerSymbol: 'O',
          playerXName: roomData.playerXName || 'Player X',
          playerOName: roomData.playerOName || 'Player O'
        });
      }
    } catch (error) {
      console.error('Error checking for room:', error);
    }
  };

  // Listen for changes in rooms collection
  const q = query(
    collection(db, ACTIVE_GAMES_COLLECTION),
    where('playerO', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const roomDoc = snapshot.docs[0];
      const roomData = roomDoc.data();
      if (roomData.status === 'playing') {
        onMatchFound({
          roomId: roomDoc.id,
          opponentId: roomData.playerX,
          opponentName: roomData.playerXName || 'Opponent',
          playerSymbol: 'O',
          playerXName: roomData.playerXName || 'Player X',
          playerOName: roomData.playerOName || 'Player O'
        });
      }
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
      if (data.timestamp && now - data.timestamp > QUEUE_TIMEOUT) {
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
