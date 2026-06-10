import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminService } from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  Image as ImageIcon, 
  Settings, 
  Check, 
  X, 
  Megaphone, 
  Save, 
  TrendingUp, 
  AlertCircle, 
  Percent, 
  Bell, 
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  Lock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ["#00C853", "#2196F3", "#9C27B0", "#FF5722", "#F44336", "#009688", "#FF9800", "#607D8B"];

const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // overview | owners | users | ads | settings
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Ad Form
  const [adTitle, setAdTitle] = useState('');
  const [adImage, setAdImage] = useState('');
  const [adLink, setAdLink] = useState('#');
  const [adPlacement, setAdPlacement] = useState('Homepage Top');
  const [adSuccess, setAdSuccess] = useState(false);

  // Settings Forms
  const [commission, setCommission] = useState(10);
  const [advancePercent, setAdvancePercent] = useState(20);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboard();
      setAdminData(data);
      setCommission(data.settings?.commission || 10);
      setAdvancePercent(data.settings?.advancePercent || 20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveOwner = async (appId) => {
    try {
      await adminService.approveOwner(appId);
      alert('Owner application approved! Account is activated.');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectOwner = async (e) => {
    e.preventDefault();
    try {
      await adminService.rejectOwner(rejectingAppId, rejectionReason);
      alert('Application rejected.');
      setRejectingAppId(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUser(userId);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleTurfFeature = async (turfId) => {
    try {
      await adminService.toggleTurfFeature(turfId);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveTurf = async (turfId) => {
    try {
      await adminService.approveTurf(turfId);
      alert('Turf venue approved successfully! It is now visible to users.');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!adTitle || !adImage) {
      alert('Please fill in required fields.');
      return;
    }
    try {
      await adminService.createAd({
        title: adTitle,
        imageUrl: adImage,
        linkUrl: adLink,
        placement: adPlacement,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setAdSuccess(true);
      setAdTitle('');
      setAdImage('');
      fetchAdminData();
      setTimeout(() => setAdSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAd = async (adId) => {
    try {
      await adminService.toggleAd(adId);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSettings({
        commission: Number(commission),
        advancePercent: Number(advancePercent)
      });
      setSettingsSuccess(true);
      fetchAdminData();
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] py-12 text-center">
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#5D7A00] mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading root console...</p>
        </div>
      </div>
    );
  }

  const { stats, applications, turfs, users, bookings, ads } = adminData;
  const pendingApps = applications.filter(a => a.status === 'pending');

  const userInitials = getInitials(user?.name);
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Admin';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'owners', label: 'Partner Queue', icon: UserCheck, badge: pendingApps.length },
    { id: 'users', label: 'Users & Venues', icon: Users },
    { id: 'ads', label: 'Ad Manager', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col lg:flex-row text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-[#F1F5F9] border-r border-slate-200/80 flex flex-col justify-between p-6 shrink-0 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)]">
        <div className="space-y-8">
          {/* Logo/Branding inside Admin Panel */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5 text-[#AAEE00]" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-800 tracking-tight block">ROOT CONSOLE</span>
              <span className="text-[10px] text-[#5D7A00] font-black uppercase tracking-wider block">Super Admin</span>
            </div>
          </div>

          {/* Tab Navigation links */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#AAEE00]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card at bottom of sidebar */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-[#AAEE00] flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-slate-800 truncate">{user?.name || 'Marcus Root'}</span>
            <span className="block text-[10px] text-slate-400 font-semibold truncate">{user?.email || 'admin@turfbook.com'}</span>
          </div>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT PANEL */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
        
        {/* Top welcome row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome back, {userFirstName}!</h1>
            <p className="text-xs text-slate-500 font-medium">Control approvals, user access lists, promotional ads, and commission parameters.</p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Calendar pill */}
            <div className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-2 shadow-sm">
              <Calendar className="w-4 h-4 text-[#5D7A00]" />
              <span>{currentDate}</span>
            </div>

            {/* Notification bell */}
            <button className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-[#AAEE00] shadow-md transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-slate-900"></span>
            </button>
          </div>
        </div>

        {/* TAB RENDERING */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Platform GMV</span>
                    <span className="block text-2xl font-black text-slate-800">₹{stats.gmv}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                      +18%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#AAEE00]/10 text-[#5D7A00] border border-[#AAEE00]/20 shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Revenue</span>
                    <span className="block text-2xl font-black text-slate-800">₹{stats.revenue}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                      +10%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Turf Arenas</span>
                    <span className="block text-2xl font-black text-slate-800">{stats.totalTurfs}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                      Active
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
                    <span className="block text-2xl font-black text-slate-800">{stats.totalUsers}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                      +12%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Split details section: Chart (2/3) + Peak Hours (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Area line chart */}
                <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Revenue Breakdown (30 Days)</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Daily platform sales and billing volumes.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-xl flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5D7A00]" />
                      <span>Last 30 Days</span>
                    </div>
                  </div>

                  <div className="h-56 w-full relative pt-2">
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="adminChartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#AAEE00" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#AAEE00" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Horizontal lines */}
                      <line x1="0" y1="180" x2="600" y2="180" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Area */}
                      <path 
                        d="M0,180 Q60,130 120,150 T240,90 T360,110 T480,50 T600,60 L600,180 L0,180 Z" 
                        fill="url(#adminChartGlow)" 
                      />

                      {/* Path */}
                      <path 
                        d="M0,180 Q60,130 120,150 T240,90 T360,110 T480,50 T600,60" 
                        fill="none" 
                        stroke="#AAEE00" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                      />

                      {/* Dots */}
                      <circle cx="120" cy="150" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                      <circle cx="240" cy="90" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                      <circle cx="360" cy="110" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                      <circle cx="480" cy="50" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                    </svg>
                  </div>

                  <div className="flex justify-between px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>

                {/* Dark peak hours card */}
                <div className="p-6 bg-[#20242B] text-white rounded-3xl flex flex-col justify-between h-full shadow-lg border border-slate-800">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-[#AAEE00]/20 text-[#AAEE00] text-[9px] font-bold uppercase tracking-wider rounded-md">Usage Stats</span>
                      <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-wider">Peak Booking Hours</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Most active slots across all registered arenas.</p>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { time: '05:00 PM - 07:00 PM', sport: 'Football', load: '95% Peak' },
                        { time: '07:00 PM - 09:00 PM', sport: 'Cricket', load: '90% Peak' },
                        { time: '08:00 AM - 10:00 AM', sport: 'Badminton', load: '80% Peak' },
                        { time: '06:00 PM - 08:00 PM', sport: 'Box Cricket', load: '75% Peak' },
                      ].map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors">
                          <div>
                            <span className="block font-bold text-white">{s.time}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold">{s.sport}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[#AAEE00]/10 text-[#AAEE00] text-[9px] font-black">{s.load}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent bookings table */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recent Platform Transactions</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Real-time status of recent bookings across India.</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Player</th>
                          <th className="pb-3 px-4">Arena</th>
                          <th className="pb-3 px-4">Sport</th>
                          <th className="pb-3 px-4">Date & Slots</th>
                          <th className="pb-3 px-4 text-right">Amount</th>
                          <th className="pb-3 pl-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {bookings.slice(0, 8).map((booking) => {
                          const initials = booking.userId ? booking.userId.substring(0, 2).toUpperCase() : 'GU';
                          return (
                            <tr key={booking._id || booking.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 pr-4 flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                                  {initials}
                                </div>
                                <span className="font-semibold text-slate-800 truncate max-w-[120px]">{booking.userId || 'Guest User'}</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">{booking.turfName || 'Sports Arena'}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-[#AAEE00]/10 border border-[#AAEE00]/20 text-[#5D7A00] text-[10px] font-bold uppercase">
                                  {booking.sport}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">
                                <div className="flex flex-col space-y-0.5">
                                  <span className="font-semibold">{booking.date}</span>
                                  <span className="text-[10px] text-slate-400">{(booking.slots || []).join(', ')}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right text-slate-800 font-bold">
                                <div className="space-y-0.5">
                                  <span>₹{booking.totalAmount}</span>
                                  <span className="block text-[9px] text-slate-400 font-normal">Paid: ₹{booking.advancePaid}</span>
                                </div>
                              </td>
                              <td className="py-3.5 pl-4 text-right">
                                {booking.status?.toLowerCase() === 'confirmed' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 border border-green-100 text-[#5D7A00] text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
                                ) : booking.status?.toLowerCase() === 'cancelled' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-500 text-[10px] font-bold uppercase tracking-wider">{booking.status || 'Pending'}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: PARTNER QUEUE */}
          {activeTab === 'owners' && (
            <motion.div
              key="owners"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Owner Approval Queue</h2>
                <p className="text-xs text-slate-500 font-medium">Approve new turf owners to enable listing creations on TurfBook.</p>
              </div>

              {pendingApps.length === 0 ? (
                <div className="p-10 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
                  <p className="text-xs text-slate-400 mt-1">No pending partner applications found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApps.map((app) => (
                    <div key={app._id || app.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-extrabold text-slate-800">{app.businessName}</h4>
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600 text-[8px] font-black uppercase">Pending Review</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-500 font-semibold">
                          <p>Owner: <span className="text-slate-800">{app.name}</span> ({app.email})</p>
                          <p>Phone: <span className="text-slate-800">{app.phone}</span></p>
                          <p className="text-[11px] text-[#5D7A00] font-bold">Turf Address: {app.turfAddress}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => handleApproveOwner(app._id || app.id)}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => setRejectingAppId(app._id || app.id)}
                          className="px-4 py-2 border border-red-100 hover:bg-red-50 text-red-500 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: USERS & VENUES */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Platform Users Panel */}
              <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Registered Accounts</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Activate or temporarily suspend user accounts.</p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                  {users.map(u => (
                    <div key={u._id || u.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="block font-bold text-slate-800">{u.name}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold">{u.email} | Role: <span className="text-slate-600 font-bold capitalize">{u.role}</span></span>
                      </div>
                      <button
                        onClick={() => handleToggleUser(u._id || u.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          u.isActive 
                            ? 'border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100' 
                            : 'bg-red-50 border-red-100 text-red-600 font-bold'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manage Arenas Panel */}
              <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Sports Arenas</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Review and approve listings or toggle featured badges.</p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                  {turfs.map(t => (
                    <div key={t._id || t.id} className="py-3.5 flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-4">
                        <span className="block font-extrabold text-slate-800 flex items-center space-x-2 truncate">
                          <span className="truncate">{t.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                            t.isApproved 
                              ? 'bg-green-50 border border-green-100 text-[#5D7A00]' 
                              : 'bg-amber-50 border border-amber-100 text-amber-600'
                          }`}>
                            {t.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold truncate">{t.area}, {t.city}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {!t.isApproved && (
                          <button
                            onClick={() => handleApproveTurf(t._id || t.id)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] font-black rounded-xl text-[9px] transition-all shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleTurfFeature(t._id || t.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold border transition-all text-[10px] ${
                            t.isFeatured 
                              ? 'bg-[#AAEE00]/10 border-[#AAEE00]/20 text-[#5D7A00]' 
                              : 'border-slate-200 text-slate-500 hover:text-[#5D7A00] hover:bg-[#AAEE00]/5 hover:border-[#AAEE00]/20'
                          }`}
                        >
                          {t.isFeatured ? '★ Featured' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AD MANAGER */}
          {activeTab === 'ads' && (
            <motion.div
              key="ads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Ad Creation Form */}
              <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#5D7A00]" />
                    <span>Publish Banner Ad</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Post dynamic banners directly onto the home page.</p>
                </div>

                {adSuccess && (
                  <div className="p-3 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs flex items-center space-x-2 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Ad banner published!</span>
                  </div>
                )}

                <form onSubmit={handleCreateAd} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Banner Ad Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Monsoon Tournament Open!"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] placeholder-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Banner Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/.../ad.jpg"
                      value={adImage}
                      onChange={(e) => setAdImage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] placeholder-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Placement Area</label>
                    <select 
                      value={adPlacement}
                      onChange={(e) => setAdPlacement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs text-slate-850 font-semibold focus:outline-none focus:border-[#5D7A00]"
                    >
                      <option>Homepage Top</option>
                      <option>Homepage Mid Section</option>
                      <option>Sidebar</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] font-black rounded-2xl text-xs transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15)] uppercase tracking-wider"
                  >
                    Publish Banner Now
                  </button>
                </form>
              </div>

              {/* Active Ads List */}
              <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Active Ad Banners</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Banners currently rotated in placement frames.</p>
                </div>

                <div className="space-y-4">
                  {ads.map(ad => (
                    <div key={ad._id || ad.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={ad.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-800 truncate">{ad.title}</span>
                          <span className="block text-[10px] text-slate-450 font-semibold mt-0.5">Placement: {ad.placement}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleAd(ad._id || ad.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          ad.isActive 
                            ? 'bg-green-50 border-green-100 text-[#5D7A00]' 
                            : 'border-slate-200 text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}

                  {ads.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-400">No ad banners listed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-lg"
            >
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Global Configuration</h2>
                <p className="text-xs text-slate-500 font-medium">Manage transaction commission fee percentages and default parameter grids.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5">
                {settingsSuccess && (
                  <div className="p-3 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs flex items-center space-x-2 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Platform settings saved!</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Percent className="w-3.5 h-3.5 text-[#5D7A00]" />
                      <span>Commission %</span>
                    </label>
                    <input 
                      type="number" 
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-bold focus:outline-none focus:border-[#5D7A00]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Percent className="w-3.5 h-3.5 text-[#5D7A00]" />
                      <span>Advance Payment %</span>
                    </label>
                    <input 
                      type="number" 
                      value={advancePercent}
                      onChange={(e) => setAdvancePercent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-bold focus:outline-none focus:border-[#5D7A00]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">SMS Confirmation Template</label>
                  <div className="relative">
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 resize-none cursor-not-allowed font-medium"
                      value="Hi {user}, your booking at {turf} for {date} is CONFIRMED. Present this QR at entry."
                      disabled
                    />
                    <Lock className="absolute right-4 bottom-4 w-4 h-4 text-slate-400" />
                  </div>
                  <span className="block text-[10px] text-slate-400 italic">Locked. Contact system administrator for templates changes.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow-md uppercase tracking-wider"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Rejection Review Modal */}
        <AnimatePresence>
          {rejectingAppId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl relative text-left"
              >
                <button 
                  onClick={() => setRejectingAppId(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleRejectOwner} className="space-y-4 pt-2">
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">Rejection Review</h3>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-650 uppercase">Reason for application rejection</label>
                    <textarea
                      rows={3}
                      placeholder="Specify why partner application is denied (e.g. Invalid business registration documents, invalid physical address)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setRejectingAppId(null)} 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
