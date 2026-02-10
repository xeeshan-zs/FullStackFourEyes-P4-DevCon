import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Supports either a single requiredRole or an array of allowedRoles
const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, role, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="glass rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based checks
  const hasRequiredRole =
    (requiredRole && role === requiredRole) ||
    (Array.isArray(allowedRoles) && allowedRoles.includes(role));

  // If a role restriction is specified and the user doesn't match, redirect to their own dashboard
  if ((requiredRole || allowedRoles) && !hasRequiredRole) {
    return <Navigate to={`/${role || ''}`} replace />;
  }

  // User is allowed
  return children;
};

export default ProtectedRoute;
