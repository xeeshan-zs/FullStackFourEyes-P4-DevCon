/**
 * AI Service for Prediction & Analytics
 * Implements simple Linear Regression and Moving Average for client-side forecasting
 */

// Simple Linear Regression for short-term trend
export const predictDemand = (historicalData) => {
    // Expected format: [{ hour: 1, occupancy: 20 }, { hour: 2, occupancy: 25 }...]
    const n = historicalData.length;
    if (n === 0) return [];

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    historicalData.forEach((point, i) => {
        const x = i;
        const y = point.occupancy;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 24 hours
    const predictions = [];
    const lastHour = historicalData[n - 1].hour; // e.g., "14:00" -> 14

    for (let i = 1; i <= 24; i++) {
        const nextX = n - 1 + i;
        const predictedVal = Math.max(0, Math.round(slope * nextX + intercept)); // No negative occupancy

        // Add some "noise" and "time-of-day" seasonality overlay
        // Peak hours: 8-9am, 5-6pm. Low: 2-4am.
        // This makes the linear regression "smarter" by adding domain knowledge/heuristics
        const hourOfDay = (parseInt(lastHour) + i) % 24;
        let seasonalityFactor = 1.0;

        if ((hourOfDay >= 8 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 18)) {
            seasonalityFactor = 1.4; // Rush hour
        } else if (hourOfDay >= 2 && hourOfDay <= 5) {
            seasonalityFactor = 0.3; // Late night
        }

        predictions.push({
            hour: `${hourOfDay}:00`,
            predictedOccupancy: Math.round(predictedVal * seasonalityFactor)
        });
    }

    return predictions;
};

// Traffic Congestion Risk Score (0-100)
export const calculateTrafficRisk = (occupancyRate, weather = 'clear') => {
    let risk = occupancyRate * 0.8; // Base risk on parking scarcity

    // Weather impact
    if (weather === 'rain') risk += 10;
    if (weather === 'snow') risk += 20;

    // Cap at 100
    return Math.min(100, Math.round(risk));
};
