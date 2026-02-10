import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Violation Types with PKR Fine Amounts
 */
export const VIOLATION_TYPES = {
    overstay: {
        label: 'Overstay',
        description: 'Parked beyond paid/allowed time',
        fine: 500,
        icon: '⏰',
        severity: 'medium'
    },
    no_permit: {
        label: 'No Permit',
        description: 'Parked in restricted zone without permit',
        fine: 1000,
        icon: '🚫',
        severity: 'high'
    },
    disabled_misuse: {
        label: 'Disabled Spot Misuse',
        description: 'Non-disabled vehicle in disabled parking',
        fine: 2000,
        icon: '♿',
        severity: 'critical'
    },
    fire_lane: {
        label: 'Fire Lane Violation',
        description: 'Parked in fire lane / no-parking zone',
        fine: 3000,
        icon: '🔥',
        severity: 'critical'
    },
    payment_evasion: {
        label: 'Payment Evasion',
        description: 'Left without paying parking fee',
        fine: 1500,
        icon: '💸',
        severity: 'high'
    },
    double_parking: {
        label: 'Double Parking',
        description: 'Blocking another vehicle or lane',
        fine: 800,
        icon: '🚗',
        severity: 'medium'
    },
    no_reservation: {
        label: 'No Reservation',
        description: 'No active reservation found for this plate',
        fine: 500,
        icon: '📋',
        severity: 'low'
    }
};

/**
 * Issue a parking ticket / e-challan
 */
export const issueTicket = async (ticketData) => {
    try {
        const violationType = VIOLATION_TYPES[ticketData.violationType] || VIOLATION_TYPES.no_reservation;

        const docRef = await addDoc(collection(db, 'tickets'), {
            licensePlate: ticketData.licensePlate?.toUpperCase() || 'UNKNOWN',
            violationType: ticketData.violationType,
            violationLabel: violationType.label,
            severity: violationType.severity,
            location: ticketData.location || 'Unknown',
            coordinates: ticketData.coordinates || null,
            notes: ticketData.notes || '',
            photoEvidence: ticketData.photoEvidence || null,
            issuedBy: ticketData.issuedBy,
            officerEmail: ticketData.officerEmail || '',
            officerName: ticketData.officerName || 'Officer',
            amount: ticketData.amount || violationType.fine,
            currency: 'PKR',
            status: 'pending', // pending, paid, disputed, resolved
            issuedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
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

/**
 * Get recent tickets (latest N)
 */
export const getRecentTickets = async (limitCount = 10) => {
    try {
        const q = query(
            collection(db, 'tickets'),
            orderBy('issuedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching recent tickets:', error);
        return [];
    }
};

/**
 * Update ticket status (paid, disputed, resolved)
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
    try {
        const ticketRef = doc(db, 'tickets', ticketId);
        await updateDoc(ticketRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating ticket:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get violation statistics (aggregated from tickets)
 */
export const getViolationStats = async (officerId = null) => {
    try {
        let q;
        if (officerId) {
            q = query(collection(db, 'tickets'), where('issuedBy', '==', officerId));
        } else {
            q = query(collection(db, 'tickets'));
        }

        const querySnapshot = await getDocs(q);
        const tickets = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Aggregate stats
        const stats = {
            totalTickets: tickets.length,
            totalFines: tickets.reduce((sum, t) => sum + (t.amount || 0), 0),
            pendingCount: tickets.filter(t => t.status === 'pending').length,
            paidCount: tickets.filter(t => t.status === 'paid').length,
            disputedCount: tickets.filter(t => t.status === 'disputed').length,
            byType: {},
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 }
        };

        tickets.forEach(t => {
            // By violation type
            const type = t.violationType || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // By severity
            const sev = t.severity || 'low';
            if (stats.bySeverity[sev] !== undefined) {
                stats.bySeverity[sev]++;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error computing violation stats:', error);
        return {
            totalTickets: 0,
            totalFines: 0,
            pendingCount: 0,
            paidCount: 0,
            disputedCount: 0,
            byType: {},
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 }
        };
    }
};
