import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children, requiredRole }) => {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/90 mb-6">
            You don't have permission to access this page.
          </p>
          <Navigate to={`/${role}`} replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
