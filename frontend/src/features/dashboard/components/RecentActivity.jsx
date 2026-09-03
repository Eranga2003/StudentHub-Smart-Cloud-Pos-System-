import React from 'react';
import {
  Activity,
  ShoppingCart,
  PlusCircle,
  PackagePlus,
  UserPlus,
  RotateCcw,
  Clock,
} from 'lucide-react';

/**
 * RecentActivity Component
 * Displays a compact timeline feed of recent store operations and cashier events.
 */
export default function RecentActivity({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs h-72 flex items-center justify-center animate-pulse">
        <div className="space-y-2.5 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-2 w-1/4 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const list = activities;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-4 h-4" />;
      case 'product':
        return <PlusCircle className="w-4 h-4" />;
      case 'stock':
        return <PackagePlus className="w-4 h-4" />;
      case 'customer':
        return <UserPlus className="w-4 h-4" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <Activity className="w-4 h-4 text-[#43B02A]" />
            <span>Store Telemetry</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Recent Activity</h2>
          <p className="text-xs text-slate-500">Live operational events & staff actions</p>
        </div>

        <span className="w-2.5 h-2.5 rounded-full bg-[#43B02A] animate-pulse" title="Live stream active"></span>
      </div>

      {/* Activity Timeline List or Empty State */}
      {list.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <Activity className="w-8 h-8 mx-auto opacity-30" />
          <p className="text-xs font-semibold text-slate-700">No Recent Activity</p>
          <p className="text-[11px] text-slate-400">Events from sales and inventory will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 divide-y divide-slate-100">
        {list.map((act) => (
          <div key={act.id} className="pt-2.5 first:pt-0 flex items-start gap-3 group">
            <div className={`w-8 h-8 rounded-lg ${act.bg || 'bg-slate-100'} ${act.color || 'text-slate-600'} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {act.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  {act.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Logged automatically</span>
        <span className="font-mono text-[11px]">Campus Branch #01</span>
      </div>
    </div>
  );
}
