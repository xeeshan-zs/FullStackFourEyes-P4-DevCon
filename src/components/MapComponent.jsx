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
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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

function MapComponent() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const centerPositions = [40.7128, -74.0060]; // NYC Center for demo

    // State for selected facility (drawer)
    const [selectedFacility, setSelectedFacility] = useState(null);

    useEffect(() => {
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
    }, []);

    const getMarkerIcon = (facility) => {
        if (facility.status === 'FULL' || facility.availableSpots === 0) return redIcon;
        if (facility.availableSpots < 20) return orangeIcon;
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
                    <MapContainer
                        center={centerPositions}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {facilities.map((facility) => (
                            <Marker
                                key={facility.id}
                                position={[facility.location.lat, facility.location.lng]}
                                icon={getMarkerIcon(facility)}
                                eventHandlers={{
                                    click: () => setSelectedFacility(facility),
                                }}
                            />
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Drawer Integration */}
            {selectedFacility && (
                <ParkingSpotDrawer
                    facility={selectedFacility}
                    onClose={() => setSelectedFacility(null)}
                    onReserve={(facility) => {
                        alert(`Reservation for ${facility.name} starting... (Module 4)`);
                        setSelectedFacility(null);
                    }}
                />
            )}
        </>
    );
}

export default MapComponent;
