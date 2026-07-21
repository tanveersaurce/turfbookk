import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // While checking auth token on page load/refresh, hold render briefly
  if (loading && !user) {
    return null;
  }

  if (isAuthenticated && user) {
    // Redirect authenticated users based on their role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      // Check if profile needs completion first
      if (!user.phone || user.phone.trim().replace(/\D/g, '').length < 10) {
        return <Navigate to="/complete-profile" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
