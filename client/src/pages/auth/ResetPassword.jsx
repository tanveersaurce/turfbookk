import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters.'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword(token, data.password);
      setLoading(false);
      if (res.success) {
        toast.success('Password reset successfully. You can now login.');
        navigate('/');
        // Trigger quick login modal
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('show-login'));
        }, 500);
      } else {
        toast.error(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Password reset failed. Token may be expired.');
    }
  };

  return (
    <div className="max-w-[440px] mx-auto my-16 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-outlineVariant text-secondary">
      <div className="mb-6 text-center">
        <h1 className="font-inter font-extrabold text-[24px] text-secondary mb-1">Set New Password</h1>
        <p className="font-inter text-[14px] text-[#5f5e5e]">Enter your new password to regain access to your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-2">
          <label className="font-inter font-bold text-[14px] text-secondary" htmlFor="password">New Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]">lock</span>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full pl-12 pr-4 py-3 bg-neutralBg rounded-xl border-none focus:ring-2 focus:ring-primary transition-all font-inter text-[15px] text-secondary"
            />
          </div>
          {errors.password && <p className="text-red-600 text-xs font-semibold">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="font-inter font-bold text-[14px] text-secondary" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]">lock_reset</span>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full pl-12 pr-4 py-3 bg-neutralBg rounded-xl border-none focus:ring-2 focus:ring-primary transition-all font-inter text-[15px] text-secondary"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-600 text-xs font-semibold">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-secondary rounded-full animate-spin"></div>
          ) : (
            <>
              Update Password
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
