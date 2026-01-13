// Authentication manager for Firebase Auth
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

// Guest ID storage key
const GUEST_ID_KEY = 'tictacthree_guest_id';

// Get or create guest ID
export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${nanoid(12)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

// Check if user is guest
export const isGuest = (user) => {
  return !user || user.isAnonymous || user.uid.startsWith('guest_');
};

// Get current user ID (authenticated or guest)
export const getCurrentUserId = (user) => {
  return user && !user.isAnonymous ? user.uid : getGuestId();
};

// Sign up new user
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      createdAt: Date.now(),
      coins: 0,
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in existing user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Failed to sign in';
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    return { success: false, error: errorMessage };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sync guest data to authenticated user
export const syncGuestDataToUser = async (user, guestCoins, guestStats) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Merge guest stats with existing user stats
      const currentData = userDoc.data();
      await updateDoc(userRef, {
        coins: (currentData.coins || 0) + guestCoins,
        totalGames: (currentData.totalGames || 0) + guestStats.totalGames,
        wins: (currentData.wins || 0) + guestStats.wins,
        losses: (currentData.losses || 0) + guestStats.losses,
        draws: (currentData.draws || 0) + guestStats.draws
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing guest data:', error);
    return { success: false, error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user coins in Firestore
export const updateUserCoins = async (userId, coins) => {
  try {
    await updateDoc(doc(db, 'users', userId), { coins });
    return { success: true };
  } catch (error) {
    console.error('Error updating user coins:', error);
    return { success: false, error: error.message };
  }
};

// Update user stats in Firestore
export const updateUserStats = async (userId, stats) => {
  try {
    await updateDoc(doc(db, 'users', userId), stats);
    return { success: true };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
