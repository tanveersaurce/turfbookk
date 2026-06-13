import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { turfService, adminService } from '../../services/api';
import { 
  ArrowLeft, 
  Check, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Award, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Users, 
  Settings, 
  Eye, 
  ExternalLink,
  Globe,
  Share2,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewTurf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Admin input states
  const [internalNote, setInternalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Load Turf Detail
  const fetchTurfDetail = async () => {
    setLoading(true);
    try {
      const response = await turfService.getTurfById(id);
      if (response.success) {
        setTurf(response.data);
      } else {
        setActionError("Failed to fetch turf details.");
      }
    } catch (err) {
      setActionError(err.message || "Error loading turf details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfDetail();
  }, [id]);

  const handleApprove = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await adminService.approveTurf(id, true);
      if (res.success) {
        setActionSuccess("Turf listing approved and published successfully!");
        fetchTurfDetail();
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setActionError(res.message || "Failed to approve turf.");
      }
    } catch (err) {
      setActionError(err.message || "Failed to approve turf.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      setActionError("Please select a rejection reason.");
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      const res = await adminService.approveTurf(id, false);
      if (res.success) {
        setActionSuccess("Turf listing rejected and owner notified.");
        fetchTurfDetail();
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setActionError(res.message || "Failed to reject turf.");
      }
    } catch (err) {
      setActionError(err.message || "Failed to reject turf.");
    }
  };

  const handleDownloadJson = () => {
    if (!turf) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(turf, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `turf_${turf.name.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] py-12 text-center">
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#5D7A00] mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Review Panel...</p>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] py-12 text-center">
        <div className="space-y-4 max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-800">Turf Listing Not Found</h3>
          <p className="text-xs text-slate-500 font-semibold">The requested turf listing ID does not exist or has been removed.</p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2.5 bg-slate-900 text-[#AAEE00] rounded-xl text-xs font-bold uppercase">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // Fallback images
  const validImages = turf.images?.filter(img => img && typeof img === 'string' && img.trim().length > 0) || [];
  const imagesList = validImages.length > 0 ? validImages : [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
  ];

  const standardAmenities = ['Parking', 'Washrooms', 'Locker Rooms', 'WiFi', 'Drinking Water', 'Canteen'];
  const formattedSlug = `/turf/${turf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${turf.city.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-800">
      
      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-8xl mx-auto p-6 lg:p-10 space-y-6 pb-24">
        
        {/* Actions Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200 text-left">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Turf Review Request</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Submitted by owner - 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button 
              onClick={() => {
                document.getElementById('action-card')?.scrollIntoView({ behavior: 'smooth' });
                setRejectionReason('Incomplete Details');
              }}
              className="px-4.5 py-2.5 border border-red-200 hover:bg-red-50 text-red-500 text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none"
            >
              <X className="w-4 h-4" />
              <span>Reject Turf</span>
            </button>
            
            <button 
              onClick={handleApprove}
              className="px-4.5 py-2.5 bg-primary hover:bg-[#BBEF11] text-black text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center space-x-1.5 focus:outline-none"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Publish</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 text-[#5D7A00] rounded-2xl text-xs flex items-center space-x-2.5 font-bold text-left shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center space-x-2.5 font-bold text-left shadow-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Metadata Status Pill Bar */}
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm text-left">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              turf.isApproved 
                ? 'bg-green-50 border border-green-200 text-[#5D7A00]' 
                : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}>
              {turf.isApproved ? 'Approved' : 'Pending Review'}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">Submission: <span className="text-slate-800 font-extrabold">{new Date(turf.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-bold">Owner: <span className="text-slate-800 font-extrabold">{turf.owner?.name || 'Rajesh Kumar'}</span></span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-bold">ID: <span className="text-slate-800 font-extrabold">#TRF-{turf._id?.substring(18).toUpperCase() || '2026-0892'}</span></span>
          </div>

          <button 
            onClick={handleDownloadJson}
            className="text-[10px] font-black text-[#5D7A00] hover:underline flex items-center space-x-1 uppercase tracking-wider shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Data JSON</span>
          </button>
        </div>

        {/* Single Column Workspace Layout */}
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Gallery Component */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
            {/* Main Active Image View */}
            <div className="relative rounded-2xl overflow-hidden h-[300px] sm:h-[400px] border border-slate-100 bg-slate-50 flex items-center justify-center">
              <img 
                src={imagesList[activeImageIndex]} 
                alt={turf.name}
                className="w-full h-full object-cover"
              />
              
              {/* Float Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded-lg tracking-wider">
                {imagesList.length} Images Total
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="grid grid-cols-4 gap-3">
              {imagesList.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${
                    activeImageIndex === idx 
                      ? 'border-primary shadow-md scale-99' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              
              {/* Empty slot for design replication */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 h-20 flex flex-col items-center justify-center text-slate-400">
                <span className="text-xl font-bold">+</span>
              </div>
            </div>
          </div>

          {/* Basic Details Card */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm text-left space-y-6">
            <h3 className="text-base font-black text-slate-950 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <AlertCircle className="w-5 h-5 text-[#5D7A00]" />
              <span>Basic Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Turf Name</span>
                <span className="text-sm font-black text-slate-800 mt-1 block">{turf.name}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Slug</span>
                <a href={`http://localhost:5173${formattedSlug}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#5D7A00] hover:underline mt-1 block flex items-center space-x-0.5">
                  <span className="truncate">{formattedSlug}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Category</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">Multi-sport Arena</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Description</span>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {turf.description || 'Premium sports arena located in Bhopal. Featuring FIFA-standard artificial grass, floodlighting for night matches, and dedicated parking. Perfect for corporate tournaments and local leagues.'}
              </p>
            </div>
          </div>

          {/* Venue Owner & Amenities Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Venue Owner details Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-100 pb-3">Venue Owner</h4>
                
                <div className="flex items-center space-x-3.5 pt-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-primary flex items-center justify-center font-black text-base border-2 border-slate-200 shadow-sm shrink-0">
                    RK
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{turf.owner?.name || 'Rajesh Kumar'}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Joined May 2024 • 1 Venue</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <a 
                  href={`tel:${turf.owner?.phone || '+919876543210'}`}
                  className="w-full py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{turf.owner?.phone || '+91 98765 43210'}</span>
                </a>

                <a 
                  href={`https://wa.me/${turf.owner?.phone || '919876543210'}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-2.5 border border-[#4CAF50] hover:bg-[#4CAF50]/5 text-[#4CAF50] font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 12.008 0c3.237.001 6.28 1.261 8.569 3.55 2.289 2.29 3.548 5.334 3.547 8.572-.004 6.678-5.33 12.002-12.012 12.002-2.002-.001-3.968-.497-5.713-1.442L0 24zm6.59-4.846c1.6.95 3.498 1.452 5.418 1.453 5.514 0 10.002-4.487 10.006-10.002.002-2.673-1.039-5.187-2.932-7.081C17.25 1.63 14.739.589 12.062.589c-5.523 0-10.016 4.492-10.02 10.007-.001 1.921.501 3.799 1.456 5.402L2.5 21.5l5.147-1.346z"/>
                    <path d="M16.924 13.917c-.27-.135-1.597-.788-1.846-.878-.249-.09-.431-.135-.612.135-.181.27-.703.878-.861 1.058-.158.18-.317.202-.587.067-.27-.135-1.139-.42-2.169-1.338-.801-.715-1.342-1.6-1.5-1.87-.158-.27-.017-.417.118-.552.122-.122.27-.317.406-.474.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.612-1.474-.839-2.016-.22-.53-.443-.457-.612-.466-.158-.008-.339-.01-.52-.01-.18 0-.474.068-.722.338-.249.27-.95.923-.95 2.253s.969 2.612 1.105 2.793c.135.18 1.907 2.912 4.619 4.082.645.278 1.149.445 1.54.569.648.206 1.238.177 1.704.108.52-.078 1.597-.653 1.823-1.283.226-.63.226-1.17.158-1.283-.068-.113-.249-.18-.52-.315z"/>
                  </svg>
                  <span>WhatsApp Owner</span>
                </a>
              </div>
            </div>

            {/* Amenities Checklist Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-100 pb-3">Amenities</h4>
                
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 pt-3">
                  {standardAmenities.map(amenity => {
                    const hasAmenity = (turf.amenities || []).some(a => a.toLowerCase().includes(amenity.toLowerCase().substring(0, 5)));
                    return (
                      <div key={amenity} className="flex items-center space-x-2 text-xs">
                        {hasAmenity ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#5D7A00] shrink-0" />
                            <span className="font-extrabold text-slate-800">{amenity}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                            <span className="font-bold text-slate-300 line-through">{amenity}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button 
                  onClick={() => alert("Redirecting to Owner Profile...")}
                  className="text-[10px] font-black text-[#5D7A00] hover:underline uppercase tracking-wider"
                >
                  View Owner Profile
                </button>
              </div>
            </div>

          </div>

          {/* Sports & Pricing Card */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm text-left space-y-6">
            <h3 className="text-base font-black text-slate-950 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-[#5D7A00]" />
              <span>Sports & Pricing</span>
            </h3>

            {/* Sports Pills */}
            <div className="flex flex-wrap gap-2">
              {(turf.sports || ['football', 'cricket', 'badminton']).map((sport, index) => (
                <span key={`${sport}-${index}`} className="px-3 py-1 bg-[#AAEE00] text-black font-extrabold text-[10px] uppercase rounded-full shadow-sm">
                  {sport}
                </span>
              ))}
            </div>

            {/* Slot Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Slot Type</th>
                    <th className="py-3 px-4">Price (Per Hr)</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className="hover:bg-slate-50/20 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800">Weekday Morning (06:00 - 16:00)</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-950">₹{turf.pricePerHour || 1200}</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#5D7A00]">10% OFF</td>
                  </tr>
                  <tr className="hover:bg-slate-50/20 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800">Weekday Night (17:00 - 23:00)</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-950">₹{turf.weekendPricePerHour || turf.pricePerHour || 1800}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/20 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800">Weekends (All Day)</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-950">₹{turf.weekendPricePerHour || 2200}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Advance Booking Policy info box */}
            <div className="p-4 bg-green-50 border border-green-200/50 rounded-2xl flex items-center space-x-3 text-[#5D7A00] text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Advance Booking Policy: {turf.advancePaymentPercentage || 20}% Non-refundable advance required.</span>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm text-left space-y-6">
            <h3 className="text-base font-black text-slate-950 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-[#5D7A00]" />
              <span>Location</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Address</span>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    {turf.address || 'Plot 42, Hoshangabad Road, Near Ashima Mall, Bhopal, MP 462026'}
                  </p>
                </div>

                <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase text-slate-600 tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Coords: 23.1993° N, 77.4477° E</span>
                </div>
              </div>

              {/* Styled Street Map Visualizer */}
              <div className="relative rounded-2xl overflow-hidden h-[180px] border border-slate-200 bg-[#E5E9F0] shadow-inner group">
                <div className="absolute inset-0 bg-[#D3DCE6] opacity-90">
                  <div className="w-full h-full relative">
                    <div className="absolute left-[30%] top-0 bottom-0 w-[6px] bg-white"></div>
                    <div className="absolute left-[65%] top-0 bottom-0 w-[8px] bg-white"></div>
                    <div className="absolute top-[35%] left-0 right-0 h-[6px] bg-white"></div>
                    <div className="absolute top-[65%] left-0 right-0 h-[8px] bg-white"></div>
                    <div className="absolute top-0 bottom-0 left-[45%] w-[8px] bg-white rotate-12 origin-top"></div>
                    
                    {/* Pins */}
                    <div className="absolute top-[48%] left-[58%]">
                      <div className="w-7 h-7 rounded-full bg-[#5D7A00]/25 flex items-center justify-center animate-pulse">
                        <MapPin className="w-4.5 h-4.5 text-[#5D7A00] fill-[#AAEE00]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours & Review Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Operating Hours */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left space-y-4">
              <h3 className="text-base font-black text-slate-950 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-[#5D7A00]" />
                <span>Operating Hours</span>
              </h3>
              
              <div className="space-y-4 pt-1">
                <div className="flex items-center space-x-2.5 text-slate-800 font-extrabold text-sm">
                  <Clock className="w-4.5 h-4.5 text-[#5D7A00] shrink-0" />
                  <span>{turf.openingTime || '06:00 AM'} — {turf.closingTime || '11:00 PM'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <span key={day} className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-black text-[9px] rounded-lg">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[175px]">
              <MessageSquare className="w-9 h-9 text-slate-300" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No reviews yet</h4>
              <p className="text-[10px] text-slate-500 font-bold max-w-[200px] leading-relaxed">
                Review will be available after first booking.
              </p>
            </div>
          </div>

          {/* Sticky Action Panel widget */}
          <div id="action-card" className="bg-[#121824] border border-white/5 p-6 rounded-3xl shadow-xl text-left space-y-5 text-white">
            <div>
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Admin Action</h4>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">Approve or reject this request</p>
            </div>

            <div className="space-y-4">
              {/* Note Area */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Internal Note (Optional)</label>
                <textarea 
                  placeholder="Add any private notes for other admins..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Primary Approve Button */}
              <button 
                onClick={handleApprove}
                className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Approve & Publish Turf</span>
              </button>

              <div className="flex items-center justify-between py-1 px-1">
                <hr className="border-white/5 w-[42%]" />
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">OR</span>
                <hr className="border-white/5 w-[42%]" />
              </div>

              {/* Rejection Select */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Rejection Reason (Required)</label>
                <select 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-semibold focus:outline-none text-white cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select Reason...</option>
                  <option value="Incomplete Details" className="bg-slate-900 text-white">Incomplete Details</option>
                  <option value="Poor Quality Images" className="bg-slate-900 text-white">Poor Quality Images</option>
                  <option value="Pricing Discrepancies" className="bg-slate-900 text-white">Pricing Discrepancies</option>
                  <option value="Duplicate Listing" className="bg-slate-900 text-white">Duplicate Listing</option>
                </select>
              </div>

              {/* Reject action Button */}
              <button 
                onClick={handleReject}
                className="w-full py-3 border-2 border-red-500 hover:bg-red-500/10 text-red-500 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
              >
                <X className="w-4.5 h-4.5" />
                <span>Reject & Notify Owner</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* 3. STICKY BOTTOM BAR ACTION MODULE */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121824] border-t border-white/10 py-3.5 px-6 z-40 flex items-center justify-between text-white hidden lg:flex shadow-2xl">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-white/10 shrink-0">
            <img 
              src={imagesList[0]} 
              alt={turf.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight leading-tight">{turf.name}</h4>
            <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">Submitted by {turf.owner?.name || 'Rajesh K.'}</p>
          </div>
        </div>

        {/* Informative Warning text */}
        <div className="hidden xl:flex items-center space-x-2 text-xs font-extrabold text-slate-300 text-left">
          <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          <span>Once approved, this venue will be instantly visible to all users in {turf.city}.</span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              document.getElementById('action-card')?.scrollIntoView({ behavior: 'smooth' });
              setRejectionReason('Incomplete Details');
            }}
            className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-slate-800 text-red-500 text-xs font-black rounded-xl transition-all"
          >
            Reject
          </button>
          
          <button 
            onClick={handleApprove}
            className="px-6 py-2.5 bg-primary hover:bg-[#BBEF11] text-black text-xs font-black rounded-xl transition-all shadow-md"
          >
            Approve Now
          </button>
        </div>
      </div>

    </div>
  );
}
