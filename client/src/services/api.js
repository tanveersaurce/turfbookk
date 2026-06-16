import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial: enables sending and receiving cookies (HTTP-only JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: add JWT header as a fallback if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: handle auth expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage on token expiration
      localStorage.removeItem('tb_token');
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// 1. AUTH SERVICE
// -------------------------------------------------------------
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success && res.data.token) {
      localStorage.setItem('tb_token', res.data.token);
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.token) {
      localStorage.setItem('tb_token', res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    localStorage.removeItem('tb_token');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token, password) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  },
};

// -------------------------------------------------------------
// 2. USER SERVICE
// -------------------------------------------------------------
export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
  updateAvatar: async (formData) => {
    const res = await api.put('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.put('/users/change-password', data);
    return res.data;
  },
  getFavorites: async () => {
    const res = await api.get('/users/favorites');
    return res.data;
  },
  addFavorite: async (turfId) => {
    const res = await api.post(`/users/favorites/${turfId}`);
    return res.data;
  },
  removeFavorite: async (turfId) => {
    const res = await api.delete(`/users/favorites/${turfId}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 3. TURF SERVICE
// -------------------------------------------------------------
export const turfService = {
  getTurfs: async (params) => {
    const res = await api.get('/turfs', { params });
    return res.data;
  },
  getAvailableCities: async () => {
    const res = await api.get('/turfs/cities/list');
    return res.data;
  },
  getSuggestions: async (q) => {
    const res = await api.get('/turfs/search/suggestions', { params: { q } });
    return res.data;
  },
  getTurfById: async (id) => {
    const res = await api.get(`/turfs/${id}`);
    return res.data;
  },
  getSlots: async (id, date) => {
    const res = await api.get(`/turfs/${id}/slots/${date}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/turfs', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/turfs/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/turfs/${id}`);
    return res.data;
  },
  getMyTurfs: async () => {
    const res = await api.get('/turfs/owner/my-turfs');
    return res.data;
  },
  uploadImages: async (id, formData) => {
    const res = await api.post(`/turfs/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  blockSlot: async (id, blockData) => {
    const res = await api.post(`/turfs/${id}/block-slot`, blockData);
    return res.data;
  },
};


// -------------------------------------------------------------
// 4. BOOKING SERVICE
// -------------------------------------------------------------
export const bookingService = {
  create: async (data) => {
    const res = await api.post('/bookings', data);
    return res.data;
  },
  getBookings: async () => {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
  },
  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data;
  },
  getOwnerBookings: async () => {
    const res = await api.get('/bookings/owner/all');
    return res.data;
  },
};

// -------------------------------------------------------------
// 5. PAYMENT SERVICE (RAZORPAY)
// -------------------------------------------------------------
export const paymentService = {
  createOrder: async (bookingId) => {
    const res = await api.post('/payment/create-order', { bookingId });
    return res.data;
  },
  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },
  getReceipt: async (bookingId) => {
    const res = await api.get(`/payment/receipt/${bookingId}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 6. REVIEW SERVICE
// -------------------------------------------------------------
export const reviewService = {
  add: async (turfId, data) => {
    const res = await api.post(`/reviews/${turfId}`, data);
    return res.data;
  },
  get: async (turfId, params) => {
    const res = await api.get(`/reviews/${turfId}`, { params });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 7. NOTIFICATION SERVICE
// -------------------------------------------------------------
export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
};

// -------------------------------------------------------------
// 8. ADMIN SERVICE
// -------------------------------------------------------------
export const adminService = {
  getUsers: async (params) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.put(`/admin/users/${id}/status`);
    return res.data;
  },
  getTurfs: async () => {
    const res = await api.get('/admin/turfs');
    return res.data;
  },
  approveTurf: async (id, isApproved) => {
    const res = await api.put(`/admin/turfs/${id}/approve`, { isApproved });
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },
  getBookings: async () => {
    const res = await api.get('/admin/bookings');
    return res.data;
  },
  getAds: async () => {
    // Return mock promo advertisements for Homepage banner
    return [
      {
        id: 'ad-1',
        title: 'Monsoon Kickoff: Flat 20% Off on Evening Soccer Slots!',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/search?sport=Football',
        isActive: true,
        placement: 'Homepage Top',
      }
    ];
  },
  getDashboard: async () => {
    const [analyticsRes, usersRes, turfsRes, bookingsRes, applicationsRes] = await Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/users'),
      api.get('/admin/turfs'),
      api.get('/admin/bookings'),
      api.get('/applications')
    ]);

    const statsData = analyticsRes.data.data?.stats || {};
    const users = usersRes.data.data || [];
    const turfs = turfsRes.data.data || [];
    const bookings = bookingsRes.data.data || [];
    const applications = applicationsRes.data.data || [];

    return {
      stats: {
        gmv: statsData.totalRevenue || 0,
        revenue: Math.round((statsData.totalRevenue || 0) * 0.10), // 10% commission
        totalTurfs: statsData.totalTurfs || 0,
        totalUsers: statsData.totalUsers || 0
      },
      users: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive
      })),
      turfs: turfs.map(t => ({
        _id: t._id,
        name: t.name,
        city: t.city,
        area: t.area,
        isApproved: t.isApproved,
        isFeatured: t.rating >= 4.7,
        images: t.images,
        owner: t.owner
      })),
      bookings: bookings.map(b => ({
        id: b._id,
        turfName: b.turf?.name || 'Sports Arena',
        userName: b.user?.name || 'Client',
        date: b.date,
        slots: [`${b.startTime} - ${b.endTime}`],
        advancePaid: Math.round(b.totalAmount * 0.20),
        remainingAmount: b.totalAmount - Math.round(b.totalAmount * 0.20),
        status: b.status
      })),
      applications: applications.map(app => ({
        _id: app._id,
        name: app.name || app.applicantName,
        email: app.email,
        phone: app.phone,
        businessName: app.businessName,
        turfAddress: app.turfAddress,
        status: app.status
      })),
      ads: [
        {
          _id: 'ad-1',
          title: 'Monsoon Kickoff: Flat 20% Off on Evening Soccer Slots!',
          imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          placement: 'Homepage Top',
          isActive: true
        }
      ],
      settings: {
        commission: 10,
        advancePercent: 20
      }
    };
  },
  approveOwner: async (appId) => {
    const res = await api.put(`/applications/${appId}/approve`);
    return res.data;
  },
  rejectOwner: async (appId, reason) => {
    const res = await api.put(`/applications/${appId}/reject`, { rejectionReason: reason });
    return res.data;
  },
  toggleUser: async (userId) => {
    const res = await api.put(`/admin/users/${userId}/status`);
    return res.data;
  },
  toggleTurfFeature: async (turfId) => {
    // Mock Toggle turf feature state
    return { success: true };
  },
  createAd: async (adData) => {
    return { success: true };
  },
  toggleAd: async (adId) => {
    return { success: true };
  },
  updateSettings: async (settingsData) => {
    return { success: true };
  }
};



