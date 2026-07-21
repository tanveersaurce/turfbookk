import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { ArrowRight, AlertCircle, CheckCircle2, User, Mail, Phone, Lock, MapPin } from 'lucide-react';

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

  const handleGoogleLogin = () => {
    window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'google_select' } }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#0D1117]">
      {/* Left Panel: Graphic, Brand, Features list */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-12 text-white hidden lg:flex bg-[#0A0D14]">
        {/* Background stadium action shot */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1664304634915-36c858c860bf?q=80&w=732&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Soccer stadium game"
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

        {/* Center: Branding Title & Features List */}
        <div className="relative z-10 max-w-md space-y-8 my-auto text-left">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary leading-tight">TurfBook</h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Join the ultimate sports community. Book premium venues, join local programs, and elevate your game today.
            </p>
          </div>

          <div className="space-y-4.5 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 fill-primary/10" />
              </div>
              <span className="text-xs font-bold text-slate-200">Access 500+ Premium Venues</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 fill-primary/10" />
              </div>
              <span className="text-xs font-bold text-slate-200">Verified & Secure Bookings</span>
            </div>
          </div>
        </div>

        {/* Bottom: footer info */}
        <div className="relative z-10">
          <span className="text-[10px] text-muted">© {new Date().getFullYear()} TurfBook. All Rights Reserved.</span>
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="lg:col-span-6 bg-white flex items-center justify-center p-8 sm:p-16 text-black">
        <div className="max-w-md w-full space-y-6">
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

          <form onSubmit={handleRegister} className="space-y-4.5 text-left">
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

            {/* Two column grid for passwords */}
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
                id="agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="agreed" className="text-[11px] text-slate-500 font-semibold leading-normal">
                I agree to the <Link to="/terms" className="text-[#000] underline font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-[#000] underline font-bold">Privacy Policy</Link>.
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
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-wider">
              Or Register With
            </span>
          </div>

          {/* Google SSO Register */}
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

          {/* Login link */}
          <div className="text-center pt-1">
            <p className="text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
