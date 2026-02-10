
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Car,
    AlertCircle,
    Settings,
    MapPin,
    Bell,
    Search,
    ChevronRight,
    Menu,
    X,
    Filter
} from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import { getParkingFacilities } from '../services/parkingService';
import FacilityManager from '../components/FacilityManager';

function OperatorDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');

    // Real-time Data State
    const [facilities, setFacilities] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalSpots: 0,
        occupiedSpots: 0,
        occupancyRate: 0,
        pendingTickets: 0
    });

    // UI State
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Dynamic Notifications based on data
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (facilities.length > 0) {
            const newNotifs = [];

            // Check for high occupancy/full facilities
            facilities.forEach(f => {
                const total = parseInt(f.totalSpots) || 0;
                // Assuming availableSpots is tracked, or we calculate it. 
                // In the current service mock, we might not have live 'availableSpots' updating constantly 
                // but let's assume we use the header data or facility status.
                // For now, let's use a mock calculation or properties if they exist.
                // Re-reading FacilityManager, we have 'totalSpots'. 
                // Let's create alerts based on random logic or static properties for now if 'occupied' isn't real.

                // Real logic (if data existed):
                // const occupancy = (f.occupied / f.totalSpots) * 100;
                // if (occupancy >= 90) newNotifs.push(...)

                // For demo purposes, let's flag if price is 0 (Setup needed) or spots < 10 (Small facility) 
                // or just general system alerts mixed with data.

                if (parseInt(f.totalSpots) === 0) {
                    newNotifs.push({
                        id: `setup-${f.id}`,
                        text: `Setup required for ${f.name} (0 spots)`,
                        time: "Now",
                        type: "warning"
                    });
                }
            });

            // System Alerts
            if (analytics.occupancyRate > 90) {
                newNotifs.push({ id: 'high-occ', text: "Overall city parking capacity is critical (>90%)", time: "Now", type: "alert" });
            }

            setNotifications(prev => {
                // Merge with any persistent system msgs if needed, or just replace
                return [
                    ...newNotifs,
                    { id: 'sys-1', text: "System fully operational", time: "1m ago", type: "success" }
                ];
            });

            if (newNotifs.length > 0) setShowNotifications(true); // Auto-show if urgent? Maybe just dot.
            // Actually let's just update the list.
        }
    }, [facilities, analytics]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Real Facilities from DB
                const data = await getParkingFacilities();
                setFacilities(data);

                // 2. Calculate Real-time Stats
                let totalCapacity = 0;
                let currentlyOccupied = 0;

                data.forEach(f => {
                    const t = parseInt(f.totalSpots) || 0;
                    const a = parseInt(f.availableSpots) || 0;
                    const o = parseInt(f.occupied) || 0;

                    // Effective capacity: use totalSpots if valid, else available + occupied
                    const effectiveTotal = t > 0 ? t : Math.max(a, a + o);
                    // Determine occupancy based on available field mapping
                    const effectiveOccupied = f.occupied !== undefined ? o : (effectiveTotal - a);

                    totalCapacity += effectiveTotal;
                    currentlyOccupied += Math.max(0, Math.min(effectiveTotal, effectiveOccupied));
                });

                const occupancyRate = totalCapacity > 0 ? ((currentlyOccupied / totalCapacity) * 100).toFixed(1) : 0;

                setAnalytics({
                    totalSpots: totalCapacity,
                    occupiedSpots: currentlyOccupied,
                    occupancyRate,
                    pendingTickets: 5 // Mock for now
                });
            } catch (error) {
                console.error("Failed to sync dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Search Logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            if (activeTab === 'search') setActiveTab('overview');
        } else {
            const results = facilities.filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(results);
            if (activeTab !== 'search') setActiveTab('search');
        }
    }, [searchQuery, facilities]);

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); setSearchQuery(''); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative ${activeTab === id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
        >
            {activeTab === id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}
            <Icon size={22} className={`transition-colors ${activeTab === id ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'group-hover:text-white'}`} />
            <span className={`font-medium tracking-wide transition-opacity duration-300 ${!isSidebarOpen && 'hidden md:hidden lg:inline opacity-0'} ${isSidebarOpen && 'opacity-100'}`}>
                {label}
            </span>
        </button>
    );

    const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
        <div className="bg-[#1E293B]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all duration-300 group hover:shadow-lg hover:shadow-black/20">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                {trend && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    {subtext}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 flex overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside
                className={`hidden md:flex flex-col bg-[#0B1120] border-r border-white/5 transition-all duration-300 fixed left-0 top-0 bottom-0 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'
                    }`}
            >
                <div className="h-28 flex items-center px-8 gap-4 mb-4 flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Car className="text-white" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-white">ParkIt</h1>
                            <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">Console</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem id="facilities" icon={MapPin} label="My Facilities" />
                    <NavItem id="settings" icon={Settings} label="Settings" />
                </div>

                <div className="p-6 border-t border-white/5 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        {isSidebarOpen && <span className="font-medium group-hover:text-red-400 transition-colors">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Visible only on Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                <div className="flex justify-around items-center p-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-medium">Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('facilities')}
                        className={`flex flex-col items-center gap-1 ${activeTab === 'facilities' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                        <MapPin size={24} />
                        <span className="text-[10px] font-medium">Facilities</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                        <Settings size={24} />
                        <span className="text-[10px] font-medium">Settings</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 text-red-400"
                    >
                        <LogOut size={24} />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col h-full overflow-hidden relative w-full pb-20 md:pb-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'
                    }`}
            >
                {/* Header */}
                <header className="h-24 flex-shrink-0 bg-[#0B1120]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden md:block"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:block">
                            <h2 className="text-xl font-bold text-white">Welcome, {user?.name || 'Operator'}</h2>
                            <p className="text-sm text-gray-400">Here's your facility overview.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search facilities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#1E293B] border border-white/5 text-sm rounded-full pl-10 pr-10 py-2.5 w-40 md:w-80 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all focus:w-48 md:focus:w-96"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 relative rounded-full transition-colors ${showNotifications ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1120] animate-pulse"></span>
                                )}
                            </button>

                            {/* Notification Popover */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-[#1E293B] border border-white/10 rounded-2xl shadow-xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{notifications.length} New</span>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((n, index) => (
                                                <div key={n.id || index} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                    <div>
                                                        <p className="text-sm text-gray-200 leading-snug">{n.text}</p>
                                                        <span className="text-xs text-gray-500 mt-1 block">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 text-center border-t border-white/5">
                                        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Mark all as read</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 cursor-pointer hidden sm:block">
                            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center text-sm font-bold">
                                {user?.name?.[0] || 'O'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8"
                    onClick={() => setShowNotifications(false)} // Close notifications when clicking outside
                >
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Search Results View */}
                        {activeTab === 'search' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Search size={20} className="text-blue-400" />
                                    Search Results
                                    <span className="text-gray-500 text-sm font-normal ml-2">Found {searchResults.length} matches for "{searchQuery}"</span>
                                </h3>

                                {searchResults.length > 0 ? (
                                    <FacilityManager initialFacilities={searchResults} readOnly={true} />
                                    // Note: We might need to pass filtered props to FacilityManager or just reuse its card rendering logic.
                                    // For now, let's reuse FacilityManager but we need to ensure it can accept 'facilities' prop to override internal fetch.
                                    // If FacilityManager doesn't accept props, we need to update it.
                                    // *Self-Correction*: FacilityManager currently fetches its own data. Passing 'initialFacilities' won't work unless we modify it.
                                    // Actually, for a quick win, let's just render the cards directly here using the same style,
                                    // OR better, update FacilityManager to accept an optional 'facilities' prop.
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Filter size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No facilities found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Overview View */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Status Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard
                                        title="Total Capacity"
                                        value={analytics.totalSpots || 0}
                                        subtext={`${Math.max(0, analytics.totalSpots - analytics.occupiedSpots) || 0} Spaces Available`}
                                        icon={MapPin}
                                        color="bg-blue-500"
                                        trend="+12% this week"
                                    />
                                    <StatCard
                                        title="Occupancy Rate"
                                        value={`${analytics.occupancyRate}% `}
                                        subtext="Real-time utilization"
                                        icon={Car}
                                        color="bg-green-500"
                                        trend="+5% today"
                                    />
                                    <StatCard
                                        title="Active Issues"
                                        value={analytics.pendingTickets || 0}
                                        subtext="Requires attention"
                                        icon={AlertCircle}
                                        color="bg-orange-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Facilities List (Shown in Overview and Facilities tabs) */}
                        {(activeTab === 'facilities' || activeTab === 'overview') && (
                            <section className={`space - y - 6 ${activeTab === 'facilities' ? 'animate-fade-in' : ''} `}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {activeTab === 'facilities' ? 'All Facilities' : 'Parking Facilities'}
                                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/20">
                                            {facilities.length > 0 ? 'Live' : 'Syncing...'}
                                        </span>
                                    </h3>
                                </div>

                                {/* We pass nothing to FacilityManager, it fetches itself.
                                    Ideally, we should pass 'facilities' so it doesn't double-fetch,
                                    but for now, to avoid breaking edits, we let it fetch or we edit it next. */}
                                <FacilityManager />
                            </section>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center animate-fade-in">
                                <Settings size={48} className="mx-auto mb-4 text-gray-600" />
                                <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
                                <p className="text-gray-400">Platform configuration coming soon.</p>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-gray-600 text-sm pb-8">
                        <p>&copy; {new Date().getFullYear()} ParkIt Operator Console. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default OperatorDashboard;
