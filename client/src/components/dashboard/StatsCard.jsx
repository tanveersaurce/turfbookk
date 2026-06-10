import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    success: 'text-success bg-success/10 border-success/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="p-5 bg-cardbg border border-white/5 rounded-2xl flex items-center justify-between"
    >
      <div className="space-y-1.5">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{title}</span>
        <span className="block text-2xl font-extrabold text-white">{value}</span>
        {change && (
          <span className={`block text-[10px] font-bold uppercase ${change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
            {change} <span className="text-muted font-normal lowercase">vs last month</span>
          </span>
        )}
      </div>

      <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.primary}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </motion.div>
  );
}
