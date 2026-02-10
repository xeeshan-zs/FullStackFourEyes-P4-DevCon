import { useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Settings, LogOut, Car, AlertCircle } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import SpotManager from '../components/SpotManager';

function OperatorDashboard() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-500">
            {/* Header */}
            <div className="glass-dark border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Operator Console</h1>
                            <p className="text-white/70 text-sm">Parking Facility Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="glass rounded-3xl p-8 mb-8 text-white">
                    <h2 className="text-3xl font-bold mb-2">Facility Overview</h2>
                    <p className="opacity-90">Manage your parking zones and real-time occupancy.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass p-6 rounded-2xl text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Car className="w-6 h-6" />
                            </div>
                            <span className="bg-green-400/20 text-green-100 px-2 py-1 rounded text-xs font-bold">
                                OPEN
                            </span>
                        </div>
                        <p className="opacity-70 text-sm">Total Capacity</p>
                        <h3 className="text-3xl font-bold">200</h3>
                        <p className="text-xs mt-2 opacity-60">Spaces available</p>
                    </div>

                    <div className="glass p-6 rounded-2xl text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="opacity-70 text-sm">Occupancy Rate</p>
                        <h3 className="text-3xl font-bold">72%</h3>
                        <p className="text-xs mt-2 opacity-60">+5% from last hour</p>
                    </div>

                    <div className="glass p-6 rounded-2xl text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="opacity-70 text-sm">Issues</p>
                        <h3 className="text-3xl font-bold">2</h3>
                        <p className="text-xs mt-2 opacity-60">Sensors offline</p>
                    </div>
                </div>

                {/* Spot Management System */}
                <div className="mb-8">
                    <SpotManager />
                </div>
            </div>
        </div>
    );
}

export default OperatorDashboard;
