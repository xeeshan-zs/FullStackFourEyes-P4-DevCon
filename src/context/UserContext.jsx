import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load role from localStorage if it exists
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
            setRole(savedRole);
        }

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (firebaseUser, userRole) => {
        setUser(firebaseUser);
        setRole(userRole);
        localStorage.setItem('userRole', userRole);
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('userRole');
    };

    const value = {
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
