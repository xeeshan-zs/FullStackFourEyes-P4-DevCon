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
import VehicleOnboardingModal from '../components/VehicleOnboardingModal';
import { addVehicle, getUserProfile, initializeUserProfile } from '../services/userProfileService';
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
    const [walletBalance, setWalletBalance] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, type: 'visa', last4: '4242', exp: '12/25', isDefault: true },
        { id: 2, type: 'mastercard', last4: '8888', exp: '09/24', isDefault: false }
    ]);
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', exp: '', cvc: '', name: '' });
    const [loading, setLoading] = useState(true);
    const [showVehicleOnboarding, setShowVehicleOnboarding] = useState(false);
    const [userVehicles, setUserVehicles] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        maxPrice: 1000,
        maxDistance: 20,
        type: 'all',
        availability: 'all',
        amenities: []
    });

    // Check for vehicle onboarding on mount
    useEffect(() => {
        const checkOnboarding = async () => {
            if (user?.uid) {
                // Initialize profile if it doesn't exist
                await initializeUserProfile(user.uid, user.email, 'driver');

                // Get user profile
                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success && profileResult.data) {
                    const vehicles = profileResult.data.vehicles || [];
                    setUserVehicles(vehicles);

                    // Show onboarding if no vehicles
                    if (vehicles.length === 0) {
                        setShowVehicleOnboarding(true);
                    }
                }
            }
        };

        checkOnboarding();
    }, [user]);

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

    // Sync Wallet Balance from Firestore
    useEffect(() => {
        const syncBalance = async () => {
            if (user?.uid) {
                const profile = await initializeUserProfile(user.uid, user.email, 'driver');
                if (profile.success) {
                    setWalletBalance(profile.data.balance || 0);
                }
            }
        };

        syncBalance();
    }, [user]);

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
        // Strict financial check
        const totalCost = reservationData.totalCost || 0;

        if (walletBalance < totalCost) {
            alert(`Insufficient balance. You need PKR ${totalCost} but only have PKR ${walletBalance}.`);
            return;
        }

        const result = await createReservation({
            ...reservationData,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || 'guest@parkit.com'
        });

        if (result.success) {
            // Deduct from wallet balance locally and in database
            const newBalance = walletBalance - totalCost;
            setWalletBalance(newBalance);
            if (user?.uid) {
                await updateWalletBalance(user.uid, newBalance);
            }

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
                            <img src="/app-logo.png" alt="App Logo" className={styles.logoIcon} />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Driver Dashboard</h1>
                            <p>Real-time parking availability</p>
                        </div>
                    </div>

                    {/* Standardized Search Bar Relocation */}
                    <div className={styles.searchContainer}>
                        <SearchFilters
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggles */}
                        <div className="flex bg-white/10 rounded-lg p-1 mr-2 hidden md:flex">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                title="Map View"
                            >
                                <MapIcon size={18} className="text-white" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                                title="List View"
                            >
                                <List size={18} className="text-white" />
                            </button>
                        </div>

                        {/* Wallet Button */}
                        <button
                            onClick={() => setShowWallet(true)}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Wallet size={20} className="text-white" />
                            <span className="hidden md:inline font-bold text-white">PKR {walletBalance}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <LogOut size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mapArea}>

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
                    <div className="max-w-7xl mx-auto pb-20 pt-10 px-4 h-full overflow-y-auto custom-scrollbar">
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
                    walletBalance={walletBalance}
                />
            )}

            {/* Wallet Modal - Standardized OLED Theme */}
            {showWallet && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
                    <div className={`${styles.walletModal} bg-[#0B1120] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col`}>
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-br from-blue-600/20 to-transparent border-b border-white/5 relative">
                            <button
                                onClick={() => {
                                    setShowWallet(false);
                                    setShowAddCard(false);
                                }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 text-white mb-6">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Wallet size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold font-heading">My Wallet</h2>
                            </div>

                            <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs text-white/50 uppercase tracking-widest font-heading mb-1">Available Balance</p>
                                <p className="text-4xl font-bold text-white tabular-nums">PKR {walletBalance}</p>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {/* Quick Top Up */}
                            <section>
                                <h3 className="text-sm font-heading text-white/70 uppercase tracking-wider mb-4">Quick Top Up</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[500, 1000, 2000].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={async () => {
                                                const newBalance = walletBalance + amount;
                                                setWalletBalance(newBalance);
                                                if (user?.uid) {
                                                    await updateWalletBalance(user.uid, newBalance);
                                                }
                                            }}
                                            className="py-3 bg-white/5 border border-white/5 rounded-xl font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                                        >
                                            +{amount}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Payment Methods */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-heading text-white/70 uppercase tracking-wider">Payment Methods</h3>
                                    <button
                                        onClick={() => setShowAddCard(!showAddCard)}
                                        className="text-xs text-white/60 hover:text-white transition-colors font-bold"
                                    >
                                        {showAddCard ? 'Cancel' : '+ Add New'}
                                    </button>
                                </div>

                                {showAddCard ? (
                                    <div className="space-y-3 animate-slideDown">
                                        <input
                                            type="text"
                                            placeholder="Card Number"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500/50"
                                            value={newCard.number}
                                            onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500/50"
                                                value={newCard.exp}
                                                onChange={(e) => setNewCard({ ...newCard, exp: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVC"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500/50"
                                                value={newCard.cvc}
                                                onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const id = Date.now();
                                                setPaymentMethods([...paymentMethods, { id, type: 'visa', last4: newCard.number.slice(-4) || '0000', exp: newCard.exp || 'MM/YY', isDefault: false }]);
                                                setShowAddCard(false);
                                                setNewCard({ number: '', exp: '', cvc: '', name: '' });
                                            }}
                                            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all"
                                        >
                                            Save Card
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {paymentMethods.map(method => (
                                            <div
                                                key={method.id}
                                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        <CreditCard size={20} className="text-white/60" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white capitalize">{method.type} •••• {method.last4}</p>
                                                        <p className="text-xs text-white/40">Expires {method.exp}</p>
                                                    </div>
                                                </div>
                                                {method.isDefault && (
                                                    <span className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Default</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/2">
                            <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-white/90 transition-all active:scale-95">
                                Proceed to Top Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DriverDashboard;
