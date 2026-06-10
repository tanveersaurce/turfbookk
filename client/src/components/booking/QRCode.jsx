import React from 'react';
import { CheckCircle2, Download, Printer, Share2, Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QRCode({ booking }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-cardbg border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 text-center space-y-6 print:border-none print:shadow-none print:bg-white print:text-black"
    >
      {/* Green Check Animation */}
      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mb-3"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h3 className="text-xl font-extrabold text-white print:text-black">Booking Confirmed!</h3>
        <p className="text-xs text-muted print:text-neutral-500 mt-1">Your slot has been secured successfully.</p>
      </div>

      <hr className="border-white/5 print:border-neutral-200" />

      {/* Ticket Details */}
      <div className="text-left space-y-3 p-4 bg-[#0D1117] print:bg-neutral-100 rounded-xl border border-white/5 print:border-neutral-200">
        <div>
          <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Booking ID</span>
          <span className="text-sm font-bold text-white print:text-black">{booking.id || 'TB-9827364-M'}</span>
        </div>
        <div>
          <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Venue</span>
          <span className="text-sm font-bold text-white print:text-black">{booking.turfName}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Date</span>
            <span className="text-xs font-semibold text-white print:text-black flex items-center space-x-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-primary print:text-neutral-700" />
              <span>{booking.date}</span>
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Sport</span>
            <span className="text-xs font-semibold text-white print:text-black flex items-center space-x-1 mt-1">
              ⚽ <span>{booking.sport}</span>
            </span>
          </div>
        </div>
        <div>
          <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Time Slots</span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {booking.slots?.map((slot, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-white/5 print:bg-neutral-200 border border-white/5 print:border-neutral-300 text-[10px] text-white print:text-black rounded-md font-semibold">
                {typeof slot === 'string' ? slot : `${slot.startTime} - ${slot.endTime}`}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Paid Advance</span>
            <span className="text-sm font-bold text-success">₹{booking.advancePaid}</span>
          </div>
          <div>
            <span className="block text-[10px] text-muted print:text-neutral-500 font-bold uppercase tracking-wider">Pay at Venue</span>
            <span className="text-sm font-bold text-accent print:text-neutral-700">₹{booking.remainingAmount}</span>
          </div>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center space-y-2 py-2 print:py-0">
        <div className="p-3 bg-white rounded-2xl inline-block shadow-lg">
          <img 
            src={booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Booking-${booking.id}-${booking.turfName}`}
            alt="Booking QR Code"
            className="w-36 h-36 object-contain"
          />
        </div>
        <span className="text-[10px] text-muted print:text-neutral-400">Scan QR Code at the venue entry</span>
      </div>

      <hr className="border-white/5 print:border-neutral-200" />

      {/* Actions */}
      <div className="flex justify-center space-x-3 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:border-primary/50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
        >
          <Printer className="w-4 h-4 text-primary" />
          <span>Print / Save</span>
        </button>
        <button 
          onClick={() => alert('Download starting...')}
          className="flex-1 py-2.5 bg-primary hover:bg-primary-light text-black rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(0,200,83,0.1)] hover:shadow-[0_0_15px_rgba(0,200,83,0.3)]"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>
    </motion.div>
  );
}
