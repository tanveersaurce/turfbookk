import React from 'react';
import { AreaChart, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RevenueChart({ type = 'line', bookings = [] }) {
  const activeBookings = bookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.paymentStatus?.toLowerCase() === 'paid');

  if (type === 'donut') {
    // Calculate dynamic sports share
    const totalActiveBookings = activeBookings.length;
    const sportsCount = activeBookings.reduce((acc, b) => {
      const sportName = b.sport ? b.sport.charAt(0).toUpperCase() + b.sport.slice(1).toLowerCase() : 'Football';
      acc[sportName] = (acc[sportName] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#00C853', '#FFD600', '#FF3D57', '#2196F3', '#9C27B0'];
    const sportsData = Object.entries(sportsCount).map(([name, count], index) => ({
      name,
      value: totalActiveBookings > 0 ? Math.round((count / totalActiveBookings) * 100) : 0,
      color: colors[index % colors.length]
    }));

    if (sportsData.length === 0) {
      sportsData.push({ name: 'Football', value: 100, color: '#00C853' });
    }

    // SVG Slices
    let currentOffset = 0;
    const slices = sportsData.map((item) => {
      const dashArray = `${item.value} ${100 - item.value}`;
      const dashOffset = currentOffset;
      currentOffset -= item.value;
      return {
        ...item,
        dashArray,
        dashOffset
      };
    });

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
              {slices.map((slice, idx) => (
                <circle 
                  key={idx}
                  cx="18" cy="18" r="15.915" fill="none" stroke={slice.color} strokeWidth="3" 
                  strokeDasharray={slice.dashArray} strokeDashoffset={slice.dashOffset} 
                />
              ))}
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

  // DEFAULT: LINE / AREA CHART (Dynamic 7 Days Revenue Trend)
  const getPast7Days = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        dateStr,
        label: dayNames[d.getDay()]
      });
    }
    return days;
  };

  const past7Days = getPast7Days();
  const dailyRevenue = past7Days.map(day => {
    return activeBookings
      .filter(b => b.date === day.dateStr)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  });

  const maxDailyRev = Math.max(...dailyRevenue, 1000);
  const xCoords = [20, 110, 200, 290, 380, 470, 560];
  const yCoords = dailyRevenue.map(rev => 170 - (rev / maxDailyRev) * 140);

  const pathD = `M${xCoords[0]},${yCoords[0]} L${xCoords[1]},${yCoords[1]} L${xCoords[2]},${yCoords[2]} L${xCoords[3]},${yCoords[3]} L${xCoords[4]},${yCoords[4]} L${xCoords[5]},${yCoords[5]} L${xCoords[6]},${yCoords[6]}`;
  const areaD = `M${xCoords[0]},180 L${xCoords[0]},${yCoords[0]} L${xCoords[1]},${yCoords[1]} L${xCoords[2]},${yCoords[2]} L${xCoords[3]},${yCoords[3]} L${xCoords[4]},${yCoords[4]} L${xCoords[5]},${yCoords[5]} L${xCoords[6]},${yCoords[6]} L${xCoords[6]},180 Z`;

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
            d={areaD} 
            fill="url(#areaGlow)" 
          />

          {/* Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#00C853" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />

          {/* Glowing Points */}
          {xCoords.map((x, idx) => (
            <circle key={idx} cx={x} cy={yCoords[idx]} r="5" fill="#00C853" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          ))}

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
        {past7Days.map((day, idx) => (
          <span key={idx}>{day.label}</span>
        ))}
      </div>
    </div>
  );
}
