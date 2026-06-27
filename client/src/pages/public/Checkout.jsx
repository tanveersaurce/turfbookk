import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearBooking } from '../../store/bookingSlice';
import { bookingService, paymentService, turfService } from '../../services/api';
import useRazorpay from '../../hooks/useRazorpay';
import QRCode from '../../components/booking/QRCode';
import { 
  Calendar, 
  Clock, 
  Timer, 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  ArrowLeft, 
  Info, 
  Lock, 
  Tag, 
  Check, 
  CreditCard, 
  Landmark, 
  QrCode,
  Zap,
  RefreshCw,
  Headphones,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const { currentBooking } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = useRazorpay();

  // Payment methods: razorpay | card | upi
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  
  // Checkout flow: payment | loading | confirmed
  const [step, setStep] = useState('payment'); 
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  // Turf details from backend
  const [turf, setTurf] = useState(null);

  // Reservation countdown timer (10 mins in seconds = 600)
  const [timeLeft, setTimeLeft] = useState(600);

  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [discount, setDiscount] = useState(0);

  // Customer details states
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || 'Tanveer Chauhan');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'tanveer@example.com');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98765 43210');

  // Terms agreement state
  const [agreed, setAgreed] = useState(true);

  // Load turf details on mount
  useEffect(() => {
    if (currentBooking?.turfId) {
      const fetchTurfDetails = async () => {
        try {
          const res = await turfService.getTurfById(currentBooking.turfId);
          if (res.success) {
            setTurf(res.data);
          }
        } catch (err) {
          console.error('Failed to fetch turf details for checkout:', err);
        }
      };
      fetchTurfDetails();
    }
  }, [currentBooking?.turfId]);

  // Handle countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync profile details if user changes
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  if (!currentBooking.turfId && step !== 'confirmed') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4 bg-slate-50 min-h-[50vh] flex flex-col justify-center items-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Active Bookings</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">Please visit an arena page and select slots to checkout.</p>
        <button 
          onClick={() => navigate('/search')}
          className="px-6 py-3 bg-[#AAEE00] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-[#BBEF11] transition-all focus:outline-none shadow-md"
        >
          Explore Turfs
        </button>
      </div>
    );
  }

  const formatTimeLeft = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
      const year = dateObj.getFullYear();
      return `${weekday}, ${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME100') {
      setDiscount(100);
      setPromoApplied(true);
      setPromoError('');
    } else if (promoCode.trim().toUpperCase() === 'TURF50') {
      setDiscount(50);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code.');
      setPromoApplied(false);
      setDiscount(0);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setError('Your slot reservation time has expired. Please select slots again.');
      return;
    }
    setStep('loading');
    setLoadingMsg('Initiating Booking Slot Check...');
    
    try {
      const startTime = currentBooking.slots[0].startTime;
      const endTime = currentBooking.slots[currentBooking.slots.length - 1].endTime;

      // 1. Create Pending Booking
      const bookingRes = await bookingService.create({
        turfId: currentBooking.turfId,
        sport: currentBooking.sport.toLowerCase(),
        date: currentBooking.date,
        startTime,
        endTime
      });

      if (!bookingRes.success) {
        throw new Error(bookingRes.message || 'Failed to create booking.');
      }

      const bookingData = bookingRes.data;

      setLoadingMsg('Initializing Razorpay Secure Order...');

      // 2. Create Razorpay Order
      const orderRes = await paymentService.createOrder(bookingData._id);
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order.');
      }

      const orderData = orderRes.data;

      setLoadingMsg('Opening Payment Gateway...');

      // 3. Initiate payment gateway
      await initiatePayment(
        orderData,
        user,
        async (paymentVerificationData) => {
          setStep('loading');
          setLoadingMsg('Verifying signature with bank...');
          try {
            const verifyRes = await paymentService.verifyPayment(paymentVerificationData);
            if (verifyRes.success) {
              setConfirmedBooking(verifyRes.data);
              setStep('confirmed');
              dispatch(clearBooking());
            } else {
              setError(verifyRes.message || 'Payment verification failed.');
              setStep('payment');
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed.');
            setStep('payment');
          }
        },
        (dismissMessage) => {
          setError(dismissMessage || 'Payment cancelled.');
          setStep('payment');
        }
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Checkout failed.');
      setStep('payment');
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16 text-slate-800 font-inter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. STEPPER HUD */}
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            {/* Step 1: Select Slot */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/10">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 mt-2">Select Slot</span>
            </div>

            {/* Line 1 -> 2 */}
            <div className="flex-1 h-[3px] bg-emerald-500 mx-4 -mt-6"></div>

            {/* Step 2: Review & Pay */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 rounded-full bg-[#AAEE00] border-4 border-[#AAEE00]/25 text-black flex items-center justify-center font-black shadow-md shadow-[#AAEE00]/10">
                2
              </div>
              <span className="text-[10px] font-black text-slate-800 mt-2">Review & Pay</span>
            </div>

            {/* Line 2 -> 3 */}
            <div className="flex-1 h-[3px] bg-slate-200 mx-4 -mt-6"></div>

            {/* Step 3: Confirmation */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 mt-2">Confirmation</span>
            </div>
          </div>
        </div>

        {/* 2. PAGE TITLE */}
        {step === 'payment' && (
          <div className="text-center space-y-1.5 pb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Booking</h1>
            <p className="text-sm text-slate-500 font-medium">Review your slot details and complete payment</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* PAYMENT SUBMIT BLOCK */}
          {step === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Column: Details & Billing */}
              <div className="md:col-span-7 space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                  
                  {/* Turf details header */}
                  <div className="flex justify-between items-start text-left">
                    <div className="flex space-x-4">
                      <img 
                        src={turf?.images?.[0] || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'} 
                        alt={currentBooking.turfName}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{currentBooking.turfName}</h3>
                        <div className="flex items-center text-xs text-slate-500 font-semibold space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{turf?.address || 'Hoshangabad Road, Bhopal'}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 font-semibold space-x-1">
                          <span className="text-amber-500">★</span>
                          <span className="font-bold text-slate-800">{turf?.rating || '4.8'}</span>
                          <span className="text-slate-400">({turf?.reviewsCount || '188'} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sport Pill Badge */}
                    <span className="px-3 py-1 bg-[#AAEE00]/10 border border-[#AAEE00]/20 text-[#5D7A00] rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1 flex-shrink-0">
                      <span className="text-[10px]">⚽</span>
                      <span className="capitalize">{currentBooking.sport}</span>
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Booking details grid (3x2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date</span>
                        <span className="text-xs font-extrabold text-slate-800">{formatDateString(currentBooking.date)}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Time</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {currentBooking.slots?.[0]?.startTime} — {currentBooking.slots?.[currentBooking.slots.length - 1]?.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Timer className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Duration</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {currentBooking.slots?.length} Hour{currentBooking.slots?.length > 1 ? 's' : ''} ({currentBooking.slots?.length} slot{currentBooking.slots?.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    {/* Sport */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Zap className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sport</span>
                        <span className="text-xs font-extrabold text-slate-800 capitalize">{currentBooking.sport}</span>
                      </div>
                    </div>

                    {/* Player */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Player</span>
                        <span className="text-xs font-extrabold text-slate-800 truncate max-w-[130px]">{customerName}</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Phone className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                        <span className="text-xs font-extrabold text-slate-800">{customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Pricing breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between font-bold text-slate-500">
                      <span>Base Price</span>
                      <span className="text-slate-800">₹{currentBooking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-500">
                      <span>Platform Fee</span>
                      <span className="text-emerald-500 font-extrabold">Free</span>
                    </div>
                    
                    {promoApplied && (
                      <div className="flex justify-between font-bold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-xs">
                        <span className="flex items-center space-x-1.5">
                          <Tag className="w-4 h-4" />
                          <span>Promo Applied ({promoCode.toUpperCase()})</span>
                        </span>
                        <span>-₹{discount}</span>
                      </div>
                    )}

                    <hr className="border-slate-100" />

                    <div className="flex justify-between font-black text-base text-slate-800">
                      <span>Subtotal</span>
                      <span>₹{currentBooking.totalAmount}</span>
                    </div>

                    <hr className="border-dashed border-slate-200" />

                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">ADVANCE PAYMENT</span>
                        <span className="text-2xl font-black text-[#5D7A00]">₹{currentBooking.advancePaid}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Remaining at Venue</span>
                        <span className="text-sm font-extrabold text-slate-800">₹{currentBooking.remainingAmount - discount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-[#FAFDF2] border border-[#E1EEBA] p-4 rounded-2xl flex items-start space-x-3 text-xs font-bold text-slate-700 text-left">
                    <div className="w-5 h-5 rounded-full bg-[#AAEE00]/20 flex items-center justify-center text-[#5D7A00] flex-shrink-0 mt-0.5">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-relaxed">
                      Only ₹{currentBooking.advancePaid} is charged now. Pay ₹{currentBooking.remainingAmount - discount} directly at the venue before playing.
                    </p>
                  </div>

                  {/* Promo code input */}
                  <div className="space-y-2">
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400 shadow-sm"
                        disabled={promoApplied}
                      />
                      <button 
                        type="submit"
                        disabled={promoApplied || !promoCode}
                        className={`px-5 py-3 border border-slate-700/80 hover:bg-slate-50 text-slate-800 hover:text-black rounded-2xl text-xs font-extrabold transition-all shadow-sm ${
                          promoApplied ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 cursor-default' : ''
                        }`}
                      >
                        {promoApplied ? 'Applied' : 'Apply'}
                      </button>
                    </form>
                    {promoError && <p className="text-[11px] font-bold text-red-500 text-left pl-1">{promoError}</p>}
                  </div>
                </div>

                {/* Cancellation Policy card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>Cancellation Policy</span>
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-bold pl-1">
                    <li className="flex items-start space-x-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Cancellations more than 24 hours before the slot: 100% Refund of advance.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>Cancellations between 12-24 hours: 50% Refund of advance.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>Cancellations less than 12 hours before the slot: No Refund.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Checkout Widget */}
              <div className="md:col-span-5">
                <div className="bg-white border-2 border-[#AAEE00] rounded-3xl p-6 shadow-[0_12px_40px_rgba(170,238,0,0.04)] space-y-6">
                  
                  {/* Amount to pay */}
                  <div className="text-left space-y-1">
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">ADVANCE AMOUNT TO PAY</span>
                    <span className="text-4xl font-black text-slate-900">₹{currentBooking.advancePaid}</span>
                  </div>

                  {/* Timer Banner */}
                  <div className="bg-[#FFF4E5] border border-[#FFE0B2] p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-orange-800">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600 animate-pulse" />
                      <span>Slot reserved for:</span>
                    </div>
                    <span className="text-sm font-black text-orange-600">{formatTimeLeft(timeLeft)}</span>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center space-x-2 text-xs font-bold text-left">
                      <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Payment selectors */}
                  <div className="space-y-3">
                    {/* Razorpay (Cards, Netbanking) */}
                    <div 
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <Landmark className="w-4.5 h-4.5 text-slate-500" />
                        <span className="text-xs font-black text-slate-800">Razorpay (Cards, Netbanking)</span>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {paymentMethod === 'razorpay' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Credit / Debit Card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <CreditCard className="w-4.5 h-4.5 text-slate-500" />
                        <span className="text-xs font-black text-slate-800">Credit / Debit Card</span>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {paymentMethod === 'card' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* UPI (GPay, PhonePe, Paytm) */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <QrCode className="w-4.5 h-4.5 text-slate-500" />
                        <span className="text-xs font-black text-slate-800">UPI (GPay, PhonePe, Paytm)</span>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {paymentMethod === 'upi' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Customer details info */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 text-left text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-850 text-sm">Customer Details</span>
                      <button 
                        type="button"
                        onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                        className="text-xs text-[#5D7A00] font-extrabold hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        {isEditingCustomer ? 'Save Details' : 'Edit Details'}
                      </button>
                    </div>
                    
                    {isEditingCustomer ? (
                      <div className="space-y-2 pt-1">
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                          placeholder="Player Name"
                        />
                        <input 
                          type="email" 
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                          placeholder="Email"
                        />
                        <input 
                          type="text" 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                          placeholder="Phone"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 pl-1 font-bold text-slate-500">
                        <p className="text-slate-800 font-extrabold">{customerName}</p>
                        <p>{customerEmail}</p>
                        <p>{customerPhone}</p>
                      </div>
                    )}
                  </div>

                  {/* Checkbox and Confirm Button */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-start space-x-2.5 text-left">
                      <input 
                        type="checkbox"
                        id="agreed"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-350 text-[#AAEE00] focus:ring-[#AAEE00]/30 w-4 h-4 accent-[#AAEE00]"
                      />
                      <label htmlFor="agreed" className="text-[11px] text-slate-500 font-bold leading-normal cursor-pointer select-none">
                        I agree to the <Link to="/terms" className="text-slate-800 underline font-bold">Terms & Conditions</Link> and the cancellation policy mentioned on the left.
                      </label>
                    </div>

                    <form onSubmit={handlePaymentSubmit}>
                      <button 
                        type="submit"
                        disabled={isProcessing || timeLeft === 0 || !agreed}
                        className="w-full py-4 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_25px_rgba(170,238,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                      >
                        <span>Pay ₹{currentBooking.advancePaid} & Confirm Booking</span>
                      </button>
                    </form>

                    <div className="flex flex-col items-center space-y-2 pt-2 text-[10px] text-slate-400 font-bold">
                      <div className="flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Secured by Razorpay</span>
                      </div>
                      <div className="flex items-center space-x-2.5 opacity-55">
                        <span className="px-1.5 py-0.5 border border-slate-300 rounded font-black">VISA</span>
                        <span className="px-1.5 py-0.5 border border-slate-300 rounded font-black">MC</span>
                        <span className="px-1.5 py-0.5 border border-slate-300 rounded font-black">UPI</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* LOADING SCREEN */}
          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-xl max-w-md mx-auto space-y-4"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#AAEE00] animate-spin"></div>
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Processing Transaction</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">{loadingMsg}</p>
            </motion.div>
          )}

          {/* CONFIRMED TICKET */}
          {step === 'confirmed' && (
            <motion.div 
              key="confirmed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <QRCode booking={confirmedBooking} />
              
              <div className="text-center pt-2">
                <button 
                  onClick={() => navigate('/user/dashboard')}
                  className="px-6 py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Go to My Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* 4. TRUST BAR */}
        {step === 'payment' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#5D7A00] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Secure Payment</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">SSL Encrypted payments</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#5D7A00] flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Instant Confirmation</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">E-ticket sent instantly</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#5D7A00] flex-shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Easy Refunds</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Directly to source account</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#5D7A00] flex-shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">24/7 Support</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Dedicated chat assistance</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
