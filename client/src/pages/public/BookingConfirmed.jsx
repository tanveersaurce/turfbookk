import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import { CheckCircle, Download, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

export const BookingConfirmed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getBookingReceiptData } = useBooking();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const bookingId = searchParams.get('id');

  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }

    const fetchBookingDetails = async () => {
      setLoading(true);
      const res = await getBookingReceiptData(bookingId);
      setLoading(false);
      if (res.success) {
        setBooking(res.data);
      } else {
        toast.error('Failed to load booking receipt details.');
        navigate('/');
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownloadReceipt = () => {
    if (!booking) return;
    // Direct link to backend PDFKit streaming endpoint
    window.open(`/api/bookings/${booking._id}/receipt`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto my-12 p-8 bg-white rounded-xl shadow-md space-y-6">
        <SkeletonLoader className="h-12 w-12 rounded-full mx-auto" />
        <SkeletonLoader className="h-6 w-48 mx-auto" />
        <SkeletonLoader className="h-32 w-full" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-[600px] mx-auto my-12 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-outlineVariant text-secondary">
      {/* Header Success Section */}
      <div className="text-center space-y-3 mb-8">
        <CheckCircle className="w-16 h-16 text-primary mx-auto stroke-[2.5]" />
        <h1 className="font-inter font-extrabold text-[28px] text-secondary tracking-tight">Booking Confirmed!</h1>
        <div className="inline-block px-3 py-1 bg-primary/10 text-secondary font-bold text-[13px] rounded-full uppercase tracking-wider">
          Game Ready ✓
        </div>
        <p className="font-inter text-[15px] text-[#5f5e5e] max-w-[420px] mx-auto">
          Your reservation is confirmed. We've sent a booking receipt to your registered email address.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-neutralBg border border-outlineVariant rounded-xl p-6 space-y-4 mb-6">
        <div className="border-b border-outlineVariant pb-3 flex justify-between items-center">
          <span className="font-inter font-bold text-[14px] uppercase text-[#5f5e5e] tracking-wider">Receipt Details</span>
          <span className="font-inter font-extrabold text-[15px] text-secondary">ID: {booking.bookingId}</span>
        </div>

        {/* Venue Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-inter font-bold text-[16px] text-secondary">{booking.turf.name}</p>
              <p className="font-inter text-[13px] text-[#5f5e5e]">{booking.turf.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Date */}
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[11px] text-[#5f5e5e] uppercase font-bold">Date</p>
                <p className="text-[14px] font-bold text-secondary">{booking.date}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[11px] text-[#5f5e5e] uppercase font-bold">Time Slot</p>
                <p className="text-[14px] font-bold text-secondary">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Sport */}
            <div className="flex items-center gap-2.5">
              <span className="text-[16px] flex-shrink-0">🏆</span>
              <div>
                <p className="text-[11px] text-[#5f5e5e] uppercase font-bold">Sport</p>
                <p className="text-[14px] font-bold text-secondary capitalize">{booking.sport}</p>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[11px] text-[#5f5e5e] uppercase font-bold">Amount Paid</p>
                <p className="text-[16px] font-extrabold text-secondary">₹{booking.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadReceipt}
          className="flex-1 py-3.5 bg-secondary hover:bg-secondary-light text-white font-bold rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-md"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </button>
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-secondary font-bold rounded-lg transition-colors shadow-md text-center"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmed;
