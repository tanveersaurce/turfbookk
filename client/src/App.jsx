import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import useAuth from './hooks/useAuth';

// Public Pages
import Home from './pages/public/Home';
import Search from './pages/public/Search';
import TurfDetail from './pages/public/TurfDetail';
import Checkout from './pages/public/Checkout';
import { BookingConfirmed } from './pages/public/BookingConfirmed';
import Cities from './pages/public/Cities';
import ContactSupport from './pages/public/ContactSupport';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import { ResetPassword } from './pages/auth/ResetPassword';

// Dashboards
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewTurf from './pages/admin/ReviewTurf';

// Global Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import QuickLoginModal from './components/common/QuickLoginModal';

function App() {
  const { loadCurrentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('tb_token');
    if (token) {
      loadCurrentUser();
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutralBg text-secondary font-inter">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/turf/:id" element={<TurfDetail />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          
          {/* Checkout (requires user authentication) */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Checkout />
              </ProtectedRoute>
            } 
          />

          {/* Booking Confirmed */}
          <Route 
            path="/booking-confirmed" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <BookingConfirmed />
              </ProtectedRoute>
            } 
          />

          {/* User Dashboard */}
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />

          {/* General & Turf Owner Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/owner/login" element={<Login />} />
          <Route path="/owner/register" element={<Register />} />
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Super Admin Auth & Dashboard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/review-turf/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReviewTurf />
              </ProtectedRoute>
            } 
          />

          {/* Password Reset Route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Global Quick Login Modal (Triggers via custom event or state) */}
      <QuickLoginModal />
    </div>
  );
}

export default App;
