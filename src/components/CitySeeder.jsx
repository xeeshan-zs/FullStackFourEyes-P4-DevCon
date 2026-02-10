import { useState } from 'react';
import { db } from '../services/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';

const TWIN_CITIES_DATA = [
    // ISLAMABAD
    {
        name: "Centaurus Mall Parking",
        type: "garage",
        location: { lat: 33.7077, lng: 73.0501 },
        address: "Jinnah Avenue, F-8, Islamabad",
        capacity: 1500,
        occupied: 850,
        price: 50, // PKR
        amenities: ["Covered", "Security", "Valet", "Disabled Access"],
        rating: 4.5
    },
    {
        name: "F-7 Markaz Public Parking",
        type: "lot",
        location: { lat: 33.7215, lng: 73.0560 },
        address: "F-7 Markaz, Islamabad",
        capacity: 300,
        occupied: 280,
        price: 30,
        amenities: ["Nearby ATMs"],
        rating: 3.8
    },
    {
        name: "Blue Area East Parking",
        type: "street",
        location: { lat: 33.7126, lng: 73.0645 },
        address: "Fazl-e-Haq Road, Blue Area, Islamabad",
        capacity: 120,
        occupied: 110,
        price: 20,
        amenities: [],
        rating: 3.2
    },
    {
        name: "Safa Gold Mall",
        type: "garage",
        location: { lat: 33.7226, lng: 73.0529 },
        address: "College Road, F-7, Islamabad",
        capacity: 400,
        occupied: 150,
        price: 40,
        amenities: ["Covered", "Security", "Valet"],
        rating: 4.2
    },
    {
        name: "F-10 Markaz Parking",
        type: "lot",
        location: { lat: 33.6943, lng: 73.0142 },
        address: "F-10 Markaz, Islamabad",
        capacity: 250,
        occupied: 200,
        price: 30,
        amenities: ["Nearby Food"],
        rating: 4.0
    },

    // RAWALPINDI
    {
        name: "Commercial Market Parking",
        type: "lot",
        location: { lat: 33.6397, lng: 73.0696 },
        address: "Commercial Market, Satellite Town, Rawalpindi",
        capacity: 350,
        occupied: 340,
        price: 30,
        amenities: [],
        rating: 3.5
    },
    {
        name: "Saddar Metro Station Parking",
        type: "lot",
        location: { lat: 33.5936, lng: 73.0543 },
        address: "Saddar, Rawalpindi",
        capacity: 600,
        occupied: 450,
        price: 20,
        amenities: ["Metro Access"],
        rating: 4.1
    },
    {
        name: "Giga Mall Parking",
        type: "garage",
        location: { lat: 33.5386, lng: 73.1554 },
        address: "GT Road, DHA Phase 2, Islamabad/Rawalpindi",
        capacity: 2000,
        occupied: 1200,
        price: 50,
        amenities: ["Covered", "Security", "EV Charging", "Valet"],
        rating: 4.7
    },
    {
        name: "Raja Bazaar Public Parking",
        type: "street",
        location: { lat: 33.6167, lng: 73.0601 },
        address: "Raja Bazaar, Rawalpindi",
        capacity: 100,
        occupied: 98,
        price: 20,
        amenities: [],
        rating: 2.5
    },
    {
        name: "Ayub Park Parking",
        type: "lot",
        location: { lat: 33.5786, lng: 73.0782 },
        address: "Jhelum Road, Rawalpindi",
        capacity: 500,
        occupied: 120,
        price: 50,
        amenities: ["Security"],
        rating: 4.3
    }
];

function CitySeeder() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [logs, setLogs] = useState([]);

    const seedLiveDatabase = async () => {
        setLoading(true);
        setLogs([]);
        setStatus(null);

        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, "parkingSpots");

            TWIN_CITIES_DATA.forEach((spot) => {
                const docRef = doc(collectionRef); // Generate new ID
                batch.set(docRef, {
                    ...spot,
                    status: spot.occupied >= spot.capacity ? 'FULL' : 'OPEN',
                    availableSpots: spot.capacity - spot.occupied,
                    createdAt: new Date().toISOString()
                });
                setLogs(prev => [...prev, `Queued: ${spot.name}`]);
            });

            await batch.commit();
            setStatus('success');
            setLogs(prev => [...prev, "✅ Batch commit successful!"]);
        } catch (error) {
            console.error("Seeding failed:", error);
            setStatus('error');
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-[9999] bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 transform translate-y-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-blue-600" size={20} />
                        Live Data: Twin Cities
                    </h3>
                    <p className="text-sm text-gray-500">
                        Seed Firestore with 10 real locations in Rawalpindi & Islamabad.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {status === 'success' && (
                        <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                            <Check size={16} /> Done
                        </span>
                    )}

                    {status === 'error' && (
                        <span className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                            <AlertCircle size={16} /> Failed
                        </span>
                    )}

                    <button
                        onClick={seedLiveDatabase}
                        disabled={loading || status === 'success'}
                        className={`
                            px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all
                            ${loading || status === 'success'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30'}
                        `}
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {status === 'success' ? 'Seeded' : 'Inject Real Data'}
                    </button>
                </div>
            </div>

            {/* Logs */}
            {logs.length > 0 && (
                <div className="max-w-4xl mx-auto mt-4 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 border border-gray-200">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CitySeeder;
