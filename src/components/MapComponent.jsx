import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { getParkingFacilities } from '../services/parkingService';
import L from 'leaflet';
import ParkingSpotDrawer from './ParkingSpotDrawer';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons based on availability
const greenIcon = new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="marker-pulse relative">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" style="width: 25px; height: 41px;">
         </div>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const orangeIcon = new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="marker-pulse relative">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" style="width: 25px; height: 41px;">
         </div>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

function MapComponent({ facilities: propFacilities, onSelectFacility }) {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const centerPositions = [33.6844, 73.0479]; // Islamabad, Pakistan

    // State for selected facility (drawer) - internal state if no prop handler
    const [internalSelected, setInternalSelected] = useState(null);

    useEffect(() => {
        if (propFacilities) {
            setFacilities(propFacilities);
            setLoading(false);
        } else {
            const fetchFacilities = async () => {
                try {
                    const data = await getParkingFacilities();
                    setFacilities(data);
                } catch (error) {
                    console.error("Failed to fetch parking data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchFacilities();
        }
    }, [propFacilities]);

    const handleMarkerClick = (facility) => {
        if (onSelectFacility) {
            onSelectFacility(facility);
        } else {
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

    const getMarkerIcon = (facility) => {
        if (facility.status === 'FULL' || facility.availableSpots === 0 || facility.occupied >= facility.capacity) return redIcon;
        const available = facility.capacity - (facility.occupied || 0);
        if (available < 20) return orangeIcon;
        return greenIcon;
    };

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
                            zoomControl={true}
                            ref={setMap}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {facilities.map((facility) => (
                                <Marker
                                    key={facility.id}
                                    position={facility.location ? [facility.location.lat, facility.location.lng] : centerPositions}
                                    icon={getMarkerIcon(facility)}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(facility),
                                    }}
                                />
                            ))}

                            {/* User location marker */}
                            {userLocation && (
                                <Marker
                                    position={userLocation}
                                    icon={new L.Icon({
                                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                                        shadowUrl: iconShadow,
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                    })}
                                >
                                    <Popup>Your Location</Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {/* Locate Me Button */}
                        <button
                            onClick={handleLocateMe}
                            className="absolute top-4 right-4 z-[500] p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            title="Locate Me"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </>
                )}
            </MapContainer>
                )}
        </div >

            {/* Drawer Integration (only if using internal state) */ }
    {
        !onSelectFacility && internalSelected && (
            <ParkingSpotDrawer
                facility={internalSelected}
                onClose={() => setInternalSelected(null)}
                onReserve={(facility) => {
                    alert(`Reservation for ${facility.name} starting... (Module 4)`);
                    setInternalSelected(null);
                }}
            />
        )
    }
        </>
    );
}

export default MapComponent;
