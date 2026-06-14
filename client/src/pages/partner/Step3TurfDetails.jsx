import React, { useState } from 'react';
import { DollarSign, Clock, MapPin, Map } from 'lucide-react';

const sportsOptions = [
  { id: 'football', label: 'Football ⚽' },
  { id: 'cricket', label: 'Cricket 🏏' },
  { id: 'basketball', label: 'Basketball 🏀' },
  { id: 'badminton', label: 'Badminton 🏸' },
  { id: 'tennis', label: 'Tennis 🎾' },
  { id: 'kabaddi', label: 'Kabaddi 🤼' }
];

export default function Step3TurfDetails({ formData, setFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.turfName.trim()) tempErrors.turfName = 'Turf Name is required.';
    if (!formData.turfAddress.trim()) tempErrors.turfAddress = 'Turf Address is required.';
    if (!formData.area.trim()) tempErrors.area = 'Area / Locality is required.';
    
    if (!formData.operatingHours.open) tempErrors.openTime = 'Open time is required.';
    if (!formData.operatingHours.close) tempErrors.closeTime = 'Close time is required.';
    
    if (!formData.pricePerHour) tempErrors.pricePerHour = 'Price per hour is required.';
    else if (isNaN(formData.pricePerHour) || Number(formData.pricePerHour) <= 0) {
      tempErrors.pricePerHour = 'Please enter a valid price greater than 0.';
    }

    if (formData.sports.length === 0) tempErrors.sports = 'Select at least one sport.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const toggleSport = (sportId) => {
    let updatedSports = [...formData.sports];
    if (updatedSports.includes(sportId)) {
      updatedSports = updatedSports.filter(s => s !== sportId);
    } else {
      updatedSports.push(sportId);
    }
    setFormData({ ...formData, sports: updatedSports });
  };

  return (
    <form onSubmit={handleNext} className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Step 3: Turf Listing Details</h3>
        <p className="text-xs text-slate-400 font-medium">Provide court details, pricing, and operating slots for booking.</p>
      </div>

      {/* Turf Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Turf / Arena Name</label>
        <input 
          type="text"
          placeholder="e.g. KickOff Arena"
          value={formData.turfName}
          onChange={(e) => setFormData({ ...formData, turfName: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
            errors.turfName ? 'border-red-500' : 'border-slate-200/60'
          }`}
        />
        {errors.turfName && <p className="text-[10px] text-red-500 font-bold">{errors.turfName}</p>}
      </div>

      {/* Turf Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Turf Ground Location Address</label>
        <textarea 
          rows={3}
          placeholder="Exact physical address of your turf facility..."
          value={formData.turfAddress}
          onChange={(e) => setFormData({ ...formData, turfAddress: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 resize-none ${
            errors.turfAddress ? 'border-red-500' : 'border-slate-200/60'
          }`}
        />
        {errors.turfAddress && <p className="text-[10px] text-red-500 font-bold">{errors.turfAddress}</p>}
      </div>

      {/* Area & Pincode / Google Maps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Locality / Area</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text"
              placeholder="e.g. Bandra West"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className={`w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
                errors.area ? 'border-red-500' : 'border-slate-200/60'
              }`}
            />
          </div>
          {errors.area && <p className="text-[10px] text-red-500 font-bold">{errors.area}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Google Maps Link (Optional)</label>
          <div className="relative">
            <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={formData.mapsLink}
              onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Operating Hours</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">OPEN FROM:</span>
            <input 
              type="time"
              value={formData.operatingHours.open}
              onChange={(e) => setFormData({ 
                ...formData, 
                operatingHours: { ...formData.operatingHours, open: e.target.value } 
              })}
              className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
                errors.openTime ? 'border-red-500' : 'border-slate-200/60'
              }`}
            />
            {errors.openTime && <p className="text-[10px] text-red-500 font-bold">{errors.openTime}</p>}
          </div>

          <div className="space-y-1 relative">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">CLOSE TO:</span>
            <input 
              type="time"
              value={formData.operatingHours.close}
              onChange={(e) => setFormData({ 
                ...formData, 
                operatingHours: { ...formData.operatingHours, close: e.target.value } 
              })}
              className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
                errors.closeTime ? 'border-red-500' : 'border-slate-200/60'
              }`}
            />
            {errors.closeTime && <p className="text-[10px] text-red-500 font-bold">{errors.closeTime}</p>}
          </div>
        </div>
      </div>

      {/* Price Per Hour */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Price Per Hour (₹)</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 font-extrabold text-sm">
            ₹
          </div>
          <input 
            type="number"
            placeholder="1200"
            value={formData.pricePerHour}
            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
            className={`w-full pl-8 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
              errors.pricePerHour ? 'border-red-500' : 'border-slate-200/60'
            }`}
          />
        </div>
        {errors.pricePerHour && <p className="text-[10px] text-red-500 font-bold">{errors.pricePerHour}</p>}
      </div>

      {/* Sports Chips Multi-Select */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700">Supported Sports (Select all that apply)</label>
        <div className="flex flex-wrap gap-2.5">
          {sportsOptions.map(sport => {
            const isSelected = formData.sports.includes(sport.id);
            return (
              <button
                type="button"
                key={sport.id}
                onClick={() => toggleSport(sport.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  isSelected 
                    ? 'bg-[#AAEE00] text-[#1A1A1A] border-[#AAEE00] shadow-sm font-extrabold scale-[1.03]' 
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {sport.label}
              </button>
            );
          })}
        </div>
        {errors.sports && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.sports}</p>}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <button 
          type="button"
          onClick={onBack}
          className="col-span-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all focus:outline-none"
        >
          Back
        </button>
        <button 
          type="submit"
          className="col-span-2 py-3.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.25)] focus:outline-none"
        >
          <span>Next Step</span>
        </button>
      </div>
    </form>
  );
}
