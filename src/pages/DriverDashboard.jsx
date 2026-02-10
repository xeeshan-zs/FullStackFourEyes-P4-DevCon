import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, ArrowRight, Wallet, X, CreditCard, LogOut, List, Map as MapIcon, Sparkles } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import MapComponent from '../components/MapComponent';
import SearchFilters from '../components/SearchFilters';
import ParkingList from '../components/ParkingList';
import ReservationModal from '../components/ReservationModal';
import { getParkingFacilities } from '../services/parkingService';
import { createReservation } from '../services/reservationService';
import { getRecommendedSpots } from '../services/recommendationService';
import styles from './DriverDashboard.module.css';

function DriverDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useUser();
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [facilities, setFacilities] = useState([]);
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [showWallet, setShowWallet] = useState(false);
    const [walletBalance, setWalletBalance] = useState(2500);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        maxPrice: 1000,
        maxDistance: 20,
        type: 'all',
        availability: 'all',
        amenities: []
    });

    // Fetch facilities and initialize with AI recommendations
    useEffect(() => {
        const fetchSpots = async () => {
            try {
                const data = await getParkingFacilities();
                setFacilities(data);
                // In a real app, get user location first
                const recommended = getRecommendedSpots(data, null);
                setFilteredFacilities(recommended);
            } catch (error) {
                console.error("Failed to load facilities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpots();
    }, []);

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        filterFacilities(query, activeFilters);
    };

    const handleFilterChange = (filters) => {
        setActiveFilters(filters);
        filterFacilities(searchQuery, filters);
    };

    const filterFacilities = (query, filters) => {
        let results = [...facilities];

        // 1. Search filter
        if (query && query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            results = results.filter(f =>
                (f.name && f.name.toLowerCase().includes(lowerQuery)) ||
                (f.address && f.address.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Apply Advanced Filters
        if (filters) {
            // Price Filter
            if (filters.maxPrice) {
                results = results.filter(f => (f.price || f.pricePerHour || 0) <= filters.maxPrice);
            }

            // Type Filter
            if (filters.type && filters.type !== 'all') {
                results = results.filter(f => f.type && f.type.toLowerCase() === filters.type.toLowerCase());
            }

            // Availability Filter
            if (filters.availability && filters.availability !== 'all') {
                if (filters.availability === 'available') {
                    results = results.filter(f => (f.availableSpots || 0) > 0 && f.status !== 'FULL');
                }
            }

            // Amenities Filter
            if (filters.amenities && filters.amenities.length > 0) {
                results = results.filter(f =>
                    f.amenities && filters.amenities.every(a => f.amenities.includes(a))
                );
            }
        }

        // Apply AI scoring to filtered results
        const scoredResults = getRecommendedSpots(results, null);
        setFilteredFacilities(scoredResults);
    };

    const handleReserve = (facility) => {
        setSelectedFacility(facility);
        setShowReservationModal(true);
    };

    const handleConfirmReservation = async (reservationData) => {
        const result = await createReservation({
            ...reservationData,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || 'guest@parkit.com'
        });

        if (result.success) {
            setShowReservationModal(false);
            setSelectedFacility(null);
            // Optional: Show success toast
        } else {
            alert('Reservation failed: ' + result.error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoGroup}>
                        <div className={styles.logoBox}>
                            <img src="/app-logo.png" alt="App Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Hello, Driver! 👋</h1>
                            <p>Find your perfect spot</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggles */}
                        <div className="flex bg-white/10 rounded-lg p-1 mr-2 hidden md:flex">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                title="Map View"
                            >
                                <MapIcon size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                title="List View"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Wallet Button */}
                        <button
                            onClick={() => setShowWallet(true)}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Wallet size={20} />
                            <span className="hidden md:inline font-bold">PKR {walletBalance}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mapArea}>
                {/* Search Overlay - Only show in map mode or always? Let's show always but positioned differently if needed */}
                <div className="absolute top-4 left-4 z-[400] w-full max-w-md px-4 pointer-events-none">
                    <div className="pointer-events-auto">
                        <SearchFilters
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <>
                        <MapComponent
                            facilities={filteredFacilities}
                            onSelectFacility={handleReserve}
                        />
                        {filteredFacilities.length === 0 && !loading && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-4 rounded-2xl flex flex-col items-center gap-2 z-[400] text-center">
                                <Search size={32} className="text-white/50" />
                                <p className="font-bold text-lg">No Parking Found</p>
                                <p className="text-sm text-white/70">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="max-w-4xl mx-auto pb-20 pt-24 px-4 h-full overflow-y-auto">
                        <ParkingList
                            facilities={filteredFacilities}
                            onSelectFacility={handleReserve}
                        />
                    </div>
                )}
            </div>

            {/* Reservation Modal */}
            {showReservationModal && selectedFacility && (
                <ReservationModal
                    facility={selectedFacility}
                    onClose={() => {
                        setShowReservationModal(false);
                        setSelectedFacility(null);
                    }}
                    onConfirm={handleConfirmReservation}
                />
            )}

            {/* Wallet Modal */}
            {showWallet && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                            <button
                                onClick={() => setShowWallet(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Wallet size={24} /> My Wallet
                            </h2>
                            <div className="mt-6 text-center">
                                <p className="text-sm opacity-80">Available Balance</p>
                                <p className="text-4xl font-bold mt-1">PKR {walletBalance}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Quick Top Up</h3>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[500, 1000, 2000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setWalletBalance(prev => prev + amount)}
                                        className="py-2 px-3 border-2 border-indigo-100 rounded-xl font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                                    >
                                        +{amount}
                                    </button>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DriverDashboard;
