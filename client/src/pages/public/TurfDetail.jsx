import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { turfService, reviewService, userService } from '../../services/api';
import { initiateBooking } from '../../store/bookingSlice';
import useSocket from '../../hooks/useSocket';
import { MapPin, Star, ShieldAlert, BadgeCheck, CheckCircle2, ChevronRight, Heart, Share2, Wifi, Car, Coffee, Lock, Plus, ShowerHead, Camera, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getAmenityIcon = (name) => {
    const n = name.toLowerCase();
    const iconClass = "w-6 h-6 text-[#AAEE00]";
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

  // Description Toggle
  const [showMore, setShowMore] = useState(false);

  // Booking states
  const [selectedSport, setSelectedSport] = useState('football');
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  
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

  // Dynamic Open/Closed check
  const isOpenNow = () => {
    if (!turf || !turf.operatingHours) return false;
    const openTime = turf.operatingHours.open || '06:00';
    const closeTime = turf.operatingHours.close || '22:00';
    const now = new Date();
    const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentStr >= openTime && currentStr <= closeTime;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse text-left">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-slate-200 rounded-lg w-1/4"></div>
        {/* Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 h-[500px] bg-slate-200 rounded-3xl"></div>
          <div className="md:col-span-4 grid grid-cols-2 gap-4 h-[500px]">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
        {/* Info Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="h-10 bg-slate-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-slate-200 rounded-3xl"></div>
              <div className="h-32 bg-slate-200 rounded-3xl"></div>
            </div>
          </div>
          <div className="lg:col-span-4 h-[450px] bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-lg text-center space-y-6 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#1A1A1A]">Arena Not Found</h2>
            <p className="text-sm text-slate-400 font-medium">{error || 'The requested venue profiles does not exist or has been removed.'}</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="w-full py-3.5 bg-[#AAEE00] hover:bg-[#88CC00] text-[#1A1A1A] font-bold rounded-2xl text-sm transition-all focus:outline-none"
          >
            Back to Venues
          </button>
        </div>
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
    <div className="bg-gradient-to-b from-[#F8F9FA] to-[#FFFFFF] text-slate-800 font-inter min-h-screen py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Bar */}
        <nav className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 py-2">
          <Link to="/" className="hover:text-[#AAEE00] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/search" className="hover:text-[#AAEE00] transition-colors">Venues</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="hover:text-[#AAEE00] transition-colors cursor-pointer capitalize">{turf.city || 'Bhopal'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-600 font-bold truncate max-w-[200px]">{turf.name}</span>
        </nav>

        {/* 1. GALLERY CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 h-[500px] rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-200 relative group">
            <img 
              src={activeImage} 
              alt={turf.name} 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out" 
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <div className="md:col-span-4 grid grid-cols-2 gap-4 h-[500px]">
            {galleryImages.slice(1, 5).map((img, idx) => {
              const isActive = activeImage === img;
              return (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer border border-slate-100 bg-slate-200 transition-all duration-300 ${
                    isActive ? 'ring-3 ring-[#AAEE00]' : 'hover:brightness-110 hover:scale-[1.03]'
                  }`}
                >
                  <img src={img} alt="Gallery thumb" className="w-full h-full object-cover" />
                  {idx === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-2 p-2 rounded-2xl">
                      <Camera className="w-5 h-5 text-white" />
                      <span className="text-[11px] font-black tracking-wider uppercase text-center leading-tight">
                        View All {turf.images?.length || 5} Photos
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Details) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2">
              <div className="space-y-4">
                {/* Tag pills */}
                <div className="flex flex-wrap gap-2">
                  {turf.sports?.map((s) => (
                    <span key={s} className="px-3 py-1 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl font-black text-[#1A1A1A] leading-tight tracking-[-0.5px]">{turf.name}</h1>
                
                <div className="flex flex-col space-y-2.5">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="w-5 h-5 text-[#AAEE00]" />
                    <span className="font-semibold">{turf.address}, {turf.city}</span>
                    <span className="text-slate-300">|</span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(turf.name + ' ' + turf.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#AAEE00] font-bold hover:underline"
                    >
                      Get Directions
                    </a>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                      <span className="text-[#1A1A1A] font-black text-[20px]">{turf.rating || '4.9'}</span>
                      <span className="text-slate-400 font-semibold">({reviewsToRender.length} Reviews)</span>
                    </div>
                    
                    <span className="px-3 py-1 bg-[#AAEE00]/10 border border-[#AAEE00]/20 text-[#88CC00] font-bold rounded-full text-[11px] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-[#AAEE00] text-white" />
                      <span>Verified Venue</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end space-y-2 self-start sm:self-auto">
                <div className="flex items-center space-x-2.5">
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all active:scale-95 focus:outline-none"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleFavoriteToggle}
                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-95 focus:outline-none ${
                      isFavourited 
                        ? 'bg-red-50 border-red-100 text-red-500' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                    title={isFavourited ? 'Unfavorite' : 'Favorite'}
                  >
                    <Heart className={`w-5 h-5 ${isFavourited ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
                <button className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors underline focus:outline-none self-end">
                  Report Issue
                </button>
              </div>
            </div>

            {/* Quick nav tabs */}
            <div className="sticky top-20 z-40 bg-white border-b border-[#E5E7EB] px-6 py-4 -mx-6 flex space-x-8 text-sm font-bold text-slate-400 shadow-sm scroll-mt-24">
              <a href="#overview" className="text-[#AAEE00] border-b-2.5 border-[#AAEE00] pb-4 -mb-4 transition-colors">Overview</a>
              <a href="#amenities" className="hover:text-[#1A1A1A] transition-colors pb-4 -mb-4">Amenities</a>
              <a href="#reviews" className="hover:text-[#1A1A1A] transition-colors pb-4 -mb-4">Reviews</a>
              <a href="#location" className="hover:text-[#1A1A1A] transition-colors pb-4 -mb-4">Location</a>
            </div>

            {/* Description */}
            <div id="overview" className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/60 space-y-4 text-left">
              <h3 className="text-[18px] font-black text-[#1A1A1A]">About This Arena</h3>
              <div className="text-sm text-slate-600 leading-[1.8] font-medium">
                {showMore ? turf.description : `${turf.description?.slice(0, 250) || ''}...`}
              </div>
              {turf.description?.length > 250 && (
                <button 
                  onClick={() => setShowMore(!showMore)}
                  className="text-[#AAEE00] font-black text-xs hover:underline uppercase tracking-wider focus:outline-none"
                >
                  {showMore ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>

            {/* Details boxes (Hours & Rules) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Operating Hours */}
              <div className="p-8 bg-white border-l-4 border-[#AAEE00] rounded-3xl shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5 text-[#1A1A1A] font-black text-base">
                    <Clock className="w-5 h-5 text-[#AAEE00]" />
                    <span>Operating Hours</span>
                  </div>
                  {isOpenNow() ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Open Now</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>Closed</span>
                    </span>
                  )}
                </div>
                <div className="space-y-3 text-xs font-bold text-slate-600 divide-y divide-slate-100 pt-2">
                  <div className="flex justify-between pb-2">
                    <span>Mon - Fri</span> 
                    <span className="text-slate-800 font-extrabold">{formatTime12H(turf.operatingHours?.open || '08:00')} - {formatTime12H(turf.operatingHours?.close || '23:00')}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span>Sat - Sun</span> 
                    <span className="text-slate-800 font-extrabold">07:00 AM - 01:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Venue Rules */}
              <div className="p-8 bg-white border-l-4 border-[#FFD700] rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 text-[#1A1A1A] font-black text-base">
                  <Shield className="w-5 h-5 text-[#FFD700]" />
                  <span>Venue Rules</span>
                </div>
                <ul className="text-xs font-bold text-slate-600 space-y-2.5">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#FFD700] text-sm mt-0.5">⚠️</span>
                    <span>Spikes/Cleats are strictly prohibited on the turf.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#FFD700] text-sm mt-0.5">⚠️</span>
                    <span>No food, chewing gum, or sugary drinks on turf surface.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#FFD700] text-sm mt-0.5">⚠️</span>
                    <span>Please reach the venue 10 mins prior to your booking.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 bg-[#FFD700]/10 text-[#B8860B] font-bold rounded-lg text-[10px] uppercase tracking-wide">
                    Policy: Free Cancellation 24h before slots
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div id="amenities" className="space-y-6 scroll-mt-24">
              <h3 className="text-[18px] font-black text-[#1A1A1A]">What's Included</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {turf.amenities?.map((amenity, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-[#AAEE00]/60 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#AAEE00]/15 flex items-center justify-center text-[#AAEE00]">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">{amenity}</span>
                  </div>
                ))}
                {(!turf.amenities || turf.amenities.length === 0) && (
                  <p className="text-xs text-slate-400 font-semibold col-span-full">No specific amenities configured.</p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="space-y-8 scroll-mt-24">
              <div className="flex justify-between items-center">
                <h3 className="text-[18px] font-black text-[#1A1A1A]">User Reviews</h3>
                <span className="text-xs font-bold text-[#AAEE00] hover:underline cursor-pointer">Write a Review</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Score */}
                <div className="sm:col-span-4 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center space-y-3">
                  <h4 className="text-[64px] font-black text-[#1A1A1A] leading-none">{turf.rating || '4.9'}</h4>
                  <div className="flex items-center justify-center space-x-1 text-[#FFD700] text-lg">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="block text-xs font-bold text-slate-400">Based on {reviewsToRender.length} reviews</span>
                </div>
                {/* Progress bars */}
                <div className="sm:col-span-8 space-y-3 text-xs font-bold text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 text-slate-600">5</span>
                    <div className="flex-1 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#AAEE00] to-[#7BC800] h-full w-[85%] rounded-full"></div>
                    </div>
                    <span className="w-8 text-right text-slate-400">85%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 text-slate-600">4</span>
                    <div className="flex-1 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#AAEE00] to-[#7BC800] h-full w-[10%] rounded-full"></div>
                    </div>
                    <span className="w-8 text-right text-slate-400">10%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 text-slate-600">3</span>
                    <div className="flex-1 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#AAEE00] to-[#7BC800] h-full w-[5%] rounded-full"></div>
                    </div>
                    <span className="w-8 text-right text-slate-400">5%</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsToRender.map((rev, idx) => {
                  const reviewerName = rev.user && typeof rev.user === 'object' ? rev.user.name : (rev.user || 'Anonymous');
                  const reviewDate = rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently');
                  return (
                    <div key={idx} className="p-8 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm text-left hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100">
                            <img src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt={reviewerName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#1A1A1A]">{reviewerName}</span>
                            <span className="block text-[11px] text-slate-400 font-bold mt-0.5">{reviewDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 text-[#FFD700] text-sm">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <span key={starIdx} className={starIdx < (rev.rating || 5) ? 'text-[#FFD700]' : 'text-slate-200'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-[1.7]">{rev.comment}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                        <span className="cursor-pointer hover:text-slate-600">Helpful? 👍 12</span>
                        <span className="px-2.5 py-0.5 bg-[#AAEE00]/10 text-[#88CC00] rounded-full">
                          ✓ Verified Booking
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dummy map target */}
            <div id="location" className="scroll-mt-24 pt-2"></div>

          </div>

          {/* Right Column: Sticky Booking Widget (Dark theme!) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#1E222B] rounded-3xl p-8 shadow-2xl space-y-6 text-white text-left border border-white/5">
              {/* Header: Price & Badge */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="block text-[28px] font-black text-[#AAEE00] leading-none">
                    ₹{selectedSportPrice} 
                    <span className="text-xs font-semibold text-slate-400 ml-1">/ hour</span>
                  </span>
                </div>
                <span className="px-3 py-1 bg-[#FFD700] text-[#1A1A1A] font-black rounded-full text-[10px] uppercase tracking-wide flex items-center space-x-1 shadow-sm">
                  <span>⚡</span>
                  <span>High Demand</span>
                </span>
              </div>

              {/* Sport Selector */}
              <div className="space-y-2 relative">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Sport</label>
                
                {/* Backdrop overlay to close dropdown on clicking outside */}
                {sportDropdownOpen && (
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setSportDropdownOpen(false)}
                  />
                )}

                <div className="relative z-50">
                  <button 
                    type="button"
                    onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                    className={`w-full px-4 py-3 bg-[#12141C] border rounded-xl text-xs font-extrabold capitalize transition-all flex items-center justify-between focus:outline-none ${
                      sportDropdownOpen 
                        ? 'border-[#AAEE00] text-[#AAEE00] shadow-sm' 
                        : 'border-white/5 text-slate-200 hover:border-white/20'
                    }`}
                  >
                    <span>{selectedSport}</span>
                    <svg 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${sportDropdownOpen ? 'rotate-180 text-[#AAEE00]' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {sportDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-[#12141C] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden"
                      >
                        <div className="py-1 divide-y divide-white/5 max-h-48 overflow-y-auto no-scrollbar">
                          {[...new Set(turf.sports || [])].map((s) => {
                            const isSelected = selectedSport === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setSelectedSport(s);
                                  setSportDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left text-xs font-extrabold capitalize transition-all flex items-center justify-between focus:outline-none ${
                                  isSelected 
                                    ? 'bg-[#AAEE00]/10 text-[#AAEE00]' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <span>{s}</span>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-[#AAEE00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date Selector Carousel */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Date</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {dateCarousel.map((d, idx) => {
                    const isSelected = bookingDate === d.dateString;
                    return (
                      <button
                        key={d.dateString}
                        type="button"
                        onClick={() => setBookingDate(d.dateString)}
                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all focus:outline-none ${
                          isSelected 
                            ? 'bg-[#AAEE00] text-[#1A1A1A] font-black shadow-md' 
                            : 'bg-[#12141C] border border-white/5 text-slate-400 hover:border-[#AAEE00]/35 hover:text-white'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold leading-none">
                          {idx === 0 ? 'Today' : d.dayName}
                        </span>
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
                    <span className="w-2 h-2 rounded-full bg-[#AAEE00] inline-block"></span>
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
                        classes += "bg-[#12141C] text-white/15 border-transparent line-through cursor-not-allowed";
                      } else if (isLocked) {
                        classes += "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse cursor-not-allowed";
                      } else if (isSelected) {
                        classes += "bg-[#AAEE00] border-[#AAEE00] text-[#1A1A1A] font-black shadow-md shadow-[#AAEE00]/20";
                      } else {
                        classes += "bg-[#12141C] border-[#AAEE00]/20 text-[#AAEE00] hover:border-[#AAEE00]/50 hover:bg-[#AAEE00]/5";
                      }

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={isBooked || isLocked}
                          onClick={() => handleSlotClick(slot)}
                          className={classes}
                        >
                          {isLocked ? '🔒 Locked' : formatTime12H(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Calculations and Price Breakdown */}
              <AnimatePresence>
                {selectedSlots.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-3 pt-4 border-t border-white/5 text-xs font-semibold text-slate-400"
                  >
                    <div className="flex justify-between">
                      <span>Base Fare ({totalHours} Hour{totalHours > 1 ? 's' : ''})</span>
                      <span className="text-white font-extrabold">₹{baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lighting Fees</span>
                      <span className="text-white font-extrabold">₹{lightingFees}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-3 text-sm font-black text-slate-200">
                      <span>Total Amount</span>
                      <span className="text-[#AAEE00] font-black text-lg">₹{totalAmount}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Action button */}
              <button
                onClick={handleProceedToBook}
                disabled={selectedSlots.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#AAEE00] to-[#88CC00] text-[#1A1A1A] font-black rounded-2xl text-xs uppercase tracking-wider transition-all hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#AAEE00]/30 flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Book Now &rarr;
              </button>

              <div className="flex justify-between text-[10px] text-slate-500 font-bold border-t border-white/5 pt-4">
                <span>🔒 Secure Payment</span>
                <span>✓ Free Cancellation</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
