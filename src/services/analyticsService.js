import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Get city-wide parking analytics
 */
export const getCityAnalytics = async () => {
    try {
        // Get all parking spots
        const spotsSnapshot = await getDocs(collection(db, 'parkingSpots'));
        const spots = spotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get all reservations
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const reservations = reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get all tickets
        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate metrics
        const totalSpots = spots.reduce((sum, spot) => sum + (spot.capacity || 0), 0);
        const occupiedSpots = reservations.filter(r => r.status === 'confirmed').length;
        const occupancyRate = totalSpots > 0 ? (occupiedSpots / totalSpots) * 100 : 0;

        const totalRevenue = reservations
            .filter(r => r.status === 'confirmed')
            .reduce((sum, r) => sum + (r.totalCost || 0), 0);

        const totalTickets = tickets.length;
        const pendingTickets = tickets.filter(t => t.status === 'pending').length;
        const paidTickets = tickets.filter(t => t.status === 'paid').length;

        return {
            totalSpots,
            occupiedSpots,
            occupancyRate: occupancyRate.toFixed(1),
            totalRevenue: totalRevenue.toFixed(2),
            totalTickets,
            pendingTickets,
            paidTickets,
            facilities: spots.length
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
            totalSpots: 0,
            occupiedSpots: 0,
            occupancyRate: 0,
            totalRevenue: 0,
            totalTickets: 0,
            pendingTickets: 0,
            paidTickets: 0,
            facilities: 0
        };
    }
};

/**
 * Get hourly occupancy data for charts
 */
export const getOccupancyTrends = async () => {
    try {
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const reservations = reservationsSnapshot.docs.map(doc => doc.data());

        // Group by hour
        const hourlyData = Array.from({ length: 24 }, (_, hour) => {
            const hourReservations = reservations.filter(r => {
                const resHour = parseInt(r.time?.split(':')[0] || 0);
                return resHour === hour;
            });

            return {
                hour: `${hour}:00`,
                occupancy: hourReservations.length,
                revenue: hourReservations.reduce((sum, r) => sum + (r.totalCost || 0), 0)
            };
        });

        return hourlyData;
    } catch (error) {
        console.error('Error fetching occupancy trends:', error);
        return [];
    }
};

/**
 * Get revenue breakdown by facility
 */
export const getRevenueByFacility = async () => {
    try {
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const reservations = reservationsSnapshot.docs.map(doc => doc.data());

        // Group by facility
        const facilityRevenue = {};
        reservations.forEach(r => {
            const name = r.facilityName || 'Unknown';
            if (!facilityRevenue[name]) {
                facilityRevenue[name] = 0;
            }
            facilityRevenue[name] += r.totalCost || 0;
        });

        return Object.entries(facilityRevenue)
            .map(([name, revenue]) => ({
                name,
                revenue: parseFloat(revenue.toFixed(2))
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10); // Top 10 facilities
    } catch (error) {
        console.error('Error fetching facility revenue:', error);
        return [];
    }
};

/**
 * Get violation statistics
 */
export const getViolationStats = async () => {
    try {
        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const tickets = ticketsSnapshot.docs.map(doc => doc.data());

        const violationTypes = {};
        tickets.forEach(t => {
            const type = t.violationType || 'Other';
            if (!violationTypes[type]) {
                violationTypes[type] = 0;
            }
            violationTypes[type]++;
        });

        return Object.entries(violationTypes).map(([name, count]) => ({
            name,
            count
        }));
    } catch (error) {
        console.error('Error fetching violation stats:', error);
        return [];
    }
};
