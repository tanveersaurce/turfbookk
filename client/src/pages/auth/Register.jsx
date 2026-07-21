import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { ArrowRight, AlertCircle, User, Mail, Phone, Lock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { loading, error } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !email || !phone || !city || !password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
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
        phone,
        password,
        role: 'user',
        city
      });

      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        
        if (currentBooking?.turfId) {
          navigate('/checkout');
        } else {
          navigate('/');
        }
      } else {
        dispatch(authFailure(response.message || 'Registration failed.'));
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed.';
      dispatch(authFailure(message));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(authStart());
    try {
      const data = await authService.googleLogin('mock_credential');
      dispatch(authSuccess(data));
      if (currentBooking?.turfId) {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    } catch (err) {
      dispatch(authFailure(err.message || 'Google Auth Failed'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 sm:p-6 text-black relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative z-10 space-y-6 text-left"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Turf<span className="text-primary font-black">Book</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 font-medium">Start your sports journey with TurfBook today.</p>
        </div>

        {/* Form Error Banner */}
        {(error || validationError) && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-left">
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
                required
              />
            </div>
          </div>

          {/* Passwords grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              id="agreed"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="agreed" className="text-[11px] text-slate-500 font-semibold leading-normal">
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
        <div className="relative py-1 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 text-[10px] font-bold text-slate-400 bg-white uppercase tracking-wider">
            Or Register With
          </span>
        </div>

        {/* Google SSO Register */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-2xl text-sm text-slate-700 flex items-center justify-center space-x-3 transition-all focus:outline-none shadow-sm"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google Account</span>
        </button>

        {/* Login link */}
        <div className="text-center pt-1">
          <p className="text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
