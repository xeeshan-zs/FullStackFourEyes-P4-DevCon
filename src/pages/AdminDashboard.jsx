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

function AdminDashboard() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [occupancyData, setOccupancyData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [violationData, setViolationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            onClick={() => {
                setActiveTab(id);
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                }
            }}
            className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all duration-200 group relative ${activeTab === id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
        >
            {activeTab === id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}
            <Icon size={20} className={`transition-colors ${activeTab === id ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'group-hover:text-white'}`} />
            <span className="font-medium tracking-wide">{label}</span>
        </button>
    );

    const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
        <div className="bg-[#1E293B]/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg group hover:shadow-black/20">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    {subtext}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 flex overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Backdrop Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-[#0B1120] border-r border-white/5 flex flex-col fixed left-0 top-0 bottom-0 z-50 w-72 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-28 flex items-center px-8 gap-4 mb-4 flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 p-2 flex-shrink-0">
                        <img src="/app-logo.png" alt="Park It" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-white">ParkIt</h1>
                        <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">Admin</p>
                    </div>
                </div>

                <div className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    <p className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Analytics</p>
                    <NavItem id="overview" icon={LayoutGrid} label="Dashboard" />
                    <NavItem id="revenue" icon={DollarSign} label="Revenue" />
                    <NavItem id="occupancy" icon={PieIcon} label="Occupancy" />
                    <NavItem id="reports" icon={FileText} label="Reports" />

                    <div className="my-4 mx-6 border-t border-white/5"></div>

                    <p className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">System</p>
                    <NavItem id="users" icon={Users} label="Users" />
                </div>

                <div className="p-6 border-t border-white/5 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        <span className="font-medium group-hover:text-red-400 transition-colors">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative md:ml-72">
                {/* Header */}
                <header className="h-16 md:h-24 flex-shrink-0 bg-[#0B1120]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Hamburger Menu - Mobile Only */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-white">City Overview</h2>
                            <p className="text-xs md:text-sm text-gray-400 hidden sm:block">Real-time data across all zones</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search analytics..."
                                className="bg-[#1E293B] border border-white/5 text-sm rounded-full pl-10 pr-4 py-2 w-64 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button className="p-2 relative text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <Bell size={18} className="md:w-5 md:h-5" />
                            <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1120]"></span>
                        </button>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
                            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center text-xs md:text-sm font-bold">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 lg:p-8">
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
