import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NotificationPermission from './components/NotificationPermission';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './map-styles.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'));
const OperatorDashboard = lazy(() => import('./pages/OperatorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OfficerDashboard = lazy(() => import('./pages/OfficerDashboard'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
// Home route handler - redirects based on auth state
function HomeRoute() {
  const { user, role, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect based on role
  if (user) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <HomePage />;
}

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <Router>
          <Suspense
            fallback={
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-lg font-semibold">Loading Park It...</p>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Home route - redirects based on auth */}
              <Route path="/" element={<HomeRoute />} />

              {/* Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Role-based Protected Routes */}
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/operator"
                element={
                  <ProtectedRoute allowedRoles={['operator']}>
                    <OperatorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={['officer']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />

          {/* Notification Permission */}
          <NotificationPermission />
        </Router>
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
