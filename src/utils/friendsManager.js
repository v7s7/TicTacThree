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
  serverTimestamp
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

// Send friend request
export const sendFriendRequest = async (fromUserId, toDisplayName, fromDisplayName) => {
  try {
    // Find user by display name
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('displayName', '==', toDisplayName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'User not found' };
    }

    const toUser = snapshot.docs[0];
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
    await setDoc(doc(db, 'friend_requests', requestId), {
      from: fromUserId,
      to: toUserId,
      fromDisplayName: fromDisplayName,
      toDisplayName: toDisplayName,
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
    const requestDoc = await getDoc(doc(db, 'friend_requests', requestId));
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
    await deleteDoc(doc(db, 'friend_requests', requestId));

    return { success: true, message: 'Friend added!' };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
};

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', requestId));
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
      collection(db, 'friend_requests'),
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
    const friendIds = userDoc.data()?.friends || [];

    if (friendIds.length === 0) {
      return { success: true, friends: [] };
    }

    const friends = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        friends.push({
          id: friendId,
          ...friendDoc.data()
        });
      }
    }

    return { success: true, friends };
  } catch (error) {
    console.error('Error getting friends list:', error);
    return { success: false, error: error.message, friends: [] };
  }
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
export const inviteFriendToGame = async (fromUserId, toUserId, fromDisplayName, toDisplayName) => {
  try {
    const roomId = nanoid(6).toUpperCase();

    await setDoc(doc(db, 'rooms', roomId), {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      playerX: fromUserId,
      playerO: toUserId,
      playerXName: fromDisplayName,
      playerOName: toDisplayName,
      status: 'waiting',
      winner: null,
      private: true,
      createdAt: Date.now(),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      inviteType: 'friend'
    });

    // Create notification for friend
    await setDoc(doc(db, 'game_invites', nanoid(12)), {
      roomId,
      from: fromUserId,
      to: toUserId,
      fromDisplayName,
      toDisplayName,
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
      collection(db, 'game_invites'),
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
    const inviteDoc = await getDoc(doc(db, 'game_invites', inviteId));
    if (!inviteDoc.exists()) {
      return { success: false, error: 'Invite not found' };
    }

    const invite = inviteDoc.data();

    // Update room status
    await updateDoc(doc(db, 'rooms', invite.roomId), {
      status: 'playing'
    });

    // Delete invite
    await deleteDoc(doc(db, 'game_invites', inviteId));

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
    await deleteDoc(doc(db, 'rooms', roomId));
    await deleteDoc(doc(db, 'game_invites', inviteId));
    return { success: true };
  } catch (error) {
    console.error('Error declining game invite:', error);
    return { success: false, error: error.message };
  }
};
