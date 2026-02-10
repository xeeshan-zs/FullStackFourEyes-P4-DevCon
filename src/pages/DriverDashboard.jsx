import { useNavigate } from 'react-router-dom';
import { Car, LogOut, Filter, Navigation } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import MapComponent from '../components/MapComponent';

function DriverDashboard() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
            {/* Header */}
            <div className="glass-dark border-b border-white/20 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Find Parking</h1>
                            <p className="text-white/70 text-xs hidden md:block">Real-time availability</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium text-sm transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative p-2 md:p-4">
                <MapComponent />

                {/* Floating Action Button (Mobile) */}
                <button className="absolute bottom-6 right-6 z-[400] p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-110 md:hidden">
                    <Navigation className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}

export default DriverDashboard;
