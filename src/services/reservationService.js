import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

/**
 * Create a new parking reservation
 */
export const createReservation = async (reservationData) => {
    try {
        // 1. Create the reservation record
        const docRef = await addDoc(collection(db, 'reservations'), {
            ...reservationData,
            createdAt: serverTimestamp(),
            status: 'confirmed'
        });

        // 2. Update the facility occupancy in parkingSpots collection
        if (reservationData.facilityId) {
            const facilityRef = doc(db, 'parkingSpots', reservationData.facilityId);
            await updateDoc(facilityRef, {
                availableSpots: increment(-1),
                occupied: increment(1)
            });
        }

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
