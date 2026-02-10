import { useNavigate } from 'react-router-dom';
import { Camera, Scan, LogOut, FileText } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';

function OfficerDashboard() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-500">
            {/* Header */}
            <div className="glass-dark border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Officer Dashboard</h1>
                            <p className="text-white/70 text-sm">Enforcement & Ticketing</p>
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
                        <Scan className="w-12 h-12 text-white" />
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        Welcome, Officer! 👮
                    </h2>

                    <p className="text-xl text-white/90 mb-8">
                        AI-powered license plate scanner coming in Module 5
                    </p>

                    {/* Main Action Button (Disabled for now) */}
                    <button
                        disabled
                        className="px-8 py-4 bg-white/20 text-white rounded-2xl font-semibold cursor-not-allowed opacity-50 text-lg mb-8 border-2 border-dashed border-white/30"
                    >
                        <div className="flex items-center gap-3 justify-center">
                            <Camera className="w-6 h-6" />
                            Scan License Plate (Module 5)
                        </div>
                    </button>

                    <div className="space-y-4 max-w-md mx-auto">
                        <div className="glass-dark rounded-2xl p-6 text-left">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">📸 OCR Scanner</h3>
                                    <p className="text-white/80 text-sm">
                                        Upload car photo or use camera to scan license plates using Tesseract.js
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-6 text-left">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">🎫 Auto-fill Tickets</h3>
                                    <p className="text-white/80 text-sm">
                                        Automatically populate ticket forms with extracted plate text
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-6 text-left">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Scan className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">⚡ Real-time Processing</h3>
                                    <p className="text-white/80 text-sm">
                                        Client-side OCR for instant results without server delays
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                        <p className="text-white/70 text-sm mb-2">Tickets Issued Today</p>
                        <p className="text-3xl font-bold text-white">Module 5</p>
                    </div>
                    <div className="glass rounded-2xl p-6">
                        <p className="text-white/70 text-sm mb-2">Active Violations</p>
                        <p className="text-3xl font-bold text-white">Coming Soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OfficerDashboard;
