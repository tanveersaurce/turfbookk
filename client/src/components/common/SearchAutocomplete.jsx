import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTurf } from '../../hooks/useTurf';

export const SearchAutocomplete = ({ placeholder = "Search turfs by city, area or name...", initialValue = "" }) => {
  const navigate = useNavigate();
  const { getSearchSuggestions } = useTurf();
  
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState({ cities: [], areas: [], turfs: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with 300ms debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ cities: [], areas: [], turfs: [] });
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const res = await getSearchSuggestions(query);
      setLoading(false);
      if (res.success) {
        setSuggestions(res.data);
        setIsOpen(true);
        setActiveIndex(-1);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  // Flatten suggestions for keyboard navigation
  const getFlattenedSuggestions = () => {
    const flat = [];
    suggestions.cities.forEach(item => flat.push({ type: 'city', value: item, label: item }));
    suggestions.areas.forEach(item => flat.push({ type: 'area', value: item.split(',')[0], label: item }));
    suggestions.turfs.forEach(item => flat.push({ type: 'turf', value: item.split(' - ')[0], label: item }));
    return flat;
  };

  const flattenedList = getFlattenedSuggestions();

  const handleKeyDown = (e) => {
    if (!isOpen || flattenedList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flattenedList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flattenedList.length) % flattenedList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flattenedList.length) {
        handleSelect(flattenedList[activeIndex]);
      } else {
        // Search current query text directly
        navigate(`/turfs?search=${query}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.type === 'city') {
      setQuery(item.value);
      navigate(`/turfs?city=${item.value}`);
    } else if (item.type === 'area') {
      setQuery(item.value);
      navigate(`/turfs?search=${item.value}`);
    } else if (item.type === 'turf') {
      setQuery(item.value);
      navigate(`/turfs?search=${item.value}`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/turfs?search=${query.trim()}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-[#5f5e5e] pointer-events-none">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-4 bg-[# edeeef] md:bg-white rounded-xl border-none focus:ring-2 focus:ring-primary transition-all font-inter text-[16px] text-[#191c1d]"
        />
        {loading && (
          <div className="absolute right-4 w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && flattenedList.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[380px] overflow-y-auto">
          {/* Cities Section */}
          {suggestions.cities.length > 0 && (
            <div className="p-2 border-b border-white/5">
              <p className="text-[12px] font-bold text-white/40 px-3 py-1 uppercase tracking-wider">Cities</p>
              {suggestions.cities.map((city, idx) => {
                const globalIdx = idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={`city-${idx}`}
                    onClick={() => handleSelect({ type: 'city', value: city })}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${isActive ? 'bg-[#AAEE00] text-[#1A1A1A]' : 'text-[#F8F9FA] hover:bg-white/5'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="font-inter text-[14px]">{city}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Areas Section */}
          {suggestions.areas.length > 0 && (
            <div className="p-2 border-b border-white/5">
              <p className="text-[12px] font-bold text-white/40 px-3 py-1 uppercase tracking-wider">Neighborhoods</p>
              {suggestions.areas.map((area, idx) => {
                const globalIdx = suggestions.cities.length + idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={`area-${idx}`}
                    onClick={() => handleSelect({ type: 'area', value: area.split(',')[0] })}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${isActive ? 'bg-[#AAEE00] text-[#1A1A1A]' : 'text-[#F8F9FA] hover:bg-white/5'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    <span className="font-inter text-[14px]">{area}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Turfs Section */}
          {suggestions.turfs.length > 0 && (
            <div className="p-2">
              <p className="text-[12px] font-bold text-white/40 px-3 py-1 uppercase tracking-wider">Venues</p>
              {suggestions.turfs.map((turf, idx) => {
                const globalIdx = suggestions.cities.length + suggestions.areas.length + idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={`turf-${idx}`}
                    onClick={() => handleSelect({ type: 'turf', value: turf.split(' - ')[0] })}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${isActive ? 'bg-[#AAEE00] text-[#1A1A1A]' : 'text-[#F8F9FA] hover:bg-white/5'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">sports_soccer</span>
                    <span className="font-inter text-[14px]">{turf}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
