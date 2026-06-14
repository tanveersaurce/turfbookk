import React, { useState } from 'react';
import { Shield, HelpCircle, CheckSquare, Square } from 'lucide-react';

const amenitiesOptions = [
  { id: 'Parking', label: 'Parking 🅿️' },
  { id: 'Floodlights', label: 'Floodlights 💡' },
  { id: 'Changing Room', label: 'Changing Room 👕' },
  { id: 'Cafeteria', label: 'Cafeteria ☕' },
  { id: 'First Aid', label: 'First Aid 🏥' },
  { id: 'WiFi', label: 'Free WiFi 📶' },
  { id: 'Drinking Water', label: 'Drinking Water 💧' },
  { id: 'Washrooms', label: 'Washrooms 🚾' }
];

export default function Step4Amenities({ formData, setFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.cancellationPolicy) {
      tempErrors.cancellationPolicy = 'Please select a cancellation policy.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleAmenityToggle = (amenityId) => {
    let updatedAmenities = [...formData.amenities];
    if (updatedAmenities.includes(amenityId)) {
      updatedAmenities = updatedAmenities.filter(a => a !== amenityId);
    } else {
      updatedAmenities.push(amenityId);
    }
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  return (
    <form onSubmit={handleNext} className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Step 4: Amenities & Policies</h3>
        <p className="text-xs text-slate-400 font-medium">Specify ground rules and amenities available at the facility.</p>
      </div>

      {/* Amenities Checkbox Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700">Available Amenities</label>
        <div className="grid grid-cols-2 gap-3">
          {amenitiesOptions.map((amenity) => {
            const isChecked = formData.amenities.includes(amenity.id);
            return (
              <div 
                key={amenity.id}
                onClick={() => handleAmenityToggle(amenity.id)}
                className={`p-3.5 border rounded-2xl flex items-center space-x-3 cursor-pointer transition-all hover:bg-slate-50 ${
                  isChecked 
                    ? 'border-[#AAEE00] bg-[#AAEE00]/5 font-bold text-slate-900' 
                    : 'border-slate-200/60 text-slate-600 bg-[#F1F5F9]'
                }`}
              >
                <div className="text-[#AAEE00] flex-shrink-0">
                  {isChecked ? <CheckSquare className="w-5 h-5 fill-[#AAEE00]/10 text-slate-800" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <span className="text-xs">{amenity.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Ground Rules (Optional)</label>
        <textarea 
          rows={4}
          placeholder="e.g. Non-marking shoes required for badminton. No smoking allowed. Arrive 10 minutes prior..."
          value={formData.rules}
          onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
          className="w-full px-4 py-3 bg-[#F1F5F9] border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 resize-none"
        />
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Booking Cancellation Policy</label>
        <select 
          value={formData.cancellationPolicy}
          onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 appearance-none ${
            errors.cancellationPolicy ? 'border-red-500' : 'border-slate-200/60'
          }`}
        >
          <option value="">Select cancellation term</option>
          <option value="no-refund">Strict: No Refund on cancellation</option>
          <option value="50-percent">Moderate: 50% Refund on cancellation</option>
          <option value="full-refund">Flexible: 100% Refund on cancellation</option>
        </select>
        {errors.cancellationPolicy && <p className="text-[10px] text-red-500 font-bold">{errors.cancellationPolicy}</p>}
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
