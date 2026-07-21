import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authSuccess, authFailure } from '../../store/authSlice';
import { userService } from '../../services/api';
import { Phone, MapPin, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompleteProfile() {
  const { user, token } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setValidationError('Mobile number must start with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateProfile({ phone: cleanPhone, city: city.trim() });
      if (response.success) {
        const updatedUserData = {
          ...user,
          ...response.data,
          phone: cleanPhone,
          city: city.trim() || user?.city || '',
          isProfileCompleted: true,
        };
        
        dispatch(authSuccess({ user: updatedUserData, token: token || localStorage.getItem('tb_token') }));

        if (currentBooking?.turfId) {
          navigate('/checkout');
        } else {
          navigate('/');
        }
      } else {
        setValidationError(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error updating profile. Please try again.';
      setValidationError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 sm:p-6 text-black relative">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative z-10 space-y-6 text-left"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">One Last Step!</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Please enter your valid 10-digit mobile number to complete your profile and enable booking & payment access.
          </p>
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* User Email (Read only) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Account Email</label>
            <input 
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-100 border-0 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mobile Phone Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <div className="w-14 py-3 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-xs font-bold text-slate-600">
                +91
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text"
                placeholder="e.g. Bhopal"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.2)] disabled:opacity-50 focus:outline-none mt-4"
          >
            <span>{loading ? 'Saving Profile...' : 'Save & Continue'}</span>
            {!loading && <ArrowRight className="w-4.5 h-4.5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
