import React from 'react';
import { Calendar, Clock, MapPin, Receipt, ShieldCheck } from 'lucide-react';

export default function BookingSummary({ booking }) {
  if (!booking || !booking.slots || booking.slots.length === 0) return null;

  return (
    <div className="bg-cardbg border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-primary" />
          <span>Booking Summary</span>
        </h3>
        <p className="text-xs text-muted mt-0.5">Please review your slots before paying</p>
      </div>

      <div className="space-y-4">
        {/* Arena details */}
        <div>
          <h4 className="text-sm font-bold text-white">{booking.turfName}</h4>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
            🏈 {booking.sport}
          </span>
        </div>

        {/* Date and Time slots */}
        <div className="space-y-2 p-3 bg-[#0D1117]/80 rounded-xl border border-white/5 text-xs text-muted">
          <div className="flex items-center space-x-2 text-white font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Date: {booking.date}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <span className="block font-medium text-white">Selected Slots ({booking.slots.length}):</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {booking.slots.map((slot, index) => (
                    <span key={index} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[10px] text-white rounded-md font-semibold">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total Hours</span>
            <span className="text-white font-medium">{booking.slots.length} hr(s)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal Price</span>
            <span className="text-white font-medium">₹{booking.totalAmount}</span>
          </div>

          <hr className="border-white/5" />

          {/* SaaS Advance breakdown */}
          <div className="flex justify-between text-sm p-2 bg-success/5 border border-success/10 rounded-lg">
            <span className="text-success font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Advance to Pay (20%)</span>
            </span>
            <span className="text-success font-bold text-base">₹{booking.advancePaid}</span>
          </div>

          <div className="flex justify-between text-xs text-muted px-2">
            <span>Payable at Venue (80%)</span>
            <span>₹{booking.remainingAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
