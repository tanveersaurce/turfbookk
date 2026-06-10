import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialCities = [
  {
    name: 'Mumbai',
    region: 'Maharashtra',
    countText: '112 Turfs Available',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-2 h-64'
  },
  {
    name: 'Bangalore',
    region: 'Karnataka',
    countText: '89 Turfs',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Delhi',
    region: 'Delhi NCR',
    countText: '78 Turfs',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Bhopal',
    region: 'Madhya Pradesh',
    countText: '24 Turfs',
    image: 'https://images.unsplash.com/photo-1600256698643-4d934a41914a?auto=format&fit=crop&w=600&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Indore',
    region: 'Madhya Pradesh',
    countText: '31 Turfs',
    image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=600&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Pune',
    region: 'Maharashtra',
    countText: '45 Turfs',
    image: 'https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=800&q=80',
    gridClass: 'md:col-span-3 h-72',
    hasProfileOverlay: true
  },
  {
    name: 'London',
    region: 'Greater London',
    countText: '95 Turfs',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Madrid',
    region: 'Community of Madrid',
    countText: '67 Turfs',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Dubai',
    region: 'Dubai Emirates',
    countText: '82 Turfs',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80',
    gridClass: 'md:col-span-1 h-64'
  },
  {
    name: 'Singapore',
    region: 'Singapore Region',
    countText: '58 Turfs',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80',
    gridClass: 'md:col-span-1 h-64'
  }
];

export default function Cities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = initialCities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCityClick = (cityName) => {
    navigate(`/search?city=${cityName}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page for the first matching result if exists
      const match = filteredCities[0];
      if (match) {
        handleCityClick(match.name);
      }
    }
  };

  const popularCities = ['Mumbai', 'Bangalore', 'Delhi'];

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-800 font-inter">
      {/* 1. DARK SEARCH BANNER */}
      <div className="w-full bg-[#1E232E] py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Ready for the <span className="text-primary">Next Level?</span>
          </h1>

          {/* Search Bar Container */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="flex items-center space-x-2 pl-3 flex-grow">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for your city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-400 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#AAEE00] hover:bg-[#BBEF11] text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              EXPLORE
            </button>
          </form>

          {/* Popular Cities tags */}
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
            <span>Popular:</span>
            {popularCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCityClick(c)}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRID HUB LIST (Light Background) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Top Playing Hubs</h2>
          <div className="w-12 h-1 bg-primary rounded-full mt-2"></div>
        </div>

        {/* Cities Grid with layouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCities.map((city, idx) => (
            <motion.div
              key={city.name}
              whileHover={{ scale: 1.015 }}
              onClick={() => handleCityClick(city.name)}
              className={`relative rounded-3xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm group ${city.gridClass}`}
            >
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 z-10 transition-colors group-hover:from-black/90"></div>
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700"
              />
              
              {/* Bottom Info text */}
              <div className="absolute bottom-5 left-6 z-20 text-left">
                <span className="block text-xl font-black text-white tracking-wide uppercase group-hover:text-primary transition-colors">
                  {city.name}
                </span>
                <span className="block text-xs text-slate-300 font-bold mt-0.5">
                  {city.countText}
                </span>
              </div>

              {/* Pune Card profile stack overlays */}
              {city.hasProfileOverlay && (
                <div className="absolute bottom-5 right-6 z-20 flex items-center -space-x-2.5">
                  <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Avatar" />
                  <img src="https://i.pravatar.cc/100?img=12" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Avatar" />
                  <img src="https://i.pravatar.cc/100?img=47" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Avatar" />
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-black border-2 border-white shadow-md">
                    +12k
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {filteredCities.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Info className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Cities Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">Try searching for other active sports hubs.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. REQUEST LOCATION CTA FOOTER BLOCK */}
      <div className="w-full bg-[#1E232E] py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Don't see your city?</h2>
          <p className="text-xs md:text-sm text-slate-400 font-bold leading-relaxed max-w-lg mx-auto">
            We are expanding rapidly across India. Register your interest and be the first to know when we launch in your area.
          </p>
          <button
            type="button"
            className="px-6 py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/10 focus:outline-none"
          >
            Request a Location
          </button>
        </div>
      </div>
    </div>
  );
}
