import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginForm({ onSuccess, onForgotPasswordClick, onRegisterClick, isModal = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    
    if (!email || !password) {
      setValidationError('Email and Password are required.');
      return;
    }

    dispatch(authStart());

    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        const loggedInUser = response.data;
        
        if (loggedInUser.role === 'owner' && loggedInUser.isApproved === false) {
          dispatch(authFailure("Your account is pending Admin approval."));
          return;
        }

        dispatch(authSuccess({ user: loggedInUser, token: localStorage.getItem('tb_token') }));
        if (onSuccess) onSuccess();
        
        if (response.mustChangePassword) {
          navigate('/change-password');
          return;
        }

        if (loggedInUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (loggedInUser.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          if (response.requiresProfileCompletion || !loggedInUser.phone || loggedInUser.phone.trim().replace(/\D/g, '').length < 10) {
            navigate('/complete-profile');
          } else if (currentBooking?.turfId) {
            navigate('/checkout');
          } else {
            navigate('/');
          }
        }
      } else {
        dispatch(authFailure(response.message || 'Login failed.'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication Failed';
      dispatch(authFailure(msg));
    }
  };

  return (
    <motion.div
      key="email_login"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-left">
        <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Welcome Back</h2>
        <p className="text-sm text-slate-500 font-medium">Sign in to manage your bookings and join the game.</p>
        {currentBooking?.turfId && (
          <span className="inline-block mt-1 px-3 py-1 bg-primary/10 border border-primary/20 text-slate-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-bold">
            ⚡ Slot held for 5 minutes
          </span>
        )}
      </div>

      {/* Form Error Banner */}
      {(error || validationError) && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Form Success Banner */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-100 text-green-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-5 text-left">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <button 
              type="button" 
              onClick={onForgotPasswordClick} 
              className="text-xs font-bold text-primary-dark hover:underline bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Sign In button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.2)] disabled:opacity-50 focus:outline-none"
        >
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          {!loading && <ArrowRight className="w-4.5 h-4.5" />}
        </button>
      </form>

      {/* Social login divider */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-wider">
          Or Login With
        </span>
      </div>

      {/* Google SSO Login */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          shape="pill"
          theme="outline"
          size="large"
          text="continue_with"
          width={isModal ? "340" : "360"}
        />
      </div>

      {/* Registration link */}
      <div className="text-center pt-2">
        <p className="text-xs font-semibold text-slate-500">
          New to TurfBook?{' '}
          <button 
            type="button" 
            onClick={onRegisterClick} 
            className="text-primary font-bold hover:underline bg-transparent"
          >
            Register Now
          </button>
        </p>
      </div>
    </motion.div>
  );
}
