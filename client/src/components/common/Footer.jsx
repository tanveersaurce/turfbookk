import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isPlayer = isAuthenticated && user?.role === 'user';

  return (
    <footer id="footer" className="bg-[#0D1117] border-t border-white/5 pt-16 pb-8 text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${isPlayer ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-8 mb-12`}>
          {/* Col 1: About & Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <svg className="w-5.5 h-5.5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Turf<span className="text-primary">Book</span>
              </span>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              India's premium sports venue discovery and booking platform. Experience seamless slot bookings and host tournaments effortlessly.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-muted hover:text-primary transition-all"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-muted hover:text-primary transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-muted hover:text-primary transition-all"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Col 2: About */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">About</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="#" className="text-muted hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/search" className="text-muted hover:text-primary transition-colors">Venues</Link></li>
              <li><Link to="#" className="text-muted hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Col 3: Sports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Sports</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?sport=Football" className="text-muted hover:text-primary transition-colors">Football</Link></li>
              <li><Link to="/search?sport=Cricket" className="text-muted hover:text-primary transition-colors">Cricket</Link></li>
              <li><Link to="/search?sport=Badminton" className="text-muted hover:text-primary transition-colors">Badminton</Link></li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="#" className="text-muted hover:text-primary transition-colors">Help Center</Link></li>
              <li><a href="#footer" className="text-muted hover:text-primary transition-colors">Contact Us</a></li>
              <li><Link to="#" className="text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 5: Partners (Only for owners / admins / guests) */}
          {!isPlayer && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">For Partners</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('show-login', { detail: { mode: 'email_register', role: 'owner' } }))}
                    className="text-muted hover:text-primary transition-colors bg-transparent border-0 cursor-pointer p-0 font-semibold text-left"
                  >
                    List Your Turf
                  </button>
                </li>
                <li><Link to="/login" className="text-muted hover:text-primary transition-colors">Partner Dashboard</Link></li>
                <li><Link to="/admin/login" className="text-muted hover:text-primary transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
          )}
        </div>

        <hr className="border-white/5 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-muted space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} TurfBook SaaS. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
