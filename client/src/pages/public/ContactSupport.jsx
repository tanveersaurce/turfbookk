import React, { useState } from 'react';
import { 
  Calendar, 
  CreditCard, 
  Store, 
  Smartphone, 
  MapPin, 
  Mail, 
  Phone, 
  Paperclip, 
  Send, 
  Share2, 
  Globe, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactSupport() {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  
  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB.");
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !message) {
      setSubmitError("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setSubject('General Inquiry');
      setMessage('');
      setScreenshot(null);
    }, 1500);
  };

  return (
    <div className="bg-[#EAEFF5] text-slate-800 font-inter min-h-screen pb-16">
      
      {/* 1. HERO HEADER */}
      <section className="text-center pt-16 pb-12 px-4 max-w-4xl mx-auto space-y-4">
        <span className="inline-block text-[10px] font-black tracking-widest text-[#5D7A00] uppercase bg-[#AAEE00]/30 border border-[#AAEE00]/65 px-3.5 py-1 rounded-full shadow-sm">
          CONTACT
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Get In Touch With Us
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 font-extrabold max-w-md mx-auto">
          Have a question, feedback or need help? We are here for you 24/7.
        </p>
      </section>

      {/* 2. SUPPORT TOPICS CARDS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Booking Issues */}
          <div className="bg-white border border-slate-300 p-6 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/20 border border-[#AAEE00]/40 flex items-center justify-center text-[#5D7A00] shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Booking Issues</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Refunds, cancellations, and slot changes.
              </p>
            </div>
            <a href="#message-form" className="text-xs font-black text-[#5D7A00] hover:text-[#5d7a00]/80 transition-colors inline-flex items-center space-x-1">
              <span>View Solutions</span>
              <span>&rarr;</span>
            </a>
          </div>

          {/* Card 2: Payment Help */}
          <div className="bg-white border border-slate-300 p-6 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/20 border border-[#AAEE00]/40 flex items-center justify-center text-[#5D7A00] shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Payment Help</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Transaction status and wallet queries.
              </p>
            </div>
            <a href="#message-form" className="text-xs font-black text-[#5D7A00] hover:text-[#5d7a00]/80 transition-colors inline-flex items-center space-x-1">
              <span>View Solutions</span>
              <span>&rarr;</span>
            </a>
          </div>

          {/* Card 3: List Your Turf */}
          <div className="bg-white border border-slate-300 p-6 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/20 border border-[#AAEE00]/40 flex items-center justify-center text-[#5D7A00] shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">List Your Turf</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Onboarding support for venue owners.
              </p>
            </div>
            <a href="#message-form" className="text-xs font-black text-[#5D7A00] hover:text-[#5d7a00]/80 transition-colors inline-flex items-center space-x-1">
              <span>View Solutions</span>
              <span>&rarr;</span>
            </a>
          </div>

          {/* Card 4: App Support */}
          <div className="bg-white border border-slate-300 p-6 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#AAEE00]/20 border border-[#AAEE00]/40 flex items-center justify-center text-[#5D7A00] shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">App Support</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                Technical glitches and account recovery.
              </p>
            </div>
            <a href="#message-form" className="text-xs font-black text-[#5D7A00] hover:text-[#5d7a00]/80 transition-colors inline-flex items-center space-x-1">
              <span>View Solutions</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. INFO & MESSAGE FORM SECTION */}
      <section id="message-form" className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Card 1: Our Office */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-sm flex items-start space-x-4 text-left">
              <div className="w-10 h-10 rounded-full bg-[#AAEE00]/20 border border-[#AAEE00]/30 flex items-center justify-center text-[#5D7A00] shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Our Office</h4>
                <p className="text-sm font-black text-slate-950">TurfBook Office</p>
                <p className="text-xs text-slate-700 font-extrabold leading-relaxed">
                  E-5, Arera Colony, Bhopal,<br />
                  Madhya Pradesh 462016, India
                </p>
              </div>
            </div>

            {/* Card 2: Email Us */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-sm flex items-start space-x-4 text-left">
              <div className="w-10 h-10 rounded-full bg-[#AAEE00]/20 border border-[#AAEE00]/30 flex items-center justify-center text-[#5D7A00] shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Email Us</h4>
                <p className="text-sm font-black text-slate-950">Email Support</p>
                <p className="text-xs text-slate-700 font-black leading-relaxed">
                  <a href="mailto:support@turfbook.com" className="hover:underline text-[#5D7A00]">support@turfbook.com</a><br />
                  <a href="mailto:business@turfbook.com" className="hover:underline text-[#5D7A00]">business@turfbook.com</a>
                </p>
              </div>
            </div>

            {/* Card 3: Call Us */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-sm flex flex-col space-y-4 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#AAEE00]/20 border border-[#AAEE00]/30 flex items-center justify-center text-[#5D7A00] shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Call Us</h4>
                  <p className="text-sm font-black text-slate-950">Call Center</p>
                  <p className="text-xs text-slate-700 font-black leading-relaxed">
                    <a href="tel:+917552420001" className="hover:underline">+91 755 242 0001</a>
                  </p>
                </div>
              </div>
              
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/917552420001" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 border-2 border-[#2E7D32] hover:bg-[#2E7D32]/5 text-[#2E7D32] font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 12.008 0c3.237.001 6.28 1.261 8.569 3.55 2.289 2.29 3.548 5.334 3.547 8.572-.004 6.678-5.33 12.002-12.012 12.002-2.002-.001-3.968-.497-5.713-1.442L0 24zm6.59-4.846c1.6.95 3.498 1.452 5.418 1.453 5.514 0 10.002-4.487 10.006-10.002.002-2.673-1.039-5.187-2.932-7.081C17.25 1.63 14.739.589 12.062.589c-5.523 0-10.016 4.492-10.02 10.007-.001 1.921.501 3.799 1.456 5.402L2.5 21.5l5.147-1.346z"/>
                  <path d="M16.924 13.917c-.27-.135-1.597-.788-1.846-.878-.249-.09-.431-.135-.612.135-.181.27-.703.878-.861 1.058-.158.18-.317.202-.587.067-.27-.135-1.139-.42-2.169-1.338-.801-.715-1.342-1.6-1.5-1.87-.158-.27-.017-.417.118-.552.122-.122.27-.317.406-.474.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.612-1.474-.839-2.016-.22-.53-.443-.457-.612-.466-.158-.008-.339-.01-.52-.01-.18 0-.474.068-.722.338-.249.27-.95.923-.95 2.253s.969 2.612 1.105 2.793c.135.18 1.907 2.912 4.619 4.082.645.278 1.149.445 1.54.569.648.206 1.238.177 1.704.108.52-.078 1.597-.653 1.823-1.283.226-.63.226-1.17.158-1.283-.068-.113-.249-.18-.52-.315z"/>
                </svg>
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Social Links Row */}
            <div className="flex items-center space-x-3 pt-2">
              <button className="w-8 h-8 rounded-full bg-[#AAEE00] text-black flex items-center justify-center hover:opacity-90 transition-all shadow-sm">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-400 transition-all shadow-sm">
                <Globe className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-400 transition-all shadow-sm">
                <Mail className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-400 transition-all shadow-sm">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Send Us a Message Form Card */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-300 p-6 sm:p-8 rounded-3xl shadow-sm text-left relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-6">
                Send Us a Message
              </h2>
              
              <AnimatePresence mode="wait">
                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 text-center space-y-4 bg-[#AAEE00]/10 border border-[#AAEE00]/30 rounded-2xl py-12"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#AAEE00] text-black flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-950">Message Sent Successfully!</h3>
                    <p className="text-xs text-slate-700 font-extrabold max-w-sm mx-auto">
                      Thank you for reaching out. A support representative will get back to you via email within the next 2 hours.
                    </p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs uppercase transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">First Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Last Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Email Address</label>
                        <input 
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Phone Number</label>
                        <input 
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Subject</label>
                      <select 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Booking Issue">Booking Issue</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="List Your Turf">List Your Turf</option>
                        <option value="App Support">App Support</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Message</label>
                        <span className="text-[10px] text-slate-600 font-bold">{message.length} / 500</span>
                      </div>
                      <textarea 
                        required
                        maxLength={500}
                        rows={4}
                        placeholder="Describe your inquiry in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-300 focus:border-[#5D7A00] focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all resize-none placeholder-slate-400"
                      />
                    </div>

                    {/* Attach Screenshot */}
                    <div className="flex items-center space-x-2.5">
                      <label className="cursor-pointer flex items-center space-x-1.5 text-[10px] font-black text-[#5D7A00] bg-[#AAEE00]/20 border border-[#AAEE00]/40 hover:bg-[#AAEE00]/30 px-3.5 py-2 rounded-xl transition-all shadow-sm">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{screenshot ? screenshot.name : 'Attach Screenshot'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                      {screenshot && (
                        <button 
                          type="button" 
                          onClick={() => setScreenshot(null)}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#AAEE00] hover:bg-[#BBEF11] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 focus:outline-none disabled:opacity-50"
                    >
                      <Send className="w-4.5 h-4.5" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MAP SECTION */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-16 text-left">
        <h2 className="text-xl sm:text-2xl font-black text-slate-950">
          Find Us Here
        </h2>
        
        {/* Stylized Maps Layout */}
        <div className="relative rounded-3xl overflow-hidden h-[360px] border border-slate-300 shadow-md group">
          {/* Mock Map Background Canvas */}
          <div className="absolute inset-0 bg-[#D3DCE6] overflow-hidden flex items-center justify-center">
            {/* Grid Pattern of roads */}
            <div className="w-full h-full opacity-70 relative">
              {/* Vertical Roads */}
              <div className="absolute left-[10%] top-0 bottom-0 w-[8px] bg-white"></div>
              <div className="absolute left-[30%] top-0 bottom-0 w-[12px] bg-white"></div>
              <div className="absolute left-[50%] top-0 bottom-0 w-[8px] bg-white"></div>
              <div className="absolute left-[70%] top-0 bottom-0 w-[10px] bg-white"></div>
              <div className="absolute left-[90%] top-0 bottom-0 w-[8px] bg-white"></div>
              
              {/* Horizontal Roads */}
              <div className="absolute top-[20%] left-0 right-0 h-[10px] bg-white"></div>
              <div className="absolute top-[45%] left-0 right-0 h-[12px] bg-white"></div>
              <div className="absolute top-[70%] left-0 right-0 h-[8px] bg-white"></div>
              
              {/* Slanted Roads */}
              <div className="absolute top-0 bottom-0 left-[20%] w-[10px] bg-white rotate-12 origin-top"></div>
              <div className="absolute top-0 bottom-0 left-[60%] w-[8px] bg-white -rotate-12 origin-bottom"></div>
              
              {/* Blocks */}
              <div className="absolute top-[5%] left-[15%] w-[10%] h-[12%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[25%] left-[5%] w-[12%] h-[15%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[55%] left-[12%] w-[15%] h-[10%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              
              <div className="absolute top-[8%] left-[35%] w-[12%] h-[10%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[52%] left-[33%] w-[10%] h-[15%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              
              <div className="absolute top-[10%] left-[75%] w-[10%] h-[8%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[28%] left-[58%] w-[15%] h-[12%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[50%] left-[72%] w-[12%] h-[15%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>
              <div className="absolute top-[78%] left-[62%] w-[10%] h-[10%] bg-[#BFCAD6] rounded-lg border border-white/40"></div>

              {/* Park Zone */}
              <div className="absolute top-[25%] left-[38%] w-[18%] h-[16%] bg-[#8FBC8F]/50 rounded-2xl border border-white/40 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#2E7D32] tracking-wider uppercase opacity-80">Arera Park</span>
              </div>
            </div>

            {/* Custom styled map markers */}
            {/* Primary Pin Marker */}
            <div className="absolute top-[40%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10">
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative flex items-center justify-center"
              >
                {/* Custom Green Location Pin Icon */}
                <div className="w-14 h-14 rounded-full bg-[#AAEE00]/30 flex items-center justify-center border border-[#AAEE00]/50 absolute -z-10 animate-ping"></div>
                <div className="w-11 h-11 bg-[#FAFBFD] rounded-full flex items-center justify-center shadow-lg border border-slate-200 z-10">
                  <MapPin className="w-6 h-6 text-[#5D7A00] fill-[#AAEE00]" />
                </div>
              </motion.div>
              {/* Tooltip */}
              <div className="mt-2.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg">
                TurfBook Head Office
              </div>
            </div>

            {/* Minor Secondary Marker */}
            <div className="absolute top-[52%] left-[45%]">
              <div className="w-5 h-5 rounded-full bg-[#5D7A00]/25 border border-[#5D7A00]/45 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5D7A00]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. METRICS / SUPPORT INFO FOOTER BAR */}
      <section className="bg-[#121824] border-y border-white/5 py-8 text-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-white/10 text-center md:text-left">
            {/* Column 1 */}
            <div className="space-y-1 md:pl-0">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-[#AAEE00]">Customer Support</h5>
              <p className="text-xs text-slate-300 font-medium">Mon - Sun: 09:00 AM - 11:00 PM</p>
            </div>
            {/* Column 2 */}
            <div className="space-y-1 md:pl-8">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-[#AAEE00]">Venue Partners</h5>
              <p className="text-xs text-slate-300 font-medium">Mon - Sat: 10:00 AM - 07:00 PM</p>
            </div>
            {/* Column 3 */}
            <div className="space-y-1 md:pl-8">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-[#AAEE00]">Emergency Help</h5>
              <p className="text-xs text-slate-300 font-medium">Live Chat & Phone: 24/7 Available</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
