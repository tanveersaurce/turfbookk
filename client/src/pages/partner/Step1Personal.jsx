import React, { useState } from 'react';
import { Mail, Phone, User, MapPin } from 'lucide-react';

export default function Step1Personal({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.applicantName.trim()) tempErrors.applicantName = 'Full Name is required.';
    
    if (!formData.email.trim()) tempErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) tempErrors.email = 'Invalid email format.';
    
    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(formData.phone.trim())) tempErrors.phone = 'Phone number must be exactly 10 digits.';
    
    if (!formData.city) tempErrors.city = 'Please select your city.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const cities = ['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

  return (
    <form onSubmit={handleNext} className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Step 1: Contact Details</h3>
        <p className="text-xs text-slate-400 font-medium">Please provide your personal information to start onboarding.</p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="John Doe"
            value={formData.applicantName}
            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
            className={`w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
              errors.applicantName ? 'border-red-500' : 'border-slate-200/60'
            }`}
          />
        </div>
        {errors.applicantName && <p className="text-[10px] text-red-500 font-bold">{errors.applicantName}</p>}
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
              errors.email ? 'border-red-500' : 'border-slate-200/60'
            }`}
          />
        </div>
        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Phone Number</label>
        <div className="flex gap-2">
          <div className="w-16 py-3 bg-[#F1F5F9] border border-slate-200/60 rounded-2xl flex items-center justify-center text-sm font-bold text-slate-650">
            +91
          </div>
          <div className="relative flex-1">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              className={`w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
                errors.phone ? 'border-red-500' : 'border-slate-200/60'
              }`}
            />
          </div>
        </div>
        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
      </div>

      {/* City Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">City</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <select 
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={`w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 appearance-none ${
              errors.city ? 'border-red-500' : 'border-slate-200/60'
            }`}
          >
            <option value="">Select your city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {errors.city && <p className="text-[10px] text-red-500 font-bold">{errors.city}</p>}
      </div>

      {/* Action Button */}
      <button 
        type="submit"
        className="w-full py-3.5 mt-4 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.25)] focus:outline-none"
      >
        <span>Next Step</span>
      </button>
    </form>
  );
}
