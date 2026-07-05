import React from 'react';
import { Download, AlertCircle, Calendar, Receipt } from 'lucide-react';

export default function BookingsTable({ bookings = [], title = 'Real-time Bookings' }) {
  
  // CSV Export utility
  const exportToCSV = () => {
    if (bookings.length === 0) return;

    // Header row
    const headers = ['Booking ID', 'User Email', 'Sport', 'Date', 'Slots', 'Total Amount', 'Advance Paid', 'Status', 'Booking Date'];
    
    // Data rows
    const rows = bookings.map(b => [
      b.id || b._id,
      b.userId || 'Guest',
      b.sport,
      b.date,
      (b.slots || []).join('; '),
      b.totalAmount,
      b.advancePaid,
      b.status,
      b.createdAt || ''
    ]);

    // Build content
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `bookings_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-danger/15 border border-danger/30 text-danger text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-wider">{status || 'Pending'}</span>;
    }
  };

  return (
    <div className="bg-cardbg border border-white/5 rounded-2xl overflow-hidden shadow-lg space-y-4 p-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>{title}</span>
          </h4>
          <p className="text-xs text-muted mt-0.5">Track, review status, or export booking ledgers.</p>
        </div>
        
        {bookings.length > 0 && (
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 border border-white/10 hover:border-primary/50 text-white hover:text-primary rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="p-8 text-center bg-white/2 border border-white/5 rounded-xl space-y-2">
          <AlertCircle className="w-8 h-8 text-muted mx-auto" />
          <p className="text-xs text-muted">No booking records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-muted font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Booking ID</th>
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Sport</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Slots</th>
                <th className="pb-3 px-4 text-right">Amount</th>
                <th className="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {bookings.map((booking) => (
                <tr key={booking.id || booking._id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 pr-4 text-white font-medium">{booking.id || booking._id}</td>
                  <td className="py-3.5 px-4 text-muted font-semibold max-w-[120px] truncate">{booking.userId || 'Guest User'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-white">
                      {booking.sport}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted flex items-center space-x-1.5 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{booking.date}</span>
                  </td>
                  <td className="py-3.5 px-4 text-white">
                    <div className="flex flex-wrap gap-1">
                      {booking.slots?.map((slot, i) => (
                        <span key={i} className="text-[10px] text-muted">
                          {slot}{i < booking.slots.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right text-white font-bold">
                    <div className="space-y-0.5">
                      <span className="block">₹{booking.advancePaid} <span className="text-[9px] text-success">(Adv)</span></span>
                      <span className="block text-[10px] text-muted">Total: ₹{booking.totalAmount}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pl-4 text-right">{getStatusBadge(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
