import { useState } from 'react';
import { Car, AlertCircle, CheckCircle, Ban } from 'lucide-react';

// Mock data for spots in a facility
const MOCK_SPOTS = Array.from({ length: 20 }, (_, i) => ({
    id: `A-${i + 1}`,
    status: Math.random() > 0.7 ? 'OCCUPIED' : Math.random() > 0.9 ? 'OUT_OF_SERVICE' : 'AVAILABLE',
    type: i < 2 ? 'DISABLED' : i < 5 ? 'EV' : 'STANDARD'
}));

import ParkingLotMap from './ParkingLotMap';

function SpotManager() {
    const [spots, setSpots] = useState(MOCK_SPOTS);
    const [filter, setFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('MAP'); // 'MAP' or 'GRID'

    const handleStatusToggle = (spotId) => {
        setSpots(spots.map(spot => {
            if (spot.id === spotId) {
                const newStatus = spot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
                return { ...spot, status: newStatus };
            }
            return spot;
        }));
    };

    // ... (helper functions remain same)

    const filteredSpots = filter === 'ALL'
        ? spots
        : spots.filter(spot => spot.status === filter);

    return (
        <div className="glass rounded-3xl p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Car className="w-6 h-6" />
                    Level 1 - Zone A
                </h2>

                <div className="flex gap-4">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-black/20 rounded-xl">
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'MAP' ? 'bg-white text-teal-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Map
                        </button>
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'GRID' ? 'bg-white text-teal-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Grid
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl">
                        {['ALL', 'AVAILABLE', 'OCCUPIED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-white text-teal-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'MAP' ? (
                <ParkingLotMap spots={filteredSpots} onSpotClick={handleStatusToggle} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredSpots.map(spot => (
                        <button
                            key={spot.id}
                            onClick={() => handleStatusToggle(spot.id)}
                            disabled={spot.status === 'OUT_OF_SERVICE'}
                            className={`
                  relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                  flex flex-col items-center justify-center gap-2 min-h-[100px] border shadow-lg group
                  ${getStatusColor(spot.status)}
                  ${spot.status === 'OUT_OF_SERVICE' ? 'opacity-50 cursor-not-allowed grayscale' : 'border-white/20 hover:shadow-xl hover:border-white/40'}
                `}
                        >
                            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                                {getStatusIcon(spot.status)}
                            </div>
                            <span className="font-bold text-lg drop-shadow-md">{spot.id}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 bg-black/10 px-2 py-0.5 rounded-full">
                                {spot.type}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-between items-center text-sm opacity-70 border-t border-white/10 pt-4">
                <div className="flex gap-4">
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div> Available
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div> Occupied
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div> Maintenance
                    </span>
                </div>
                <p>Click a spot to toggle status</p>
            </div>
        </div>
    );
}

export default SpotManager;
