import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { turfService } from '../../services/api';
import TurfCard from '../../components/turf/TurfCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { MapPin, Star, Heart, Grid, SlidersHorizontal, ChevronDown, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getCityRegion = (cityName) => {
  const lookup = {
    Bhopal: 'Madhya Pradesh, India',
    Indore: 'Madhya Pradesh, India',
    Delhi: 'Delhi NCR, India',
    Mumbai: 'Maharashtra, India',
    Bangalore: 'Karnataka, India',
    Pune: 'Maharashtra, India',
    Hyderabad: 'Telangana, India',
    Chennai: 'Tamil Nadu, India',
    London: 'Greater London, United Kingdom',
    Madrid: 'Madrid, Spain',
    Dubai: 'Dubai, United Arab Emirates',
    Singapore: 'Singapore, Singapore'
  };
  return lookup[cityName] || `${cityName}, India`;
};

const sportsList = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Box Cricket', emoji: '🎯' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Volleyball', emoji: '🏐' }
];

export default function Search() {
  const [urlParams, setUrlParams] = useSearchParams();
  
  // URL Param Sync
  const [city, setCity] = useState(urlParams.get('city') || 'Bhopal');
  const [sport, setSport] = useState(urlParams.get('sport') || 'Football');
  
  // Sidebar Filters local states
  const [minPrice] = useState(200);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedRating, setSelectedRating] = useState(4); // default 4+ star
  const [amenities, setAmenities] = useState({
    parking: false,
    floodlights: true, // default checked in mockup
    washroom: false,
    cafeteria: false
  });

  // Header quick filters states
  const [sortOrder, setSortOrder] = useState('rating'); // rating | priceAsc | priceDesc
  const [priceFilter, setPriceFilter] = useState('any'); // any | under800 | under1200 | above1200
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [visibleCount, setVisibleCount] = useState(6);

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL params change (e.g. city clicked from Home)
  useEffect(() => {
    const urlCity = urlParams.get('city');
    const urlSport = urlParams.get('sport');
    if (urlCity) setCity(urlCity);
    if (urlSport) setSport(urlSport);
  }, [urlParams]);

  useEffect(() => {
    const fetchFilteredTurfs = async () => {
      setLoading(true);
      try {
        const queryParams = {
          city,
          sport: sport !== 'Multi-Sport' ? sport : undefined
        };
        const data = await turfService.getTurfs(queryParams);
        setTurfs(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredTurfs();
    
    // Sync back to URL
    setUrlParams({ city, sport });
  }, [city, sport]);

  const toggleAmenity = (name) => {
    setAmenities(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleClearFilters = () => {
    setMaxPrice(2000);
    setSelectedRating(0);
    setAmenities({
      parking: false,
      floodlights: false,
      washroom: false,
      cafeteria: false
    });
    setPriceFilter('any');
    setSortOrder('rating');
  };

  // Perform multi-layer client-side filtering
  const filteredTurfs = turfs
    .filter(t => {
      // 1. Sport check (ensure sport matches)
      if (sport && !t.sports?.some(s => s.toLowerCase() === sport.toLowerCase())) {
        return false;
      }

      // 2. Price filter check (sidebar and header dropdown)
      const startingPrice = t.pricePerHour || 800;
      if (startingPrice < minPrice || startingPrice > maxPrice) return false;

      if (priceFilter === 'under800' && startingPrice >= 800) return false;
      if (priceFilter === 'under1200' && startingPrice >= 1200) return false;
      if (priceFilter === 'above1200' && startingPrice < 1200) return false;

      // 3. Rating filter check (sidebar and header dropdown)
      if (selectedRating > 0 && t.rating < selectedRating) return false;

      // 4. Amenities filter check
      for (const [key, value] of Object.entries(amenities)) {
        if (value) {
          const hasAmenity = t.amenities?.some(a => a.toLowerCase().includes(key));
          if (!hasAmenity) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = a.pricePerHour || 800;
      const priceB = b.pricePerHour || 800;
      
      if (sortOrder === 'priceAsc') return priceA - priceB;
      if (sortOrder === 'priceDesc') return priceB - priceA;
      return b.rating - a.rating; // Top Rated default
    });

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-800 font-inter">
      {/* 1. DARK HEADER BLOCK */}
      <div className="w-full bg-[#1E232E] py-8 text-white text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>&gt;</span>
            <span>Cities</span>
            <span>&gt;</span>
            <span className="text-primary font-bold">{city}</span>
          </div>
          
          {/* Header Title & Summary */}
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">Turfs in {city}</h1>
            <p className="text-xs text-slate-400 font-bold">{getCityRegion(city)} · {filteredTurfs.length} venues available</p>
          </div>

          {/* Sport Pills Bar */}
          <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {sportsList.map((s) => {
              const isActive = sport.toLowerCase() === s.name.toLowerCase();
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSport(s.name)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 transition-all focus:outline-none ${
                    isActive 
                      ? 'bg-primary text-black shadow-md shadow-primary/10' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <span>{s.name}</span>
                  <span>{s.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. BODY RESULTS (Light Background) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Horizontal Sort/Quick Filters Bar */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4 text-left">
          {/* Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer shadow-sm pr-8 appearance-none"
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer shadow-sm pr-8 appearance-none"
              >
                <option value="any">Price: Any</option>
                <option value="under800">Price: Under ₹800</option>
                <option value="under1200">Price: Under ₹1200</option>
                <option value="above1200">Price: Above ₹1200</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer shadow-sm pr-8 appearance-none"
              >
                <option value="0">Rating: Any</option>
                <option value="4.5">Rating: 4.5+ ★</option>
                <option value="4">Rating: 4.0+ ★</option>
                <option value="3.5">Rating: 3.5+ ★</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Amenities Quick Display */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value !== 'placeholder') {
                    toggleAmenity(e.target.value);
                  }
                }}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer shadow-sm pr-8 appearance-none"
                defaultValue="placeholder"
              >
                <option value="placeholder" disabled>Amenities</option>
                <option value="parking">Parking Area {amenities.parking && '✓'}</option>
                <option value="floodlights">Floodlights {amenities.floodlights && '✓'}</option>
                <option value="washroom">Washroom {amenities.washroom && '✓'}</option>
                <option value="cafeteria">Cafeteria {amenities.cafeteria && '✓'}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Right aligned status and layout */}
          <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-bold text-slate-500 w-full md:w-auto">
            <span>{filteredTurfs.length} turfs found</span>
            <div className="flex items-center space-x-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50 shadow-sm">
              <button 
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. SPLIT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-800 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-950">Filters</h3>
              <button 
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[#5D7A00] font-bold hover:underline bg-transparent focus:outline-none"
              >
                Clear All
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Sport Types checkboxes */}
            <div className="space-y-3">
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Sport Type</label>
              <div className="space-y-2.5">
                {sportsList.map((s) => (
                  <label key={s.name} className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-black cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={sport.toLowerCase() === s.name.toLowerCase()}
                      onChange={() => setSport(s.name)}
                      className="rounded border-slate-300 text-primary bg-slate-50 focus:ring-primary w-4 h-4 accent-primary"
                    />
                    <span>{s.name} {s.emoji}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Price Slider */}
            <div className="space-y-3">
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Price Range (₹)</label>
              <div className="relative pt-1">
                <input 
                  type="range"
                  min={200}
                  max={2000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center text-slate-700 shadow-sm">
                  ₹{minPrice}
                </div>
                <div className="text-slate-400 font-bold">-</div>
                <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center text-slate-700 shadow-sm">
                  ₹{maxPrice}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Star Rating buttons */}
            <div className="space-y-3">
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Rating</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5].map((val) => {
                  const isActive = selectedRating === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedRating(val)}
                      className={`py-2.5 border rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center space-y-0.5 focus:outline-none ${
                        isActive 
                          ? 'bg-primary border-primary text-black shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{val === 3 ? '3+' : val === 4 ? '4+' : '5'}</span>
                      <span className="text-[10px] leading-none">★</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Amenities List */}
            <div className="space-y-3">
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Amenities</label>
              <div className="space-y-2.5">
                {[
                  { key: 'parking', label: 'Parking Area' },
                  { key: 'floodlights', label: 'Floodlights' },
                  { key: 'washroom', label: 'Washrooms' },
                  { key: 'cafeteria', label: 'Cafeteria' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-black cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={amenities[item.key] || false}
                      onChange={() => toggleAmenity(item.key)}
                      className="rounded border-slate-300 text-primary bg-slate-50 focus:ring-primary w-4 h-4 accent-primary"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Apply filters button */}
            <button
              type="button"
              className="w-full py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all focus:outline-none shadow-sm shadow-primary/10"
            >
              Apply Filters
            </button>
          </aside>

          {/* Cards Grid */}
          <main className="lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonLoader count={6} />
                </div>
              ) : (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredTurfs.slice(0, visibleCount).map((turf, idx) => (
                    <TurfCard key={turf.id || turf._id} turf={turf} index={idx} />
                  ))}

                  {filteredTurfs.length === 0 && (
                    <div className="col-span-full py-16 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
                      <Info className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="text-base font-bold text-slate-900">No Matching Arenas</h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">Try resetting pricing filters or shifting dates to find available courts.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Button */}
            {filteredTurfs.length > visibleCount && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="px-6 py-3 border border-slate-200 hover:border-slate-400 bg-white rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 mx-auto focus:outline-none shadow-sm text-slate-700 hover:text-black"
                >
                  <span>Load More Turfs</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
