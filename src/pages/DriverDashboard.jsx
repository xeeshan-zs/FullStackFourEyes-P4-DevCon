import { useNavigate } from 'react-router-dom';
import { Car, LogOut, Filter, Navigation } from 'lucide-react';
import { signOut } from '../services/authService';
import { useUser } from '../context/UserContext';
import MapComponent from '../components/MapComponent';
import styles from './DriverDashboard.module.css';

function DriverDashboard() {
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
                            <img src="/app-logo.png" alt="App Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className={styles.headerText}>
                            <h1>Find Parking</h1>
                            <p>Real-time availability</p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.iconButton}>
                            <Filter />
                        </button>
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <LogOut />
                            <span className={styles.logoutText}>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className={styles.mapArea}>
                <MapComponent />

                {/* Floating Action Button (Mobile) */}
                <button className={styles.fab}>
                    <Navigation />
                </button>
            </div>
        </div>
    );
}

export default DriverDashboard;
