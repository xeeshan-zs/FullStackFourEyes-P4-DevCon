import { useNavigate } from 'react-router-dom';
import { Shield, BarChart3, MapPin, LogOut, DollarSign, AlertCircle } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import styles from './Dashboard.module.css';

function AdminDashboard() {
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
                            <Shield className={styles.logoIcon} />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Admin Dashboard</h1>
                            <p>City-wide parking management</p>
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
                        <BarChart3 />
                    </div>

                    <h2 className={styles.heroTitle}>
                        Welcome, Admin! 🛡️
                    </h2>

                    <p className={styles.heroSubtitle}>
                        Analytics dashboard coming in Module 4
                    </p>
                </div>

                {/* Stats Preview Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                                <DollarSign style={{ color: '#10B981' }} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Total Revenue</p>
                                <p className={styles.statValue}>Coming Soon</p>
                            </div>
                        </div>
                        <p className={styles.statNote}>Real-time revenue tracking</p>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                <MapPin style={{ color: '#3B82F6' }} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Occupancy Rate</p>
                                <p className={styles.statValue}>Module 4</p>
                            </div>
                        </div>
                        <p className={styles.statNote}>Live parking utilization</p>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                                <AlertCircle style={{ color: '#F97316' }} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Active Violations</p>
                                <p className={styles.statValue}>Module 5</p>
                            </div>
                        </div>
                        <p className={styles.statNote}>Ticketing overview</p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>📊 Upcoming Features</h3>
                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureCheck}>✓</div>
                            <div>
                                <p className={styles.featureItemTitle}>Spot Manager (Module 4)</p>
                                <p className={styles.featureItemDesc}>Manually toggle parking spots on/off</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.featureCheck}>✓</div>
                            <div>
                                <p className={styles.featureItemTitle}>Demand Prediction (Module 6)</p>
                                <p className={styles.featureItemDesc}>AI-powered occupancy forecasting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
