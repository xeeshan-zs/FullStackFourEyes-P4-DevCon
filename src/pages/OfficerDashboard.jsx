
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Camera,
    FileText,
    BarChart3,
    Bell,
    Search,
    X,
    Menu,
    Shield,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ChevronRight,
    Navigation,
    Send,
    Loader2
} from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import LicensePlateScanner from '../components/LicensePlateScanner';
import CameraPreview from '../components/CameraPreview';
import {
    issueTicket,
    validateLicensePlate,
    getOfficerTickets,
    getRecentTickets,
    getViolationStats,
    VIOLATION_TYPES
} from '../services/ticketingService';

function OfficerDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useUser();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Scanner & Violation State
    const [showScanner, setShowScanner] = useState(false);
    const [scannedPlate, setScannedPlate] = useState('');
    const [plateEvidence, setPlateEvidence] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [selectedViolation, setSelectedViolation] = useState('');
    const [violationNotes, setViolationNotes] = useState('');
    const [issuing, setIssuing] = useState(false);

    // Data State
    const [myTickets, setMyTickets] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Location State
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationAddress, setLocationAddress] = useState('Fetching location...');

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.uid) return;
                const officerId = user.uid;
                const [tickets, recent, violationStats] = await Promise.all([
                    getOfficerTickets(officerId),
                    getRecentTickets(5),
                    getViolationStats(officerId)
                ]);
                setMyTickets(tickets);
                setRecentTickets(recent);
                setStats(violationStats);

                // Generate notifications from data
                const notifs = [];
                if (violationStats.pendingCount > 0) {
                    notifs.push({ id: 'pending', text: `${violationStats.pendingCount} ticket(s) pending review`, time: 'Now', type: 'warning' });
                }
                if (violationStats.disputedCount > 0) {
                    notifs.push({ id: 'disputed', text: `${violationStats.disputedCount} ticket(s) under dispute`, time: 'Now', type: 'error' });
                }
                notifs.push({ id: 'sys', text: 'Enforcement system online', time: '1m ago', type: 'success' });
                setNotifications(notifs);
            } catch (err) {
                console.error('Failed to load officer data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Get geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCurrentLocation(coords);
                    setLocationAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                },
                () => setLocationAddress('Location unavailable')
            );
        }
    }, []);

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    const handlePlateDetected = async (plate, evidenceImage) => {
        setScannedPlate(plate);
        setPlateEvidence(evidenceImage || null);
        setShowScanner(false);
        setActiveTab('scan');

        const result = await validateLicensePlate(plate);
        setValidationResult(result);

        if (!result.valid) {
            setSelectedViolation('no_reservation');
        }
    };

    const handleIssueTicket = async () => {
        if (!scannedPlate || !selectedViolation) return;
        setIssuing(true);

        const violationType = VIOLATION_TYPES[selectedViolation];
        const ticket = await issueTicket({
            licensePlate: scannedPlate,
            violationType: selectedViolation,
            location: locationAddress,
            coordinates: currentLocation,
            notes: violationNotes,
            photoEvidence: plateEvidence,
            issuedBy: user.uid,
            officerEmail: user?.email || 'officer@parkit.com',
            officerName: user?.name || 'Officer',
            amount: violationType.fine
        });

        setIssuing(false);

        if (ticket.success) {
            // Refresh data
            const officerId = user.uid;
            const [tickets, violationStats] = await Promise.all([
                getOfficerTickets(officerId),
                getViolationStats(officerId)
            ]);
            setMyTickets(tickets);
            setStats(violationStats);

            // Reset form
            setScannedPlate('');
            setPlateEvidence(null);
            setValidationResult(null);
            setSelectedViolation('');
            setViolationNotes('');
            setActiveTab('dashboard');
        } else {
            alert('Failed to issue ticket: ' + ticket.error);
        }
    };

    const clearScan = () => {
        setScannedPlate('');
        setPlateEvidence(null);
        setValidationResult(null);
        setSelectedViolation('');
        setViolationNotes('');
    };

    // Filtered tickets for search
    const filteredTickets = searchQuery
        ? myTickets.filter(t =>
            t.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.violationLabel?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : myTickets;

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); setSearchQuery(''); }}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative ${activeTab === id
                ? 'text-orange-400'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
        >
            {activeTab === id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            )}
            <Icon size={22} className={`transition-colors ${activeTab === id ? 'text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]' : 'group-hover:text-white'}`} />
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
                <p className="text-sm text-gray-500 flex items-center gap-1.5">{subtext}</p>
            </div>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            paid: 'bg-green-500/10 text-green-400 border-green-500/20',
            disputed: 'bg-red-500/10 text-red-400 border-red-500/20',
            resolved: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
        return (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 flex overflow-hidden font-sans selection:bg-orange-500/30">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-[#0B1120] border-r border-white/5 transition-all duration-300 fixed left-0 top-0 bottom-0 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}
            >
                <div className="h-28 flex items-center px-8 gap-4 mb-4 flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                        <Shield className="text-white" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-white">ParkIt</h1>
                            <p className="text-xs text-orange-400 font-medium tracking-wider uppercase">Enforcement</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem id="scan" icon={Camera} label="Scan Plate" />
                    <NavItem id="tickets" icon={FileText} label="My Tickets" />
                    <NavItem id="analytics" icon={BarChart3} label="Analytics" />
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

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                <div className="flex justify-around items-center p-4">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'scan', icon: Camera, label: 'Scan' },
                        { id: 'tickets', icon: FileText, label: 'Tickets' },
                        { id: 'analytics', icon: BarChart3, label: 'Stats' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-orange-400' : 'text-gray-400'}`}
                        >
                            <item.icon size={24} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col h-full overflow-hidden relative w-full pb-20 md:pb-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'}`}
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
                            <h2 className="text-xl font-bold text-white">Welcome, {user?.name || 'Officer'} 👮</h2>
                            <p className="text-sm text-gray-400">Enforcement & Violation Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#1E293B] border border-white/5 text-sm rounded-full pl-10 pr-10 py-2.5 w-40 md:w-80 text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all focus:w-48 md:focus:w-96"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
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
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1120] animate-pulse" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-[#1E293B] border border-white/10 rounded-2xl shadow-xl shadow-black/50 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{notifications.length}</span>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map((n, i) => (
                                            <div key={n.id || i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                <div>
                                                    <p className="text-sm text-gray-200 leading-snug">{n.text}</p>
                                                    <span className="text-xs text-gray-500 mt-1 block">{n.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-500/20 cursor-pointer hidden sm:block">
                            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center text-sm font-bold">
                                {user?.name?.[0] || 'O'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8"
                    onClick={() => setShowNotifications(false)}
                >
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* ===================== DASHBOARD TAB ===================== */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Tickets Issued"
                                        value={stats?.totalTickets || 0}
                                        subtext="Total enforcement actions"
                                        icon={FileText}
                                        color="bg-orange-500"
                                    />
                                    <StatCard
                                        title="Pending Review"
                                        value={stats?.pendingCount || 0}
                                        subtext="Awaiting resolution"
                                        icon={Clock}
                                        color="bg-yellow-500"
                                    />
                                    <StatCard
                                        title="Fines Collected"
                                        value={`PKR ${(stats?.totalFines || 0).toLocaleString()}`}
                                        subtext={`${stats?.paidCount || 0} paid tickets`}
                                        icon={CheckCircle}
                                        color="bg-green-500"
                                    />
                                    <StatCard
                                        title="Disputed"
                                        value={stats?.disputedCount || 0}
                                        subtext="Under review"
                                        icon={AlertTriangle}
                                        color="bg-red-500"
                                    />
                                </div>

                                {/* Quick Scan CTA */}
                                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Ready to Enforce?</h3>
                                        <p className="text-gray-400">Scan a license plate to check for violations and issue e-challans instantly.</p>
                                    </div>
                                    <button
                                        onClick={() => { setActiveTab('scan'); setShowScanner(true); }}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all text-lg flex items-center gap-3 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Camera size={24} />
                                        Scan Plate
                                    </button>
                                </div>

                                {/* Recent Violations */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            Recent Violations
                                            <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20">
                                                {myTickets.length > 0 ? 'Live' : 'No Data'}
                                            </span>
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab('tickets')}
                                            className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                        >
                                            View All <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {myTickets.length > 0 ? (
                                        <div className="space-y-3">
                                            {myTickets.slice(0, 5).map((ticket, i) => (
                                                <div key={ticket.id || i} className="bg-[#1E293B]/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                                                            {VIOLATION_TYPES[ticket.violationType]?.icon || '📋'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white tracking-wider">{ticket.licensePlate}</p>
                                                            <p className="text-sm text-gray-400">{ticket.violationLabel || ticket.violationType}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-white">PKR {(ticket.amount || 0).toLocaleString()}</p>
                                                        <StatusBadge status={ticket.status} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                                            <Shield size={48} className="mx-auto mb-4 text-gray-600" />
                                            <h4 className="text-lg font-bold text-white mb-2">No Violations Yet</h4>
                                            <p className="text-gray-400">Start scanning plates to issue your first e-challan.</p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {/* ===================== SCAN PLATE TAB ===================== */}
                        {activeTab === 'scan' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Camera size={20} className="text-orange-400" />
                                    License Plate Scanner
                                </h3>

                                {!validationResult ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Camera Preview Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                    <Camera size={18} className="text-orange-400" />
                                                    Camera Scan
                                                </h4>
                                                <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">AI-Powered OCR</span>
                                            </div>
                                            <CameraPreview
                                                onPlateDetected={async (plate, evidence) => {
                                                    setScannedPlate(plate);
                                                    setPlateEvidence(evidence || null);
                                                    const result = await validateLicensePlate(plate);
                                                    setValidationResult(result);
                                                    if (!result.valid) {
                                                        setSelectedViolation('no_reservation');
                                                    }
                                                }}
                                            />
                                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                                                <p className="text-xs text-blue-400">💡 Position the license plate within the orange frame and tap "Capture & Scan"</p>
                                            </div>
                                        </div>

                                        {/* Manual Input Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                    ✍️ Manual Entry
                                                </h4>
                                                <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">Type Manually</span>
                                            </div>

                                            <div className="bg-[#1E293B]/50 border border-white/5 rounded-2xl p-6 space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2 font-medium">License Plate Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., ABC-1234"
                                                        value={scannedPlate}
                                                        onChange={(e) => setScannedPlate(e.target.value.toUpperCase())}
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono tracking-wider text-center"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2">Enter the vehicle's license plate number manually</p>
                                                </div>

                                                <button
                                                    onClick={async () => {
                                                        if (scannedPlate.trim()) {
                                                            const result = await validateLicensePlate(scannedPlate.trim());
                                                            setValidationResult(result);
                                                            if (!result.valid) {
                                                                setSelectedViolation('no_reservation');
                                                            }
                                                        }
                                                    }}
                                                    disabled={!scannedPlate.trim()}
                                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                                                >
                                                    Validate & Continue
                                                </button>
                                            </div>

                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                                <p className="text-xs font-bold text-white">Common Plate Formats:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['ABC-123', 'AB-1234', 'ABC-1234', 'AB-123-C'].map(format => (
                                                        <button
                                                            key={format}
                                                            onClick={() => setScannedPlate(format)}
                                                            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors border border-white/10 font-mono"
                                                        >
                                                            {format}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Scanned Result */}
                                        <div className="bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-white text-lg">Scanned Plate</h4>
                                                {validationResult && (
                                                    validationResult.valid ? (
                                                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                                            <CheckCircle size={16} />
                                                            <span className="text-sm font-bold">Valid Reservation</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                                                            <XCircle size={16} />
                                                            <span className="text-sm font-bold">Violation</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="bg-[#0B1120] rounded-2xl p-6 text-center border border-white/5">
                                                <p className="text-4xl font-bold text-white tracking-[0.3em] font-mono">{scannedPlate}</p>
                                            </div>

                                            {validationResult && validationResult.valid && (
                                                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                                                    <p className="text-sm text-green-400 font-medium">✅ Active reservation found</p>
                                                    <p className="text-xs text-green-400/60 mt-1">Facility: {validationResult.reservation?.facilityName || 'N/A'}</p>
                                                </div>
                                            )}

                                            {validationResult && !validationResult.valid && (
                                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                                                    <p className="text-sm text-red-400 font-medium">⚠️ {validationResult.reason}</p>
                                                </div>
                                            )}

                                            {/* Location */}
                                            <div className="flex items-center gap-3 text-gray-400 bg-white/5 rounded-xl p-3">
                                                <Navigation size={16} className="text-orange-400 flex-shrink-0" />
                                                <span className="text-sm truncate">{locationAddress}</span>
                                            </div>

                                            {plateEvidence && (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">📸 Photo Evidence</p>
                                                    <img src={plateEvidence} alt="Evidence" className="rounded-xl border border-white/10 w-full max-h-48 object-cover" />
                                                </div>
                                            )}

                                            <button onClick={clearScan} className="w-full py-3 bg-white/5 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors">
                                                Clear & Scan Again
                                            </button>
                                        </div>

                                        {/* Violation Form */}
                                        <div className="bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8 space-y-6">
                                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                                <AlertTriangle size={20} className="text-orange-400" />
                                                Issue E-Challan
                                            </h4>

                                            {/* Violation Type */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-3 font-medium">Violation Type</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(VIOLATION_TYPES).map(([key, v]) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => setSelectedViolation(key)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedViolation === key
                                                                ? 'border-orange-500/50 bg-orange-500/10 text-white'
                                                                : 'border-white/5 bg-white/5 text-gray-300 hover:border-white/10'
                                                                }`}
                                                        >
                                                            <span className="text-xl">{v.icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm">{v.label}</p>
                                                                <p className="text-xs text-gray-500 truncate">{v.description}</p>
                                                            </div>
                                                            <span className="text-sm font-bold text-orange-400 flex-shrink-0">PKR {v.fine.toLocaleString()}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 font-medium">Notes (optional)</label>
                                                <textarea
                                                    value={violationNotes}
                                                    onChange={(e) => setViolationNotes(e.target.value)}
                                                    placeholder="Additional details about the violation..."
                                                    rows={3}
                                                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                                                />
                                            </div>

                                            {/* Fine Preview */}
                                            {selectedViolation && (
                                                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Total Fine Amount</p>
                                                        <p className="text-2xl font-bold text-orange-400">PKR {VIOLATION_TYPES[selectedViolation].fine.toLocaleString()}</p>
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${VIOLATION_TYPES[selectedViolation].severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        VIOLATION_TYPES[selectedViolation].severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                            VIOLATION_TYPES[selectedViolation].severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {VIOLATION_TYPES[selectedViolation].severity.toUpperCase()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Issue Button */}
                                            <button
                                                onClick={handleIssueTicket}
                                                disabled={!selectedViolation || issuing}
                                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                {issuing ? (
                                                    <>
                                                        <Loader2 size={22} className="animate-spin" />
                                                        Issuing Ticket...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={22} />
                                                        Issue E-Challan
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===================== MY TICKETS TAB ===================== */}
                        {activeTab === 'tickets' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText size={20} className="text-orange-400" />
                                        My Issued Tickets
                                        <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20">
                                            {filteredTickets.length} Total
                                        </span>
                                    </h3>
                                </div>

                                {filteredTickets.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredTickets.map((ticket, i) => (
                                            <div key={ticket.id || i} className="bg-[#1E293B]/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                                                <div className="flex items-center justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                                                            {VIOLATION_TYPES[ticket.violationType]?.icon || '📋'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white tracking-wider text-lg">{ticket.licensePlate}</p>
                                                            <p className="text-sm text-gray-400">{ticket.violationLabel || ticket.violationType}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-white text-lg">PKR {(ticket.amount || 0).toLocaleString()}</p>
                                                        <StatusBadge status={ticket.status} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-white/5">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {ticket.location || 'Unknown'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {ticket.issuedAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}
                                                    </span>
                                                    {ticket.notes && (
                                                        <span className="text-gray-600 truncate max-w-[200px]">📝 {ticket.notes}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                                        <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                                        <h4 className="text-lg font-bold text-white mb-2">
                                            {searchQuery ? 'No Matching Tickets' : 'No Tickets Yet'}
                                        </h4>
                                        <p className="text-gray-400">
                                            {searchQuery ? `No tickets match "${searchQuery}".` : 'Start scanning plates to build your enforcement record.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===================== ANALYTICS TAB ===================== */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-8 animate-fade-in">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BarChart3 size={20} className="text-orange-400" />
                                    Violation Analytics
                                </h3>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard
                                        title="Total Fines Issued"
                                        value={`PKR ${(stats?.totalFines || 0).toLocaleString()}`}
                                        subtext={`${stats?.totalTickets || 0} total tickets`}
                                        icon={FileText}
                                        color="bg-orange-500"
                                    />
                                    <StatCard
                                        title="Collection Rate"
                                        value={stats?.totalTickets > 0 ? `${Math.round((stats.paidCount / stats.totalTickets) * 100)}%` : '0%'}
                                        subtext={`${stats?.paidCount || 0} of ${stats?.totalTickets || 0} paid`}
                                        icon={CheckCircle}
                                        color="bg-green-500"
                                    />
                                    <StatCard
                                        title="Dispute Rate"
                                        value={stats?.totalTickets > 0 ? `${Math.round((stats.disputedCount / stats.totalTickets) * 100)}%` : '0%'}
                                        subtext={`${stats?.disputedCount || 0} disputes`}
                                        icon={AlertTriangle}
                                        color="bg-red-500"
                                    />
                                </div>

                                {/* Violation Breakdown */}
                                <div className="bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8">
                                    <h4 className="font-bold text-white mb-6">Violations by Type</h4>
                                    {stats?.byType && Object.keys(stats.byType).length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(stats.byType).map(([type, count]) => {
                                                const vt = VIOLATION_TYPES[type];
                                                const percentage = stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0;
                                                return (
                                                    <div key={type} className="flex items-center gap-4">
                                                        <span className="text-xl w-8 text-center">{vt?.icon || '📋'}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm text-gray-300 font-medium">{vt?.label || type}</span>
                                                                <span className="text-sm text-gray-400">{count} ({percentage.toFixed(0)}%)</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>No violation data to display yet.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Severity Breakdown */}
                                <div className="bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8">
                                    <h4 className="font-bold text-white mb-6">Severity Distribution</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'low', label: 'Low', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30', textColor: 'text-blue-400' },
                                            { key: 'medium', label: 'Medium', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30', textColor: 'text-yellow-400' },
                                            { key: 'high', label: 'High', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30', textColor: 'text-orange-400' },
                                            { key: 'critical', label: 'Critical', color: 'from-red-500/20 to-red-600/20 border-red-500/30', textColor: 'text-red-400' }
                                        ].map(s => (
                                            <div key={s.key} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-5 text-center`}>
                                                <p className={`text-3xl font-bold ${s.textColor}`}>{stats?.bySeverity?.[s.key] || 0}</p>
                                                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-gray-600 text-sm pb-8">
                        <p>&copy; {new Date().getFullYear()} ParkIt Enforcement Console. All rights reserved.</p>
                    </div>
                </div>
            </main>

            {/* Scanner Modal */}
            {showScanner && (
                <LicensePlateScanner
                    onPlateDetected={handlePlateDetected}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}

export default OfficerDashboard;
