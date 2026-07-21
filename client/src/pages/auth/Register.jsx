import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2 } from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm';

export default function Register() {
  const { currentBooking } = useSelector((state) => state.booking);
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#0D1117]">
      {/* Left Panel: Graphic, Brand, Features list */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-12 text-white hidden lg:flex bg-[#0A0D14]">
        {/* Background stadium action shot */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1664304634915-36c858c860bf?q=80&w=732&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Soccer stadium game"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0A0D14]/90 to-transparent"></div>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-black text-primary tracking-tight">
            TurfBook
          </Link>
        </div>

        {/* Center: Branding Title & Features List */}
        <div className="relative z-10 max-w-md space-y-8 my-auto text-left">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary leading-tight">TurfBook</h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Join the ultimate sports community. Book premium venues, join local programs, and elevate your game today.
            </p>
          </div>

          <div className="space-y-4.5 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 fill-primary/10" />
              </div>
              <span className="text-xs font-bold text-slate-200">Access 500+ Premium Venues</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 fill-primary/10" />
              </div>
              <span className="text-xs font-bold text-slate-200">Verified & Secure Bookings</span>
            </div>
          </div>
        </div>

        {/* Bottom: footer info */}
        <div className="relative z-10">
          <span className="text-[10px] text-muted">© {new Date().getFullYear()} TurfBook. All Rights Reserved.</span>
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="lg:col-span-6 bg-white flex items-center justify-center p-8 sm:p-16 text-black">
        <div className="max-w-md w-full space-y-6">
          <RegisterForm 
            onSuccess={() => {
              if (currentBooking?.turfId) {
                navigate('/checkout');
              } else {
                navigate('/');
              }
            }} 
            onLoginClick={() => navigate('/login')} 
            isModal={false} 
          />
        </div>
      </div>
    </div>
  );
}
