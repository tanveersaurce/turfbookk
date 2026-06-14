import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UsersVenuesList({ users, turfs, handleToggleUser, handleToggleTurfFeature }) {
  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
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

      {/* Manage Arenas Panel */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Sports Arenas</h3>
          <p className="text-[10px] text-slate-400 font-medium">Review and approve listings or toggle featured badges.</p>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
          {turfs.map(t => (
            <div key={t._id || t.id} className="py-3.5 flex justify-between items-center text-xs">
              <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                <img 
                  src={t.images?.[0] || 'https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=300&q=80'} 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" 
                />
                <div className="min-w-0">
                  <Link to={`/admin/review-turf/${t._id || t.id}`} className="block group">
                    <span className="block font-extrabold text-slate-800 group-hover:text-[#5D7A00] flex items-center space-x-2 truncate transition-colors">
                      <span className="truncate">{t.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                        t.isApproved 
                          ? 'bg-green-50 border border-green-100 text-[#5D7A00]' 
                          : 'bg-amber-50 border border-amber-100 text-amber-600'
                      }`}>
                        {t.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </span>
                    <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-semibold truncate transition-colors">{t.area}, {t.city}</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to={`/admin/review-turf/${t._id || t.id}`}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#AAEE00] font-black rounded-xl text-[9px] transition-all shadow-sm"
                >
                  Review Request
                </Link>
                <button
                  onClick={() => handleToggleTurfFeature(t._id || t.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all text-[10px] ${
                    t.isFeatured 
                      ? 'bg-[#AAEE00]/10 border-[#AAEE00]/20 text-[#5D7A00]' 
                      : 'border-slate-200 text-slate-500 hover:text-[#5D7A00] hover:bg-[#AAEE00]/5 hover:border-[#AAEE00]/20'
                  }`}
                >
                  {t.isFeatured ? '★ Featured' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
