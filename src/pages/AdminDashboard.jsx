import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    AlertCircle,
    LogOut,
    Menu,
    Search,
    Bell,
    Users,
    Settings,
    LayoutGrid,
    FileText,
    PieChart as PieIcon
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useUser } from '../context/UserContext';
import { getCityAnalytics, getOccupancyTrends, getRevenueByFacility, getViolationStats } from '../services/analyticsService';
import { predictDemand } from '../services/aiService';
import AdminOverview from '../components/admin/AdminOverview';
import AdminRevenue from '../components/admin/AdminRevenue';
import AdminOccupancy from '../components/admin/AdminOccupancy';
import AdminReports from '../components/admin/AdminReports';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';

function AdminDashboard() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [occupancyData, setOccupancyData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [violationData, setViolationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [cityData, occupancy, revenue, violations] = await Promise.all([
                getCityAnalytics(),
                getOccupancyTrends(),
                getRevenueByFacility(),
                getViolationStats()
            ]);

            setAnalytics(cityData);
            setOccupancyData(occupancy);
            setRevenueData(revenue);
            setViolationData(violations);

            // Generate AI Predictions based on current occupancy data
            const predictions = predictDemand(occupancy);
            setAnalytics(prev => ({ ...prev, predictions }));
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={20} className={activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
            <span className={`font-medium ${!isSidebarOpen && 'hidden md:hidden lg:inline'}`}>{label}</span>
            {activeTab === id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
            )}
        </button>
    );

    const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    {subtext}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 flex overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside
                className={`flex-shrink-0 bg-[#0F172A]/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 flex flex-col fixed md:relative z-50 h-full ${isSidebarOpen ? 'w-72' : 'w-20'
                    }`}
            >
                <div className="h-24 flex items-center px-6 border-b border-white/5 gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 p-2">
                        <img src="/app-logo.png" alt="Park It" className="w-full h-full object-contain" />
                    </div>
                    {isSidebarOpen && (
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">ParkIt<span className="text-blue-500">.</span></h1>
                            <p className="text-xs text-gray-500 font-medium">Admin Console</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className={`px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>
                        {isSidebarOpen ? 'Analytics' : '...'}
                    </p>
                    <NavItem id="overview" icon={LayoutGrid} label="Dashboard" />
                    <NavItem id="revenue" icon={DollarSign} label="Revenue" />
                    <NavItem id="occupancy" icon={PieIcon} label="Occupancy" />
                    <NavItem id="reports" icon={FileText} label="Reports" />

                    <div className="my-4 border-t border-white/5"></div>

                    <p className={`px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>
                        {isSidebarOpen ? 'System' : '...'}
                    </p>
                    <NavItem id="users" icon={Users} label="Users" />
                    <NavItem id="settings" icon={Settings} label="Settings" />
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-24 flex-shrink-0 bg-[#0B1120]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-40 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white">City Overview</h2>
                            <p className="text-sm text-gray-400">Real-time data across all zones</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search analytics..."
                                className="bg-[#1E293B] border border-white/5 text-sm rounded-full pl-10 pr-4 py-2 w-64 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button className="p-2 relative text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1120]"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
                            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center text-sm font-bold">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p>Loading analytics data...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {activeTab === 'overview' && (
                                <AdminOverview
                                    analytics={analytics}
                                    occupancyData={occupancyData}
                                    revenueData={revenueData}
                                    violationData={violationData}
                                    COLORS={COLORS}
                                />
                            )}
                            {activeTab === 'revenue' && <AdminRevenue revenueData={revenueData} />}
                            {activeTab === 'occupancy' && <AdminOccupancy occupancyData={occupancyData} />}
                            {activeTab === 'reports' && <AdminReports />}
                            {activeTab === 'users' && <AdminUsers />}
                            {activeTab === 'settings' && <AdminSettings />}
                        </div>
                    )}

                    <footer className="mt-12 text-center text-gray-600 text-sm pb-8">
                        <p>&copy; {new Date().getFullYear()} ParkIt Admin Console. All rights reserved.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
