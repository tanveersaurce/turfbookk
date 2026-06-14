import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplicationSuccess() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('id') || 'TB-2024-XXXX';

  return (
    <div className="bg-[#0D1117] min-h-screen text-white flex items-center justify-center p-6 font-inter">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-slate-100 text-slate-800 text-center space-y-6"
      >
        {/* Animated Checkmark */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
          <p className="text-xs text-slate-450 font-semibold leading-relaxed">
            Your venue details have been successfully transmitted to our onboarding desk.
          </p>
        </div>

        {/* Application ID Card */}
        <div className="p-5 bg-[#1A1A1A] rounded-2xl border border-white/5 space-y-2 text-left">
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Application Reference ID</span>
          <div className="text-xl font-bold font-mono text-[#AAEE00] text-center tracking-wider py-1 border-t border-b border-white/5">
            {applicationId}
          </div>
          <p className="text-[9px] text-slate-400 text-center font-bold">Copy this ID to check status later.</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Our verification team is reviewing your details. Please allow <strong>24 to 48 hours</strong> for approval logs and email dispatch.
          </p>

          <div className="pt-2 space-y-3">
            <Link 
              to={`/become-partner/status?id=${applicationId}`}
              className="w-full py-3.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2.5 transition-all shadow-[0_4px_15px_rgba(170,238,0,0.25)] focus:outline-none"
            >
              <span>Track Application Status</span>
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </Link>

            <Link 
              to="/"
              className="inline-block text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
