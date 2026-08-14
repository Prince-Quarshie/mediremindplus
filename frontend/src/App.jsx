import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import Schedule from './pages/Schedule';
import Refills from './pages/Refills';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Unauthenticated users see Auth (Signup/Login) as default first page; authenticated users auto-redirect to dashboard */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <Auth initialTab="login" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />

          {/* Protected routes requiring authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <ProtectedRoute>
                <Medications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/refills"
            element={
              <ProtectedRoute>
                <Refills />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<p style={{ padding: '24px' }}>You don't have access to this page.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
