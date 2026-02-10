import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import LicensePlateScanner from '../components/LicensePlateScanner';
import { issueTicket, validateLicensePlate } from '../services/ticketingService';
import styles from './Dashboard.module.css';

function OfficerDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useUser();
    const [showScanner, setShowScanner] = useState(false);
    const [scannedPlate, setScannedPlate] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [ticketsToday, setTicketsToday] = useState(0);

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    const handlePlateDetected = async (plate) => {
        setScannedPlate(plate);

        // Validate the plate
        const result = await validateLicensePlate(plate);
        setValidationResult(result);
    };

    const handleIssueTicket = async () => {
        if (!scannedPlate) return;

        const ticket = await issueTicket({
            licensePlate: scannedPlate,
            violationType: 'No Reservation',
            location: 'Unknown', // Could be added via geolocation
            issuedBy: user?.uid || 'officer-demo',
            officerEmail: user?.email || 'officer@parkit.com',
            amount: 100
        });

        if (ticket.success) {
            setTicketsToday(prev => prev + 1);
            alert(`Ticket issued successfully! Ticket ID: ${ticket.ticketId}`);
            // Reset
            setScannedPlate('');
            setValidationResult(null);
        } else {
            alert('Failed to issue ticket: ' + ticket.error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoGroup}>
                        <div className={styles.logoBox}>
                            <Camera className={styles.logoIcon} />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Officer Dashboard</h1>
                            <p>Enforcement & Ticketing</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        <LogOut />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.main}>
                <div className={styles.hero}>
                    <div className={styles.heroIcon}>
                        <Camera />
                    </div>

                    <h2 className={styles.heroTitle}>
                        Welcome, Officer! 👮
                    </h2>

                    <p className={styles.heroSubtitle}>
                        AI-Powered License Plate Recognition
                    </p>

                    {/* Scan Button */}
                    <button
                        onClick={() => setShowScanner(true)}
                        className="mt-6 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg flex items-center gap-3 mx-auto"
                    >
                        <Camera size={24} />
                        Scan License Plate
                    </button>

                    {/* Scanned Plate Display */}
                    {scannedPlate && (
                        <div className="mt-8 max-w-md mx-auto">
                            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Scanned Plate</h3>
                                    {validationResult && (
                                        validationResult.valid ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle size={20} />
                                                <span className="text-sm font-semibold">Valid</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertTriangle size={20} />
                                                <span className="text-sm font-semibold">Violation</span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <p className="text-3xl font-bold text-gray-900 tracking-wider mb-4">
                                    {scannedPlate}
                                </p>

                                {validationResult && !validationResult.valid && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-red-800 font-medium">
                                            {validationResult.reason}
                                        </p>
                                    </div>
                                )}

                                {validationResult && validationResult.valid && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-green-800 font-medium">
                                            Active reservation found
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Facility: {validationResult.reservation?.facilityName || 'N/A'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {validationResult && !validationResult.valid && (
                                        <button
                                            onClick={handleIssueTicket}
                                            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText size={18} />
                                            Issue Ticket
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setScannedPlate('');
                                            setValidationResult(null);
                                        }}
                                        className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Preview */}
                <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '2rem' }}>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Tickets Issued Today</p>
                        <p className={styles.statValue}>{ticketsToday}</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Active Violations</p>
                        <p className={styles.statValue}>{scannedPlate ? 1 : 0}</p>
                    </div>
                </div>
            </div>

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
