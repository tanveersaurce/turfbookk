import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCity } from '../../store/turfSlice';
import { turfService } from '../../services/api';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableCityDropdown({ onChange, className = "" }) {
  const dispatch = useDispatch();
  const selectedCity = useSelector((state) => state.turf.searchParams.city);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside of the element
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch available cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const res = await turfService.getAvailableCities();
        if (res.success) {
          setCities(res.data);
        }
      } catch (err) {
        console.error('Failed to load available cities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Focus the search input when the dropdown expands
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current.focus();
      }, 50); // Brief timeout to allow framer-motion mount
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (city) => {
    dispatch(setSelectedCity(city));
    if (onChange) {
      onChange(city);
    }
    setIsOpen(false);
  };

  const filteredCities = cities.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer hover:bg-slate-100/50 hover:border-slate-300 transition-all shadow-sm"
      >
        <div className="flex items-center space-x-2 truncate">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate text-slate-700">{selectedCity}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Animated Dropdown Menu List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Search filter input inside menu list */}
            <div className="p-2 border-b border-slate-100 relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-350 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* List options wrapper */}
            <div className="max-h-48 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
              {loading && cities.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 p-3 text-center uppercase tracking-wider animate-pulse">Loading cities...</div>
              ) : filteredCities.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 p-3 text-center uppercase tracking-wider">No matching cities</div>
              ) : (
                filteredCities.map((city) => {
                  const isSelected = city.toLowerCase() === selectedCity.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-[#5D7A00]/10 text-[#5D7A00] font-black' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{city}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#5D7A00] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
