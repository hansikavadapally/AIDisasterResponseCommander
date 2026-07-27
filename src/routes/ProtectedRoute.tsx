import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Protects a route so only an authenticated user with the expected role can
// access it. Otherwise redirects to the appropriate login page.
export function ProtectedRoute({ role, children }: { role: 'commander' | 'client'; children: ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-cyber-cyan animate-pulse font-display">Authenticating...</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to={role === 'commander' ? '/commander/login' : '/client/login'} replace state={{ from: location }} />;
  }

  if (profile.role !== role) {
    // Redirect to their correct dashboard
    return <Navigate to={profile.role === 'commander' ? '/commander/dashboard' : '/client/dashboard'} replace />;
  }

  return <>{children}</>;
}