// -------------------------------------------------------------
// 9. OWNER SERVICE
// -------------------------------------------------------------
export const ownerService = {
  apply: async (data) => {
    const res = await api.post('/auth/owner-apply', data);
    return res.data;
  },
  getDashboard: async (email) => {
    // Get owner's turfs and bookings
    const [turfsRes, bookingsRes] = await Promise.all([
      api.get('/turfs/owner/my-turfs'),
      api.get('/bookings/owner/all')
    ]);

    const turfs = turfsRes.data.data || [];
    const bookings = bookingsRes.data.data || [];

    // Calculate overview statistics
    const confirmedPaidBookings = bookings.filter(b => b.status === 'confirmed' || b.paymentStatus === 'paid');
    const totalRevenue = confirmedPaidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === todayStr).length;

    const activeTurfs = turfs.filter(t => t.isActive).length;

    const ratedTurfs = turfs.filter(t => t.rating > 0);
    const averageRating = ratedTurfs.length > 0 
      ? (ratedTurfs.reduce((sum, t) => sum + t.rating, 0) / ratedTurfs.length).toFixed(1)
      : '4.8';

    return {
      overview: {
        totalRevenue,
        todayBookings,
        activeTurfs,
        averageRating
      },
      bookings,
      turfs: turfs.map(t => ({
        id: t._id,
        name: t.name,
        description: t.description,
        city: t.city,
        area: t.area,
        address: t.address,
        pincode: t.rules || '',
        isActive: t.isActive,
        isApproved: t.isApproved,
        images: t.images && t.images.length > 0 ? t.images : ['https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=800&q=80'],
        pricing: {
          Football: t.pricePerHour,
          Cricket: t.pricePerHour + 200,
          Badminton: t.pricePerHour - 200,
        },
        sports: t.sports || ['Football', 'Cricket'],
        weeklySchedule: t.weeklySchedule || {
          mon: { open: '06:00', close: '22:00', isOpen: true },
          tue: { open: '06:00', close: '22:00', isOpen: true },
          wed: { open: '06:00', close: '22:00', isOpen: true },
          thu: { open: '06:00', close: '22:00', isOpen: true },
          fri: { open: '06:00', close: '22:00', isOpen: true },
          sat: { open: '06:00', close: '22:00', isOpen: true },
          sun: { open: '06:00', close: '22:00', isOpen: true },
        }
      }))
    };
  }
};

export default api;

