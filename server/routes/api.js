import express from 'express';

// Middleware imports
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware.js';
import { authLimiter, bookingLimiter } from '../middleware/rateLimiter.js';

// Controller imports
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

import {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  changePassword,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from '../controllers/user.controller.js';

import {
  getTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  deleteTurf,
  getMyTurfs,
  searchSuggestions,
  checkSlotsAvailability,
  uploadTurfImages,
  blockSlot,
} from '../controllers/turf.controller.js';

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
} from '../controllers/booking.controller.js';

import {
  createOrder,
  verifyPayment,
  getReceipt,
} from '../controllers/payment.controller.js';

import {
  addReview,
  getTurfReviews,
  deleteReview,
} from '../controllers/review.controller.js';

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller.js';

import {
  getAllUsers,
  toggleUserStatus,
  getAllTurfs,
  approveTurf,
  getAdminAnalytics,
  getAllBookings,
} from '../controllers/admin.controller.js';

const router = express.Router();

// ==========================================
// 1. AUTH ROUTES
// ==========================================
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.post('/auth/logout', protect, logout);
router.post('/auth/forgot-password', authLimiter, forgotPassword);
router.post('/auth/reset-password/:token', authLimiter, resetPassword);
router.get('/auth/me', protect, getMe);

// ==========================================
// 2. USER PROFILE ROUTES
// ==========================================
router.get('/users/profile', protect, getUserProfile);
router.put('/users/profile', protect, updateUserProfile);
router.put('/users/profile/avatar', protect, uploadSingle('image'), updateUserAvatar);
router.put('/users/change-password', protect, changePassword);
router.get('/users/favorites', protect, getFavorites);
router.post('/users/favorites/:turfId', protect, addToFavorites);
router.delete('/users/favorites/:turfId', protect, removeFromFavorites);

// ==========================================
// 3. TURF ROUTES
// ==========================================
router.get('/turfs', getTurfs);
router.get('/turfs/search/suggestions', searchSuggestions);
router.get('/turfs/:id', getTurfById);
router.get('/turfs/:id/slots/:date', checkSlotsAvailability);

// Owner restricted turf routes
router.post('/turfs', protect, authorizeRoles('owner'), createTurf);
router.put('/turfs/:id', protect, authorizeRoles('owner', 'admin'), updateTurf);
router.delete('/turfs/:id', protect, authorizeRoles('owner', 'admin'), deleteTurf);
router.get('/turfs/owner/my-turfs', protect, authorizeRoles('owner'), getMyTurfs);
router.post('/turfs/:id/images', protect, authorizeRoles('owner'), uploadMultiple('images', 5), uploadTurfImages);
router.post('/turfs/:id/block-slot', protect, authorizeRoles('owner'), blockSlot);

// ==========================================
// 4. BOOKING ROUTES
// ==========================================
router.post('/bookings', protect, bookingLimiter, createBooking);
router.get('/bookings/my-bookings', protect, getMyBookings);
router.get('/bookings/owner/all', protect, authorizeRoles('owner'), getOwnerBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id/cancel', protect, cancelBooking);

// ==========================================
// 5. PAYMENT ROUTES
// ==========================================
router.post('/payment/create-order', protect, createOrder);
router.post('/payment/verify', protect, verifyPayment);
router.get('/payment/receipt/:bookingId', protect, getReceipt);

// ==========================================
// 6. REVIEW ROUTES
// ==========================================
router.post('/reviews/:turfId', protect, addReview);
router.get('/reviews/:turfId', getTurfReviews);
router.delete('/reviews/:id', protect, deleteReview);

// ==========================================
// 7. NOTIFICATION ROUTES
// ==========================================
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllAsRead);
router.put('/notifications/:id/read', protect, markAsRead);

// ==========================================
// 8. ADMIN ROUTES
// ==========================================
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/admin/users/:id/status', protect, authorizeRoles('admin'), toggleUserStatus);
router.get('/admin/turfs', protect, authorizeRoles('admin'), getAllTurfs);
router.put('/admin/turfs/:id/approve', protect, authorizeRoles('admin'), approveTurf);
router.get('/admin/analytics', protect, authorizeRoles('admin'), getAdminAnalytics);
router.get('/admin/bookings', protect, authorizeRoles('admin'), getAllBookings);

export default router;
