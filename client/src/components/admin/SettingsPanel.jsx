import React, { useState, useEffect } from 'react';
import { Percent, Save, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPanel({ initialCommission, initialAdvancePercent, handleSaveSettings }) {
  const [commission, setCommission] = useState(initialCommission || 10);
  const [advancePercent, setAdvancePercent] = useState(initialAdvancePercent || 20);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync inputs if initial values change after mount
  useEffect(() => {
    setCommission(initialCommission);
  }, [initialCommission]);

  useEffect(() => {
    setAdvancePercent(initialAdvancePercent);
  }, [initialAdvancePercent]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await handleSaveSettings({
      commission,
      advancePercent
    });
    setSaving(false);

    if (success) {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-lg"
    >
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Global Configuration</h2>
        <p className="text-xs text-slate-500 font-medium">Manage transaction commission fee percentages and default parameter grids.</p>
      </div>

      <form onSubmit={onSubmit} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5">
        {settingsSuccess && (
          <div className="p-3 bg-green-50 border border-green-100 text-[#5D7A00] rounded-2xl text-xs flex items-center space-x-2 font-bold animate-bounce">
            <Check className="w-4 h-4" />
            <span>Platform settings saved!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5 text-[#5D7A00]" />
              <span>Commission %</span>
            </label>
            <input 
              type="number" 
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-bold focus:outline-none focus:border-[#5D7A00]"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5 text-[#5D7A00]" />
              <span>Advance Payment %</span>
            </label>
            <input 
              type="number" 
              value={advancePercent}
              onChange={(e) => setAdvancePercent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-850 font-bold focus:outline-none focus:border-[#5D7A00]"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">SMS Confirmation Template</label>
          <div className="relative">
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 resize-none cursor-not-allowed font-medium"
              value="Hi {user}, your booking at {turf} for {date} is CONFIRMED. Present this QR at entry."
              disabled
            />
            <Lock className="absolute right-4 bottom-4 w-4 h-4 text-slate-400" />
          </div>
          <span className="block text-[10px] text-slate-400 italic">Locked. Contact system administrator for templates changes.</span>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-[#AAEE00] text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow-md uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
