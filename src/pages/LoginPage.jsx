import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Camera, Building2 } from 'lucide-react';
import { signInWithEmail, signInAnonymously } from '../services/authService';
import { useUser } from '../context/UserContext';

// Updated roles based on Problem Statement 4
const roles = [
    {
        id: 'driver',
        name: 'Driver',
        subtext: 'Citizen App',
        icon: Car,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'operator',
        name: 'Operator',
        subtext: 'Facility Manager',
        icon: Building2,
        color: 'from-emerald-500 to-teal-500'
    },
    {
        id: 'officer',
        name: 'Officer',
        subtext: 'Enforcement',
        icon: Camera,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'admin',
        name: 'Admin',
        subtext: 'City Planner',
        icon: Shield,
        color: 'from-purple-500 to-pink-500'
    },
];

function LoginPage() {
    const [selectedRole, setSelectedRole] = useState('driver');
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
            login(result.user, selectedRole);
            navigate(`/${selectedRole}`);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleQuickDemo = async () => {
        setError('');
        setLoading(true);

        const result = await signInAnonymously();

        if (result.success) {
            login(result.user, selectedRole);
            navigate(`/${selectedRole}`);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const selectedRoleData = roles.find(r => r.id === selectedRole);
    const Icon = selectedRoleData?.icon || Car;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-full">
                            <Icon className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Park-it</h1>
                    <p className="text-white/80">Smart City Parking Hub</p>
                </div>

                {/* Role Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {roles.map((role) => {
                        const RoleIcon = role.icon;
                        return (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`p-4 rounded-xl transition-all duration-300 flex flex-col items-center text-center ${selectedRole === role.id
                                        ? 'bg-white/30 backdrop-blur-md shadow-lg scale-105 border border-white/40'
                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                            >
                                <RoleIcon className={`w-8 h-8 mb-2 ${selectedRole === role.id ? 'text-white' : 'text-white/60'
                                    }`} />
                                <span className={`text-sm font-bold block ${selectedRole === role.id ? 'text-white' : 'text-white/60'
                                    }`}>
                                    {role.name}
                                </span>
                                <span className={`text-xs block ${selectedRole === role.id ? 'text-white/80' : 'text-white/40'
                                    }`}>
                                    {role.subtext}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-100 text-sm animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : `Sign in as ${selectedRoleData?.name}`}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/20"></div>
                            <span className="flex-shrink-0 mx-4 text-white/50 text-xs">OR FAST TRACK</span>
                            <div className="flex-grow border-t border-white/20"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleQuickDemo}
                            disabled={loading}
                            className="w-full py-3 px-6 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30 disabled:opacity-50 group"
                        >
                            Quick Demo
                            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                </form>

                <p className="text-center text-white/40 text-xs mt-8">
                    Park-it Hackathon Build • v0.2
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
