import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import { getCityAnalytics, getOccupancyTrends, getRevenueByFacility, getViolationStats } from '../services/analyticsService';
import SystemStatus from '../components/SystemStatus';
import Dashboard from './Dashboard.module.css';

function AdminDashboard() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [occupancyData, setOccupancyData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [violationData, setViolationData] = useState([]);
    const [loading, setLoading] = useState(true);

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
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className={Dashboard.dashboard}>
            {/* Header */}
            <header className={Dashboard.header}>
                <div className={Dashboard.logoContainer}>
                    <div className={Dashboard.logoBox}>
                        <BarChart3 className={Dashboard.logoIcon} size={28} />
                    </div>
                    <div>
                        <h1 className={Dashboard.title}>Admin Analytics</h1>
                        <p className={Dashboard.subtitle}>City-Wide Parking Insights</p>
                    </div>
                </div>
                <button onClick={handleLogout} className={Dashboard.logoutBtn}>
                    Logout
                </button>
            </header>

            <main className={Dashboard.content}>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Hero Stats */}
                        <div className={Dashboard.statsGrid}>
                            <div className={Dashboard.statCard}>
                                <div className={Dashboard.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className={Dashboard.statLabel}>Occupancy Rate</p>
                                    <p className={Dashboard.statValue}>{analytics?.occupancyRate}%</p>
                                    <p className={Dashboard.statSubtext}>{analytics?.occupiedSpots} / {analytics?.totalSpots} spots</p>
                                </div>
                            </div>

                            <div className={Dashboard.statCard}>
                                <div className={Dashboard.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className={Dashboard.statLabel}>Total Revenue</p>
                                    <p className={Dashboard.statValue}>PKR {analytics?.totalRevenue}</p>
                                    <p className={Dashboard.statSubtext}>{analytics?.facilities} facilities</p>
                                </div>
                            </div>

                            <div className={Dashboard.statCard}>
                                <div className={Dashboard.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className={Dashboard.statLabel}>Violations</p>
                                    <p className={Dashboard.statValue}>{analytics?.totalTickets}</p>
                                    <p className={Dashboard.statSubtext}>{analytics?.pendingTickets} pending</p>
                                </div>
                            </div>

                            {/* Real-time System Status */}
                            <div className="lg:col-span-1">
                                <SystemStatus />
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            {/* Occupancy Trends */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Hourly Occupancy Trends</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={occupancyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Revenue by Facility */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Facilities by Revenue</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Violation Types */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Violation Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={violationData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => entry.name}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {violationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Revenue Trends */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Hourly Revenue</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={occupancyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Export Section */}
                        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">Export Reports</h3>
                            <p className="text-blue-100 mb-4">Download comprehensive analytics reports</p>
                            <div className="flex gap-4">
                                <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                    Export PDF
                                </button>
                                <button className="px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors">
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
