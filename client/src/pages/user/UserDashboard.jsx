import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingService, authService, userService } from '../../services/api';
import { updateProfile } from '../../store/authSlice';
import { Calendar, Clock, MapPin, QrCode, User, CheckCircle2, AlertCircle, Heart, Shield, Settings, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ["#00C853", "#2196F3", "#9C27B0", "#FF5722", "#F44336", "#009688", "#FF9800", "#607D8B"];

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export default function UserDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Profile Edit fields
  const parts = user?.name ? user.name.trim().split(/\s+/) : [];
  const initialFirstName = parts[0] || '';
  const initialLastName = parts.slice(1).join(' ') || '';

  const [formFirstName, setFormFirstName] = useState(initialFirstName);
  const [formLastName, setFormLastName] = useState(initialLastName);
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security Password Change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Selected ticket drawer modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (tabParam && (tabParam === 'bookings' || tabParam === 'profile' || tabParam === 'favourites' || tabParam === 'security')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      const parts = user.name ? user.name.trim().split(/\s+/) : [];
      setFormFirstName(parts[0] || '');
      setFormLastName(parts.slice(1).join(' ') || '');
      setFormPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await bookingService.getBookings(user.email);
        setBookings(data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchUserBookings();
  }, [user]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || activeTab !== 'favourites') return;
      setFavoritesLoading(true);
      try {
        const response = await userService.getFavorites();
        setFavorites(response.data || []);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, [user, activeTab]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await userService.updateAvatar(formData);
      if (res.success) {
        dispatch(updateProfile({ avatar: res.data.avatar }));
      } else {
        alert(res.message || 'Failed to upload avatar.');
      }
    } catch (err) {
      alert('Error uploading avatar: ' + err.message);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? (20% advance will be refunded to wallet)')) return;
    try {
      await bookingService.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    try {
      const fullName = `${formFirstName} ${formLastName}`.trim();
      const res = await userService.updateProfile({ name: fullName, phone: formPhone });
      if (res.success) {
        dispatch(updateProfile({ name: fullName, phone: formPhone }));
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(res.message || 'Failed to save changes.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to save changes.');
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    try {
      const res = await userService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setSecuritySuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSecuritySuccess(false), 3000);
      } else {
        setSecurityError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setSecurityError(err.response?.data?.message || err.message || 'Failed to update password.');
    }
  };

  const avatarBg = user?.name ? colors[user.name.charCodeAt(0) % colors.length] : colors[0];
  const userInitials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-inter py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Sidebar summary card & Tab Selector */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
              {/* Profile Image & Ring */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-primary p-0.5 relative overflow-hidden flex items-center justify-center bg-slate-100">
                  {user?.avatar?.url || user?.avatar ? (
                    <img 
                      src={user?.avatar?.url || user?.avatar} 
                      alt={user?.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-3xl"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {userInitials}
                    </div>
                  )}
                </div>
                {/* File Upload Trigger (Pencil icon) */}
                <label 
                  htmlFor="avatar-upload-input"
                  className="absolute bottom-1 right-1 w-7.5 h-7.5 rounded-full bg-[#5D7A00] hover:bg-[#4E6B00] text-white flex items-center justify-center cursor-pointer shadow-md border border-white transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </label>
                <input 
                  type="file" 
                  id="avatar-upload-input" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Name & Email */}
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{user?.name}</h3>
                <span className="block text-xs font-semibold text-slate-400">{user?.email}</span>
              </div>

              {/* Verified Pill */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-xs font-bold text-[#5D7A00]">
                <svg className="w-3.5 h-3.5 fill-[#5D7A00]/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                <span>Verified</span>
              </div>

              {/* Total Bookings Box */}
              <div className="w-full bg-[#F8FAFC] border border-slate-100 p-4.5 rounded-2xl space-y-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Bookings</span>
                <span className="block text-2xl font-black text-slate-800">{bookings.length}</span>
              </div>
            </div>

            {/* Sidebar Tab List */}
            <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm space-y-1.5 text-left">
              <button
                onClick={() => setSearchParams({ tab: 'profile' })}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all focus:outline-none ${
                  activeTab === 'profile'
                    ? 'bg-[#5D7A00] text-white shadow-md shadow-primary/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <User className="w-4.5 h-4.5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setSearchParams({ tab: 'bookings' })}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all focus:outline-none ${
                  activeTab === 'bookings'
                    ? 'bg-[#5D7A00] text-white shadow-md shadow-primary/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => setSearchParams({ tab: 'favourites' })}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all focus:outline-none ${
                  activeTab === 'favourites'
                    ? 'bg-[#5D7A00] text-white shadow-md shadow-primary/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-4.5 h-4.5" />
                <span>My Favourites</span>
              </button>

              <button
                onClick={() => setSearchParams({ tab: 'security' })}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all focus:outline-none ${
                  activeTab === 'security'
                    ? 'bg-[#5D7A00] text-white shadow-md shadow-primary/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4.5 h-4.5" />
                <span>Security</span>
              </button>
            </div>
          </aside>

          {/* Right Column: Main Panel content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800">Personal Information</h2>
                    <p className="text-sm text-slate-500 font-medium">Update your personal details and how we can reach you.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    {profileSuccess && (
                      <div className="p-3.5 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Profile updated successfully!</span>
                      </div>
                    )}
                    {profileError && (
                      <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    {/* Name grid row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">First Name</label>
                        <input 
                          type="text"
                          value={formFirstName}
                          onChange={(e) => setFormFirstName(e.target.value)}
                          className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800 placeholder-slate-400"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Last Name</label>
                        <input 
                          type="text"
                          value={formLastName}
                          onChange={(e) => setFormLastName(e.target.value)}
                          className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Email address disabled row */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-400 cursor-not-allowed pr-10 focus:outline-none"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                      <span className="block text-[10px] text-slate-400 italic">Contact support to change your verified email.</span>
                    </div>

                    {/* Phone number row */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number</label>
                      <input 
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all focus:outline-none"
                    >
                      Save Changes
                    </button>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: MY BOOKINGS */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                    <h2 className="text-2xl font-black text-slate-800">Your Bookings</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and check in to your reserved slots.</p>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <h3 className="text-sm font-bold text-slate-800">No Bookings Yet</h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">You haven't booked any sports venues yet. Explore grounds nearby to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => {
                        const isCancelled = booking.status === 'cancelled';
                        return (
                          <div 
                            key={booking.id || booking._id}
                            className={`p-5 bg-white border rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm ${
                              isCancelled ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-primary/20 hover:shadow'
                            }`}
                          >
                            {/* Info */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-slate-800">{booking.turfName}</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded-md font-semibold capitalize">{booking.sport}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3.5 h-3.5 text-primary" />
                                  <span>{booking.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5 text-primary" />
                                  <span className="max-w-[150px] truncate">{(booking.slots || []).join(', ')}</span>
                                </div>
                              </div>
                              <div className="flex space-x-4 text-[10px] font-bold">
                                <span>Advance Paid: <span className="text-green-600">₹{booking.advancePaid}</span></span>
                                <span>Pay at Venue: <span className="text-amber-500">₹{booking.remainingAmount}</span></span>
                              </div>
                            </div>

                            {/* CTA Actions */}
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                              {isCancelled ? (
                                <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider">Cancelled</span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setSelectedTicket(booking)}
                                    className="px-3.5 py-2 border border-slate-200 hover:border-primary/50 text-slate-700 hover:text-[#5D7A00] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all bg-white"
                                  >
                                    <QrCode className="w-4 h-4 text-primary" />
                                    <span>View Ticket</span>
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(booking.id || booking._id)}
                                    className="px-3.5 py-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold transition-all bg-white"
                                  >
                                    Cancel Booking
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: MY FAVOURITES */}
              {activeTab === 'favourites' && (
                <motion.div
                  key="favourites"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                    <h2 className="text-2xl font-black text-slate-800">Your Favourites</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Quickly access the arenas you love playing at.</p>
                  </div>

                  {favoritesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
                      <Heart className="w-8 h-8 text-slate-400 mx-auto" />
                      <h3 className="text-sm font-bold text-slate-800">No Favourites Yet</h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">Mark grounds as favourite to find them easily here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((turf) => (
                        <div 
                          key={turf._id || turf.id}
                          className="p-4 bg-white border border-slate-100 hover:border-primary/20 rounded-2xl flex items-center space-x-4 transition-all shadow-sm"
                        >
                          <img 
                            src={(turf.images && turf.images[0]) || 'https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=300&q=80'} 
                            alt={turf.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate">{turf.name}</h4>
                            <p className="text-xs text-slate-400 truncate">{turf.area}, {turf.city}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-bold">
                              ₹{turf.pricePerHour}/hr
                            </span>
                          </div>
                          <Link 
                            to={`/turf/${turf._id || turf.id}`}
                            className="px-3 py-1.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs transition-all"
                          >
                            Book
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: SECURITY */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800">Security Settings</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage your account password and security tokens.</p>
                  </div>

                  <form onSubmit={handleSecuritySubmit} className="space-y-5">
                    {securitySuccess && (
                      <div className="p-3.5 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Password changed successfully!</span>
                      </div>
                    )}
                    {securityError && (
                      <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span>{securityError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all focus:outline-none"
                    >
                      Update Password
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Ticket QR Code Modal Drawer */}
        <AnimatePresence>
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1117]/85 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl text-slate-800 text-left"
              >
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Render dynamic ticket details inside ticket drawer */}
                <div className="pt-2">
                  <div className="text-center mb-4">
                    <h3 className="text-base font-extrabold text-slate-800">Your Check-In Pass</h3>
                    <span className="text-[10px] text-slate-400 font-bold">ID: {selectedTicket.id || selectedTicket._id}</span>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-2xl flex items-center justify-center mx-auto w-fit mb-4">
                    <img 
                      src={selectedTicket.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Booking-${selectedTicket.id || selectedTicket._id}`}
                      alt="QR Pass"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-slate-500 font-medium border-t border-slate-100 pt-4">
                    <div className="flex justify-between"><span className="font-bold text-slate-700">Venue:</span> <span className="max-w-[200px] truncate text-right font-semibold">{selectedTicket.turfName}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-700">Date:</span> <span className="font-semibold">{selectedTicket.date}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-700">Sport:</span> <span className="font-semibold capitalize">{selectedTicket.sport}</span></div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">Time Slots:</span> 
                      <span className="text-slate-800 font-bold max-w-[200px] truncate text-right">{(selectedTicket.slots || []).join(', ')}</span>
                    </div>
                    <div className="flex justify-between"><span className="font-bold text-slate-700">Remaining Balance:</span> <span className="text-amber-500 font-black">₹{selectedTicket.remainingAmount}</span></div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
