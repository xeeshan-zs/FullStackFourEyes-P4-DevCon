import { useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Settings, LogOut, Car, AlertCircle } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import SpotManager from '../components/SpotManager';
import styles from './Dashboard.module.css';

function OperatorDashboard() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await signOut();
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoGroup}>
                        <div className={styles.logoBox}>
                            <Building2 className={styles.logoIcon} />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Operator Console</h1>
                            <p>Parking Facility Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        <LogOut />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.main}>
                {/* Welcome Section */}
                <div className={styles.hero}>
                    <div className={styles.heroIcon}>
                        <LayoutDashboard />
                    </div>
                    <h2 className={styles.heroTitle}>Facility Overview</h2>
                    <p className={styles.heroSubtitle}>Manage your parking zones and real-time occupancy.</p>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                <Car style={{ color: '#3B82F6' }} />
                            </div>
                            <span style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#10B981',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}>
                                OPEN
                            </span>
                        </div>
                        <p className={styles.statLabel}>Total Capacity</p>
                        <p className={styles.statValue}>200</p>
                        <p className={styles.statNote}>Spaces available</p>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                <LayoutDashboard style={{ color: '#3B82F6' }} />
                            </div>
                        </div>
                        <p className={styles.statLabel}>Occupancy Rate</p>
                        <p className={styles.statValue}>72%</p>
                        <p className={styles.statNote}>+5% from last hour</p>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                                <AlertCircle style={{ color: '#F97316' }} />
                            </div>
                        </div>
                        <p className={styles.statLabel}>Issues</p>
                        <p className={styles.statValue}>2</p>
                        <p className={styles.statNote}>Sensors offline</p>
                    </div>
                </div>

                {/* Spot Management System */}
                <div style={{ marginBottom: '2rem' }}>
                    <SpotManager />
                </div>
            </div>
        </div>
    );
}

export default OperatorDashboard;
