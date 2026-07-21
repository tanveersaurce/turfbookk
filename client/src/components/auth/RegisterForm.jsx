import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { Mail, Phone, Lock, AlertCircle, User, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterForm({ onSuccess, onLoginClick, isModal = true }) {
  const role = 'user';
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneReg, setPhoneReg] = useState('');
  const [city, setCity] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { loading, error } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    dispatch(authStart());
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      dispatch(authSuccess(data));
      if (onSuccess) onSuccess();

      const userObj = data.data;
      if (data.requiresProfileCompletion || !userObj?.phone || userObj.phone.trim().replace(/\D/g, '').length < 10) {
        navigate('/complete-profile');
      } else if (currentBooking?.turfId) {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google Authentication failed.';
      dispatch(authFailure(message));
    }
  };

  const handleGoogleError = () => {
    dispatch(authFailure('Google Sign-In was cancelled or failed.'));
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!name || !email || !password || !phoneReg || !city || !confirmPassword) {
      setValidationError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setValidationError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    dispatch(authStart());

    try {
      const response = await authService.register({
        name,
        email,
        phone: phoneReg,
        password,
        role,
        city
      });
      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        if (onSuccess) onSuccess();
        if (currentBooking?.turfId) {
          navigate('/checkout');
        } else {
          navigate('/');
        }
      } else {
        dispatch(authFailure(response.message || 'Registration failed.'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication Failed';
      dispatch(authFailure(msg));
    }
  };

  return (
    <motion.div
      key="email_register"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <div className="space-y-1.5 text-left">
        <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Create Account</h2>
        <p className="text-sm text-slate-500 font-medium">Start your journey with TurfBook</p>
      </div>

      {/* Form Error Banner */}
      {(error || validationError) && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{validationError || error}</span>
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Phone Number</label>
          <div className="flex gap-2">
            <div className="w-16 py-3 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-sm font-bold text-slate-600">
              +91
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phoneReg}
                onChange={(e) => setPhoneReg(e.target.value.replace(/\D/g, ''))}
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
              required
            />
          </div>
        </div>

        {/* Password & Confirm Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* T&C checkbox */}
        <div className="flex items-start space-x-2 pt-1">
          <input 
            type="checkbox"
            id="modal-agreed"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label htmlFor="modal-agreed" className="text-[11px] text-slate-500 font-semibold leading-normal">
            I agree to the Terms of Service and Privacy Policy.
          </label>
        </div>

        {/* Create Account button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.2)] disabled:opacity-50 focus:outline-none mt-2"
        >
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          {!loading && <ArrowRight className="w-4.5 h-4.5" />}
        </button>
      </form>

      {/* Social login divider */}
      {!isModal && (
        <>
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-wider">
              Or Register With
            </span>
          </div>

          {/* Google SSO Register */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
              width="360"
            />
          </div>
        </>
      )}

      {/* Login link */}
      <div className="text-center pt-1">
        <p className="text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onLoginClick} 
            className="text-primary font-bold hover:underline bg-transparent"
          >
            Login
          </button>
        </p>
      </div>
    </motion.div>
  );
}
