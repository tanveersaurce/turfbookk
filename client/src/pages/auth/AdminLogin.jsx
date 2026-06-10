import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';
import { authService } from '../../services/api';
import { Mail, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
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
      
      // Enforce Super Admin Role Check
      if (data.user?.role !== 'admin') {
        throw new Error('Access denied. Super Admin credentials required.');
      }

      dispatch(authSuccess(data));
      navigate('/admin/dashboard');
    } catch (err) {
      dispatch(authFailure(err.message || 'Login failed. Please verify credentials.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[#0D1117] opacity-95"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-cardbg border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-danger/25 text-danger flex items-center justify-center mx-auto mb-3 border border-danger/40">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Super Admin Gateway</h2>
          <p className="text-xs text-muted mt-1">Authorized personnel only</p>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Secure Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="email"
                placeholder="admin@turfbook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-danger/50 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-danger/50 text-white"
                required
              />
            </div>
            <span className="block mt-1 text-[10px] text-muted text-right">Demo Admin: <span className="text-danger font-bold">admin@turfbook.com</span> / password</span>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-danger/90 hover:bg-danger text-white font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(255,61,87,0.15)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
