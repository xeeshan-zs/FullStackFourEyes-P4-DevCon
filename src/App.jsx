import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DriverDashboard from './pages/DriverDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import './map-styles.css';
// Home route handler - redirects based on auth state
function HomeRoute() {
  const { user, role, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="glass rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (user && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Home route - redirects based on auth */}
          <Route path="/" element={<HomeRoute />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Role-based Protected Routes */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operator"
            element={
              <ProtectedRoute requiredRole="operator">
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer"
            element={
              <ProtectedRoute requiredRole="officer">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
