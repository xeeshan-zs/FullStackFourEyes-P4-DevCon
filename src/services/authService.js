import { auth } from './firebase';
import {
    signInWithEmailAndPassword,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error signing in:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign in anonymously (for quick demo)
 */
export const signInAnonymously = async () => {
    try {
        const userCredential = await firebaseSignInAnonymously(auth);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error signing in anonymously:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
