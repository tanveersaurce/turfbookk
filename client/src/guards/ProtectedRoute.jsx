import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // If not authenticated, redirect to home page which will trigger login modal if they tried booking, 
    // or just show landing page.
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but role not allowed, redirect to correct role dashboard or home
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Enforce profile completion for players (requires valid 10-digit phone)
  if (
    user?.role === 'user' &&
    (!user.phone || user.phone.trim().replace(/\D/g, '').length < 10) &&
    window.location.pathname !== '/complete-profile'
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};
