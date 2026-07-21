import React from 'react';
import StatsCard from '../dashboard/StatsCard';
import RevenueChart from '../dashboard/RevenueChart';
import BookingsTable from '../dashboard/BookingsTable';
import { TrendingUp, Award, UserCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardOverview({ stats, bookings }) {
  const activeBookings = (bookings || []).filter(b => b.status?.toLowerCase() === 'confirmed' || b.paymentStatus?.toLowerCase() === 'paid');
  
  // Calculate dynamic stats
  const dynamicGmv = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const dynamicRevenue = Math.round(dynamicGmv * 0.10); // 10% commission

  // Calculate dynamic peak booking hours
  const overallSlots = (bookings || []).flatMap(b => (b.slots || []).map(s => ({ slot: s, sport: b.sport })));
  const overallSlotCounts = overallSlots.reduce((acc, item) => {
    const key = `${item.slot}_${item.sport}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sortedOverallSlots = Object.entries(overallSlotCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, count]) => {
      const [time, sport] = key.split('_');
      return {
        time,
        sport: sport || 'Football',
        load: count > 1 ? `${count} Bookings` : '1 Booking'
      };
    });

  const peakSlotsList = sortedOverallSlots.length > 0 
    ? sortedOverallSlots 
    : [
        { time: '05:00 PM - 07:00 PM', sport: 'Football', load: 'Available' },
        { time: '07:00 PM - 09:00 PM', sport: 'Cricket', load: 'Available' },
        { time: '08:00 AM - 10:00 AM', sport: 'Badminton', load: 'Available' },
        { time: '06:00 PM - 08:00 PM', sport: 'Box Cricket', load: 'Available' }
      ];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Platform GMV"
          value={`₹${dynamicGmv.toLocaleString('en-IN')}`}
          change="Active"
          icon={TrendingUp}
          color="primary"
        />

        <StatsCard
          title="Platform Revenue"
          value={`₹${dynamicRevenue.toLocaleString('en-IN')}`}
          change="Earnings"
          icon={Award}
          color="accent"
        />

        <StatsCard
          title="Active Turf Arenas"
          value={stats.totalTurfs}
          change="Approved"
          icon={UserCheck}
          color="success"
        />

        <StatsCard
          title="Registered Users"
          value={stats.totalUsers}
          change="Registered"
          icon={Users}
          color="danger"
        />
      </div>

      {/* Split details section: Chart (2/3) + Peak Hours (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Area line chart reused */}
        <div className="lg:col-span-2">
          <RevenueChart bookings={bookings} />
        </div>

        {/* Dark peak hours card */}
        <div className="p-6 bg-[#20242B] text-white rounded-3xl flex flex-col justify-between h-full shadow-lg border border-slate-800">
          <div className="space-y-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#AAEE00]/20 text-[#AAEE00] text-[9px] font-bold uppercase tracking-wider rounded-md">Usage Stats</span>
              <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-wider">Peak Booking Hours</h4>
              <p className="text-[10px] text-slate-400 font-medium">Most active slots across all registered arenas.</p>
            </div>

            <div className="space-y-2.5">
              {peakSlotsList.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors">
                  <div>
                    <span className="block font-bold text-white">{s.time}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold">{s.sport}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#AAEE00]/10 text-[#AAEE00] text-[9px] font-black">{s.load}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings table reused */}
      <BookingsTable bookings={bookings} title="Recent Platform Transactions" />
    </motion.div>
  );
}
