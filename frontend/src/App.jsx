import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

// Navigation component
const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated || !user?.profile_completed) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Meis</h1>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/matches">Matches</a>
          <a href="/settings">Settings</a>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Profile complete check route
const ProfileCompleteRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user?.profile_completed) {
    return <Navigate to="/profile-setup" />;
  }

  return children;
};

// Auth routes (redirect if authenticated)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
};

const AppRoutes = () => {
  return (
    <>
      <Navigation />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        {/* Profile setup (after registration) */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* Protected routes (require profile completion) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProfileCompleteRoute>
                <Home />
              </ProfileCompleteRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <ProfileCompleteRoute>
                <Matches />
              </ProfileCompleteRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <ProfileCompleteRoute>
                <Chat />
              </ProfileCompleteRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProfileCompleteRoute>
                <Settings />
              </ProfileCompleteRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
