import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, LogOut, List, Map as MapIcon, Sparkles } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import MapComponent from '../components/MapComponent';
import SearchFilters from '../components/SearchFilters';
import ParkingList from '../components/ParkingList';
import ReservationModal from '../components/ReservationModal';
import { parkingFacilities } from '../data/mockData';
import { createReservation } from '../services/reservationService';
import { getRecommendedSpots } from '../services/recommendationService';
import styles from './DriverDashboard.module.css';

function DriverDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useUser();
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);

    // Initialize with AI recommendations
    useEffect(() => {
        // In a real app, get user location first
        const recommended = getRecommendedSpots(parkingFacilities, null);
        setFilteredFacilities(recommended);
    }, []);

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        filterFacilities(query, null);
    };

    const handleFilterChange = (filters) => {
        filterFacilities(searchQuery, filters);
    };

    const filterFacilities = (query, filters) => {
        let results = [...parkingFacilities];

        // Search filter
        if (query && query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            results = results.filter(f =>
                f.name.toLowerCase().includes(lowerQuery) ||
                (f.address && f.address.toLowerCase().includes(lowerQuery))
            );
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

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoGroup}>
                        <div className={styles.logoBox}>
                            <Car className={styles.logoIcon} />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Find Parking</h1>
                            <p className="flex items-center gap-1">
                                <Sparkles size={12} className="text-yellow-400" />
                                AI-Powered Recommendations
                            </p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <div className="flex bg-white/10 rounded-lg p-1 mr-4">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                            >
                                <MapIcon size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <LogOut />
                            <span className={styles.logoutText}>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <SearchFilters
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                />
            </div>

            {/* Main Content Area */}
            <div className={styles.mapArea}>
                {viewMode === 'map' ? (
                    <MapComponent
                        facilities={filteredFacilities}
                        onSelectFacility={handleReserve}
                    />
                ) : (
                    <div className="max-w-4xl mx-auto pb-20">
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
        </div>
    );
}

export default DriverDashboard;
