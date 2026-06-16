import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UsersVenuesList({ users, handleToggleUser }) {
  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto w-full"
    >
      {/* Platform Users Panel */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Registered Accounts</h3>
          <p className="text-[10px] text-slate-400 font-medium">Activate or temporarily suspend user accounts.</p>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
          {users.map(u => (
            <div key={u._id || u.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="block font-bold text-slate-800">{u.name}</span>
                <span className="block text-[10px] text-slate-400 font-semibold">{u.email} | Role: <span className="text-slate-600 font-bold capitalize">{u.role}</span></span>
              </div>
              <button
                onClick={() => handleToggleUser(u._id || u.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                  u.isActive 
                    ? 'border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100' 
                    : 'bg-red-50 border-red-100 text-red-600 font-bold'
                }`}
              >
                {u.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
