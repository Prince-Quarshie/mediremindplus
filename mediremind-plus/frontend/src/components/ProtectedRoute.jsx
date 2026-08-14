import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage:
// <ProtectedRoute><Dashboard /></ProtectedRoute>                         -> any logged-in user
// <ProtectedRoute allowedRoles={['patient']}><PatientPage /></ProtectedRoute> -> role restricted
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
