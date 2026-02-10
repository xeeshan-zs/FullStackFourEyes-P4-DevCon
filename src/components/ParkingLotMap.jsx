import { useState } from 'react';

/**
 * Interactive SVG Floor Plan for Parking Facility
 */
const ParkingLotMap = ({ spots, onSpotClick }) => {
    // Defines the layout of the parking lot
    // We'll organize spots into two rows with a driving lane in the middle
    const spotWidth = 60;
    const spotHeight = 100;
    const gap = 10;
    const laneHeight = 120;

    const getFillColor = (status, type) => {
        if (status === 'OUT_OF_SERVICE') return '#9CA3AF'; // Gray
        if (status === 'OCCUPIED') return '#EF4444'; // Red
        // Available
        if (type === 'DISABLED') return '#3B82F6'; // Blue
        if (type === 'EV') return '#10B981'; // Green
        return '#22C55E'; // Green
    };

    return (
        <div className="w-full overflow-x-auto bg-gray-900 rounded-xl p-8 border border-white/10 shadow-inner">
            <svg
                width={Math.max(800, spots.length * 40)}
                height={350}
                viewBox={`0 0 ${Math.max(800, spots.length * 40)} 350`}
                className="mx-auto"
            >
                {/* Background / Pavement */}
                <rect x="0" y="0" width="100%" height="100%" fill="#1F2937" rx="20" />

                {/* Driving Lane Markings */}
                <line
                    x1="20"
                    y1="175"
                    x2="98%"
                    y2="175"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="10, 10"
                />

                {/* Render Spots */}
                {spots.map((spot, index) => {
                    // split into two rows
                    const row = index % 2; // 0 = top, 1 = bottom
                    const col = Math.floor(index / 2);

                    const x = 50 + col * (spotWidth + gap);
                    const y = row === 0 ? 20 : 20 + spotHeight + laneHeight;

                    const isOccupied = spot.status === 'OCCUPIED';

                    return (
                        <g
                            key={spot.id}
                            onClick={() => onSpotClick(spot.id)}
                            style={{ cursor: spot.status === 'OUT_OF_SERVICE' ? 'not-allowed' : 'pointer' }}
                            className="transition-opacity hover:opacity-80"
                        >
                            {/* Parking Spot Box */}
                            <rect
                                x={x}
                                y={y}
                                width={spotWidth}
                                height={spotHeight}
                                fill={getFillColor(spot.status, spot.type)}
                                stroke="white"
                                strokeWidth="2"
                                rx="4"
                                opacity={isOccupied ? 0.6 : 1}
                            />

                            {/* Spot Number */}
                            <text
                                x={x + spotWidth / 2}
                                y={y + (row === 0 ? 25 : spotHeight - 15)}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                            >
                                {spot.id}
                            </text>

                            {/* Type Icon (Simple text for now) */}
                            {spot.type !== 'STANDARD' && (
                                <text
                                    x={x + spotWidth / 2}
                                    y={y + spotHeight / 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="10"
                                    opacity="0.8"
                                >
                                    {spot.type === 'EV' ? '⚡' : '♿'}
                                </text>
                            )}

                            {/* Car representation if occupied */}
                            {isOccupied && (
                                <path
                                    d={`M${x + 10} ${y + 20} h${spotWidth - 20} v${spotHeight - 40} h-${spotWidth - 20} z`}
                                    fill="white"
                                    opacity="0.2"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-xs text-white/70">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Standard</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div> Disabled</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded"></div> EV Charging</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Occupied</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-500 rounded"></div> Maintenance</span>
            </div>
        </div>
    );
};

export default ParkingLotMap;
