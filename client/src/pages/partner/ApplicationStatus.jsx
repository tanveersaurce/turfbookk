import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function ApplicationStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [appIdInput, setAppIdInput] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [appDetails, setAppDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (targetId) => {
    if (!targetId || !targetId.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    setAppDetails(null);

    try {
      const response = await api.get(`/applications/status/${targetId.trim().toUpperCase()}`);
      if (response.data.success) {
        setAppDetails(response.data.data);
      } else {
        setErrorMsg(response.data.message || 'Application not found.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Application not found. Double check your ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      handleSearch(queryId);
    }
  }, [queryId]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (appIdInput.trim()) {
      setSearchParams({ id: appIdInput.trim().toUpperCase() });
      handleSearch(appIdInput);
    }
  };

  // Status mapping index
  // pending -> under_review -> approved/rejected/more_info_needed
  const getStatusStep = (status) => {
    if (status === 'pending') return 1;
    if (status === 'under_review') return 2;
    if (['approved', 'rejected', 'more_info_needed'].includes(status)) return 3;
    return 1;
  };

  const currentStepIndex = appDetails ? getStatusStep(appDetails.status) : 1;

  return (
    <div className="bg-[#0D1117] min-h-screen text-white flex items-center justify-center p-6 sm:p-12 font-inter">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-slate-100 text-slate-800">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Track Onboarding Status</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Check the progress of your TurfBook Listing Application.</p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={onSearchSubmit} className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">Application ID</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text"
                placeholder="e.g. TB-2024-A1B2"
                value={appIdInput}
                onChange={(e) => setAppIdInput(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3.5 bg-[#F1F5F9] border border-slate-200/60 focus:border-[#AAEE00] focus:ring-2 focus:ring-[#AAEE00]/20 rounded-2xl text-sm font-semibold focus:outline-none text-slate-800 placeholder-slate-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-xs flex items-center justify-center transition-all shadow-md focus:outline-none disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-800" /> : 'Check Status'}
            </button>
          </div>
        </form>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-650 rounded-2xl text-xs font-semibold flex items-start space-x-2 text-left mb-6">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Details Display area */}
        <AnimatePresence mode="wait">
          {appDetails && (
            <motion.div
              key={appDetails.applicationId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <hr className="border-slate-100" />
              
              {/* Basic Listing Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{appDetails.turfName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Submitted by: {appDetails.applicantName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-black text-slate-400 block">Submitted At</span>
                  <span className="text-[10px] font-bold text-slate-700">{new Date(appDetails.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                
                {/* Step 1: Submitted */}
                <div className="relative flex items-start space-x-3.5">
                  <div className="absolute left-[-21px] top-0.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-sm">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-850">Application Submitted</h5>
                    <p className="text-[10px] text-slate-405 font-medium mt-0.5">Information successfully saved on servers.</p>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="relative flex items-start space-x-3.5">
                  <div className={`absolute left-[-21px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                    currentStepIndex >= 2 
                      ? 'bg-[#FFD700] text-slate-900' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${currentStepIndex >= 2 ? 'text-slate-850' : 'text-slate-400'}`}>Under Verification Review</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Verification team is validating licenses and image proofs.</p>
                  </div>
                </div>

                {/* Step 3: Decision */}
                <div className="relative flex items-start space-x-3.5">
                  <div className={`absolute left-[-21px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                    currentStepIndex >= 3
                      ? appDetails.status === 'approved' 
                        ? 'bg-[#AAEE00] text-slate-900' 
                        : appDetails.status === 'rejected' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-[#FFD700] text-slate-900' // more info
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {appDetails.status === 'approved' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : appDetails.status === 'rejected' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${currentStepIndex >= 3 ? 'text-slate-850' : 'text-slate-400'}`}>
                      {appDetails.status === 'approved' ? (
                        <span className="text-emerald-600 font-black">Application Approved!</span>
                      ) : appDetails.status === 'rejected' ? (
                        <span className="text-red-500 font-black">Application Rejected</span>
                      ) : appDetails.status === 'more_info_needed' ? (
                        <span className="text-[#b45309] font-black">More Info Required</span>
                      ) : (
                        <span>Decision Process</span>
                      )}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Final decision regarding turf listing activation.</p>
                  </div>
                </div>

              </div>

              {/* Conditional Alert Panels */}
              
              {/* 1. Approved Panel */}
              {appDetails.status === 'approved' && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-emerald-800 leading-normal">
                    🎉 Congratulations! Your listing application has been approved and your owner account is live. Use the password emailed to you to log in.
                  </p>
                  <Link 
                    to="/login"
                    className="w-full py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md focus:outline-none"
                  >
                    <span>Login to Owner Panel</span>
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
                  </Link>
                </div>
              )}

              {/* 2. Rejected Panel */}
              {appDetails.status === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                  <h5 className="text-xs font-extrabold text-red-700">Rejection Details:</h5>
                  <div className="p-3 bg-white border border-red-200/60 rounded-xl text-xs text-slate-600 font-medium">
                    {appDetails.rejectionReason || 'No reason provided.'}
                  </div>
                  <Link 
                    to="/become-partner/apply"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all focus:outline-none"
                  >
                    Re-apply
                  </Link>
                </div>
              )}

              {/* 3. More Info Needed Panel */}
              {appDetails.status === 'more_info_needed' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                  <h5 className="text-xs font-extrabold text-amber-700">Requested Information:</h5>
                  <div className="p-3 bg-white border border-amber-200/60 rounded-xl text-xs text-slate-600 font-semibold leading-relaxed">
                    {appDetails.additionalInfoRequest || 'No specific details provided.'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    * Please reply to the status email with the required documents, or contact support@turfbook.com.
                  </p>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
