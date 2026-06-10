import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Star, Heart, Zap, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../services/api';
import { updateProfile } from '../../store/authSlice';
import toast from 'react-hot-toast';

export default function TurfCard({ turf, index = 0 }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const turfId = turf.id || turf._id;
  const isFavorite = user?.favorites?.some(fav => (fav._id || fav) === turfId);

  const handleBookNow = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login'));
    } else {
      navigate(`/turf/${turfId}`);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login'));
      return;
    }

    try {
      if (isFavorite) {
        // Optimistic update
        const updatedFavorites = user.favorites.filter(
          (fav) => (fav._id || fav) !== turfId
        );
        dispatch(updateProfile({ favorites: updatedFavorites }));

        const res = await userService.removeFavorite(turfId);
        if (!res.success) {
          dispatch(updateProfile({ favorites: user.favorites }));
          toast.error(res.message || 'Failed to remove from favorites.');
        } else {
          toast.success('Removed from favorites.');
        }
      } else {
        // Optimistic update
        const updatedFavorites = [...(user.favorites || []), turfId];
        dispatch(updateProfile({ favorites: updatedFavorites }));

        const res = await userService.addFavorite(turfId);
        if (!res.success) {
          dispatch(updateProfile({ favorites: user.favorites }));
          toast.error(res.message || 'Failed to add to favorites.');
        } else {
          toast.success('Added to favorites!');
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err.message);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Generate a mock distance based on index to make UI look high fidelity
  const mockDistance = ((index % 5) + 1.2).toFixed(1);

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => navigate(`/turf/${turfId}`)}
      className="w-full bg-white rounded-3xl border border-slate-200 hover:border-primary overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 text-left flex flex-col h-full"
    >
      {/* Image & Badges */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden flex-shrink-0">
        <img 
          src={turf.images?.[0] || 'https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=600&q=80'} 
          alt={turf.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#5D7A00] rounded-lg text-[9px] font-black text-white tracking-wider uppercase">
          {turf.sports?.[0] || 'Multi-Sport'}
        </div>

        {/* Favorite Heart Toggler */}
        <button 
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-slate-600 hover:text-red-500 shadow-sm transition-colors z-10 focus:outline-none"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight truncate">{turf.name}</h4>
            <div className="flex items-center space-x-1.5 mt-1 text-slate-500 font-semibold text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#5D7A00] flex-shrink-0" />
              <span className="truncate">{turf.area}, {turf.city} • {mockDistance} km away</span>
            </div>
          </div>

          {/* Rating and reviews */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-0.5 text-[#FFC107]">
              <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
              <span className="text-slate-800 font-black">{turf.rating || '4.8'}</span>
            </div>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-slate-400">({turf.reviewCount || 120})</span>
          </div>

          {/* Amenities Icons Row (Mockup Style) */}
          <div className="flex items-center space-x-2 pt-1 text-slate-400">
            {turf.amenities?.slice(0, 4).map((amenity, idx) => {
              const a = amenity.toLowerCase();
              if (a.includes('parking')) {
                return (
                  <span key={idx} className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0" title="Parking Available">
                    P
                  </span>
                );
              }
              if (a.includes('floodlight') || a.includes('light')) {
                return (
                  <Zap key={idx} className="w-4 h-4 text-slate-500 flex-shrink-0" title="Floodlights" />
                );
              }
              if (a.includes('washroom') || a.includes('shower') || a.includes('changing')) {
                return (
                  <svg key={idx} className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" title="Washroom">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                );
              }
              if (a.includes('cafeteria') || a.includes('food') || a.includes('canteen') || a.includes('cafe')) {
                return (
                  <Coffee key={idx} className="w-4 h-4 text-slate-500 flex-shrink-0" title="Cafeteria" />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-shrink-0">
          <div className="text-left">
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hourly Rate</span>
            <span className="text-base font-black text-slate-900">
              ₹{turf.pricePerHour || 800}<span className="text-xs font-semibold text-slate-400">/hr</span>
            </span>
          </div>

          <button 
            type="button"
            onClick={handleBookNow}
            className="px-4 py-2 bg-primary hover:bg-[#BBEF11] text-black text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-primary/10 focus:outline-none"
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
