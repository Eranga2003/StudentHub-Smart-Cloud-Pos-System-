import React from 'react';
import { Award, Package } from 'lucide-react';

/**
 * TopProductsChart Component
 * Horizontal Bar Chart showing the top 5 products ranked by units sold.
 */
export default function TopProductsChart({ data = [], loading = false }) {
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

  const products = data.length > 0 ? data : [
    { id: 1, name: 'Exercise Book (120 Pages Ruled)', quantity: 185, revenue: 38850, category: 'Books' },
    { id: 2, name: 'Blue Gel Pen (0.5mm)', quantity: 142, revenue: 7100, category: 'Stationery' },
    { id: 3, name: 'A4 Copier Paper 80GSM Ream', quantity: 98, revenue: 147000, category: 'Stationery' },
    { id: 4, name: 'Popular Novel (Student Edition)', quantity: 64, revenue: 38400, category: 'Books' },
    { id: 5, name: 'High-Speed USB Cable (Type-C)', quantity: 52, revenue: 41600, category: 'Accessories' },
  ];

  const maxQty = Math.max(...products.map((p) => p.quantity));

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <Award className="w-4 h-4 text-[#43B02A]" />
            <span>Product Velocity</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Top Selling Products</h2>
          <p className="text-xs text-slate-500">Top 5 items ranked by unit volume sold</p>
        </div>

        <span className="badge-green text-xs px-2.5 py-1 rounded-md font-semibold">
          High Turnover
        </span>
      </div>

      {/* Horizontal List with Bars */}
      <div className="space-y-3.5 pt-1">
        {products.map((item, index) => {
          const widthPercent = ((item.quantity / maxQty) * 100).toFixed(0);

          return (
            <div key={item.id || index} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-[#0B3B60]">
                    {item.quantity} <span className="font-medium text-[11px] text-slate-400">units</span>
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline font-mono">
                    (LKR {item.revenue.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B3B60] to-[#43B02A] rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                  style={{ width: `${widthPercent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="text-slate-400 text-[11px]">Ranked by units sold</span>
        <span className="text-slate-400 text-[11px]">Campus Store #01</span>
      </div>
    </div>
  );
}
