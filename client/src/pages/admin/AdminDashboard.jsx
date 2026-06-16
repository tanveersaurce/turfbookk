import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Megaphone, 
  Settings, 
  Bell, 
  Calendar,
  FileText
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Import refactored child components
import DashboardOverview from '../../components/admin/DashboardOverview';
import PartnerQueue from '../../components/admin/PartnerQueue';
import UsersVenuesList from '../../components/admin/UsersVenuesList';
import AdManager from '../../components/admin/AdManager';
import SettingsPanel from '../../components/admin/SettingsPanel';

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

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tb_admin_active_tab') || 'overview';
  });
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboard();
      setAdminData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    localStorage.setItem('tb_admin_active_tab', activeTab);
  }, [activeTab]);

  const handleApproveOwner = async (appId) => {
    try {
      await adminService.approveOwner(appId);
      alert('Owner application approved! Account is activated.');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectOwner = async (appId, reason) => {
    try {
      await adminService.rejectOwner(appId, reason);
      alert('Application rejected.');
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

  const handleCreateAd = async (adData) => {
    try {
      await adminService.createAd({
        ...adData,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchAdminData();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
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

  const handleSaveSettings = async (settingsData) => {
    try {
      await adminService.updateSettings({
        commission: Number(settingsData.commission),
        advancePercent: Number(settingsData.advancePercent)
      });
      fetchAdminData();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  // Safe Loading Guard: prevents rendering children before data is loaded
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

  const { applications, turfs, users, bookings, ads } = adminData;
  const pendingApps = applications.filter(a => a.status === 'pending');

  const userInitials = getInitials(user?.name);
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Admin';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'owners', label: 'Partner Queue', icon: UserCheck, badge: pendingApps.length },
    { id: 'applications', label: 'Partner Applications', icon: FileText, badge: pendingApps.length, path: '/admin/applications' },
    { id: 'users', label: 'User Management', icon: Users },
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

              if (tab.path) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                );
              }

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
          {activeTab === 'overview' && (
            <DashboardOverview 
              stats={adminData.stats} 
              bookings={bookings} 
            />
          )}

          {activeTab === 'owners' && (
            <PartnerQueue 
              applications={applications} 
              handleApproveOwner={handleApproveOwner} 
              handleRejectOwner={handleRejectOwner}
            />
          )}

          {activeTab === 'users' && (
            <UsersVenuesList 
              users={users} 
              handleToggleUser={handleToggleUser} 
            />
          )}

          {activeTab === 'ads' && (
            <AdManager 
              ads={ads} 
              handleCreateAd={handleCreateAd} 
              handleToggleAd={handleToggleAd}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel 
              initialCommission={adminData.settings?.commission || 10} 
              initialAdvancePercent={adminData.settings?.advancePercent || 20} 
              handleSaveSettings={handleSaveSettings}
            />
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
