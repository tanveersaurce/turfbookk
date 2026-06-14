import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function Step2Business({ formData, setFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const gstInputRef = useRef(null);
  const idInputRef = useRef(null);

  const validate = () => {
    const tempErrors = {};
    if (!formData.businessName.trim()) tempErrors.businessName = 'Business Name is required.';
    
    if (formData.hasGst) {
      if (!formData.gstNumber.trim()) tempErrors.gstNumber = 'GST Number is required.';
      else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber.trim().toUpperCase())) {
        tempErrors.gstNumber = 'Invalid GST format (Format: 22AAAAA1111A1Z1).';
      }
      if (!formData.gstCertificateFile) tempErrors.gstCertificate = 'GST Certificate is required when GST is enabled.';
    }

    if (!formData.businessAddress.trim()) tempErrors.businessAddress = 'Business Address is required.';
    if (!formData.experience) tempErrors.experience = 'Please select business experience.';
    if (!formData.idProofFile) tempErrors.idProof = 'ID Proof document is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleGstFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, gstCertificateFile: file });
    }
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, idProofFile: file });
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Step 2: Business & Documents</h3>
        <p className="text-xs text-slate-400 font-medium">Verify your registered corporate details and upload certificates.</p>
      </div>

      {/* Business Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Business / Entity Name</label>
        <input 
          type="text"
          placeholder="Elite Sports Private Limited"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
            errors.businessName ? 'border-red-500' : 'border-slate-200/60'
          }`}
        />
        {errors.businessName && <p className="text-[10px] text-red-500 font-bold">{errors.businessName}</p>}
      </div>

      {/* GST Toggle & Number */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/40 rounded-2xl">
          <div>
            <label className="text-sm font-bold text-slate-800">Do you have a GST number?</label>
            <p className="text-[10px] text-slate-400 font-semibold">Enable to provide business tax billing details.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox"
              checked={formData.hasGst}
              onChange={(e) => setFormData({ ...formData, hasGst: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AAEE00]"></div>
          </label>
        </div>

        {formData.hasGst && (
          <div className="space-y-3 pl-2 border-l-2 border-[#AAEE00]/40">
            {/* GST Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">GST Registration Number</label>
              <input 
                type="text"
                placeholder="22AAAAA1111A1Z1"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
                  errors.gstNumber ? 'border-red-500' : 'border-slate-200/60'
                }`}
              />
              {errors.gstNumber && <p className="text-[10px] text-red-500 font-bold">{errors.gstNumber}</p>}
            </div>

            {/* GST File Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">GST Registration Certificate</label>
              <div 
                onClick={() => gstInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center space-y-2 ${
                  errors.gstCertificate ? 'border-red-400 bg-red-50/10' : 'border-[#AAEE00] bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={gstInputRef}
                  onChange={handleGstFileChange}
                  accept="application/pdf,image/*"
                  className="hidden"
                />
                
                {formData.gstCertificateFile ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">{formData.gstCertificateFile.name}</span>
                    <span className="text-[10px] text-slate-400">Click to change document</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Upload GST Certificate</span>
                    <span className="text-[10px] text-slate-400">Drag & Drop or Click to browse (PDF or Image)</span>
                  </>
                )}
              </div>
              {errors.gstCertificate && <p className="text-[10px] text-red-500 font-bold">{errors.gstCertificate}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Business Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Registered Office Address</label>
        <textarea 
          rows={3}
          placeholder="Flat/Shop No, Building Name, Street Name..."
          value={formData.businessAddress}
          onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 resize-none ${
            errors.businessAddress ? 'border-red-500' : 'border-slate-200/60'
          }`}
        />
        {errors.businessAddress && <p className="text-[10px] text-red-500 font-bold">{errors.businessAddress}</p>}
      </div>

      {/* Experience dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Business Experience</label>
        <select
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className={`w-full px-4 py-3 bg-[#F1F5F9] border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#AAEE00]/30 text-slate-800 ${
            errors.experience ? 'border-red-500' : 'border-slate-200/60'
          }`}
        >
          <option value="">Select experience level</option>
          <option value="0-1 years">New Business (0-1 years)</option>
          <option value="1-3 years">Established (1-3 years)</option>
          <option value="3-5 years">Experienced (3-5 years)</option>
          <option value="5+ years">Veteran (5+ years)</option>
        </select>
        {errors.experience && <p className="text-[10px] text-red-500 font-bold">{errors.experience}</p>}
      </div>

      {/* Upload ID Proof */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Applicant ID Proof (Aadhaar / PAN / Passport)</label>
        <div 
          onClick={() => idInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center space-y-2 ${
            errors.idProof ? 'border-red-400 bg-red-50/10' : 'border-[#AAEE00] bg-slate-50/50'
          }`}
        >
          <input 
            type="file" 
            ref={idInputRef}
            onChange={handleIdFileChange}
            accept="application/pdf,image/*"
            className="hidden"
          />
          
          {formData.idProofFile ? (
            <>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">{formData.idProofFile.name}</span>
              <span className="text-[10px] text-slate-400">Click to change document</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Upload ID Proof</span>
              <span className="text-[10px] text-slate-400">Drag & Drop or Click to browse (PDF or Image)</span>
            </>
          )}
        </div>
        {errors.idProof && <p className="text-[10px] text-red-500 font-bold">{errors.idProof}</p>}
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
