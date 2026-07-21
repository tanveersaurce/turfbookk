import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { X, Mail, Phone, Lock, AlertCircle, User, Award, CheckCircle2, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState('email_login'); // email_login | email_register
  const role = 'user';
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneReg, setPhoneReg] = useState('');
  const [city, setCity] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [otp, setOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { loading, error } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.booking);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Listen to global trigger event
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      const mode = e?.detail?.mode || 'email_login';
      setAuthMode(mode);
      setEmail('');
      setPassword('');
      setName('');
      setPhoneReg('');
      setCity('');
      setConfirmPassword('');
      setAgreed(false);
      setShowPassword(false);
      setValidationError('');
      setOtp('');
      setSuccessMessage('');
      setLocalLoading(false);
    };

    window.addEventListener('show-login', handleOpen);
    return () => window.removeEventListener('show-login', handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGoogleLogin = async () => {
    dispatch(authStart());
    try {
      const data = await authService.googleLogin('mock_credential');
      dispatch(authSuccess(data));
      handleClose();
      if (currentBooking.turfId) {
        navigate('/checkout');
      }
    } catch (err) {
      dispatch(authFailure(err.message || 'Google Auth Failed'));
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (authMode === 'email_login') {
      if (!email || !password) {
        setValidationError('Email and Password are required.');
        return;
      }
    } else {
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
    }

    dispatch(authStart());

    try {
      if (authMode === 'email_login') {
        const response = await authService.login({ email, password });
        if (response.success) {
          const loggedInUser = response.data;
          
          if (loggedInUser.role === 'owner' && loggedInUser.isApproved === false) {
            dispatch(authFailure("Your account is pending Admin approval."));
            return;
          }

          dispatch(authSuccess({ user: loggedInUser, token: localStorage.getItem('tb_token') }));
          
          if (response.mustChangePassword) {
            handleClose();
            navigate('/change-password');
            return;
          }

          handleClose();
          
          if (loggedInUser.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (loggedInUser.role === 'owner') {
            navigate('/owner/dashboard');
          } else {
            if (currentBooking?.turfId) {
              navigate('/checkout');
            } else {
              navigate('/');
            }
          }
          return;
        } else {
          dispatch(authFailure(response.message || 'Login failed.'));
          return;
        }
      } else {
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
          handleClose();
          if (currentBooking?.turfId) {
            navigate('/checkout');
          } else {
            navigate('/');
          }
          return;
        } else {
          dispatch(authFailure(response.message || 'Registration failed.'));
          return;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication Failed';
      dispatch(authFailure(msg));
    }
  };

  const handleForgotPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!email) {
      setValidationError('Please enter your email address.');
      return;
    }

    setLocalLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccessMessage('A 6-digit verification code has been sent to your email.');
        setAuthMode('reset_password_otp');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setValidationError(response.message || 'Failed to send reset code.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reset code.';
      setValidationError(msg);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!otp || !password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (otp.length !== 6) {
      setValidationError('Verification code must be 6 digits.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setLocalLoading(true);
    try {
      const response = await authService.resetPassword(email, otp, password);
      if (response.success) {
        setSuccessMessage('Password reset successfully! You can now login.');
        setAuthMode('email_login');
        setPassword('');
        setConfirmPassword('');
      } else {
        setValidationError(response.message || 'Failed to reset password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
      setValidationError(msg);
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl h-full max-h-[680px] md:h-[680px] overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl relative text-slate-800 grid grid-cols-1 md:grid-cols-12"
      >
        {/* Left Panel: Graphic & Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 text-white bg-[#0A0D14] h-full">
          {authMode === 'email_register' ? (
            <>
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
              <div className="relative z-10 text-left">
                <span className="text-xl font-black text-primary tracking-tight">
                  TurfBook
                </span>
              </div>

              {/* Center: Branding Title & Features List */}
              <div className="relative z-10 space-y-6 my-auto text-left">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-primary leading-tight">TurfBook</h1>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Join the ultimate sports community. Book premium venues, join local programs, and elevate your game today.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-primary/10" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">Access 500+ Premium Venues</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-primary/10" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">Verified & Secure Bookings</span>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="relative z-10 text-left">
                <span className="text-[9px] text-slate-400 font-bold">© {new Date().getFullYear()} TurfBook. All Rights Reserved.</span>
              </div>
            </>
          ) : (
            <>
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
              <div className="relative z-10 text-left">
                <span className="text-xl font-black text-primary tracking-tight">
                  TurfBook
                </span>
              </div>

              {/* Center: Interactive Graphic Card */}
              <div className="relative flex items-center justify-center my-auto">
                <div className="relative w-full h-48 overflow-hidden shadow-2xl border border-white/5 bg-[#121824]/40 rounded-xl">
                  <img 
                    src="https://i.pinimg.com/736x/58/e2/d0/58e2d0a5aa480c52e8f569bb5368dbea.jpg" 
                    alt="Soccer athlete action"
                    className="w-full h-full object-cover"
                  />
                  {/* Glassmorphic overlay card */}
                  <div className="absolute bottom-4 right-[-10px] w-48 rounded-xl border border-white/10 glassmorphism p-3 space-y-2 shadow-xl text-left">
                    <div className="flex items-center space-x-1.5 text-primary">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[8px] uppercase font-black tracking-wider text-white">Community Pulse</span>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <div>
                        <h4 className="text-xs font-black text-white leading-none">500+</h4>
                        <span className="text-[8px] text-slate-300 font-medium">Premium Turfs</span>
                      </div>
                      <hr className="border-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-primary">4.8</span>
                        <div className="flex items-center space-x-0.5 text-[#FFC107] text-[8px]">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Athlete quote */}
              <div className="relative z-10 max-w-sm text-left">
                <p className="text-[10px] text-slate-400 italic leading-relaxed">
                  "Precision booking for the elite athlete. Every game starts with the perfect turf."
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Forms */}
        <div className="col-span-12 md:col-span-7 h-full overflow-y-auto p-6 md:p-10 relative bg-white flex flex-col custom-scrollbar text-black">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            type="button"
            className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all focus:outline-none z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="my-auto w-full max-w-md mx-auto py-6">
            <AnimatePresence mode="wait">
              {/* LOGIN MODE */}
              {authMode === 'email_login' && (
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
                          onClick={() => {
                            setAuthMode('forgot_password');
                            setValidationError('');
                            setSuccessMessage('');
                          }} 
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
                  <button 
                    type="button"
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
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('email_register')} 
                        className="text-primary font-bold hover:underline bg-transparent"
                      >
                        Register Now
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* FORGOT PASSWORD MODE */}
              {authMode === 'forgot_password' && (
                <motion.div
                  key="forgot_password"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-left">
                    <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Reset Password</h2>
                    <p className="text-sm text-slate-500 font-medium">Enter your registered email address to receive a 6-digit verification code.</p>
                  </div>

                  {/* Form Error Banner */}
                  {validationError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
                      <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-5 text-left">
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

                    {/* Send code button */}
                    <button 
                      type="submit"
                      disabled={localLoading}
                      className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.2)] disabled:opacity-50 focus:outline-none"
                    >
                      <span>{localLoading ? 'Sending Code...' : 'Send Reset Code'}</span>
                      {!localLoading && <ArrowRight className="w-4.5 h-4.5" />}
                    </button>
                  </form>

                  {/* Back to Login link */}
                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthMode('email_login');
                        setValidationError('');
                        setSuccessMessage('');
                      }} 
                      className="text-xs font-bold text-slate-500 hover:underline hover:text-slate-800 bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

              {/* RESET PASSWORD OTP MODE */}
              {authMode === 'reset_password_otp' && (
                <motion.div
                  key="reset_password_otp"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-left">
                    <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Verify Code</h2>
                    <p className="text-sm text-slate-500 font-medium">Enter the 6-digit verification code sent to your email and set your new password.</p>
                  </div>

                  {/* Form Error Banner */}
                  {validationError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
                      <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Form Success Banner */}
                  {successMessage && (
                    <div className="p-3.5 bg-green-50 border border-green-100 text-green-600 rounded-xl flex items-start space-x-2 text-xs font-semibold">
                      <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                    {/* Verification Code */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400 tracking-[0.2em] text-center font-bold text-lg focus:tracking-[0.2em]"
                          required
                        />
                      </div>
                    </div>

                    {/* Passwords grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">New Password</label>
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

                    {/* Reset button */}
                    <button 
                      type="submit"
                      disabled={localLoading}
                      className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.2)] disabled:opacity-50 focus:outline-none mt-2"
                    >
                      <span>{localLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                      {!localLoading && <ArrowRight className="w-4.5 h-4.5" />}
                    </button>
                  </form>

                  {/* Resend and Back to Login links */}
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      disabled={localLoading}
                      className="text-xs font-bold text-primary-dark hover:underline bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50 focus:outline-none"
                    >
                      Resend Code
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthMode('email_login');
                        setValidationError('');
                        setSuccessMessage('');
                      }} 
                      className="text-xs font-bold text-slate-500 hover:underline hover:text-slate-800 bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
                    >
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

              {/* REGISTER MODE */}
              {authMode === 'email_register' && (
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

                  {/* Login link */}
                  <div className="text-center pt-1">
                    <p className="text-xs font-semibold text-slate-500">
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('email_login')} 
                        className="text-primary font-bold hover:underline bg-transparent"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
