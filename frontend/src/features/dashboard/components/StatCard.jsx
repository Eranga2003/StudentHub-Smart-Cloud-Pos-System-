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
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
          <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-7 w-32 bg-slate-200 rounded"></div>
        <div className="h-3 w-28 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0B3B60]/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {Icon ? <Icon className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
        </div>
      </div>

      {/* Main KPI Value */}
      <div>
        <h3 className="text-2xl font-bold text-[#0B3B60] tracking-tight">
          {formatted || value}
        </h3>

        {/* Change Indicator & Comparison text */}
        {(change || comparison) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  isPositive
                    ? 'text-[#43B02A] bg-[#43B02A]/10'
                    : 'text-amber-700 bg-amber-100'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {change}
              </span>
            )}
            {comparison && (
              <span className="text-slate-500 text-[11px] truncate">
                {comparison}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
