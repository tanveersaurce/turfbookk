import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { turfService, reviewService } from '../../services/api';
import { initiateBooking } from '../../store/bookingSlice';
import useSocket from '../../hooks/useSocket';
import { MapPin, Star, ShieldAlert, BadgeCheck, CheckCircle2, ChevronRight, Heart, Share2, Wifi, Car, Coffee, Lock, Plus, ShowerHead } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getAmenityIcon = (name) => {
    const n = name.toLowerCase();
    const iconClass = "w-6 h-6 text-slate-800";
    if (n.includes('wifi') || n.includes('internet')) return <Wifi className={iconClass} />;
    if (n.includes('parking') || n.includes('valet')) return <Car className={iconClass} />;
    if (n.includes('cafeteria') || n.includes('cafe') || n.includes('food') || n.includes('canteen')) return <Coffee className={iconClass} />;
    if (n.includes('locker')) return <Lock className={iconClass} />;
    if (n.includes('first aid') || n.includes('medical') || n.includes('aid')) return <Plus className={iconClass} />;
    if (n.includes('shower') || n.includes('washroom') || n.includes('changing')) return <ShowerHead className={iconClass} />;
    return <BadgeCheck className={iconClass} />;
  };

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);

  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery
  const [activeImage, setActiveImage] = useState('');
  const [isFavourited, setIsFavourited] = useState(false);

  // Booking states
  const [selectedSport, setSelectedSport] = useState('football');
  
  // Date Carousel
  const getNext5Days = () => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      days.push({
        dateString,
        dayNum: d.getDate(),
        dayName: weekdayNames[d.getDay()],
      });
    }
    return days;
  };
  const dateCarousel = getNext5Days();
  const [bookingDate, setBookingDate] = useState(dateCarousel[0].dateString);

  // Slots
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Socket
  const { 
    lockedSlots, 
    realtimeBookedSlots, 
    realtimeCancelledSlots, 
    lockSlot, 
    unlockSlot 
  } = useSocket(id, bookingDate);

  // Reviews
  const [dbReviews, setDbReviews] = useState([]);
  const mockReviews = [
    { id: 1, user: 'Marcus Chen', rating: 5, comment: 'Best turf in the city! The shock absorption is really noticeable, my knees felt great even after a 2-hour high-intensity game. The floodlights are bright and even, no dark spots at all.', date: '2 days ago' },
    { id: 2, user: 'Pooja Nair', rating: 4, comment: 'Clean washrooms and spacious parking. The cafe could have more options.', date: '5 days ago' },
  ];

  useEffect(() => {
    const fetchTurf = async () => {
      setLoading(true);
      try {
        const response = await turfService.getTurfById(id);
        if (response.success && response.data) {
          const turfData = response.data;
          setTurf(turfData);
          setActiveImage(turfData.images?.[0] || '');
          setSelectedSport(turfData.sports?.[0] || 'football');
        } else {
          setError(response.message || 'Failed to retrieve turf detail.');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve turf detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchTurf();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !bookingDate) return;
      setSlotsLoading(true);
      try {
        const response = await turfService.getSlots(id, bookingDate);
        setSlots(response.data || []);
        setSelectedSlots([]); // Clear selections on date change
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, bookingDate]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewService.get(id);
        setDbReviews(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user?.favorites && turf) {
      const turfId = turf.id || turf._id;
      setIsFavourited(user.favorites.some(fav => (fav._id || fav) === turfId));
    }
  }, [user, turf]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
        <p className="text-xs text-slate-400 mt-3 font-semibold">Loading venue profiles...</p>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-red-500 text-lg font-bold">Error Loading Arena</div>
        <p className="text-xs text-slate-400 mt-2 font-medium">{error || 'Arena does not exist.'}</p>
      </div>
    );
  }

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login'));
      return;
    }
    const turfId = turf.id || turf._id;
    try {
      if (isFavourited) {
        await userService.removeFavorite(turfId);
        setIsFavourited(false);
      } else {
        await userService.addFavorite(turfId);
        setIsFavourited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Convert "HH:MM" to "08:00 AM" formatting
  const formatTime12H = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hours12 = h % 12 || 12;
    const minutesStr = m.toString().padStart(2, '0');
    return `${hours12.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  };

  const isSlotSocketLocked = (slot) => {
    return lockedSlots.some(ls => ls.slotId === `${slot.startTime}-${slot.endTime}`);
  };

  const handleSlotClick = (slot) => {
    const slotStr = `${slot.startTime} - ${slot.endTime}`;
    if (selectedSlots.includes(slotStr)) {
      setSelectedSlots(prev => prev.filter(s => s !== slotStr));
      unlockSlot(`${slot.startTime}-${slot.endTime}`);
    } else {
      setSelectedSlots(prev => [...prev, slotStr]);
      lockSlot(`${slot.startTime}-${slot.endTime}`, user?.id || 'guest');
    }
  };

  const selectedSportPrice = turf.pricePerHour || 800;
  const totalHours = selectedSlots.length;
  const baseFare = totalHours * selectedSportPrice;
  const lightingFees = totalHours * (turf.lightingFees || 150);
  const totalAmount = baseFare + lightingFees;
  const advancePayment = Math.round(totalAmount * 0.20);
  const remainingPayment = totalAmount - advancePayment;

  const handleProceedToBook = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot to proceed.');
      return;
    }

    // Convert selectedSlots strings back to slot objects for Checkout and BookingSummary
    const slotsObjects = selectedSlots.map(slotStr => {
      const [start, end] = slotStr.split(' - ');
      return {
        startTime: start,
        endTime: end,
        price: selectedSportPrice
      };
    });

    // Save booking parameters to Redux Store
    dispatch(initiateBooking({
      turfId: turf.id || turf._id,
      turfName: turf.name,
      sport: selectedSport,
      date: bookingDate,
      slots: slotsObjects,
      pricing: selectedSportPrice,
      totalAmount,
      advancePaid: advancePayment,
      remainingAmount: remainingPayment
    }));

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login'));
    } else {
      navigate('/checkout');
    }
  };

  const reviewsToRender = dbReviews.length > 0 ? dbReviews : mockReviews;

  // Gallery grid setup
  const galleryImages = [
    activeImage,
    turf.images?.[1] || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
    turf.images?.[2] || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=400&q=80',
    turf.images?.[3] || 'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=400&q=80',
    turf.images?.[4] || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <div className="bg-[#FAFBFD] text-slate-800 font-inter min-h-screen py-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. GALLERY CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 h-80 sm:h-[450px] rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-200">
            <img src={activeImage} alt={turf.name} className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 gap-3 h-80 sm:h-[450px]">
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveImage(img)}
                className="relative rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm group bg-slate-200"
              >
                <img src={img} alt="Gallery thumb" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                {idx === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-black tracking-wider uppercase">
                    +12 Photos
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Details) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="space-y-2.5">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{turf.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#5D7A00]" />
                    <span>{turf.address}, {turf.city}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#FFC107]">
                    <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                    <span className="text-slate-800 font-bold">{turf.rating || '4.9'}</span>
                    <span className="text-slate-400">({reviewsToRender.length} Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors focus:outline-none"
                >
                  <Share2 className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={handleFavoriteToggle}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors focus:outline-none ${
                    isFavourited 
                      ? 'bg-red-50 border-red-100 text-red-500' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Heart className={`w-4.5 h-4.5 ${isFavourited ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick nav tabs */}
            <div className="flex space-x-6 border-b border-slate-200 pb-3 text-sm font-bold text-slate-400">
              <span className="text-[#5D7A00] border-b-2 border-[#5D7A00] pb-3 cursor-pointer">Overview</span>
              <span className="hover:text-slate-700 cursor-pointer">Amenities</span>
              <span className="hover:text-slate-700 cursor-pointer">Reviews</span>
              <span className="hover:text-slate-700 cursor-pointer">Location</span>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">Description</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {turf.description}
              </p>
              {/* Sport pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {turf.sports?.map((s) => (
                  <span key={s} className="px-3 py-1 bg-[#1E293B] text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Details boxes (Hours & Rules) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Operating Hours */}
              <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 text-[#5D7A00] font-extrabold text-sm">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>Operating Hours</span>
                </div>
                <div className="space-y-2 text-xs font-bold text-slate-600">
                  <div className="flex justify-between"><span>Mon - Fri</span> <span className="text-slate-800">08:00 - 23:00</span></div>
                  <div className="flex justify-between"><span>Sat - Sun</span> <span className="text-slate-800">07:00 - 01:00</span></div>
                </div>
              </div>

              {/* Venue Rules */}
              <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 text-[#5D7A00] font-extrabold text-sm">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                  <span>Venue Rules</span>
                </div>
                <ul className="text-xs font-bold text-slate-500 list-disc pl-4 space-y-1.5">
                  <li>Spikes/Cleats are strictly prohibited.</li>
                  <li>No food allowed on the turf surface.</li>
                  <li>Cancellations required 24h in advance.</li>
                </ul>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {turf.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white border border-slate-100 shadow-sm text-center space-y-2">
                    {getAmenityIcon(amenity)}
                    <span className="text-xs font-bold text-slate-700">{amenity}</span>
                  </div>
                ))}
                {(!turf.amenities || turf.amenities.length === 0) && (
                  <p className="text-xs text-muted">No specific amenities configured.</p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">User Reviews</h3>
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Write a Review</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score */}
                <div className="md:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center space-y-2">
                  <h4 className="text-5xl font-black text-slate-900 leading-none">{turf.rating || '4.9'}</h4>
                  <div className="flex items-center justify-center space-x-0.5 text-[#FFC107]">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="block text-xs font-bold text-slate-400">{reviewsToRender.length} Reviews</span>
                </div>
                {/* Progress bars */}
                <div className="md:col-span-8 space-y-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span className="w-2">5</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#5D7A00] h-full w-[85%]"></div>
                    </div>
                    <span className="w-8 text-right">85%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2">4</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#5D7A00] h-full w-[10%]"></div>
                    </div>
                    <span className="w-8 text-right">10%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2">3</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#5D7A00] h-full w-[3%]"></div>
                    </div>
                    <span className="w-8 text-right">3%</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsToRender.map((rev, idx) => {
                  const reviewerName = rev.user && typeof rev.user === 'object' ? rev.user.name : (rev.user || 'Anonymous');
                  const reviewDate = rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently');
                  return (
                    <div key={idx} className="p-5 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm text-left">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt={reviewerName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">{reviewerName}</span>
                            <span className="block text-[10px] text-slate-400 font-bold">{reviewDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 text-[#FFC107] text-xs">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <span key={starIdx} className={starIdx < (rev.rating || 5) ? 'text-[#FFC107]' : 'text-slate-200'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{rev.comment}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget (Dark theme!) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#1E222B] rounded-3xl p-6 shadow-2xl space-y-6 text-white text-left">
              {/* Header: Price & Badge */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-[24px] font-black text-primary leading-none">₹{selectedSportPrice} <span className="text-xs font-semibold text-slate-400">/ hour</span></span>
                </div>
                <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary font-black rounded-lg text-[9px] uppercase tracking-wider">
                  Popular
                </span>
              </div>

              {/* Sport Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Sport</label>
                <div className="flex gap-2">
                  {turf.sports?.map((s) => (
                    <button 
                      key={s}
                      type="button"
                      onClick={() => setSelectedSport(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold capitalize transition-all border focus:outline-none ${
                        selectedSport === s 
                          ? 'bg-primary border-primary text-black' 
                          : 'bg-[#12141C] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector Carousel */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Date</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {dateCarousel.map((d) => {
                    const isSelected = bookingDate === d.dateString;
                    return (
                      <button
                        key={d.dateString}
                        type="button"
                        onClick={() => setBookingDate(d.dateString)}
                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all focus:outline-none ${
                          isSelected 
                            ? 'bg-primary text-black font-black' 
                            : 'bg-[#12141C] border border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold leading-none">{d.dayName}</span>
                        <span className="text-sm font-extrabold leading-none mt-1">{d.dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Slots</label>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold">Selected</span>
                  </div>
                </div>

                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-[#12141C] border border-white/5 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const slotStr = `${slot.startTime} - ${slot.endTime}`;
                      const isSelected = selectedSlots.includes(slotStr);
                      const isLocked = isSlotSocketLocked(slot);
                      const isBooked = slot.isBooked || realtimeBookedSlots.includes(`${slot.startTime}-${slot.endTime}`);

                      let classes = "py-2.5 rounded-xl text-[10px] font-extrabold text-center transition-all border focus:outline-none ";
                      
                      if (isBooked) {
                        classes += "bg-[#12141C] text-white/20 border-transparent line-through cursor-not-allowed";
                      } else if (isLocked) {
                        classes += "bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse cursor-not-allowed";
                      } else if (isSelected) {
                        classes += "bg-primary border-primary text-black";
                      } else {
                        classes += "bg-[#12141C] border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5";
                      }

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={isBooked || isLocked}
                          onClick={() => handleSlotClick(slot)}
                          className={classes}
                        >
                          {isLocked ? 'Locked' : formatTime12H(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Calculations and Price Breakdown */}
              {selectedSlots.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/5 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Fare ({totalHours} Hour{totalHours > 1 ? 's' : ''})</span>
                    <span className="text-white font-extrabold">₹{baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lighting Fees</span>
                    <span className="text-white font-extrabold">₹{lightingFees}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-black text-slate-200">
                    <span>Total</span>
                    <span className="text-primary font-black text-base">₹{totalAmount}</span>
                  </div>
                </div>
              )}

              {/* CTA Action button */}
              <button
                onClick={handleProceedToBook}
                className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/15 flex items-center justify-center focus:outline-none"
              >
                Book Now
              </button>

              <span className="block text-[9px] text-slate-500 text-center font-bold">
                No payment required until you arrive at the venue.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
