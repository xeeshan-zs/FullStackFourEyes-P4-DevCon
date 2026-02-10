import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { signInWithEmail, signInAnonymously } from '../services/authService';
import { useUser } from '../context/UserContext';
import styles from './LoginPage.module.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signInWithEmail(email, password);

        if (result.success) {
            // Role is now fetched from Firestore by signInWithEmail
            login(result.user, result.role);
            navigate(`/${result.role}`);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleQuickDemo = async () => {
        setError('');
        setLoading(true);

        // For demo, we might want to default to 'driver' or random role if needed
        // but let's stick to simple anonymous auth which usually defaults to 'driver' in our app logic
        const result = await signInAnonymously();

        if (result.success) {
            login(result.user, 'driver'); // Demo users are drivers by default
            navigate('/driver');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Logo and Title */}
                <div className={styles.logoSection}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.logoCircle}>
                            <Car className={styles.logoIcon} />
                        </div>
                    </div>
                    <h1 className={styles.title}>Park-it</h1>
                    <p className={styles.subtitle}>Smart City Parking Hub</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Email (e.g., driver@parkit.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.btnPrimary}
                        >
                            {loading ? 'Creating Secure Session...' : 'Sign In'}
                        </button>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>OR FAST TRACK</span>
                            <div className={styles.dividerLine}></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleQuickDemo}
                            disabled={loading}
                            className={styles.btnSecondary}
                        >
                            Guest Driver Demo
                            <span className={styles.arrow}>→</span>
                        </button>
                    </div>
                </form>

                <p className={styles.footer}>
                    Park-it Hackathon Build • v0.3
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
