import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps pages that just require being logged in (customer or admin),
// unlike ProtectedRoute which additionally requires the Admin role.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="shell"><div className="loading-note">Loading…</div></div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
