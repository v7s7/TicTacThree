// Friends system manager
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

const defaultRivalryStats = () => ({ wins: 0, losses: 0, draws: 0, lastPlayed: null, lastResult: null });
const invertOutcome = (outcome) => {
  if (outcome === 'win') return 'loss';
  if (outcome === 'loss') return 'win';
  return 'draw';
};

// Send friend request
export const sendFriendRequest = async (fromUserId, toDisplayName, fromDisplayName, fromAvatar = {}) => {
  try {
    // Find user by display name (case-insensitive)
    const usersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersRef);
    
    // Filter by case-insensitive username match
    const matchingUsers = allUsersSnapshot.docs.filter(doc => {
      const userData = doc.data();
      return userData.displayName && userData.displayName.toLowerCase() === toDisplayName.toLowerCase();
    });
    
    if (matchingUsers.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const toUser = matchingUsers[0];
    const toUserId = toUser.id;

    if (toUserId === fromUserId) {
      return { success: false, error: 'Cannot add yourself' };
    }

    // Check if already friends
    const fromUserDoc = await getDoc(doc(db, 'users', fromUserId));
    const friends = fromUserDoc.data()?.friends || [];
    if (friends.includes(toUserId)) {
      return { success: false, error: 'Already friends' };
    }

    // Create friend request
    const requestId = nanoid(12);
    await setDoc(doc(db, 'friendRequests', requestId), {
      from: fromUserId,
      to: toUserId,
      fromDisplayName: fromDisplayName,
      toDisplayName: toDisplayName,
      fromPhotoUrl: fromAvatar.photoUrl || null,
      fromEquippedFrame: fromAvatar.frame || null,
      fromEquippedBackground: fromAvatar.background || null,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Friend request sent!' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: error.message };
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId, userId) => {
  try {
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) {
      return { success: false, error: 'Request not found' };
    }

    const request = requestDoc.data();

    // Add each other as friends
    await updateDoc(doc(db, 'users', request.from), {
      friends: arrayUnion(request.to)
    });

    await updateDoc(doc(db, 'users', request.to), {
      friends: arrayUnion(request.from)
    });

    // Delete request
    await deleteDoc(doc(db, 'friendRequests', requestId));

    return { success: true, message: 'Friend added!' };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
};

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error declining friend request:', error);
    return { success: false, error: error.message };
  }
};

// Get pending friend requests
export const getFriendRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'friendRequests'),
      where('to', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, requests };
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return { success: false, error: error.message, requests: [] };
  }
};

// Get friends list with data
export const getFriendsList = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data() || {};
    const friendIds = userData.friends || [];
    const rivalries = userData.rivalries || {};

    if (friendIds.length === 0) {
      return { success: true, friends: [] };
    }

    const friends = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        const rivalryStats = rivalries[friendId] || defaultRivalryStats();
        friends.push({
          id: friendId,
          ...friendDoc.data(),
          rivalry: {
            ...defaultRivalryStats(),
            ...rivalryStats
          }
        });
      }
    }

    return { success: true, friends };
  } catch (error) {
    console.error('Error getting friends list:', error);
    return { success: false, error: error.message, friends: [] };
  }
};

export const updateHeadToHeadForFriends = async (userId, friendId, outcomeForUser, gameMode = 'online') => {
  try {
    if (gameMode !== 'online') return { success: false, skipped: true };
    if (!userId || !friendId || userId === friendId) return { success: false, error: 'Invalid IDs' };

    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);
    const [userSnap, friendSnap] = await Promise.all([getDoc(userRef), getDoc(friendRef)]);

    if (!userSnap.exists() || !friendSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userSnap.data() || {};
    const friendData = friendSnap.data() || {};
    const userFriends = userData.friends || [];
    const friendFriends = friendData.friends || [];

    // Only record rivalry stats when they are actually friends
    if (!userFriends.includes(friendId) || !friendFriends.includes(userId)) {
      return { success: false, skipped: true };
    }

    const now = Date.now();
    const userRivalry = { ...defaultRivalryStats(), ...(userData.rivalries?.[friendId] || {}) };
    const friendRivalry = { ...defaultRivalryStats(), ...(friendData.rivalries?.[userId] || {}) };

    const applyOutcome = (rivalry, outcome) => {
      if (outcome === 'win') rivalry.wins += 1;
      else if (outcome === 'loss') rivalry.losses += 1;
      else rivalry.draws += 1;
      rivalry.lastPlayed = now;
      rivalry.lastResult = outcome;
      return rivalry;
    };

    applyOutcome(userRivalry, outcomeForUser);
    applyOutcome(friendRivalry, invertOutcome(outcomeForUser));

    await updateDoc(userRef, { [`rivalries.${friendId}`]: userRivalry });

    return { success: true, userRivalry };
  } catch (error) {
    console.error('Error updating head-to-head:', error);
    return { success: false, error: error.message };
  }
};

