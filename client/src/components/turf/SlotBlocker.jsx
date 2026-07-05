import React, { useState } from 'react';
import { ShieldAlert, Check, AlertCircle } from 'lucide-react';

export default function SlotBlocker({ onBlock }) {
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dateVal}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [reason, setReason] = useState('Routine Maintenance');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    // Basic Validation
    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      setLoading(false);
      return;
    }

    try {
      if (onBlock) {
        await onBlock({ date, startTime, endTime, reason });
      }
      setSuccess(true);
      setReason('Routine Maintenance');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to block slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-cardbg rounded-2xl border border-white/5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-accent" />
          <span>Block Slots Manually</span>
        </h3>
        <p className="text-xs text-muted mt-1">Block specific times for maintenance, coachings, or tournaments. Blocked slots will appear unavailable to customers.</p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-success/10 border border-success/20 text-success rounded-xl flex items-center space-x-2 text-xs">
          <Check className="w-4 h-4" />
          <span>Time slot blocked successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Date</label>
          <input
            type="date"
            min={getLocalDateString()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
            required
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Block Reason</label>
        <input
          type="text"
          placeholder="e.g. Private Tournament, Turf Maintenance, Coaching Sessions"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
          required
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-accent text-black hover:bg-yellow-400 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{loading ? 'Blocking...' : 'Block Slot Now'}</span>
        </button>
      </div>
    </form>
  );
}
