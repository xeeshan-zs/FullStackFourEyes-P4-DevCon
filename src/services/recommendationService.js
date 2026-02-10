/**
 * Simple heuristics-based AI for parking recommendations
 * Scores facilities based on user preferences and current context
 */

export const getRecommendedSpots = (facilities, userLocation, preferences = {}) => {
    if (!facilities || facilities.length === 0) return [];

    const scoredFacilities = facilities.map(facility => {
        let score = 0;
        let badges = [];

        // 1. Price Score (Lower is better)
        // Normalized: 0 to 10 points
        const price = facility.price || facility.pricePerHour || 10;
        if (price < 30) {
            score += 10;
            badges.push('Best Value');
        } else if (price < 50) {
            score += 5;
        }

        // 2. Availability Score (Higher is better)
        // Normalized: 0 to 10 points
        const capacity = facility.capacity || 100;
        const occupied = facility.occupied || 0;
        const utilization = occupied / capacity;

        if (utilization < 0.3) {
            score += 8;
            badges.push('Plenty of Space');
        } else if (utilization < 0.7) {
            score += 5;
        } else if (utilization > 0.9) {
            score -= 10; // Penalty for being nearly full
        }

        // 3. Distance Score (if user location exists)
        // Normalized: 0 to 15 points
        if (userLocation && facility.location) {
            const dist = calculateDistance(
                userLocation[0], userLocation[1],
                facility.location.lat, facility.location.lng
            );

            if (dist < 1) { // Less than 1km
                score += 15;
                badges.push('Closest');
            } else if (dist < 3) {
                score += 8;
            } else if (dist < 5) {
                score += 3;
            }
        }

        // 4. Rating Score
        if (facility.rating >= 4.5) {
            score += 5;
            badges.push('Top Rated');
        }

        return {
            ...facility,
            aiScore: score,
            aiBadges: badges,
            isRecommended: score > 20 // Threshold for recommendation
        };
    });

    // Sort by score descending
    return scoredFacilities.sort((a, b) => b.aiScore - a.aiScore);
};

// Helper: Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
