import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    dispatch(authStart());
    try {
      const data = await authService.login({ email, password });
      
      // Enforce Owner Role Check
      if (data.user?.role !== 'owner') {
        throw new Error('Unauthorized role. Use Owner credentials to log in.');
      }

      dispatch(authSuccess(data));
      navigate('/owner/dashboard');
    } catch (err) {
      dispatch(authFailure(err.message || 'Login failed. Please verify credentials.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80" 
          alt="Stadium background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cardbg border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Owner Portal</h2>
          <p className="text-xs text-muted mt-1">Log in to manage bookings and schedules</p>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="email"
                placeholder="email@partner.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                required
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-muted font-medium">
              <span>Enter the password you set during registration</span>
              <span>Demo: <strong className="text-primary">rajesh@turf.com</strong> / password</span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,200,83,0.15)] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link 
            to="/owner/register" 
            className="text-xs text-muted hover:text-primary flex items-center justify-center space-x-1 font-medium"
          >
            <span>Don't have a partner account? Register here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
