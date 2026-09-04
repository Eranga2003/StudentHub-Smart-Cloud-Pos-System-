import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

/**
 * StatCard Component
 * Displays a single KPI summary metric with icon, main number, trend indicator, and comparison text.
 */
export default function StatCard({
  title,
  value,
  formatted,
  change,
  comparison,
  isPositive = true,
  icon: Icon,
  iconBg = 'bg-[#0B3B60]/10',
  iconColor = 'text-[#0B3B60]',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs animate-pulse space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded"></div>
        <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:border-[#0B3B60]/30 hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-2.5">
      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 uppercase tracking-wide truncate">
          {title}
        </span>
        <div className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {Icon ? <Icon className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Main KPI Value */}
      <div>
        <h3 className="text-lg sm:text-xl font-black text-[#0B3B60] tracking-tight truncate">
          {formatted || value}
        </h3>

        {/* Change Indicator & Comparison text */}
        {(change || comparison) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                  isPositive
                    ? 'text-[#43B02A] bg-[#43B02A]/10'
                    : 'text-amber-700 bg-amber-100'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5" />
                )}
                {change}
              </span>
            )}
            {comparison && (
              <span className="text-slate-400 text-[10px] truncate">
                {comparison}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
