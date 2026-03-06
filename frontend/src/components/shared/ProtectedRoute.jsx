import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/*
  ProtectedRoute -- wraps routes that require authentication.
  Redirects to /login if the user is not authenticated.
  Shows a loading state while the initial auth check runs.
*/

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-size-sm)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
