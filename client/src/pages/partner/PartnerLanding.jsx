import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Calendar, Sliders, CheckCircle, Shield, FileText, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PartnerLanding() {
  return (
    <div className="bg-[#0D1117] text-white min-h-screen font-inter">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#AAEE00]/10 border border-[#AAEE00]/20 rounded-full text-xs font-black tracking-wider uppercase text-[#AAEE00] shadow-[0_4px_12px_rgba(170,238,0,0.1)]">
              <span>🚀 TurfBook Partner Program</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Grow Your Business <br />
              with <span className="text-[#AAEE00] drop-shadow-[0_2px_15px_rgba(170,238,0,0.15)]">TurfBook</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl">
              Maximize your venue's capacity, automate bookings, and manage schedules seamlessly. Join India's leading sports venue discovery network.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link 
                to="/become-partner/apply"
                className="px-8 py-4 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-center text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_4px_25px_rgba(170,238,0,0.25)] hover:scale-[1.02]"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[3px]" />
              </Link>
              
              <Link 
                to="/become-partner/status"
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-center text-sm transition-all border border-white/10 hover:border-white/20"
              >
                Already applied? Check status &rarr;
              </Link>
            </div>
          </div>

          {/* Right Graphics */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Background glowing gradients */}
            <div className="absolute w-72 h-72 rounded-full bg-[#AAEE00]/10 blur-[80px] -z-10"></div>
            
            <div className="relative w-full max-w-md aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#121824]/40">
              <img 
                src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80" 
                alt="Turf Book pitch"
                className="w-full h-full object-cover"
              />
              {/* Glassmorphic average revenue badge */}
              <div className="absolute top-6 left-6 rounded-2xl border border-white/10 glassmorphism p-4 shadow-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/20 flex items-center justify-center text-[#AAEE00]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-white">+240%</div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Average Revenue</div>
                </div>
              </div>
              
              {/* Active Slots pill */}
              <div className="absolute bottom-6 right-6 rounded-2xl border border-white/10 glassmorphism px-4 py-2.5 shadow-xl flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-white tracking-wide">Real-time Bookings Active</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-20 bg-[#0A0D14] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Why Partner with TurfBook?</h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              We provide the tools and features you need to scale your arena's operations and maximize venue utilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 bg-[#121824]/40 border border-white/5 hover:border-[#AAEE00]/25 rounded-3xl text-left space-y-4 hover:bg-[#121824]/60 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#AAEE00]/10 flex items-center justify-center text-[#AAEE00] group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Get More Bookings</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Expose your venue to thousands of active sports players in your city. Run targeted discount slots during off-peak hours dynamically.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-[#121824]/40 border border-white/5 hover:border-[#AAEE00]/25 rounded-3xl text-left space-y-4 hover:bg-[#121824]/60 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#AAEE00]/10 flex items-center justify-center text-[#AAEE00] group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Easy Payouts</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Accept advance booking payments securely with our Integrated Razorpay gateway. View revenue breakdown ledgers and withdraw directly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-[#121824]/40 border border-white/5 hover:border-[#AAEE00]/25 rounded-3xl text-left space-y-4 hover:bg-[#121824]/60 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#AAEE00]/10 flex items-center justify-center text-[#AAEE00] group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Owner Dashboard</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Gain access to a customized partner desk dashboard. Manage schedules, block dates, update court pricing, and review ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REQUIREMENTS SECTION */}
      <section id="requirements" className="py-20 bg-[#0D1117] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight">Onboarding Requirements</h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Before applying, make sure you have the following documents and venue specifications ready. This helps us verify and activate your turf quickly.
              </p>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start space-x-3.5 max-w-md">
                <Shield className="w-5 h-5 text-[#AAEE00] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                  We verify all venue listings to ensure player safety and maintain platform standards. Verification takes 24-48 hours.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#121824]/30 border border-white/5 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Required Documents</h3>
                <ul className="text-xs text-slate-400 font-semibold space-y-2 list-disc list-inside">
                  <li>GST Registration Certificate (if applicable)</li>
                  <li>Business Owner ID Proof (Aadhaar / PAN Card)</li>
                  <li>Venue Listing Photos (Max 5, including pitch views)</li>
                </ul>
              </div>

              <div className="p-6 bg-[#121824]/30 border border-white/5 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/10 flex items-center justify-center text-[#AAEE00]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Court Infrastructure</h3>
                <ul className="text-xs text-slate-400 font-semibold space-y-2 list-disc list-inside">
                  <li>Standard dimensions for listed sports</li>
                  <li>Good high-performance floodlights for night games</li>
                  <li>Safe boundaries / secure fencing nets</li>
                </ul>
              </div>

              <div className="p-6 bg-[#121824]/30 border border-white/5 rounded-2xl space-y-3 sm:col-span-2">
                <h3 className="text-sm font-bold text-white">Basic Amenities</h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Partner venues are highly recommended to provide clean drinking water, accessible washrooms, basic changing facilities, and on-site parking to receive better ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT & FAQ SECTION */}
      <section id="support" className="py-20 bg-[#0A0D14] border-b border-white/5 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Find answers to the most common questions about the TurfBook partner program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-xs sm:text-sm font-semibold">
            <div className="space-y-2 p-6 bg-[#121824]/30 border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-2 text-[#AAEE00]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <h3 className="font-extrabold text-white">How long does approval take?</h3>
              </div>
              <p className="text-slate-400 leading-relaxed pl-6">
                Our verification team reviews submissions within 24 to 48 hours. Once verified, you will receive login credentials via email, and your turf listing will immediately become live.
              </p>
            </div>

            <div className="space-y-2 p-6 bg-[#121824]/30 border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-2 text-[#AAEE00]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <h3 className="font-extrabold text-white">What commission does TurfBook charge?</h3>
              </div>
              <p className="text-slate-400 leading-relaxed pl-6">
                TurfBook charges a flat 10% platform commission on completed online bookings. There are no hidden subscription charges or setup fees.
              </p>
            </div>

            <div className="space-y-2 p-6 bg-[#121824]/30 border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-2 text-[#AAEE00]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <h3 className="font-extrabold text-white">Can I manage my own pricing and schedules?</h3>
              </div>
              <p className="text-slate-400 leading-relaxed pl-6">
                Absolutely! Through the Owner Dashboard, you have complete control over slot rates, morning/evening pricing differences, slot blockages, and operating schedules.
              </p>
            </div>

            <div className="space-y-2 p-6 bg-[#121824]/30 border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-2 text-[#AAEE00]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <h3 className="font-extrabold text-white">How are slot conflicts handled?</h3>
              </div>
              <p className="text-slate-400 leading-relaxed pl-6">
                Our platform features real-time slot locking, which makes double booking impossible. If a user starts checkout on a slot, it is reserved for them for 5 minutes until checkout completes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="py-20 bg-[#0D1117] text-center relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-[#AAEE00]/5 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Ready to lead the game?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Submit your turf credentials and location. Start hosting verified sports matches in your city today.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/become-partner/apply"
              className="px-10 py-4.5 bg-[#AAEE00] hover:bg-[#BBEF11] text-[#1A1A1A] font-extrabold rounded-2xl text-sm flex items-center space-x-2.5 transition-all shadow-[0_4px_25px_rgba(170,238,0,0.25)] hover:scale-[1.02]"
            >
              <span>Submit Onboarding Form</span>
              <ArrowRight className="w-5 h-5 stroke-[3px]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
