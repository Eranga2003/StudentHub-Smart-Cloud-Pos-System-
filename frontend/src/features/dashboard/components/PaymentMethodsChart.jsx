import React, { useState } from 'react';
import { CreditCard, Banknote, Building, PieChart } from 'lucide-react';

/**
 * PaymentMethodsChart Component
 * Donut Chart displaying the distribution between Cash, Card, and Bank Transfer.
 */
export default function PaymentMethodsChart({ data = [], loading = false }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs h-80 flex items-center justify-center animate-pulse">
        <div className="space-y-3 text-center">
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
          <div className="w-36 h-36 rounded-full bg-slate-100 mx-auto"></div>
        </div>
      </div>
    );
  }

  const paymentData = data;

  // SVG Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const slices = paymentData.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (item.percentage / 100) * circumference;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  const totalAmount = paymentData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <PieChart className="w-4 h-4 text-[#43B02A]" />
            <span>Tender Channels</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Payment Methods</h2>
          <p className="text-xs text-slate-500">Breakdown of settlement types</p>
        </div>

        <span className="badge-navy text-xs px-2.5 py-1 rounded-md font-semibold">
          3 Methods
        </span>
      </div>

      {/* Donut Chart & Legend Side by Side / Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background Track Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIdx === i ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Tender</span>
            <span className="text-sm font-black text-[#0B3B60]">
              LKR {(totalAmount / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {paymentData.map((item, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered ? 'border-[#0B3B60] bg-slate-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-xs font-semibold text-slate-800">
                    {item.method}
                  </span>
                </div>

                <div className="text-right flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0B3B60]">
                    {item.percentage}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                    (LKR {item.amount ? item.amount.toLocaleString() : '0'})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="text-slate-400 text-[11px]">Primary tender: Cash (58%)</span>
        <span className="text-slate-400 text-[11px]">Zero merchant fee</span>
      </div>
    </div>
  );
}