export const listenFriendRequests = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(
    collection(db, 'friendRequests'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(requests);
  });
};

export const listenGameInvites = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(
    collection(db, 'gameInvites'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snapshot) => {
    const invites = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(invites);
  });
};

// Remove friend
export const removeFriend = async (userId, friendId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      friends: arrayRemove(friendId)
    });

    await updateDoc(doc(db, 'users', friendId), {
      friends: arrayRemove(userId)
    });

    return { success: true, message: 'Friend removed' };
  } catch (error) {
    console.error('Error removing friend:', error);
    return { success: false, error: error.message };
  }
};

// Create private game invite
export const inviteFriendToGame = async (fromUserId, toUserId, fromDisplayName, toDisplayName, fromAvatar = {}) => {
  try {
    const roomId = nanoid(6).toUpperCase();

    await setDoc(doc(db, 'gameRooms', roomId), {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      playerX: fromUserId,
      playerO: toUserId,
      playerXName: fromDisplayName,
      playerOName: toDisplayName,
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
      private: true,
      createdAt: Date.now(),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      inviteType: 'friend'
    });

    // Create notification for friend
    await setDoc(doc(db, 'gameInvites', nanoid(12)), {
      roomId,
      from: fromUserId,
      to: toUserId,
      fromDisplayName,
      toDisplayName,
      fromPhotoUrl: fromAvatar.photoUrl || null,
      fromEquippedFrame: fromAvatar.frame || null,
      fromEquippedBackground: fromAvatar.background || null,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true, roomId, message: 'Invite sent!' };
  } catch (error) {
    console.error('Error inviting friend:', error);
    return { success: false, error: error.message };
  }
};

// Get game invites
export const getGameInvites = async (userId) => {
  try {
    const q = query(
      collection(db, 'gameInvites'),
      where('to', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    const invites = [];
    snapshot.forEach((doc) => {
      invites.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, invites };
  } catch (error) {
    console.error('Error getting game invites:', error);
    return { success: false, error: error.message, invites: [] };
  }
};

// Accept game invite
export const acceptGameInvite = async (inviteId) => {
  try {
    const inviteDoc = await getDoc(doc(db, 'gameInvites', inviteId));
    if (!inviteDoc.exists()) {
      return { success: false, error: 'Invite not found' };
    }

    const invite = inviteDoc.data();

    const roomRef = doc(db, 'gameRooms', invite.roomId);
    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists()) throw new Error('Room not found');

      const roomData = roomSnap.data() || {};
      const readyX = roomData.readyX === true;

      transaction.update(roomRef, {
        readyO: true,
        status: readyX ? 'playing' : 'waiting',
        startedAt: readyX ? Date.now() : null
      });
    });

    // Delete invite
    await deleteDoc(doc(db, 'gameInvites', inviteId));

    return { success: true, roomId: invite.roomId };
  } catch (error) {
    console.error('Error accepting game invite:', error);
    return { success: false, error: error.message };
  }
};

// Decline game invite
export const declineGameInvite = async (inviteId, roomId) => {
  try {
    // Delete room and invite
    await deleteDoc(doc(db, 'gameRooms', roomId));
    await deleteDoc(doc(db, 'gameInvites', inviteId));
    return { success: true };
  } catch (error) {
    console.error('Error declining game invite:', error);
    return { success: false, error: error.message };
  }
};
