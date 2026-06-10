import React from 'react';
import { AreaChart, Calendar, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RevenueChart({ type = 'line', data }) {
  if (type === 'donut') {
    // Custom SVG Donut Chart representation
    const sportsData = [
      { name: 'Football', value: 55, color: '#00C853' },
      { name: 'Cricket', value: 30, color: '#FFD600' },
      { name: 'Badminton', value: 15, color: '#FF3D57' },
    ];

    return (
      <div className="p-6 bg-cardbg border border-white/5 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Target className="w-4 h-4 text-primary" />
          <span>Bookings by Sport</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
          {/* SVG Donut */}
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
              {/* Football slice (55%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#00C853" strokeWidth="3" 
                strokeDasharray="55 45" strokeDashoffset="0" 
              />
              {/* Cricket slice (30%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#FFD600" strokeWidth="3" 
                strokeDasharray="30 70" strokeDashoffset="-55" 
              />
              {/* Badminton slice (15%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#FF3D57" strokeWidth="3" 
                strokeDasharray="15 85" strokeDashoffset="-85" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white">100%</span>
              <span className="text-[9px] text-muted uppercase font-semibold">Total Share</span>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-3">
            {sportsData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="space-y-0.5">
                  <span className="block font-medium text-white">{item.name}</span>
                  <span className="block text-[10px] text-muted">{item.value}% of bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: LINE / AREA CHART
  return (
    <div className="p-6 bg-cardbg border border-white/5 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <AreaChart className="w-4 h-4 text-primary" />
          <span>Revenue Trend (Last 7 Days)</span>
        </h4>
        <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-muted flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Auto Updates</span>
        </div>
      </div>

      {/* SVG Area Chart */}
      <div className="relative pt-4 h-44 w-full">
        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
          {/* Chart Grid Lines */}
          <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          {/* Area under the line */}
          <path 
            d="M0,180 Q100,140 200,150 T400,90 T600,60 L600,180 L0,180 Z" 
            fill="url(#areaGlow)" 
          />

          {/* Line Path */}
          <path 
            d="M0,180 Q100,140 200,150 T400,90 T600,60" 
            fill="none" 
            stroke="#00C853" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />

          {/* Glowing Points */}
          <circle cx="200" cy="150" r="5" fill="#00C853" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="400" cy="90" r="5" fill="#00C853" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="600" cy="60" r="5" fill="#00C853" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

          {/* Definitions for Glow gradients */}
          <defs>
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C853" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00C853" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-2 text-[10px] text-muted font-bold uppercase tracking-wider">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
