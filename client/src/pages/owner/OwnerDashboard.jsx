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
  Clock,
  AlertCircle,
  X
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

const defaultImages = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80'
];

const sportsList = [
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'box_cricket', label: 'Box Cricket', emoji: '🎯' },
  { id: 'badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' }
];

const amenitiesList = [
  { id: 'parking', label: 'Parking', emoji: '🅿️' },
  { id: 'washroom', label: 'Washroom', emoji: '🚾' },
  { id: 'changing', label: 'Changing Room', emoji: '👕' },
  { id: 'cafeteria', label: 'Cafeteria', emoji: '☕' },
  { id: 'water', label: 'Water Cooler', emoji: '💧' },
  { id: 'first_aid', label: 'First Aid', emoji: '🏥' },
  { id: 'floodlights', label: 'Floodlights', emoji: '💡' },
  { id: 'wifi', label: 'Free WiFi', emoji: '📶' },
  { id: 'rental', label: 'Rental Equip', emoji: '🎫' },
  { id: 'coaching', label: 'Coaching', emoji: '🎓' }
];

const convertTo24Hour = (timeStr) => {
  if (!timeStr) return '06:00';
  const parts = timeStr.split(' ');
  if (parts.length < 2) return timeStr;
  const time = parts[0];
  const modifier = parts[1];
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

export default function OwnerDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tb_owner_active_tab') || 'overview';
  });
  const [showAddForm, setShowAddForm] = useState(() => {
    return localStorage.getItem('tb_owner_show_add_form') === 'true';
  });

  const getDraft = () => {
    try {
      return JSON.parse(localStorage.getItem('tb_owner_draft_venue') || '{}');
    } catch {
      return {};
    }
  };

  const draft = getDraft();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stepper state
  const [formStep, setFormStep] = useState(draft.formStep !== undefined ? draft.formStep : 1);

  // Form states for turf listing
  const [editingTurf, setEditingTurf] = useState(null);

  const [name, setName] = useState(draft.name || '');
  const [description, setDescription] = useState(draft.description || '');
  const [city, setCity] = useState(draft.city || 'Bhopal');
  const [area, setArea] = useState(draft.area || '');
  const [address, setAddress] = useState(draft.address || '');
  const [pincode, setPincode] = useState(draft.pincode || '');
  const [landmark, setLandmark] = useState(draft.landmark || '');
  const [sportsSelected, setSportsSelected] = useState(draft.sportsSelected || ['football']);
  const [weekdayPrice, setWeekdayPrice] = useState(draft.weekdayPrice !== undefined ? draft.weekdayPrice : 1200);
  const [weekendPrice, setWeekendPrice] = useState(draft.weekendPrice !== undefined ? draft.weekendPrice : 1500);
  const [openTime, setOpenTime] = useState(draft.openTime || '06:00 AM');
  const [closeTime, setCloseTime] = useState(draft.closeTime || '11:00 PM');
  const [open24x7, setOpen24x7] = useState(draft.open24x7 !== undefined ? draft.open24x7 : false);
  const [advancePercent, setAdvancePercent] = useState(draft.advancePercent !== undefined ? draft.advancePercent : 20);
  const [amenitiesSelected, setAmenitiesSelected] = useState(draft.amenitiesSelected || []);
  const [rules, setRules] = useState(draft.rules || '');
  const [cancellationPolicy, setCancellationPolicy] = useState(draft.cancellationPolicy !== undefined ? draft.cancellationPolicy : true);
  const [uploadedPhotos, setUploadedPhotos] = useState(draft.uploadedPhotos || []);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const cities = ['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

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

  useEffect(() => {
    localStorage.setItem('tb_owner_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('tb_owner_show_add_form', showAddForm);
  }, [showAddForm]);

  useEffect(() => {
    if (showAddForm && !editingTurf) {
      const draftObj = {
        name,
        description,
        city,
        area,
        address,
        pincode,
        landmark,
        sportsSelected,
        weekdayPrice,
        weekendPrice,
        openTime,
        closeTime,
        open24x7,
        advancePercent,
        amenitiesSelected,
        rules,
        cancellationPolicy,
        uploadedPhotos,
        formStep
      };
      localStorage.setItem('tb_owner_draft_venue', JSON.stringify(draftObj));
    }
  }, [
    showAddForm,
    editingTurf,
    name,
    description,
    city,
    area,
    address,
    pincode,
    landmark,
    sportsSelected,
    weekdayPrice,
    weekendPrice,
    openTime,
    closeTime,
    open24x7,
    advancePercent,
    amenitiesSelected,
    rules,
    cancellationPolicy,
    uploadedPhotos,
    formStep
  ]);

  const validateStep = (step) => {
    setFormError('');
    setFormSuccess('');

    if (step === 1) {
      if (!name || !name.trim()) {
        setFormError('Please enter a Turf Name.');
        return false;
      }
      if (!description || !description.trim()) {
        setFormError('Please enter a Description.');
        return false;
      }
      if (description.trim().length < 20) {
        setFormError('Description must be at least 20 characters long.');
        return false;
      }
    }

    if (step === 2) {
      if (!city) {
        setFormError('Please select a City.');
        return false;
      }
      if (!area || !area.trim()) {
        setFormError('Please enter a Locality / Area.');
        return false;
      }
      if (!pincode || !pincode.trim()) {
        setFormError('Please enter a Pincode.');
        return false;
      }
      if (!/^\d{6}$/.test(pincode.trim())) {
        setFormError('Pincode must be exactly 6 digits.');
        return false;
      }
      if (!address || !address.trim()) {
        setFormError('Please enter the Full Address.');
        return false;
      }
    }

    if (step === 3) {
      if (sportsSelected.length === 0) {
        setFormError('Please select at least one sport.');
        return false;
      }
      if (!weekdayPrice || Number(weekdayPrice) <= 0) {
        setFormError('Please enter a valid Weekday Pricing (greater than 0).');
        return false;
      }
      if (!weekendPrice || Number(weekendPrice) <= 0) {
        setFormError('Please enter a valid Weekend Pricing (greater than 0).');
        return false;
      }
    }

    if (step === 5) {
      if (uploadedPhotos.length === 0) {
        setFormError('Please upload at least one photo of your turf.');
        return false;
      }
    }

    return true;
  };

  const handleCreateOrUpdateTurf = async (e) => {
    e.preventDefault();

    // Validate all steps from 1 to 5
    for (let step = 1; step <= 5; step++) {
      if (!validateStep(step)) {
        setFormStep(step);
        return;
      }
    }

    setFormError('');
    setFormSuccess('');

    // Map selected sports to supported enum values
    const sports = sportsSelected.map(s => {
      if (s === 'box_cricket') return 'cricket';
      if (s === 'volleyball') return 'tennis';
      return s;
    }).filter(s => ['football', 'cricket', 'basketball', 'badminton', 'tennis'].includes(s));

    if (sports.length === 0) {
      setFormError('Please select at least one supported sport (Football, Cricket, Badminton, Basketball).');
      return;
    }

    const fullStreetAddress = landmark 
      ? `${address} (Landmark: ${landmark})`
      : address;

    const turfPayload = {
      name,
      description,
      city,
      area,
      address: fullStreetAddress,
      pincode,
      sports,
      pricePerHour: Number(weekdayPrice) || 1200,
      amenities: amenitiesSelected,
      rules,
      images: uploadedPhotos.length > 0 ? uploadedPhotos : defaultImages,
      location: { lat: 23.2599, lng: 77.4126 }, // Default coordinates
      operatingHours: {
        open: open24x7 ? '00:00' : convertTo24Hour(openTime),
        close: open24x7 ? '23:59' : convertTo24Hour(closeTime)
      }
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
    setPincode(turf.pincode || '');
    
    // Map sports back
    setSportsSelected(turf.sports || []);
    setWeekdayPrice(turf.pricePerHour || 1200);
    setWeekendPrice((turf.pricePerHour || 1200) + 200);
    
    const mapTo12Hour = (time24) => {
      if (!time24) return '06:00 AM';
      const parts = time24.split(':');
      if (parts.length < 2) return '06:00 AM';
      const hrs = parseInt(parts[0], 10);
      const minutes = parts[1];
      const modifier = hrs >= 12 ? 'PM' : 'AM';
      const formattedHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      return `${String(formattedHrs).padStart(2, '0')}:${minutes} ${modifier}`;
    };
    
    setOpenTime(mapTo12Hour(turf.operatingHours?.open));
    setCloseTime(mapTo12Hour(turf.operatingHours?.close));
    setOpen24x7(turf.operatingHours?.open === '00:00' && turf.operatingHours?.close === '23:59');
    
    setAmenitiesSelected(turf.amenities || []);
    setRules(turf.rules || '');
    setUploadedPhotos(turf.images || []);
    setFormStep(1);
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
    localStorage.removeItem('tb_owner_draft_venue');
    localStorage.removeItem('tb_owner_show_add_form');
    setName('');
    setDescription('');
    setCity('Bhopal');
    setArea('');
    setAddress('');
    setPincode('');
    setLandmark('');
    setSportsSelected(['football']);
    setWeekdayPrice(1200);
    setWeekendPrice(1500);
    setOpenTime('06:00 AM');
    setCloseTime('11:00 PM');
    setOpen24x7(false);
    setAdvancePercent(20);
    setAmenitiesSelected([]);
    setRules('');
    setCancellationPolicy(true);
    setUploadedPhotos([]);
    setFormStep(1);
    setFormError('');
    setFormSuccess('');
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
    { id: 'earnings', label: 'Earnings', icon: Landmark }
  ];

  const steps = [
    { num: 1, label: 'Info' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Sports' },
    { num: 4, label: 'Rules' },
    { num: 5, label: 'Photos' }
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
              className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-8 max-w-3xl text-left"
            >
              {/* Stepper Header Block */}
              <div className="flex items-center justify-between max-w-lg mx-auto mb-8 relative">
                <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
                {steps.map((s) => {
                  const isCompleted = formStep > s.num;
                  const isActive = formStep === s.num;
                  return (
                    <div key={s.num} className="flex flex-col items-center space-y-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-100' 
                          : isActive 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200' 
                            : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3px]" /> : s.num}
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-650 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrUpdateTurf} className="space-y-6">
                
                {/* STEP 1: BASIC INFO */}
                {formStep === 1 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Step 1: Basic Information</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tell players all about your court, synthetic grass quality, and matches.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Turf Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elite Arena"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-semibold text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Description</label>
                      <textarea 
                        rows={5}
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell players about your turf, the vibe, and special features..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-medium text-slate-800 resize-none"
                        required
                      />
                      <div className="text-right text-[10px] text-slate-400 font-bold">
                        {description.length}/1000
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION */}
                {formStep === 2 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Step 2: Location Details</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Accurate venue location details help players find you easily.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">City</label>
                        <select 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs text-slate-800 font-semibold focus:outline-none"
                        >
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Area</label>
                        <input 
                          type="text" 
                          value={area} 
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g. Bandra West"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Pincode</label>
                        <input 
                          type="text" 
                          value={pincode} 
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="400050"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Landmark</label>
                        <input 
                          type="text" 
                          value={landmark} 
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Metro Station"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Address</label>
                      <textarea 
                        rows={3}
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Shop No, Building Name, Street..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-medium text-slate-800 resize-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: SPORTS & PRICING */}
                {formStep === 3 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Step 3: Sports & Pricing</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Select playing sports, hour rates, operating hours and advance limits.</p>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 block">Select Sports Offered</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {sportsList.map((sport) => {
                          const isSelected = sportsSelected.includes(sport.id);
                          return (
                            <button
                              key={sport.id}
                              type="button"
                              onClick={() => {
                                if (sportsSelected.includes(sport.id)) {
                                  setSportsSelected(prev => prev.filter(x => x !== sport.id));
                                } else {
                                  setSportsSelected(prev => [...prev, sport.id]);
                                }
                              }}
                              className={`p-4 rounded-2xl border transition-all flex items-center space-x-3 text-xs font-bold ${
                                isSelected 
                                  ? 'bg-[#AAEE00]/10 border-[#AAEE00]/30 text-[#5D7A00] shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-lg">{sport.emoji}</span>
                              <span>{sport.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Weekday Pricing (₹/hr)</label>
                        <input 
                          type="number" 
                          value={weekdayPrice} 
                          onChange={(e) => setWeekdayPrice(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none font-bold text-slate-800"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Weekend Pricing (₹/hr)</label>
                        <input 
                          type="number" 
                          value={weekendPrice} 
                          onChange={(e) => setWeekendPrice(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none font-bold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700">Operating Hours</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Open 24x7</span>
                          <button
                            type="button"
                            onClick={() => setOpen24x7(!open24x7)}
                            className="focus:outline-none"
                          >
                            {open24x7 ? (
                              <ToggleRight className="w-8 h-8 text-[#5D7A00]" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-slate-300" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {!open24x7 && (
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={openTime}
                            onChange={(e) => setOpenTime(e.target.value)}
                            className="bg-slate-50 border border-slate-205 rounded-2xl px-3 py-3 text-xs text-slate-800 font-semibold focus:outline-none"
                          >
                            {['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM'].map(t => <option key={t} value={t}>Opens at: {t}</option>)}
                          </select>
                          <select
                            value={closeTime}
                            onChange={(e) => setCloseTime(e.target.value)}
                            className="bg-slate-50 border border-slate-205 rounded-2xl px-3 py-3 text-xs text-slate-800 font-semibold focus:outline-none"
                          >
                            {['09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '02:00 AM'].map(t => <option key={t} value={t}>Closes at: {t}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">Advance Payment %</span>
                        <span className="text-[#5D7A00]">Advance to be paid: ₹{Math.round((weekdayPrice * advancePercent) / 100)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={advancePercent} 
                        onChange={(e) => setAdvancePercent(Number(e.target.value))}
                        className="w-full accent-[#5D7A00] h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-black">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: AMENITIES & RULES */}
                {formStep === 4 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Step 4: Amenities & Rules</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle facilities offered at the turf and configure arena guidelines.</p>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 block">Select Amenities Offered</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {amenitiesList.map((amenity) => {
                          const isSelected = amenitiesSelected.includes(amenity.label);
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => {
                                if (amenitiesSelected.includes(amenity.label)) {
                                  setAmenitiesSelected(prev => prev.filter(x => x !== amenity.label));
                                } else {
                                  setAmenitiesSelected(prev => [...prev, amenity.label]);
                                }
                              }}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1.5 text-[9px] font-black uppercase text-center ${
                                isSelected 
                                  ? 'bg-[#AAEE00]/10 border-[#AAEE00]/30 text-[#5D7A00] shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-xl mb-0.5">{amenity.emoji}</span>
                              <span className="truncate w-full">{amenity.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Rules & Regulations</label>
                      <textarea 
                        rows={4}
                        value={rules} 
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="e.g. Non-marking shoes only, No smoking..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5D7A00] font-medium text-slate-800 resize-none"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-850">Cancellation Policy</span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">Allow users to cancel up to 24 hours before</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCancellationPolicy(!cancellationPolicy)}
                        className="focus:outline-none"
                      >
                        {cancellationPolicy ? (
                          <ToggleRight className="w-8 h-8 text-[#5D7A00]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-350" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: PHOTOS */}
                {formStep === 5 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Step 5: Photos</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload high-resolution images of your turf to grab attention.</p>
                    </div>

                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-2.5 text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUploadedPhotos(prev => [...prev, reader.result]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 shadow-inner">
                        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Click or Drag to Upload Photos</span>
                        <span className="block text-[9px] text-slate-400 font-bold mt-0.5">High quality images increase bookings by 40%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(uploadedPhotos.length > 0 ? uploadedPhotos : defaultImages).map((photo, index) => (
                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                          <img src={photo} className="w-full h-full object-cover" alt="Uploaded Turf" />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#5D7A00] text-white text-[8px] font-black uppercase rounded-md shadow-md">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-650 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Wizard Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                  {formStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep(prev => prev - 1)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { resetFormFields(); setShowAddForm(false); }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  )}

                  {formStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep(formStep)) {
                          setFormStep(prev => prev + 1);
                        }
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] font-black rounded-xl text-xs transition-all uppercase tracking-wider"
                    >
                      Next
                    </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-slate-900 font-black rounded-xl text-xs shadow-md transition-all uppercase tracking-wider"
                      >
                        {editingTurf ? 'Submit Edits' : 'Submit for Approval 🚀'}
                      </button>
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5">*Your turf will be reviewed by an admin within 24 hours.</span>
                    </div>
                  )}
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

                  {/* Split Section */}
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
                          
                          <line x1="0" y1="180" x2="600" y2="180" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

                          <path 
                            d="M0,180 Q60,110 120,130 T240,70 T360,90 T480,40 T600,30 L600,180 L0,180 Z" 
                            fill="url(#ownerChartGlow)" 
                          />

                          <path 
                            d="M0,180 Q60,110 120,130 T240,70 T360,90 T480,40 T600,30" 
                            fill="none" 
                            stroke="#AAEE00" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />

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
                        <p className="text-xs text-slate-405">No booking records found.</p>
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
                      <div key={turf.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 hover:border-slate-200 transition-all text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                              <span className="block text-xs text-slate-405 font-semibold mt-0.5">{turf.area}, {turf.city}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 self-start sm:self-auto">
                            <button 
                              onClick={() => startEdit(turf)}
                              className="p-2.5 border border-slate-200 hover:border-[#5D7A00]/50 hover:bg-[#AAEE00]/5 text-slate-550 hover:text-[#5D7A00] rounded-xl transition-all shadow-sm bg-white flex items-center space-x-1"
                              title="Edit Basic Info"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-[10px] font-bold">Edit Details</span>
                            </button>
                            <button 
                              onClick={() => toggleTurfActive(turf)}
                              className="p-2.5 border border-slate-200 hover:border-[#5D7A00]/50 hover:bg-[#AAEE00]/5 text-slate-550 hover:text-[#5D7A00] rounded-xl transition-all shadow-sm bg-white flex items-center space-x-1"
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

                        {turf.isApproved && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
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
                                  <span className="font-semibold text-slate-850 truncate max-w-[120px]">{booking.userId || 'Guest User'}</span>
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
                                    <span className="text-[10px] text-slate-400 font-semibold">{(booking.slots || []).join(', ')}</span>
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
