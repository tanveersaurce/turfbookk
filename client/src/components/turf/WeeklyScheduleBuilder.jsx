import React, { useState } from 'react';
import { Save, Check, X, Calendar } from 'lucide-react';

export default function WeeklyScheduleBuilder({ initialSchedule, onSave }) {
  const [schedule, setSchedule] = useState(initialSchedule || {
    mon: { open: '06:00', close: '22:00', isOpen: true },
    tue: { open: '06:00', close: '22:00', isOpen: true },
    wed: { open: '06:00', close: '22:00', isOpen: true },
    thu: { open: '06:00', close: '22:00', isOpen: true },
    fri: { open: '06:00', close: '22:00', isOpen: true },
    sat: { open: '06:00', close: '22:00', isOpen: true },
    sun: { open: '06:00', close: '22:00', isOpen: true },
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const days = [
    { key: 'mon', name: 'Monday' },
    { key: 'tue', name: 'Tuesday' },
    { key: 'wed', name: 'Wednesday' },
    { key: 'thu', name: 'Thursday' },
    { key: 'fri', name: 'Friday' },
    { key: 'sat', name: 'Saturday' },
    { key: 'sun', name: 'Sunday' },
  ];

  const handleToggle = (dayKey) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen
      }
    }));
  };

  const handleTimeChange = (dayKey, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      if (onSave) {
        await onSave(schedule);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-cardbg rounded-2xl border border-white/5 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Weekly Opening Hours</span>
        </h3>
        <p className="text-xs text-muted mt-1">Configure opening times, closing times, and weekly off days for your turf.</p>
      </div>

      <div className="space-y-4">
        {days.map((day) => {
          const config = schedule[day.key] || { open: '06:00', close: '22:00', isOpen: true };
          return (
            <div key={day.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 gap-3">
              {/* Day Name & Toggle */}
              <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                <span className="text-sm font-semibold text-white w-24">{day.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(day.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    config.isOpen
                      ? 'bg-success/15 border-success/30 text-success'
                      : 'bg-danger/15 border-danger/30 text-danger'
                  }`}
                >
                  {config.isOpen ? 'OPEN' : 'CLOSED'}
                </button>
              </div>

              {/* Time Fields (only if open) */}
              {config.isOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-muted uppercase font-bold">Open:</span>
                    <input
                      type="time"
                      value={config.open}
                      onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                      className="px-2 py-1 bg-[#0D1117] border border-white/10 rounded-lg text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                  <span className="text-muted text-xs">to</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-muted uppercase font-bold">Close:</span>
                    <input
                      type="time"
                      value={config.close}
                      onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                      className="px-2 py-1 bg-[#0D1117] border border-white/10 rounded-lg text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted italic">Closed for weekly off</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        {success && (
          <span className="text-xs text-success font-semibold flex items-center space-x-1">
            <Check className="w-4 h-4" /> <span>Schedule updated successfully!</span>
          </span>
        )}
        <div className="flex-grow"></div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-primary hover:bg-primary-light text-black text-xs font-bold rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
        </button>
      </div>
    </form>
  );
}
