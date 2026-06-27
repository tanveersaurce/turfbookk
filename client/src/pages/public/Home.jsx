import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchParams } from '../../store/turfSlice';
import { turfService, adminService } from '../../services/api';
import TurfCard from '../../components/turf/TurfCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import SearchableCityDropdown from '../../components/common/SearchableCityDropdown';
import { Search, MapPin, Calendar, Award, ShieldCheck, ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hash } = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [hash]);

  const { searchParams } = useSelector((state) => state.turf);
  const [city, setCity] = useState(searchParams.city || 'Bhopal');
  const [sport, setSport] = useState('Football');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAd, setActiveAd] = useState(null);

  const sports = ['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis'];

  useEffect(() => {
    if (searchParams.city) {
      setCity(searchParams.city);
    }
  }, [searchParams.city]);

  const cityImages = {
    London: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80',
    Madrid: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80',
    Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80',
    Singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80',
  };

  const programs = [
    {
      id: 'prog-1',
      title: 'Elite Striker Academy',
      sport: 'Football',
      desc: 'Master shooting, positioning and clinical finishing with UEFA certified coaches.',
      timing: 'Mon, Wed, Fri (4:00 PM - 6:00 PM)',
      price: '₹4,500/month',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prog-2',
      title: 'Spin & Pace Masterclass',
      sport: 'Cricket',
      desc: 'Refine your bowling technique, run-up, and control under state-level legends.',
      timing: 'Tue, Thu, Sat (3:30 PM - 5:30 PM)',
      price: '₹3,800/month',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prog-3',
      title: 'Smash & Drop Academy',
      sport: 'Badminton',
      desc: 'Accelerate your court movement, drop accuracy, and backhand smashes.',
      timing: 'Sat & Sun (8:00 AM - 10:00 AM)',
      price: '₹5,000/month',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80',
    }
  ];

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const data = await turfService.getTurfs();
        setTurfs(data.data || []);

        const ads = await adminService.getAds();
        const active = ads.find(a => a.isActive && a.placement === 'Homepage Top');
        setActiveAd(active);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    dispatch(setSearchParams({ city, sport, date }));
    navigate(`/search?city=${city}&sport=${sport}&date=${date}`);
  };

  const handleProgramExplore = () => {
    navigate('/search?activity=coaching');
  };

  const topRatedTurfs = [...turfs].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="space-y-16 pb-20 overflow-x-hidden bg-[#FAFBFD] text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-[#FAFBFD]/30 to-[#FAFBFD] px-4 max-w-8xl mx-auto">
        {/* Background Action Image with dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/736x/9c/b0/e1/9cb0e1ecc61b24d9a84c529ea80d661b.jpg" 
            alt="Sports background"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          {/* Left Column: Heading & Badge */}
          <div className="lg:col-span-8 space-y-6 text-left pl-10">
            {/* 5-Star Reviews Badge */}
            <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
              <div className="flex items-center space-x-0.5 text-[#FFC107]">
                <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
              </div>
              <span className="text-xs text-slate-700 font-bold">10k+ reviews</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              Book Your Turf, <br />
              <span className="text-primary">Play Anytime</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg font-medium">
              Find and book premium sports venues near you. Level up your game with our certified coaching programs and corporate tournaments.
            </p>

            {/* Quick trust metrics */}
            <div className="flex items-center space-x-6 text-xs text-slate-300 pt-2 font-bold">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" /> 
                <span>Verified Arenas</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4.5 h-4.5 text-primary" /> 
                <span>Instant Confirmation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Search Card Widget */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xl space-y-4 max-w-[360px] mx-auto lg:ml-auto"
            >
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900">Find a Venue</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Explore the best courts in your city</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-3.5">
                {/* Location Input */}
                <div className="space-y-0.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Location</label>
                  <SearchableCityDropdown onChange={(c) => setCity(c)} />
                </div>

                {/* Activity Dropdown */}
                <div className="space-y-0.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Select Activity</label>
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    <select 
                      className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value === 'coaching') {
                          handleProgramExplore();
                        }
                      }}
                    >
                      <option className="bg-white text-slate-800" value="court">Book Court / Slot</option>
                      <option className="bg-white text-slate-800" value="coaching">Pro Coaching</option>
                      <option className="bg-white text-slate-800" value="tournament">Tournaments</option>
                    </select>
                  </div>
                </div>

                {/* Sport Dropdown */}
                <div className="space-y-0.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Sport</label>
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    <select 
                      value={sport} 
                      onChange={(e) => setSport(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                    >
                      {sports.map((s) => <option key={s} value={s} className="bg-white text-slate-800">{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-0.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Date</label>
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-bold cursor-pointer"
                    />
                  </div>
                </div>

                {/* Find Venue Button */}
                <button 
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(170,238,0,0.15)] flex items-center justify-center space-x-2 focus:outline-none"
                >
                  <Search className="w-4 h-4" />
                  <span>FIND VENUE</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. AD BANNER */}
      {activeAd && (
        <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48 border border-slate-100 group shadow-md">
            <img 
              src="https://i.pinimg.com/1200x/c3/98/ae/c398aed6e0abdc94e540998649723cbe.jpg"
              alt={activeAd.title}
              className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center p-6 space-y-2 text-left">
              <span className="px-2 py-0.5 bg-primary text-black font-extrabold rounded-md text-[9px] uppercase tracking-wider w-fit">Featured Banner</span>
              <h3 className="text-lg sm:text-2xl font-black text-white max-w-md">{activeAd.title}</h3>
              <a 
                href={activeAd.linkUrl}
                className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <span>Check details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 3. TOP SPORTS VENUES SECTION */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Top Sports Venues</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Find your ideal court for quality and safety</p>
          </div>
          <button 
            onClick={() => navigate('/search')} 
            className="text-xs font-bold text-slate-700 hover:text-black hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <SkeletonLoader count={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {topRatedTurfs.map(t => <TurfCard key={t.id || t._id} turf={t} />)}
            {topRatedTurfs.length === 0 && (
              <p className="text-xs text-slate-500 col-span-full py-6 text-center">No featured turfs available in your location.</p>
            )}
          </div>
        )}
      </section>

      {/* 4. POPULAR CITIES SECTION */}
      <section id="cities" className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Popular Cities</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Find the best turfs in your favorite cities</p>
          </div>
          <button 
            onClick={() => navigate('/cities')} 
            className="text-xs font-bold text-slate-700 hover:text-black hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Object.entries(cityImages).map(([c, img]) => (
            <motion.div 
              key={c}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                dispatch(setSearchParams({ city: c }));
                navigate(`/search?city=${c}`);
              }}
              className="relative rounded-2xl h-36 overflow-hidden border border-slate-100 hover:border-primary/45 cursor-pointer shadow-md group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/35 z-10 transition-colors group-hover:from-black/90"></div>
              <img 
                src={img}
                alt={c}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-2">
                <span className="text-sm font-extrabold text-white tracking-wider group-hover:text-primary transition-colors uppercase">{c}</span>
                <span className="text-[10px] text-slate-300 font-semibold mt-0.5">Explore Arenas</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. PRO COACHING BANNER SECTION */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center border border-slate-200 shadow-md p-8 sm:p-12 bg-white">
          {/* Action Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.pinimg.com/1200x/df/e2/32/dfe2326abb45dbbdc051a2ec0b59d319.jpg" 
              alt="Soccer kick action"
              className="w-full h-full object-cover "
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAFBFD] via-[#FAFBFD]/10 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-xl space-y-5 text-left">
            <span className="text-[10px] font-black tracking-widest text-[#5D7A00] uppercase bg-[#AAEE00]/10 border border-[#AAEE00]/20 px-3 py-1 rounded-full w-fit block">
              BREAK THE LIMITS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Pro Coaching Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Level up your game with certified trainers for Tennis, Football, and Cricket. Personalized regimes, masterclasses, and match simulation.
            </p>
            <button 
              onClick={handleProgramExplore}
              className="px-6 py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md focus:outline-none"
            >
              Explore Programs
            </button>
          </div>
        </div>
      </section>

      {/* 6. SPORTS PROGRAMS & COURSES GRID */}
      <section id="programs" className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Sports Programs & Courses</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Learn from the pros and level up your game</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <motion.div 
              key={prog.id}
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full"
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={prog.image} 
                  alt={prog.title} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-primary text-black font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">
                  {prog.sport}
                </span>
              </div>
              <div className="p-5 flex flex-col justify-between flex-grow space-y-4 text-left">
                <div className="space-y-2">
                  <h4 className="text-base font-black text-slate-900">{prog.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{prog.desc}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold">Timings: <span className="text-slate-800 font-bold">{prog.timing}</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-[#5D7A00]">{prog.price}</span>
                    <button 
                      onClick={handleProgramExplore}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-black rounded-xl text-xs font-bold transition-all"
                    >
                      See Program
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. CORPORATE & BULK BOOKINGS SECTION */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center justify-end border border-slate-200 shadow-md p-8 sm:p-12 bg-white">
          {/* Action Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=1200&q=80" 
              alt="Indoor court background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#FAFBFD] via-[#FAFBFD]/20 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-xl space-y-5 text-right flex flex-col items-end">
            <span className="text-[10px] font-black tracking-widest text-[#5D7A00] uppercase bg-[#AAEE00]/10 border border-[#AAEE00]/20 px-3 py-1 rounded-full w-fit block">
              FOR ENTERPRISES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Corporate & Bulk Bookings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
              Find your next team building event or tournament at our world-class facilities. Special pricing, customized catering, and tournament organizing support.
            </p>
            <a 
              href="mailto:corporate@turfbook.com?subject=Corporate%20Booking%20Inquiry"
              className="px-6 py-3 border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* 8. BECOME AN OWNER SECTION */}
      {user?.role !== 'user' && (
        <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-100 border border-slate-200 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm text-left">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5D7A00]" />
                <span>List Your Sports Arena</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you a turf owner? Partner with TurfBook to list your courts, manage bookings in real-time, block dates, and run targeted promotions to maximize revenues.
              </p>
            </div>
            <button 
              onClick={() => navigate('/become-partner')}
              className="px-6 py-3.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 text-center w-full md:w-auto cursor-pointer"
            >
              List Your Turf
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
