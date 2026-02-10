import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Get user role from Firestore
 */
export const getUserRole = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().role;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
};

/**
 * Set user role in Firestore
 */
export const setUserRole = async (uid, role) => {
    try {
        await setDoc(doc(db, 'users', uid), { uid, role }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error setting user role:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, role = 'driver') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save role to Firestore
        await setUserRole(userCredential.user.uid, role);
        return { success: true, user: userCredential.user, role };
    } catch (error) {
        console.error('Error signing up:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Fetch role from Firestore
        const role = await getUserRole(userCredential.user.uid);
        return { success: true, user: userCredential.user, role: role || 'driver' }; // Default to driver if no role found
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
