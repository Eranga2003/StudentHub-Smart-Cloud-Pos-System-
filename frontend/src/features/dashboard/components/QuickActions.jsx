import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Boxes, UserPlus, Zap } from 'lucide-react';

/**
 * QuickActions Component
 * Fast-access shortcut buttons for common cashier workflows.
 * Primary action: New Sale
 */
export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider">
          <Zap className="w-4 h-4 text-[#43B02A]" />
          <span>Quick Actions</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* PRIMARY ACTION: + New Sale */}
        <button
          onClick={() => navigate('/pos')}
          className="btn-primary py-2.5 px-3 justify-center text-xs font-bold shadow-xs hover:shadow-md transition-all col-span-2 sm:col-span-1"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>+ New Sale</span>
        </button>

        {/* + Add Product */}
        <button
          onClick={() => navigate('/products')}
          className="btn-glass py-2.5 px-3 justify-center text-xs font-semibold hover:border-[#0B3B60]/30 hover:bg-slate-50 transition-all text-slate-700"
        >
          <Plus className="w-3.5 h-3.5 text-[#0B3B60]" />
          <span>+ Add Product</span>
        </button>

        {/* + Stock In */}
        <button
          onClick={() => navigate('/inventory')}
          className="btn-glass py-2.5 px-3 justify-center text-xs font-semibold hover:border-[#0B3B60]/30 hover:bg-slate-50 transition-all text-slate-700"
        >
          <Boxes className="w-3.5 h-3.5 text-[#43B02A]" />
          <span>+ Stock In</span>
        </button>

        {/* + Add Customer */}
        <button
          onClick={() => navigate('/customers')}
          className="btn-glass py-2.5 px-3 justify-center text-xs font-semibold hover:border-[#0B3B60]/30 hover:bg-slate-50 transition-all text-slate-700"
        >
          <UserPlus className="w-3.5 h-3.5 text-sky-600" />
          <span>+ Add Customer</span>
        </button>
      </div>
    </div>
  );
}
