import React, { useState } from 'react';
import { Layers } from 'lucide-react';

/**
 * SalesCategoryChart Component
 * Vertical Bar Chart displaying revenue distribution across store categories.
 * Categories:
 * - Books
 * - Stationery
 * - Snacks & Chocolates
 * - Drinks
 * - Ice Cream
 * - USB & Mobile Accessories
 */
export default function SalesCategoryChart({ data = [], loading = false }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs h-80 flex items-center justify-center animate-pulse">
        <div className="space-y-3 text-center">
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
          <div className="h-48 w-full max-w-md bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const categoryData = data.length > 0 ? data : [
    { category: 'Books', sales: 124500, share: 32, color: '#0B3B60' },
    { category: 'Stationery', sales: 98200, share: 25, color: '#43B02A' },
    { category: 'Snacks & Chocolates', sales: 62400, share: 16, color: '#F59E0B' },
    { category: 'Drinks', sales: 44300, share: 11, color: '#3B82F6' },
    { category: 'Ice Cream', sales: 31800, share: 8, color: '#EC4899' },
    { category: 'USB & Mobile Accessories', sales: 28800, share: 8, color: '#8B5CF6' },
  ];

  const maxVal = Math.max(...categoryData.map((c) => c.sales)) * 1.15;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <Layers className="w-4 h-4 text-[#43B02A]" />
            <span>Department Breakdown</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Sales by Category</h2>
          <p className="text-xs text-slate-500">Revenue split across retail categories</p>
        </div>

        <span className="badge-navy text-xs px-2.5 py-1 rounded-md font-semibold">
          6 Categories
        </span>
      </div>

      {/* Bar Chart Area */}
      <div className="space-y-3 pt-2">
        {categoryData.map((item, index) => {
          const percentage = ((item.sales / maxVal) * 100).toFixed(0);
          const isHovered = hoveredCategory === item.category;

          return (
            <div
              key={index}
              className="space-y-1 cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={`font-semibold transition-colors ${isHovered ? 'text-[#0B3B60]' : 'text-slate-700'}`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0B3B60]">
                    LKR {item.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] w-9 text-right">
                    {item.share}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#0B3B60',
                    opacity: isHovered ? 1 : 0.85,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="text-slate-400 text-[11px]">Sorted by gross volume</span>
        <span className="font-mono text-slate-400 text-[11px]">Total LKR: {categoryData.reduce((s, c) => s + c.sales, 0).toLocaleString()}</span>
      </div>
    </div>
  );
}
