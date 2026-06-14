import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

import Step1Personal from './Step1Personal';
import Step2Business from './Step2Business';
import Step3TurfDetails from './Step3TurfDetails';
import Step4Amenities from './Step4Amenities';
import Step5Photos from './Step5Photos';

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    city: '',
    businessName: '',
    gstNumber: '',
    hasGst: false,
    businessAddress: '',
    experience: '',
    turfName: '',
    turfAddress: '',
    area: '',
    mapsLink: '',
    operatingHours: { open: '', close: '' },
    pricePerHour: '',
    sports: [],
    amenities: [],
    rules: '',
    cancellationPolicy: '',
    turfImages: [],
    coverImageIndex: 0,
    gstCertificateFile: null,
    idProofFile: null,
    agreedToTerms: false
  });

  const navigate = useNavigate();

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 5));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = new FormData();
      
      // Append files
      formData.turfImages.forEach((imageFile) => {
        data.append('turfImages', imageFile);
      });

      if (formData.hasGst && formData.gstCertificateFile) {
        data.append('gstCertificate', formData.gstCertificateFile);
      }
      if (formData.idProofFile) {
        data.append('idProof', formData.idProofFile);
      }

      // Append standard fields
      data.append('applicantName', formData.applicantName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('city', formData.city);
      data.append('businessName', formData.businessName);
      data.append('gstNumber', formData.gstNumber);
      data.append('hasGst', formData.hasGst);
      data.append('businessAddress', formData.businessAddress);
      data.append('experience', formData.experience);
      data.append('turfName', formData.turfName);
      data.append('turfAddress', formData.turfAddress);
      data.append('area', formData.area);
      data.append('mapsLink', formData.mapsLink);
      data.append('pricePerHour', formData.pricePerHour);
      data.append('rules', formData.rules);
      data.append('cancellationPolicy', formData.cancellationPolicy);
      data.append('coverImageIndex', formData.coverImageIndex);
      data.append('agreedToTerms', formData.agreedToTerms);

      // Stringify complex arrays/objects
      data.append('sports', JSON.stringify(formData.sports));
      data.append('amenities', JSON.stringify(formData.amenities));
      data.append('operatingHours', JSON.stringify(formData.operatingHours));

      const response = await api.post('/applications', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        navigate(`/become-partner/success?id=${response.data.applicationId}`);
      } else {
        toast.error(response.data.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || error.message || 'An error occurred during submission.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0D1117] min-h-screen text-white flex items-center justify-center p-6 sm:p-12 font-inter">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-slate-100 text-slate-800">
        
        {/* Header indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
            <span>Become a Turf Partner</span>
            <span className="text-[#5D7A00] font-black">Step {step} of 5</span>
          </div>
          
          {/* Progress bar capsule */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-full transition-all duration-300 ${
                  s <= step ? 'bg-[#AAEE00]' : 'bg-slate-100'
                } ${s < 5 ? 'border-r border-white' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <Step1Personal 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
          />
        )}
        
        {step === 2 && (
          <Step2Business 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}

        {step === 3 && (
          <Step3TurfDetails 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}

        {step === 4 && (
          <Step4Amenities 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}

        {step === 5 && (
          <Step5Photos 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            submitting={submitting}
          />
        )}

      </div>
    </div>
  );
}
