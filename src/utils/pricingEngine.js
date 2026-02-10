/**
 * Dynamic Pricing Engine
 * Calculates parking rates based on demand, time-of-day, and facility type
 */

// Base rates per hour by facility type
const BASE_RATES = {
    street: 2.0,
    garage: 4.0,
    lot: 3.0,
    reserved: 6.0
};

// Time-of-day multipliers
const TIME_MULTIPLIERS = {
    peak: 1.5,      // 8-10 AM, 5-7 PM
    normal: 1.0,    // 10 AM-5 PM
    offPeak: 0.7    // 7 PM-8 AM
};

// Demand multipliers based on occupancy
const DEMAND_MULTIPLIERS = {
    high: 1.8,      // >80% occupied
    medium: 1.2,    // 50-80% occupied
    low: 1.0        // <50% occupied
};

/**
 * Get time-of-day multiplier
 */
export const getTimeMultiplier = () => {
    const hour = new Date().getHours();

    if ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 19)) {
        return TIME_MULTIPLIERS.peak;
    } else if (hour >= 10 && hour < 17) {
        return TIME_MULTIPLIERS.normal;
    } else {
        return TIME_MULTIPLIERS.offPeak;
    }
};

/**
 * Get demand multiplier based on occupancy
 */
export const getDemandMultiplier = (occupied, total) => {
    const occupancyRate = occupied / total;

    if (occupancyRate > 0.8) {
        return DEMAND_MULTIPLIERS.high;
    } else if (occupancyRate > 0.5) {
        return DEMAND_MULTIPLIERS.medium;
    } else {
        return DEMAND_MULTIPLIERS.low;
    }
};

/**
 * Calculate dynamic price for a parking facility
 */
export const calculatePrice = (facility) => {
    const baseRate = facility.pricePerHour || facility.price || BASE_RATES[facility.type] || BASE_RATES.lot;
    const timeMultiplier = getTimeMultiplier();
    const demandMultiplier = getDemandMultiplier(
        facility.occupied || 0,
        facility.capacity || 1
    );

    const dynamicPrice = baseRate * timeMultiplier * demandMultiplier;

    return {
        hourly: parseFloat(dynamicPrice.toFixed(2)),
        base: baseRate,
        timeMultiplier,
        demandMultiplier,
        surge: demandMultiplier > 1.0
    };
};

/**
 * Calculate total cost for a reservation
 */
export const calculateReservationCost = (facility, hours) => {
    const pricing = calculatePrice(facility);
    const total = pricing.hourly * hours;

    return {
        hourly: pricing.hourly,
        hours,
        total: parseFloat(total.toFixed(2)),
        surge: pricing.surge
    };
};

/**
 * Get pricing tier label
 */
export const getPricingTier = (hourlyRate) => {
    if (hourlyRate < 3) return 'Budget';
    if (hourlyRate < 6) return 'Standard';
    return 'Premium';
};
