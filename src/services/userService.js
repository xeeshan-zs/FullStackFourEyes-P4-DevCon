import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'users';

/**
 * Get user profile data from Firestore
 */
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, COLLECTION_NAME, uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

/**
 * Initialize user profile in Firestore if it doesn't exist
 */
export const initializeUserProfile = async (uid, initialData = {}) => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const dataToSet = {
                uid,
                balance: 0,
                role: 'driver',
                createdAt: new Date().toISOString(),
                ...initialData
            };
            await setDoc(userRef, dataToSet);
            return { success: true, data: dataToSet };
        }
        return { success: true, data: userDoc.data() };
    } catch (error) {
        console.error('Error initializing user profile:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update wallet balance in Firestore
 */
export const updateWalletBalance = async (uid, newBalance) => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(userRef, {
            balance: newBalance,
            lastUpdated: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        return { success: false, error: error.message };
    }
};
