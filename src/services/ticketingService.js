import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

/**
 * Issue a parking ticket
 */
export const issueTicket = async (ticketData) => {
    try {
        const docRef = await addDoc(collection(db, 'tickets'), {
            ...ticketData,
            issuedAt: serverTimestamp(),
            status: 'pending', // pending, paid, disputed
            amount: ticketData.amount || 100 // Default fine: $100
        });

        return {
            success: true,
            ticketId: docRef.id
        };
    } catch (error) {
        console.error('Error issuing ticket:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Validate if a license plate has an active reservation
 */
export const validateLicensePlate = async (licensePlate) => {
    try {
        const now = new Date();

        // Query active reservations for this plate
        const q = query(
            collection(db, 'reservations'),
            where('licensePlate', '==', licensePlate.toUpperCase()),
            where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return {
                valid: false,
                reason: 'No active reservation found'
            };
        }

        // Check if any reservation is currently active
        for (const doc of querySnapshot.docs) {
            const reservation = doc.data();
            const startTime = new Date(reservation.date + ' ' + reservation.time);
            const endTime = new Date(startTime.getTime() + reservation.duration * 60 * 60 * 1000);

            if (now >= startTime && now <= endTime) {
                return {
                    valid: true,
                    reservation: {
                        id: doc.id,
                        ...reservation
                    }
                };
            }
        }

        return {
            valid: false,
            reason: 'Reservation expired or not yet started'
        };
    } catch (error) {
        console.error('Error validating plate:', error);
        return {
            valid: false,
            reason: 'Validation error: ' + error.message
        };
    }
};

/**
 * Get all tickets issued by an officer
 */
export const getOfficerTickets = async (officerId) => {
    try {
        const q = query(
            collection(db, 'tickets'),
            where('issuedBy', '==', officerId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
    }
};
