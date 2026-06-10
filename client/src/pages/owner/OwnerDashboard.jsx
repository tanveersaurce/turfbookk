import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ownerService, turfService } from '../../services/api';
import WeeklyScheduleBuilder from '../../components/turf/WeeklyScheduleBuilder';
import SlotBlocker from '../../components/turf/SlotBlocker';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  Landmark, 
  Check, 
  DollarSign, 
  Award, 
  Plus, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  Bell,
  Sliders,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  MapPin,
  Lock,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ["#00C853", "#2196F3", "#9C27B0", "#FF5722", "#F44336", "#009688", "#FF9800", "#607D8B"];

const getInitials = (name) => {
  if (!name) return 'O';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export default function OwnerDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // overview | manage | bookings | earnings
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for turf listing
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Bhopal');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [sportsSelected, setSportsSelected] = useState(['Football']);
  const [pricingFootball, setPricingFootball] = useState(800);
  const [pricingCricket, setPricingCricket] = useState(1000);
  const [pricingBadminton, setPricingBadminton] = useState(600);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const cities = ['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
  const availableSports = ['Football', 'Cricket', 'Box Cricket', 'Badminton', 'Basketball', 'Volleyball'];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await ownerService.getDashboard(user?.email || 'o1');
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCreateOrUpdateTurf = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const pricing = {};
    if (sportsSelected.includes('Football')) pricing.Football = Number(pricingFootball);
    if (sportsSelected.includes('Cricket') || sportsSelected.includes('Box Cricket')) pricing.Cricket = Number(pricingCricket);
    if (sportsSelected.includes('Badminton')) pricing.Badminton = Number(pricingBadminton);

    const turfPayload = {
      name,
      description,
      city,
      area,
      address,
      pincode,
      sports: sportsSelected,
      pricing,
    };

    try {
      if (editingTurf) {
        await turfService.update(editingTurf.id, turfPayload);
        setFormSuccess('Turf updated successfully!');
      } else {
        await turfService.create(turfPayload, user.email);
        setFormSuccess('Turf listing created! Admin approval is pending.');
      }
      
      // Refresh list
      fetchDashboardData();
      
      // Reset form
      setTimeout(() => {
        setShowAddForm(false);
        setEditingTurf(null);
        resetFormFields();
      }, 1500);

    } catch (err) {
      setFormError(err.message || 'Action failed.');
    }
  };

  const startEdit = (turf) => {
    setEditingTurf(turf);
    setName(turf.name);
    setDescription(turf.description);
    setCity(turf.city);
    setArea(turf.area);
    setAddress(turf.address);
    setPincode(turf.pincode);
    setSportsSelected(turf.sports);
    setPricingFootball(turf.pricing?.Football || 800);
    setPricingCricket(turf.pricing?.Cricket || 1000);
    setPricingBadminton(turf.pricing?.Badminton || 600);
    setShowAddForm(true);
  };

  const handleBlockSlotAction = async (turfId, blockData) => {
    try {
      await turfService.blockSlot(turfId, blockData);
      alert('Slot blocked successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Block failed.');
    }
  };

  const handleUpdateScheduleAction = async (turfId, schedule) => {
    try {
      await turfService.update(turfId, { weeklySchedule: schedule });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update schedule.');
    }
  };

  const toggleTurfActive = async (turf) => {
    try {
      await turfService.update(turf.id, { isActive: !turf.isActive });
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetFormFields = () => {
    setName('');
    setDescription('');
    setCity('Bhopal');
    setArea('');
    setAddress('');
    setPincode('');
    setSportsSelected(['Football']);
    setPricingFootball(800);
    setPricingCricket(1000);
    setPricingBadminton(600);
    setFormError('');
    setFormSuccess('');
  };

  const toggleSportSelection = (sportName) => {
    if (sportsSelected.includes(sportName)) {
      setSportsSelected(prev => prev.filter(s => s !== sportName));
    } else {
      setSportsSelected(prev => [...prev, sportName]);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] py-12 text-center">
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#5D7A00] mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading partner desk...</p>
        </div>
      </div>
    );
  }

  const { overview, bookings, turfs } = dashboardData;

  const userInitials = getInitials(user?.name);
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manage', label: 'My Arenas', icon: Settings },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col lg:flex-row text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-[#F1F5F9] border-r border-slate-200/80 flex flex-col justify-between p-6 shrink-0 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)]">
        <div className="space-y-8 flex flex-col h-full justify-between">
          <div className="space-y-8">
            {/* Logo/Branding */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                <Award className="w-5 h-5 text-[#AAEE00]" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 tracking-tight block">PARTNER DESK</span>
                <span className="text-[10px] text-[#5D7A00] font-black uppercase tracking-wider block">Turf Partner</span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id && !showAddForm;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setShowAddForm(false);
                      setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#AAEE00]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom actions (New Venue + Profile card) */}
          <div className="space-y-4 pt-6">
            <button
              onClick={() => {
                resetFormFields();
                setEditingTurf(null);
                setShowAddForm(true);
              }}
              className="w-full py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-slate-900 text-xs font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_12px_rgba(170,238,0,0.25)] border border-[#AAEE00]/50"
            >
              <Plus className="w-4 h-4 text-slate-900 stroke-[3px]" />
              <span>+ New Venue</span>
            </button>

            <div className="pt-4 border-t border-slate-200/60 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-[#AAEE00] flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800 truncate">{user?.name || 'Marcus Partner'}</span>
                <span className="block text-[10px] text-slate-400 font-semibold truncate">{user?.email || 'partner@turfbook.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto space-y-8">
        
        {/* Top welcome row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome back, {userFirstName}!</h1>
            <p className="text-xs text-slate-500 font-medium">Manage sports bookings, weekly schedules, off days, and earnings ledger reports.</p>
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

        {/* CONTENT TABS OR NEW VENUE FORM */}
        <AnimatePresence mode="wait">
          
          {showAddForm ? (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 max-w-2xl text-left"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {editingTurf ? 'Edit Arena details' : 'List a New Sports Turf'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Please provide correct location details and pricing grids.</p>
              </div>

              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-650 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrUpdateTurf} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Arena Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bernabeu Box Sports"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Arena Description</label>
                  <textarea 
                    rows={3}
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your court dimensions, artificial turf quality, cafe, floodlights etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] text-slate-800 font-medium resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">City</label>
                    <select 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-2xl px-3 py-3 text-xs text-slate-800 font-semibold focus:outline-none"
                    >
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Locality / Area</label>
                    <input 
                      type="text" 
                      value={area} 
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Arera Colony"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Physical Address</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street name, landmark details"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Pincode</label>
                    <input 
                      type="text" 
                      value={pincode} 
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="462001"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Supported Sports</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSports.map((sport) => {
                      const isSelected = sportsSelected.includes(sport);
                      return (
                        <button 
                          key={sport}
                          type="button"
                          onClick={() => toggleSportSelection(sport)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected 
                              ? 'bg-[#AAEE00]/10 border-[#AAEE00]/25 text-[#5D7A00]' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic pricing fields */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {sportsSelected.includes('Football') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Football (₹/hr)</label>
                      <input 
                        type="number" 
                        value={pricingFootball}
                        onChange={(e) => setPricingFootball(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                      />
                    </div>
                  )}
                  {(sportsSelected.includes('Cricket') || sportsSelected.includes('Box Cricket')) && (
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cricket (₹/hr)</label>
                      <input 
                        type="number" 
                        value={pricingCricket}
                        onChange={(e) => setPricingCricket(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                      />
                    </div>
                  )}
                  {sportsSelected.includes('Badminton') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Badminton (₹/hr)</label>
                      <input 
                        type="number" 
                        value={pricingBadminton}
                        onChange={(e) => setPricingBadminton(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] font-black rounded-xl text-xs shadow-md transition-all uppercase tracking-wider"
                  >
                    {editingTurf ? 'Save Edits' : 'Submit Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Earning</span>
                        <span className="block text-2xl font-black text-slate-800">₹{overview.totalRevenue}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                          +12%
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#AAEE00]/10 text-[#5D7A00] border border-[#AAEE00]/20 shadow-sm">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Bookings</span>
                        <span className="block text-2xl font-black text-slate-800">{overview.todayBookings}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                          +5%
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Listed Arenas</span>
                        <span className="block text-2xl font-black text-slate-800">{overview.activeTurfs}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                          Active
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                        <Settings className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Rating</span>
                        <span className="block text-2xl font-black text-slate-800">{overview.averageRating} ★</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-[#5D7A00]">
                          Top Rated
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Split Section: Chart + Peak Hours */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SVG Chart */}
                    <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Revenue Trend (30 Days)</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Monthly daily-earnings and platform payouts breakdown.</p>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-xl flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-[#5D7A00]" />
                          <span>Last 30 Days</span>
                        </div>
                      </div>

                      <div className="h-56 w-full relative pt-2">
                        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="ownerChartGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#AAEE00" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#AAEE00" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Horizontal Lines */}
                          <line x1="0" y1="180" x2="600" y2="180" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

                          {/* Area */}
                          <path 
                            d="M0,180 Q60,110 120,130 T240,70 T360,90 T480,40 T600,30 L600,180 L0,180 Z" 
                            fill="url(#ownerChartGlow)" 
                          />

                          {/* Line */}
                          <path 
                            d="M0,180 Q60,110 120,130 T240,70 T360,90 T480,40 T600,30" 
                            fill="none" 
                            stroke="#AAEE00" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />

                          {/* Dots */}
                          <circle cx="120" cy="130" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                          <circle cx="240" cy="70" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                          <circle cx="360" cy="90" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                          <circle cx="480" cy="40" r="5" fill="#20242B" stroke="#AAEE00" strokeWidth="2.5" />
                        </svg>
                      </div>

                      <div className="flex justify-between px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                      </div>
                    </div>

                    {/* Peak Hours dark-themed widget */}
                    <div className="p-6 bg-[#20242B] text-white rounded-3xl flex flex-col justify-between h-full shadow-lg border border-slate-800">
                      <div className="space-y-4">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-[#AAEE00]/20 text-[#AAEE00] text-[9px] font-bold uppercase tracking-wider rounded-md">Realtime usage</span>
                          <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-wider">Peak Hours Slots</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Most reserved playing hours across your courts.</p>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            { time: '06:00 PM - 08:00 PM', sport: 'Football', load: '98% Full' },
                            { time: '05:00 PM - 07:00 PM', sport: 'Box Cricket', load: '85% Full' },
                            { time: '08:00 AM - 10:00 AM', sport: 'Badminton', load: '80% Full' },
                            { time: '07:00 PM - 09:00 PM', sport: 'Cricket', load: '75% Full' },
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

                  {/* Bookings Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recent Turf Bookings</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Real-time status of player reservations for your arenas.</p>
                      </div>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No booking records found.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <th className="pb-3 pr-4">Player</th>
                              <th className="pb-3 px-4">Arena Name</th>
                              <th className="pb-3 px-4">Sport</th>
                              <th className="pb-3 px-4">Date & Slots</th>
                              <th className="pb-3 px-4 text-right">Amount</th>
                              <th className="pb-3 pl-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {bookings.slice(0, 6).map((booking) => {
                              const initials = booking.userId ? booking.userId.substring(0, 2).toUpperCase() : 'GU';
                              return (
                                <tr key={booking._id || booking.id} className="hover:bg-slate-55 transition-colors">
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

              {/* TAB 2: MANAGE ARENAS */}
              {activeTab === 'manage' && (
                <motion.div
                  key="manage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {turfs.map((turf) => (
                      <div key={turf.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 hover:border-slate-200 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                          <div className="flex items-center space-x-4 min-w-0">
                            <img src={turf.images?.[0] || 'https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=300&q=80'} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-2.5 truncate">
                                <span className="truncate">{turf.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                  turf.isApproved 
                                    ? 'bg-green-50 border border-green-100 text-[#5D7A00]' 
                                    : 'bg-amber-50 border border-amber-100 text-amber-600'
                                }`}>
                                  {turf.isApproved ? 'Approved' : 'Pending Approval'}
                                </span>
                              </h3>
                              <span className="block text-xs text-slate-400 font-semibold mt-0.5">{turf.area}, {turf.city}</span>
                            </div>
                          </div>

                          {/* Fast Actions */}
                          <div className="flex space-x-2 self-start sm:self-auto">
                            <button 
                              onClick={() => startEdit(turf)}
                              className="p-2.5 border border-slate-200 hover:border-[#5D7A00]/50 hover:bg-[#AAEE00]/5 text-slate-500 hover:text-[#5D7A00] rounded-xl transition-all shadow-sm bg-white flex items-center space-x-1"
                              title="Edit Basic Info"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-[10px] font-bold">Edit Details</span>
                            </button>
                            <button 
                              onClick={() => toggleTurfActive(turf)}
                              className="p-2.5 border border-slate-200 hover:border-[#5D7A00]/50 hover:bg-[#AAEE00]/5 text-slate-500 hover:text-[#5D7A00] rounded-xl transition-all shadow-sm bg-white flex items-center space-x-1"
                              title={turf.isActive ? 'Deactivate Listing' : 'Activate Listing'}
                            >
                              {turf.isActive ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-[#5D7A00]" />
                                  <span className="text-[10px] font-bold text-[#5D7A00]">Active</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-400">Offline</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Schedule builder & slot blocker if approved */}
                        {turf.isApproved && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-left">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-sm">
                              <WeeklyScheduleBuilder 
                                initialSchedule={turf.weeklySchedule} 
                                onSave={(sched) => handleUpdateScheduleAction(turf.id, sched)} 
                              />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 shadow-sm">
                              <SlotBlocker 
                                onBlock={(blockData) => handleBlockSlotAction(turf.id, blockData)} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {turfs.length === 0 && (
                      <div className="p-10 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-slate-800">No Arenas Listed</h3>
                        <p className="text-xs text-slate-405 mt-1">You have no listed turf venues. List a venue using "+ New Venue" to begin booking operations.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: BOOKINGS */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 text-left">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">All Arena Bookings Ledger</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Complete record list of reservations, cancellations, and advance earnings.</p>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-400">No bookings found for your listed venues.</p>
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
                          {bookings.map((booking) => {
                            const initials = booking.userId ? booking.userId.substring(0, 2).toUpperCase() : 'GU';
                            return (
                              <tr key={booking._id || booking.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 pr-4 flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                                    {initials}
                                  </div>
                                  <span className="font-semibold text-slate-805 truncate max-w-[120px]">{booking.userId || 'Guest User'}</span>
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
                                    <span className="text-[10px] text-slate-404 font-semibold">{(booking.slots || []).join(', ')}</span>
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
                </motion.div>
              )}

              {/* TAB 4: EARNINGS & WALLET */}
              {activeTab === 'earnings' && (
                <motion.div
                  key="earnings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Wallet Balance Card */}
                  <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between h-60 text-left">
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Settlement Wallet Balance</span>
                      <span className="block text-3xl font-black text-slate-800">₹{overview.totalRevenue}</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Available for immediate withdrawal to your linked bank account.</span>
                    </div>

                    <button 
                      onClick={() => alert('Withdrawal request of ₹' + overview.totalRevenue + ' submitted to bank successfully.')}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] text-xs font-black rounded-2xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Withdraw Funds to Bank
                    </button>
                  </div>

                  {/* Simulated Ledger transactions */}
                  <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm text-left">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Settlement & Payouts History</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Track past bank settlements and withdrawal ledger updates.</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: 'SET-9827364', date: 'May 28, 2026', amount: 320 },
                        { id: 'SET-7236254', date: 'May 24, 2026', amount: 100 },
                      ].map((txn) => (
                        <div key={txn.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                          <div>
                            <span className="block text-slate-800 font-bold">Fund Settled (#{txn.id})</span>
                            <span className="block text-[10px] text-slate-400 font-semibold">{txn.date}</span>
                          </div>
                          <span className="text-[#5D7A00] font-black text-sm">+₹{txn.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

        </AnimatePresence>

      </main>

    </div>
  );
}
