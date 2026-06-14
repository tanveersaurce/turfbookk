import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Eye, FileText, CheckCircle, XCircle, HelpCircle, 
  ChevronRight, Calendar, User, Building, MapPin, 
  DollarSign, Clock, ShieldAlert, Loader2, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function PartnerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | pending | under_review | approved | rejected | more_info_needed
  const [selectedApp, setSelectedApp] = useState(null);

  // Modals States
  const [actionApp, setActionApp] = useState(null); // application selected for action
  const [actionType, setActionType] = useState(''); // approve | reject | request_info
  const [actionText, setActionText] = useState(''); // rejection reason or request info message
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'all' ? '' : activeTab;
      const response = await api.get(`/applications`, {
        params: { status: statusParam, limit: 100 }
      });
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    setSelectedApp(null);
  }, [activeTab]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionApp) return;

    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        const response = await api.put(`/applications/${actionApp._id}/approve`);
        if (response.data.success) {
          toast.success('Owner created & turf listed!');
          fetchApplications();
          setActionApp(null);
        }
      } else if (actionType === 'reject') {
        if (!actionText.trim()) {
          toast.error('Rejection reason is required.');
          setActionLoading(false);
          return;
        }
        const response = await api.put(`/applications/${actionApp._id}/reject`, {
          rejectionReason: actionText
        });
        if (response.data.success) {
          toast.success('Application rejected successfully.');
          fetchApplications();
          setActionApp(null);
        }
      } else if (actionType === 'request_info') {
        if (!actionText.trim()) {
          toast.error('Information request message is required.');
          setActionLoading(false);
          return;
        }
        const response = await api.put(`/applications/${actionApp._id}/request-info`, {
          infoNeeded: actionText
        });
        if (response.data.success) {
          toast.success('Information request sent.');
          fetchApplications();
          setActionApp(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setActionType('');
      setActionText('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-[#FFD700]/15 text-[#b45309] border border-[#FFD700]/30 rounded-full text-[10px] font-black uppercase tracking-wider">Pending</span>;
      case 'under_review':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Under Review</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-[#AAEE00]/15 text-emerald-600 border border-[#AAEE00]/30 rounded-full text-[10px] font-black uppercase tracking-wider">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/10 text-red-650 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Rejected</span>;
      case 'more_info_needed':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">More Info</span>;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Listings' },
    { id: 'pending', label: 'Pending' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'more_info_needed', label: 'Needs Info' }
  ];

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-800 font-inter py-8 px-4 sm:px-6 lg:px-8 text-left relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top welcome row */}
        <div className="flex items-center space-x-3">
          <Link to="/admin/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Partner Applications Desk</h1>
            <p className="text-xs text-slate-500 font-medium">Verify credentials, review document certifications, and approve partner turfs.</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap border-b border-slate-200 gap-1 sm:gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#5D7A00] text-[#5D7A00]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table / Grid */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5D7A00]" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium text-xs">
                No onboarding applications found in this status tab.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">App ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">Applicant</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">Turf</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">City</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-450">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {applications.map((app) => (
                      <tr 
                        key={app._id} 
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          selectedApp?._id === app._id ? 'bg-slate-50/70' : ''
                        }`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{app.applicationId}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{app.applicantName}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{app.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-800">{app.turfName}</td>
                        <td className="px-6 py-4 text-slate-500">{app.city}</td>
                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Side Info Drawer */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[500px]">
            {selectedApp ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{selectedApp.turfName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedApp.applicationId}</p>
                  </div>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {/* Section 1: Applicant Info */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#5D7A00] tracking-wider flex items-center space-x-1.5 border-b pb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Personal Information</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Applicant Name</span>
                      <span>{selectedApp.applicantName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Phone Number</span>
                      <span>{selectedApp.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Email Address</span>
                      <span className="break-all">{selectedApp.email}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Business Info */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#5D7A00] tracking-wider flex items-center space-x-1.5 border-b pb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>Business Details</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Business Name</span>
                      <span>{selectedApp.businessName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Experience</span>
                      <span>{selectedApp.experience}</span>
                    </div>
                    {selectedApp.hasGst && (
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 uppercase font-black block">GST Registration</span>
                        <span>{selectedApp.gstNumber}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Documents</span>
                      <div className="flex gap-2.5 mt-1">
                        {selectedApp.hasGst && selectedApp.gstCertificateUrl && (
                          <a
                            href={selectedApp.gstCertificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>GST Doc</span>
                          </a>
                        )}
                        {selectedApp.idProofUrl && (
                          <a
                            href={selectedApp.idProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>ID Proof</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Turf Details */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#5D7A00] tracking-wider flex items-center space-x-1.5 border-b pb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Venue Location Details</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">City</span>
                      <span>{selectedApp.city}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Area</span>
                      <span>{selectedApp.area}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Physical Address</span>
                      <span>{selectedApp.turfAddress}</span>
                    </div>
                    {selectedApp.mapsLink && (
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Google Maps location</span>
                        <a 
                          href={selectedApp.mapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#5D7A00] hover:underline break-all"
                        >
                          {selectedApp.mapsLink}
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Price Per Hour</span>
                      <span className="text-slate-900 font-extrabold">₹{selectedApp.pricePerHour}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Operating Hours</span>
                      <span>{selectedApp.operatingHours.open} - {selectedApp.operatingHours.close}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Supported Sports</span>
                      <span className="capitalize">{selectedApp.sports.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                {selectedApp.turfImages && selectedApp.turfImages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Venue Images</span>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedApp.turfImages.map((img, idx) => (
                        <a 
                          key={idx} 
                          href={img} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border border-slate-100 block"
                        >
                          <img src={img} className="w-full h-full object-cover" alt="Venue" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Controls for pending/under_review */}
                {['pending', 'under_review', 'more_info_needed'].includes(selectedApp.status) && (
                  <div className="pt-4 border-t flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActionApp(selectedApp);
                        setActionType('approve');
                        setActionText('');
                      }}
                      className="w-full py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-slate-900 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Onboarding</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActionApp(selectedApp);
                          setActionType('reject');
                          setActionText('');
                        }}
                        className="py-3 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionApp(selectedApp);
                          setActionType('request_info');
                          setActionText('');
                        }}
                        className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Request Info</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 stroke-[1.5]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select an application</span>
                <p className="text-[10px] text-slate-400 font-medium text-center">Click any application row in the queue to load details.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal Drawer */}
      <AnimatePresence>
        {actionApp && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800 space-y-5"
            >
              <h3 className="text-lg font-black text-slate-900 tracking-tight capitalize">
                {actionType === 'approve' ? 'Approve Application?' : actionType === 'reject' ? 'Reject Application?' : 'Request More Info'}
              </h3>
              
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {actionType === 'approve' 
                  ? `Approving will generate owner user login credentials and list "${actionApp.turfName}" active on TurfBook immediately.`
                  : actionType === 'reject' 
                    ? `Rejecting will update "${actionApp.turfName}" application status to rejected and send notification.`
                    : `Specify the details required from "${actionApp.applicantName}".`
                }
              </p>

              <form onSubmit={handleActionSubmit} className="space-y-4">
                {(actionType === 'reject' || actionType === 'request_info') && (
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700">
                      {actionType === 'reject' ? 'Rejection Reason' : 'Details Requested'}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={actionType === 'reject' ? 'e.g. Incomplete ID document proof...' : 'e.g. Please upload a clearer GST certificate...'}
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F1F5F9] border border-slate-200/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 resize-none"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      setActionApp(null);
                      setActionType('');
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-all focus:outline-none disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-slate-900 font-extrabold rounded-2xl text-xs flex items-center justify-center transition-all disabled:opacity-50 focus:outline-none"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : 'Confirm Action'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
