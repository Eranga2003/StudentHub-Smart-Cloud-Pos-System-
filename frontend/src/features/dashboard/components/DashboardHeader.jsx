import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, RefreshCw, Calendar, Sparkles } from 'lucide-react';

/**
 * DashboardHeader Component
 * Top welcome section displaying store branch, operational status, date, and primary actions.
 */
export default function DashboardHeader({ onRefresh, loading = false }) {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#43B02A] uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-[#43B02A] animate-ping"></span>
          <span>Live POS Active • Campus Branch #01</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B3B60]">
          Executive Dashboard
        </h1>
        <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
          <span>•</span>
          <span>Commercial Bookstore & Student Service Center</span>
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="btn-glass text-xs py-2 px-3 flex items-center gap-1.5"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#43B02A] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}

        {/* PRIMARY ACTION: Open POS Terminal */}
        <button
          onClick={() => navigate('/pos')}
          className="btn-primary"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Launch POS Terminal</span>
        </button>
      </div>
    </div>
  );
}
