import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { user, role, loading, getRedirectPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high p-2 flex items-center justify-center shadow-lg border border-primary/20">
            <img src="/logo.svg" alt="MetroPulse Logo" className="w-full h-full object-contain" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant font-mono animate-pulse">
          Authenticating Transit Session...
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to unified login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const normalizedUserRole = (role || 'passenger').toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(normalizedUserRole)) {
    // Redirect to the user's appropriate assigned portal
    const target = getRedirectPath(normalizedUserRole);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
