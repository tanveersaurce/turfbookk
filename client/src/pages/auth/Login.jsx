import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Award } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const { currentBooking } = useSelector((state) => state.booking);
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#0D1117]">
      {/* Left Panel: Graphic & Branding */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-12 text-white hidden lg:flex bg-[#0A0D14]">
        {/* Background Field Grid overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/736x/80/69/ad/8069ad6d967795e62c7f6b818329b0af.jpg" 
            alt="Soccer Field grid"
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

        {/* Center: Interactive Graphic Card */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-150 h-96 overflow-hidden shadow-2xl border border-white/5 bg-[#121824]/40">
            <img 
              src="https://i.pinimg.com/736x/58/e2/d0/58e2d0a5aa480c52e8f569bb5368dbea.jpg" 
              alt="Soccer athlete action"
              className="w-full h-full object-cover"
            />
            {/* Glassmorphic overlay card */}
            <div className="absolute bottom-6 right-[-20px] w-72 rounded-2xl border border-white/10 glassmorphism p-5 space-y-4 shadow-xl text-left">
              <div className="flex items-center space-x-2 text-primary">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider text-white">Community Pulse</span>
              </div>
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-lg font-black text-white leading-none">500+</h4>
                  <span className="text-[10px] text-muted font-medium">Premium Turfs</span>
                </div>
                <hr className="border-white/5" />
                <div>
                  <h4 className="text-lg font-black text-white leading-none">50k</h4>
                  <span className="text-[10px] text-muted font-medium">Active Players</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-primary">4.8</span>
                  <div className="flex items-center space-x-0.5 text-[#FFC107]">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Athlete quote */}
        <div className="relative z-10 max-w-sm">
          <p className="text-xs text-muted italic leading-relaxed">
            "Precision booking for the elite athlete. Every game starts with the perfect turf."
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="lg:col-span-6 bg-white flex items-center justify-center p-8 sm:p-16 text-black">
        <div className="max-w-md w-full space-y-7">
          <LoginForm 
            onSuccess={() => {
              if (currentBooking?.turfId) {
                navigate('/checkout');
              } else {
                navigate('/');
              }
            }} 
            onForgotPasswordClick={() => navigate('/forgot-password')} 
            onRegisterClick={() => navigate('/register')} 
            isModal={false} 
          />
        </div>
      </div>
    </div>
  );
}
