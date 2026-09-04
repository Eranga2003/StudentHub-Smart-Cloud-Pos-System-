import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  ShoppingCart,
  Bell,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 lg:top-3.5 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 lg:border lg:border-slate-200/90 lg:rounded-2xl px-3 sm:px-6 flex items-center justify-between shadow-xs mb-3 sm:mb-5 transition-all">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 mr-2 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-[#0B3B60] hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 lg:hidden shrink-0">
          <img src="/logo.png" alt="StudentHub" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
        </div>

        {/* Global Quick Search */}
        <div className="relative w-full max-w-md min-w-0">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog or invoices..."
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 focus:border-[#0B3B60] transition-all truncate"
          />
        </div>
      </div>

      {/* Right: Actions, Live Clock, Notifications, POS Action */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#0B3B60]" />
          <span>{time}</span>
        </div>

        {/* Design System Quick Pill */}
        <button
          onClick={() => navigate('/design-system')}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-[#0B3B60]/10 text-[#0B3B60] border border-[#0B3B60]/20 hover:bg-[#0B3B60]/15 transition-colors"
          title="Inspect Official Brand Design Tokens"
        >
          <Sparkles className="w-3 h-3 text-[#43B02A]" />
          <span>Design Tokens</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-[#0B3B60] hover:bg-slate-100 transition-colors shrink-0"
          title="View Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#43B02A] ring-2 ring-white"></span>
        </button>

        {/* Primary CTA: [ New POS Sale ] in Official Brand Green (#43B02A) */}
        <button
          onClick={() => navigate('/pos')}
          className="btn-primary py-1.5 px-2.5 sm:py-2 sm:px-4 flex items-center gap-1.5 shadow-sm text-xs shrink-0 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline font-medium">New POS Sale</span>
          <span className="sm:hidden font-bold text-[11px]">Sale</span>
        </button>
      </div>
    </header>
  );
}
