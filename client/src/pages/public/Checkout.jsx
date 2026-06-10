import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBooking } from '../../store/bookingSlice';
import { bookingService, paymentService } from '../../services/api';
import useRazorpay from '../../hooks/useRazorpay';
import BookingSummary from '../../components/booking/BookingSummary';
import QRCode from '../../components/booking/QRCode';
import { CreditCard, Wallet, Landmark, QrCode, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const { currentBooking } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = useRazorpay();

  // Payment methods: upi | card | netbanking
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Checkout flow: payment | loading | confirmed
  const [step, setStep] = useState('payment'); 
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  if (!currentBooking.turfId && step !== 'confirmed') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Bookings</h2>
        <p className="text-xs text-muted max-w-xs mx-auto">Please visit an arena page and select slots to checkout.</p>
        <button 
          onClick={() => navigate('/search')}
          className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl text-xs hover:bg-primary-light transition-all"
        >
          Explore Turfs
        </button>
      </div>
    );
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* STEPPER HUD */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs font-semibold text-muted bg-cardbg p-4 border border-white/5 rounded-2xl max-w-2xl mx-auto">
        <div className="flex items-center space-x-1.5 text-primary">
          <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">1</span>
          <span>Slots</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
        <div className="flex items-center space-x-1.5 text-primary">
          <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">2</span>
          <span>Login</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
        <div className={`flex items-center space-x-1.5 ${step === 'confirmed' ? 'text-primary' : 'text-white'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step === 'confirmed' ? 'bg-primary/20' : 'bg-primary text-black'}`}>3</span>
          <span>Payment</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
        <div className={`flex items-center space-x-1.5 ${step === 'confirmed' ? 'text-primary' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step === 'confirmed' ? 'bg-primary text-black' : 'bg-white/10'}`}>4</span>
          <span>Confirm</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* PAYMENT SUBMIT BLOCK */}
        {step === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
          >
            {/* Left Col: Razorpay Sim Options */}
            <div className="md:col-span-2 bg-cardbg border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Razorpay Payment Portal</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">Choose your payment mode to authorize the transaction.</p>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-lg'
                        : 'bg-[#0D1117] border-white/5 text-muted hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-wider">UPI / QR</span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-lg'
                        : 'bg-[#0D1117] border-white/5 text-muted hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-wider">Credit Card</span>
                  </button>

                  {/* NetBanking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-lg'
                        : 'bg-[#0D1117] border-white/5 text-muted hover:text-white'
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-wider">NetBanking</span>
                  </button>
                </div>

                {/* Sub Forms based on method */}
                <div className="p-4 bg-[#0D1117] border border-white/5 rounded-xl text-xs space-y-4">
                  {paymentMethod === 'upi' && (
                    <div className="space-y-3">
                      <label className="block text-[10px] text-muted font-bold uppercase tracking-wider">UPI ID / VPA</label>
                      <input 
                        type="text"
                        placeholder="yourname@upi"
                        className="w-full px-4 py-2.5 bg-[#0D1117] border border-white/15 rounded-lg focus:outline-none focus:border-primary text-white font-semibold"
                        required
                      />
                      <span className="block text-[10px] text-muted">A payment notification request will be sent to your UPI App.</span>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Card Number</label>
                          <input 
                            type="text"
                            maxLength={16}
                            placeholder="4111 2222 3333 4444"
                            className="w-full px-4 py-2.5 bg-[#0D1117] border border-white/15 rounded-lg focus:outline-none focus:border-primary text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Expiry Date</label>
                          <input 
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-2.5 bg-[#0D1117] border border-white/15 rounded-lg focus:outline-none focus:border-primary text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-1">CVV</label>
                          <input 
                            type="password"
                            maxLength={3}
                            placeholder="123"
                            className="w-full px-4 py-2.5 bg-[#0D1117] border border-white/15 rounded-lg focus:outline-none focus:border-primary text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Select Bank</label>
                      <select className="w-full bg-[#0D1117] border border-white/15 rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-primary">
                        <option>SBI (State Bank of India)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-light text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,200,83,0.3)] flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Simulate Payment (₹{currentBooking.advancePaid})</span>
                </button>
              </form>
            </div>

            {/* Right Col: Booking summary stick card */}
            <div className="md:col-span-1">
              <BookingSummary booking={currentBooking} />
            </div>
          </motion.div>
        )}

        {/* LOADING MODAL */}
        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center bg-cardbg border border-white/15 rounded-2xl shadow-2xl max-w-md mx-auto space-y-4"
          >
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Processing Transaction</h3>
            <p className="text-xs text-muted leading-relaxed">{loadingMsg}</p>
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
                className="px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all"
              >
                Go to My Dashboard
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
