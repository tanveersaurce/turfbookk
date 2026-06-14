import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/api';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Basic client-side validation helpers
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password does not match new password.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('New password does not meet complexity requirements.');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        toast.success('Password updated successfully!');
        // Delay redirect slightly for toast readability
        setTimeout(() => {
          navigate('/owner/dashboard');
        }, 1000);
      } else {
        setErrorMsg(response.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 text-left"
      >
        {/* Top: Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-[#AAEE00] flex items-center justify-center shadow-[0_4px_15px_rgba(170,238,0,0.3)]">
              <svg className="w-6 h-6 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
              Turf<span className="text-[#AAEE00]">Book</span>
            </span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] text-center mb-1">
          Set Your New Password
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          For security, please change your auto-generated password
        </p>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-[#FFD700] border border-[#E6C200] rounded-2xl flex items-start space-x-3 text-xs font-semibold text-[#1A1A1A]">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <p className="leading-relaxed">
            You are using a system-generated password. Please set a new secure password to continue.
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-2 text-xs font-semibold">
            <XCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type={showCurrent ? 'text' : 'password'}
                placeholder="Current system password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-[#AAEE00]/30 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showCurrent ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-[#AAEE00]/30 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNew ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            
            {/* Helper Checklist */}
            <div className="mt-2 space-y-1 pl-1 text-[11px] font-semibold text-slate-500">
              <p className="mb-1 text-slate-400">Min 8 chars, 1 uppercase, 1 number</p>
              <div className="flex items-center space-x-1.5">
                <span className={hasMinLength ? "text-emerald-500" : "text-slate-300"}>
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />At least 8 characters
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={hasUppercase ? "text-emerald-500" : "text-slate-300"}>
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />At least 1 uppercase letter
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={hasNumber ? "text-emerald-500" : "text-slate-300"}>
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />At least 1 number
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-[#F1F5F9] border-0 focus:ring-2 focus:ring-[#AAEE00]/30 rounded-2xl text-sm font-medium focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
