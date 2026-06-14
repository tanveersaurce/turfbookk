import React, { useState, useRef } from 'react';
import { Upload, X, Star, AlertCircle, Check } from 'lucide-react';

export default function Step5Photos({ formData, setFormData, onSubmit, onBack, submitting }) {
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const tempErrors = {};
    if (formData.turfImages.length === 0) {
      tempErrors.turfImages = 'Please upload at least 1 photo of your turf.';
    }
    if (!formData.agreedToTerms) {
      tempErrors.agreedToTerms = 'You must agree to the Terms of Service & Privacy Policy.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter out non-images
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (formData.turfImages.length + imageFiles.length > 5) {
      alert('You can upload a maximum of 5 images.');
      return;
    }

    const updated = [...formData.turfImages, ...imageFiles];
    setFormData({ ...formData, turfImages: updated });
  };

  const removePhoto = (indexToRemove) => {
    const updated = formData.turfImages.filter((_, idx) => idx !== indexToRemove);
    
    // Reset cover index if index is out of bounds
    let newCoverIndex = formData.coverImageIndex;
    if (newCoverIndex >= updated.length) {
      newCoverIndex = Math.max(0, updated.length - 1);
    }
    
    setFormData({ 
      ...formData, 
      turfImages: updated,
      coverImageIndex: newCoverIndex
    });
  };

  const setCoverPhoto = (index) => {
    setFormData({ ...formData, coverImageIndex: index });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Step 5: Photos & Finalize</h3>
        <p className="text-xs text-slate-400 font-medium">Upload photos of your turf ground. A minimum of 1 photo is required.</p>
      </div>

      {/* Upload Zone */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">Turf Photos (Max 5, Select one as Cover)</label>
        
        <div 
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-[#AAEE00] bg-slate-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center space-y-2"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Add Turf Photos</span>
          <span className="text-[10px] text-slate-400">Upload high quality venue photos (Max size 5MB each)</span>
        </div>
        {errors.turfImages && <p className="text-[10px] text-red-500 font-bold">{errors.turfImages}</p>}
      </div>

      {/* Image Previews Grid */}
      {formData.turfImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-4">
          {formData.turfImages.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            const isCover = formData.coverImageIndex === idx;
            return (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-150">
                <img 
                  src={previewUrl} 
                  alt={`Turf preview ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Delete overlay */}
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Cover indicator / Selector */}
                <button
                  type="button"
                  onClick={() => setCoverPhoto(idx)}
                  className={`absolute bottom-1 left-1 p-1 rounded-lg transition-colors focus:outline-none flex items-center ${
                    isCover 
                      ? 'bg-[#AAEE00] text-[#1A1A1A] font-extrabold text-[9px]' 
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                  title={isCover ? "Cover Image" : "Make Cover Image"}
                >
                  <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-[#1A1A1A]' : ''}`} />
                  {isCover && <span className="ml-0.5">Cover</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Terms and Conditions Checkbox */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start space-x-2.5">
          <input 
            type="checkbox"
            id="termsAgree"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
            className="mt-1.5 rounded border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5"
          />
          <label htmlFor="termsAgree" className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            I certify that the information provided is accurate and representational of the actual property. I agree to TurfBook's Partner Terms of Service and Privacy Policy.
          </label>
        </div>
        {errors.agreedToTerms && <p className="text-[10px] text-red-500 font-bold">{errors.agreedToTerms}</p>}
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200/40 rounded-2xl text-[10px] font-bold text-slate-500">
        📝 Note: Applications take 24-48 hours to be reviewed by the onboarding staff. You will receive credentials in your email inbox once approved.
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <button 
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="col-span-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all focus:outline-none disabled:opacity-50"
        >
          Back
        </button>
        <button 
          type="submit"
          disabled={submitting}
          className="col-span-2 py-3.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(170,238,0,0.25)] focus:outline-none disabled:opacity-50"
        >
          <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
        </button>
      </div>
    </form>
  );
}
