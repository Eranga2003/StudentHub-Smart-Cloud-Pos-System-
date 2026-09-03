import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowUpDown, Boxes } from 'lucide-react';

/**
 * LowStockTable Component
 * Displays products that require replenishment, with stock alerts and quick navigation.
 */
export default function LowStockTable({ items = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs h-72 flex items-center justify-center animate-pulse">
        <div className="space-y-3 text-center">
          <div className="h-4 w-36 bg-slate-200 rounded mx-auto"></div>
          <div className="h-40 w-full max-w-lg bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const stockList = items.length > 0 ? items : [
    { id: '1', name: 'Scientific Calculator fx-991EX', sku: 'EL-CAS-991', category: 'Stationery', currentStock: 2, minStock: 10, status: 'Critical' },
    { id: '2', name: 'Elephant House Wonder Bar', sku: 'IC-WON-01', category: 'Ice Cream', currentStock: 1, minStock: 15, status: 'Critical' },
    { id: '3', name: 'CR Book 200 Pages Ruled', sku: 'BK-CR-200', category: 'Books', currentStock: 4, minStock: 20, status: 'Low' },
    { id: '4', name: 'SanDisk 64GB USB 3.0 Flash', sku: 'AC-USB-64G', category: 'USB Accessories', currentStock: 3, minStock: 12, status: 'Low' },
    { id: '5', name: 'Graph Book 80 Pages A4', sku: 'BK-GRP-80', category: 'Books', currentStock: 5, minStock: 25, status: 'Low' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table Card Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Stock Depletion Warnings</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Low Stock Items</h2>
          <p className="text-xs text-slate-500">Items reaching or below minimum threshold</p>
        </div>

        {/* View Inventory Button */}
        <button
          onClick={() => navigate('/inventory/low-stock')}
          className="btn-glass text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          <Boxes className="w-3.5 h-3.5 text-[#43B02A]" />
          <span>View Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-center">Current Stock</th>
              <th className="px-5 py-3 text-center">Minimum Stock</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stockList.map((item) => {
              const isCritical = item.status === 'Critical' || item.currentStock <= 2;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    <span className="badge-navy px-2 py-0.5 rounded text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-block font-black text-xs px-2.5 py-1 rounded-md ${
                        isCritical
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.currentStock} units
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-xs font-mono text-slate-500">
                    {item.minStock} units
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isCritical
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isCritical ? 'Critical' : 'Low'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate('/inventory')}
                      className="btn-glass text-xs py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      <ArrowUpDown className="w-3 h-3 text-[#43B02A]" />
                      <span>Restock</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {stockList.length} items requiring attention</span>
        <span className="text-[11px] text-slate-400">Reorder trigger: stock ≤ minimum</span>
      </div>
    </div>
  );
}
