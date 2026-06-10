import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ownerService } from '../../services/api';
import { AlertCircle, CheckCircle, FileText, User, Mail, Phone, Home, Building, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OwnerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [turfAddress, setTurfAddress] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!name || !email || !phone || !businessName || !turfAddress || !password) {
      setError('Please fill in all details.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await ownerService.apply({
        name,
        email,
        phone,
        businessName,
        turfAddress,
        password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80" 
          alt="Stadium background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-cardbg border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        {success ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto mb-3">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-white">Application Received!</h2>
            <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
              Your registration is under review. The platform administrator has been notified. Upon approval, your partner account will be created automatically.
            </p>
            <p className="text-[11px] text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl max-w-sm mx-auto font-semibold">
              🔑 Log in details: Once approved, you can log in using your registered email and the password you set during registration.
            </p>
            <div className="pt-2">
              <Link 
                to="/owner/login"
                className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl text-xs hover:bg-primary-light transition-all inline-block"
              >
                Back to Partner Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Partner Application</h2>
              <p className="text-xs text-muted mt-1">Submit your sports arena details to register with us</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="email"
                      placeholder="email@arena.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="tel"
                      placeholder="10-digit Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Business / Turf Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text"
                      placeholder="e.g. Arena Box Cricket"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Login Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="password"
                    placeholder="Set Login Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>
              </div>

              {/* Turf Address */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Turf Physical Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-4 h-4 text-muted" />
                  <textarea 
                    rows={2}
                    placeholder="Enter complete street, locality, pincode details"
                    value={turfAddress}
                    onChange={(e) => setTurfAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0D1117] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white resize-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-light text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,200,83,0.15)] disabled:opacity-50 mt-2"
              >
                {loading ? 'Submitting Application...' : 'Submit Register Request'}
              </button>
            </form>

            <div className="text-center mt-6">
              <span className="text-xs text-muted">
                Already registered? <Link to="/owner/login" className="text-primary font-bold hover:underline">Log in here</Link>
              </span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
