import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Heart, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ["#00C853", "#2196F3", "#9C27B0", "#FF5722", "#F44336", "#009688", "#FF9800", "#607D8B"];

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const PartnerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Scroll spy to highlight active section on scroll
  useEffect(() => {
    if (location.pathname !== '/become-partner') {
      setActiveSection('');
      return;
    }
    
    const handleScrollSpy = () => {
      const sections = ['benefits', 'requirements', 'support'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    if (location.pathname !== '/become-partner') {
      navigate('/become-partner');
      // Timeout is needed to ensure page is loaded before checking DOM elements
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1A1A1A] py-4 border-b border-neutral-800 text-white font-inter">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#AAEE00] flex items-center justify-center shadow-[0_4px_15px_rgba(170,238,0,0.2)] group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white transition-colors">
              Turf<span className="text-white">Book</span>
            </span>
          </Link>

          {/* MIDDLE: Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('benefits')}
              className={`text-sm font-semibold transition-all hover:text-[#AAEE00] bg-transparent border-0 cursor-pointer ${
                activeSection === 'benefits' ? 'text-[#AAEE00] underline decoration-2 underline-offset-4 font-bold' : 'text-white'
              }`}
            >
              Benefits
            </button>
            <button
              onClick={() => handleNavClick('requirements')}
              className={`text-sm font-semibold transition-all hover:text-[#AAEE00] bg-transparent border-0 cursor-pointer ${
                activeSection === 'requirements' ? 'text-[#AAEE00] underline decoration-2 underline-offset-4 font-bold' : 'text-white'
              }`}
            >
              Requirements
            </button>
            <button
              onClick={() => handleNavClick('support')}
              className={`text-sm font-semibold transition-all hover:text-[#AAEE00] bg-transparent border-0 cursor-pointer ${
                activeSection === 'support' ? 'text-[#AAEE00] underline decoration-2 underline-offset-4 font-bold' : 'text-white'
              }`}
            >
              Support
            </button>
          </div>

          {/* RIGHT: Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }))}
              className="text-sm font-semibold text-white bg-transparent border-[1.5px] border-white rounded-lg px-4 py-2 hover:bg-white hover:text-[#1A1A1A] transition-all cursor-pointer"
            >
              Login as Owner
            </button>
            <button
              onClick={() => navigate('/become-partner/apply')}
              className="text-sm font-bold text-[#1A1A1A] bg-[#AAEE00] border-0 rounded-lg px-5 py-2 hover:opacity-90 transition-all cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none bg-transparent border-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-800 bg-[#1A1A1A] overflow-hidden shadow-lg mt-4"
          >
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => handleNavClick('benefits')}
                className={`block w-full text-left py-2 text-base font-semibold bg-transparent border-0 cursor-pointer ${
                  activeSection === 'benefits' ? 'text-[#AAEE00] underline' : 'text-white'
                }`}
              >
                Benefits
              </button>
              <button 
                onClick={() => handleNavClick('requirements')}
                className={`block w-full text-left py-2 text-base font-semibold bg-transparent border-0 cursor-pointer ${
                  activeSection === 'requirements' ? 'text-[#AAEE00] underline' : 'text-white'
                }`}
              >
                Requirements
              </button>
              <button 
                onClick={() => handleNavClick('support')}
                className={`block w-full text-left py-2 text-base font-semibold bg-transparent border-0 cursor-pointer ${
                  activeSection === 'support' ? 'text-[#AAEE00] underline' : 'text-white'
                }`}
              >
                Support
              </button>
              
              <hr className="border-neutral-800" />
              
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }));
                  }}
                  className="w-full py-2.5 border border-white text-white rounded-xl text-sm font-semibold hover:bg-white hover:text-[#1A1A1A] transition-all text-center bg-transparent cursor-pointer"
                >
                  Login as Owner
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/become-partner/apply');
                  }}
                  className="w-full py-2.5 bg-[#AAEE00] text-black border-0 rounded-xl text-sm font-extrabold hover:opacity-90 transition-all text-center cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MainNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const avatarBg = user?.name ? colors[user.name.charCodeAt(0) % colors.length] : colors[0];
  const userInitials = getInitials(user?.name);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Player';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm' 
        : 'bg-white border-b border-slate-100 py-4'
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_15px_rgba(170,238,0,0.2)] group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              Turf<span className="text-slate-900">Book</span>
            </span>
          </Link>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-[#5D7A00] border-b-2 border-[#5D7A00] pb-1 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              Home
            </Link>
            <Link to="/search" className={`text-sm font-semibold transition-colors ${location.pathname === '/search' ? 'text-[#5D7A00] border-b-2 border-[#5D7A00] pb-1 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              Fields
            </Link>
            {(user?.role !== 'owner') && (
              <>
                <a href="/#programs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Programs
                </a>
                <Link to="/contact-support" className={`text-sm font-semibold transition-colors ${location.pathname === '/contact-support' ? 'text-[#5D7A00] border-b-2 border-[#5D7A00] pb-1 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
                  Contact
                </Link>
              </>
            )}
            {user?.role === 'owner' && (
              <Link to="/owner/dashboard" className={`text-sm font-semibold transition-colors ${location.pathname === '/owner/dashboard' ? 'text-[#5D7A00] border-b-2 border-[#5D7A00] pb-1 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
                My Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className={`text-sm font-semibold transition-colors ${location.pathname === '/admin/dashboard' ? 'text-[#5D7A00] border-b-2 border-[#5D7A00] pb-1 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right: CTA / Profile */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated && location.pathname.includes('partner') && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }))}
                className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors bg-transparent border-0 cursor-pointer"
              >
                Login as Owner
              </button>
            )}
            {!user && (
              <button 
                onClick={() => navigate('/become-partner')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-transparent border-0 cursor-pointer"
              >
                List Your Turf
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full transition-all focus:outline-none cursor-pointer"
                >
                  {user?.avatar?.url || user?.avatar ? (
                    <img 
                      src={user?.avatar?.url || user?.avatar} 
                      alt={user?.name} 
                      className="w-[32px] h-[32px] rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div 
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {userInitials}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-800 max-w-[100px] truncate pr-1">
                    {firstName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-100 p-2 shadow-xl text-slate-700"
                    >
                      {user?.role === 'user' && (
                        <>
                          <Link 
                            to="/user/dashboard?tab=bookings"
                            className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>My Bookings</span>
                          </Link>
                          <Link 
                            to="/user/dashboard?tab=profile"
                            className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link 
                            to="/user/dashboard?tab=favourites"
                            className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            <span>My Favourites</span>
                          </Link>
                        </>
                      )}

                      {user?.role === 'owner' && (
                        <>
                          <Link 
                            to="/owner/dashboard"
                            className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Owner Dashboard</span>
                          </Link>
                          <Link 
                            to="/owner/dashboard?tab=arenas"
                            className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>My Arenas</span>
                          </Link>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin/dashboard"
                          className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <hr className="border-slate-100 my-1" />

                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2.5 w-full px-3.5 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left font-medium bg-transparent border-0 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }))}
                  className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_register' } }))}
                  className="px-5 py-2.5 bg-primary hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-sm transition-all shadow-sm cursor-pointer border-0"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-black hover:bg-slate-50 focus:outline-none bg-transparent border-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block py-2 text-base font-semibold text-slate-800">Home</Link>
              <Link to="/search" className="block py-2 text-base font-semibold text-slate-800">Fields</Link>
              
              {user?.role !== 'owner' && (
                <>
                  <a href="/#programs" className="block py-2 text-base font-semibold text-slate-800">Programs</a>
                  <Link to="/contact-support" className="block py-2 text-base font-semibold text-slate-800">Contact</Link>
                </>
              )}

              {user?.role === 'owner' && (
                <Link to="/owner/dashboard" className="block py-2 text-base font-semibold text-slate-800">My Dashboard</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="block py-2 text-base font-semibold text-slate-800">Admin Panel</Link>
              )}

              <hr className="border-slate-100" />

              {!isAuthenticated && location.pathname.includes('partner') && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }));
                  }}
                  className="flex items-center justify-center w-full py-2.5 mb-2 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold hover:border-slate-400 bg-transparent cursor-pointer text-center"
                >
                  Login as Owner
                </button>
              )}
              {!user && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/become-partner');
                  }}
                  className="flex items-center justify-center w-full py-2.5 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold hover:border-slate-450 bg-transparent cursor-pointer text-center"
                >
                  List Your Turf
                </button>
              )}

              {isAuthenticated ? (
                <>
                  <div className="py-2 flex items-center space-x-3">
                    {user?.avatar?.url || user?.avatar ? (
                      <img 
                        src={user?.avatar?.url || user?.avatar} 
                        alt={user?.name} 
                        className="w-[36px] h-[36px] rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div 
                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: avatarBg }}
                      >
                        {userInitials}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-800">{user?.name}</span>
                  </div>

                  {user?.role === 'user' && (
                    <>
                      <Link to="/user/dashboard?tab=bookings" className="block py-2 text-sm font-semibold text-slate-600 hover:text-black">My Bookings</Link>
                      <Link to="/user/dashboard?tab=profile" className="block py-2 text-sm font-semibold text-slate-600 hover:text-black">My Profile</Link>
                      <Link to="/user/dashboard?tab=favourites" className="block py-2 text-sm font-semibold text-slate-600 hover:text-black">My Favourites</Link>
                    </>
                  )}

                  {user?.role === 'owner' && (
                    <>
                      <Link to="/owner/dashboard" className="block py-2 text-sm font-semibold text-slate-600 hover:text-black">Owner Dashboard</Link>
                      <Link to="/owner/dashboard?tab=arenas" className="block py-2 text-sm font-semibold text-slate-600 hover:text-black">My Arenas</Link>
                    </>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2.5 w-full py-2 text-sm font-semibold text-red-500 bg-transparent border-0 cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_login' } }));
                  }}
                  className="w-full py-3 bg-primary text-black border-0 font-bold rounded-xl text-sm hover:bg-[#BBEF11] block text-center cursor-pointer"
                >
                  Login / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function Navbar() {
  const location = useLocation();
  const isPartnerPage = location.pathname.startsWith('/become-partner');

  return (
    <>
      {isPartnerPage ? (
        <PartnerNavbar />
      ) : (
        <MainNavbar />
      )}
    </>
  );
}