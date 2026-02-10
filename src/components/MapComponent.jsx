import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { getParkingFacilities } from '../services/parkingService';
import L from 'leaflet';
import ParkingSpotDrawer from './ParkingSpotDrawer';

// Custom User Location Icon
const userLocationIcon = new L.DivIcon({
    className: 'user-location-marker',
    html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
    </div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

// Custom Parking Spot Icon Generator
const createParkingIcon = (available, status) => {
    let colorClass = 'bg-green-500';
    if (status === 'FULL' || available === 0) colorClass = 'bg-red-500';
    else if (available < 20) colorClass = 'bg-orange-500';

    return new L.DivIcon({
        className: 'custom-parking-icon',
        html: `
      <div class="relative group">
        <div class="${colorClass} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs transform transition-transform group-hover:scale-110">
          ${available}
        </div>
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
      </div>
    `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
};

function MapComponent({ facilities: propFacilities, onSelectFacility }) {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const centerPositions = [33.6844, 73.0479]; // Islamabad, Pakistan

    // State for selected facility (drawer) - internal state if no prop handler
    const [internalSelected, setInternalSelected] = useState(null);

    useEffect(() => {
        const fetchFacilities = async () => {
            // If facilities are passed as props, use them
            if (propFacilities) {
                setFacilities(propFacilities);
                setLoading(false);

                // Smart Zoom: If only 1 result stays after filtering, fly to it
                if (propFacilities.length === 1 && map && propFacilities[0].location) {
                    map.flyTo([propFacilities[0].location.lat, propFacilities[0].location.lng], 16, {
                        duration: 1.5
                    });
                }
            } else {
                // Otherwise fetch from service
                const data = await getParkingFacilities();
                setFacilities(data);
                setLoading(false);
            }
        };

        fetchFacilities();
    }, [propFacilities, map]);

    // Handle marker click
    const handleMarkerClick = (facility) => {
        if (onSelectFacility) {
            // If external handler provided, use it
            onSelectFacility(facility);
        } else {
            // Otherwise use internal state
            setInternalSelected(facility);
        }
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    if (map) {
                        map.flyTo([latitude, longitude], 14, {
                            duration: 2
                        });
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Unable to get your location. Please enable location services.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const [showTraffic, setShowTraffic] = useState(false);

    // Mock Traffic Data (Simulated roads around center)
    const trafficRoads = [
        { positions: [[33.6844, 73.0479], [33.6850, 73.0490], [33.6860, 73.0500]], color: '#ef4444' }, // Red (Congested)
        { positions: [[33.6800, 73.0400], [33.6810, 73.0410], [33.6820, 73.0420]], color: '#22c55e' }, // Green (Clear)
        { positions: [[33.6900, 73.0550], [33.6890, 73.0540], [33.6880, 73.0530]], color: '#f59e0b' }  // Orange (Moderate)
    ];

    return (
        <>
            <div className="h-full w-full rounded-3xl overflow-hidden glass shadow-xl border border-white/20 relative">
                {loading ? (
                    <div className="h-full flex items-center justify-center bg-white/10 backdrop-blur">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <>
                        <MapContainer
                            center={centerPositions}
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                            zoomControl={false}
                            ref={setMap}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Traffic Flow Overlay */}
                            {showTraffic && trafficRoads.map((road, i) => (
                                <Polyline
                                    key={i}
                                    positions={road.positions}
                                    pathOptions={{ color: road.color, weight: 6, opacity: 0.7 }}
                                />
                            ))}

                            {facilities.map((facility) => {
                                const available = facility.capacity ? facility.capacity - (facility.occupied || 0) : (facility.totalSpots - facility.availableSpots);
                                // Fallback logic if data structure varies
                                const count = facility.availableSpots !== undefined ? facility.availableSpots : available;

                                return (
                                    <Marker
                                        key={facility.id}
                                        position={facility.location ? [facility.location.lat, facility.location.lng] : centerPositions}
                                        icon={createParkingIcon(count, facility.status)}
                                        eventHandlers={{
                                            click: () => handleMarkerClick(facility),
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <h3 className="font-bold">{facility.name}</h3>
                                                <p className="text-sm">{count} spots available</p>
                                                <p className="text-sm font-bold text-white">PKR {facility.price || facility.pricePerHour}/hr</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* User location marker */}
                            {userLocation && (
                                <Marker
                                    position={userLocation}
                                    icon={userLocationIcon}
                                >
                                    <Popup>You are here</Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {/* Controls */}
                        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                            <button
                                onClick={() => setShowTraffic(!showTraffic)}
                                className={`p-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center ${showTraffic ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}
                                title="Toggle Traffic Layer"
                            >
                                <Activity size={20} />
                            </button>

                            <button
                                onClick={handleLocateMe}
                                className="p-3 bg-white text-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
                                title="Locate Me"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Drawer Integration (only if using internal state) */}
            {!onSelectFacility && internalSelected && (
                <ParkingSpotDrawer
                    facility={internalSelected}
                    onClose={() => setInternalSelected(null)}
                    onReserve={(facility) => {
                        alert(`Reservation for ${facility.name} starting... (Module 4)`);
                        setInternalSelected(null);
                    }}
                />
            )}
        </>
    );
}

export default MapComponent;
