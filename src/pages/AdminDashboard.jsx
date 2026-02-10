import { useNavigate } from 'react-router-dom';
import { Shield, BarChart3, MapPin, LogOut, DollarSign, AlertCircle } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';

function AdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            {/* Header */}
            <div className="glass-dark border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-white/70 text-sm">City-wide parking management</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="glass rounded-3xl p-8 md:p-12 text-center mb-6">
                    <div className="bg-white/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <BarChart3 className="w-12 h-12 text-white" />
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        Welcome, Admin! 🛡️
                    </h2>

                    <p className="text-xl text-white/90 mb-8">
                        Analytics dashboard coming in Module 4
                    </p>
                </div>

                {/* Stats Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">Coming Soon</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-xs">Real-time revenue tracking</p>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Occupancy Rate</p>
                                <p className="text-2xl font-bold text-white">Module 4</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-xs">Live parking utilization</p>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-orange-500/20 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Active Violations</p>
                                <p className="text-2xl font-bold text-white">Module 5</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-xs">Ticketing overview</p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">📊 Upcoming Features</h3>
                    <div className="space-y-3">
                        <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                            <div className="bg-white/20 p-2 rounded">✓</div>
                            <div>
                                <p className="text-white font-medium">Spot Manager (Module 4)</p>
                                <p className="text-white/70 text-sm">Manually toggle parking spots on/off</p>
                            </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                            <div className="bg-white/20 p-2 rounded">✓</div>
                            <div>
                                <p className="text-white font-medium">Demand Prediction (Module 6)</p>
                                <p className="text-white/70 text-sm">AI-powered occupancy forecasting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
