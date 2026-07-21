import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { loading, error } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    dispatch(authStart());
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        
        if (response.mustChangePassword) {
          navigate('/change-password');
          return;
        }

        // Redirect based on role
        const role = response.data.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          if (currentBooking?.turfId) {
            navigate('/checkout');
          } else {
            navigate('/');
          }
        }
      } else {
        dispatch(authFailure(response.message || 'Login failed.'));
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid email or password.';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#0D1117]">
      {/* Left Panel: Graphic & Branding */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-12 text-white hidden lg:flex bg-[#0A0D14]">
        {/* Background Field Grid overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/736x/80/69/ad/8069ad6d967795e62c7f6b818329b0af.jpg" 
            alt="Soccer Field grid"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0A0D14]/90 to-transparent"></div>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-black text-primary tracking-tight">
            TurfBook
          </Link>
        </div>

        {/* Center: Interactive Graphic Card */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-150 h-96 overflow-hidden shadow-2xl border border-white/5 bg-[#121824]/40">
            <img 
              src="https://i.pinimg.com/736x/58/e2/d0/58e2d0a5aa480c52e8f569bb5368dbea.jpg" 
              alt="Soccer athlete action"
              className="w-full h-full object-cover"
            />
            {/* Glassmorphic overlay card */}
            <div className="absolute bottom-6 right-[-20px] w-72 rounded-2xl border border-white/10 glassmorphism p-5 space-y-4 shadow-xl text-left">
              <div className="flex items-center space-x-2 text-primary">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider text-white">Community Pulse</span>
              </div>
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-lg font-black text-white leading-none">500+</h4>
                  <span className="text-[10px] text-muted font-medium">Premium Turfs</span>
                </div>
                <hr className="border-white/5" />
                <div>
                  <h4 className="text-lg font-black text-white leading-none">50k</h4>
                  <span className="text-[10px] text-muted font-medium">Active Players</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-primary">4.8</span>
                  <div className="flex items-center space-x-0.5 text-[#FFC107]">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Athlete quote */}
        <div className="relative z-10 max-w-sm">
          <p className="text-xs text-muted italic leading-relaxed">
            "Precision booking for the elite athlete. Every game starts with the perfect turf."
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="lg:col-span-6 bg-white flex items-center justify-center p-8 sm:p-16 text-black">
        <div className="max-w-md w-full space-y-7">
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Welcome Back</h2>
            <p className="text-sm text-slate-500 font-medium">Sign in to manage your bookings and join the game.</p>
          </div>

          {/* Form Error Banner */}
          {(error || validationError) && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
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
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                  Forgot Password?
                </Link>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-2xl text-sm text-slate-700 flex items-center justify-center space-x-3 transition-all focus:outline-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google Account</span>
          </button>

          {/* Registration link */}
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-slate-500">
              New to TurfBook?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
