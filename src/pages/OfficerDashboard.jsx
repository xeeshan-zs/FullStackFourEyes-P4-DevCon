import { useNavigate } from 'react-router-dom';
import { Camera, Scan, LogOut, FileText } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import styles from './Dashboard.module.css';

function OfficerDashboard() {
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
                        <Scan />
                    </div>

                    <h2 className={styles.heroTitle}>
                        Welcome, Officer! 👮
                    </h2>

                    <p className={styles.heroSubtitle}>
                        AI-powered license plate scanner coming in Module 5
                    </p>

                    {/* Main Action Button (Disabled for now) */}
                    <button
                        disabled
                        className={styles.featureItem}
                        style={{ width: 'auto', display: 'inline-flex', margin: '0 auto', cursor: 'not-allowed', opacity: 0.5 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Camera />
                            Scan License Plate (Module 5)
                        </div>
                    </button>

                    <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', maxWidth: '28rem', margin: '2rem auto 0' }}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureCheck}>
                                <Camera />
                            </div>
                            <div>
                                <h3 className={styles.featureItemTitle}>📸 OCR Scanner</h3>
                                <p className={styles.featureItemDesc}>
                                    Upload car photo or use camera to scan license plates
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureCheck}>
                                <FileText />
                            </div>
                            <div>
                                <h3 className={styles.featureItemTitle}>🎫 Auto-fill Tickets</h3>
                                <p className={styles.featureItemDesc}>
                                    Automatically populate ticket forms with extracted plate text
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureCheck}>
                                <Scan />
                            </div>
                            <div>
                                <h3 className={styles.featureItemTitle}>⚡ Real-time Processing</h3>
                                <p className={styles.featureItemDesc}>
                                    Client-side OCR for instant results without server delays
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Preview */}
                <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Tickets Issued Today</p>
                        <p className={styles.statValue}>Module 5</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Active Violations</p>
                        <p className={styles.statValue}>Coming Soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OfficerDashboard;
