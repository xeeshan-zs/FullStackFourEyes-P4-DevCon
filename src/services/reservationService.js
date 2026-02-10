import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Create a new parking reservation
 */
export const createReservation = async (reservationData) => {
    try {
        const docRef = await addDoc(collection(db, 'reservations'), {
            ...reservationData,
            createdAt: serverTimestamp(),
            status: 'confirmed'
        });

        return {
            success: true,
            reservationId: docRef.id
        };
    } catch (error) {
        console.error('Error creating reservation:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get user's reservations
 */
export const getUserReservations = async (userId) => {
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, 'reservations'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            )
        );

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
};
