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
import ChangePassword from './pages/auth/ChangePassword';

// Dashboards
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewTurf from './pages/admin/ReviewTurf';

// Partner Pages
import PartnerLanding from './pages/partner/PartnerLanding';
import ApplicationForm from './pages/partner/ApplicationForm';
import ApplicationSuccess from './pages/partner/ApplicationSuccess';
import ApplicationStatus from './pages/partner/ApplicationStatus';
import PartnerApplications from './pages/admin/PartnerApplications';

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

          {/* General Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Partner Onboarding Public Routes */}
          <Route path="/become-partner" element={<PartnerLanding />} />
          <Route path="/become-partner/apply" element={<ApplicationForm />} />
          <Route path="/become-partner/success" element={<ApplicationSuccess />} />
          <Route path="/become-partner/status" element={<ApplicationStatus />} />
          
          {/* Force Change Password Route (auth required) */}
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />

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
          <Route 
            path="/admin/applications" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PartnerApplications />
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
