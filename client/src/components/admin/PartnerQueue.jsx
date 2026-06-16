import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PartnerQueue({ applications, handleApproveOwner, handleRejectOwner }) {
  // Local modal state
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingApps = applications.filter(a => a.status === 'pending');

  const onSubmitReject = (e) => {
    e.preventDefault();
    handleRejectOwner(rejectingAppId, rejectionReason);
    setRejectingAppId(null);
    setRejectionReason('');
  };

  return (
    <motion.div
      key="owners"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Section 1: Owner Account Approvals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Owner Account Approvals</h2>
          <p className="text-xs text-slate-500 font-medium">Approve new turf owners to enable listing creations on TurfBook.</p>
        </div>

        {pendingApps.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
            <p className="text-xs text-slate-400 mt-1">No pending partner applications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApps.map((app) => (
              <div key={app._id || app.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-extrabold text-slate-800">{app.businessName}</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600 text-[8px] font-black uppercase">Pending Review</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 font-semibold">
                    <p>Owner: <span className="text-slate-800">{app.name}</span> ({app.email})</p>
                    <p>Phone: <span className="text-slate-800">{app.phone}</span></p>
                    <p className="text-[11px] text-[#5D7A00] font-bold">Turf Address: {app.turfAddress}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => handleApproveOwner(app._id || app.id)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Account</span>
                  </button>
                  <button 
                    onClick={() => setRejectingAppId(app._id || app.id)}
                    className="px-4 py-2 border border-red-100 hover:bg-red-50 text-red-550 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Review Modal */}
      <AnimatePresence>
        {rejectingAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setRejectingAppId(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={onSubmitReject} className="space-y-4 pt-2">
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">Rejection Review</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-650 uppercase">Reason for application rejection</label>
                  <textarea
                    rows={3}
                    placeholder="Specify why partner application is denied (e.g. Invalid business registration documents, invalid physical address)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-medium focus:outline-none focus:border-[#5D7A00] resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setRejectingAppId(null)} 
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                  >
                    Confirm Reject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
