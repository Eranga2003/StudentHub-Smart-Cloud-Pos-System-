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

  const defaultActivities = [
    {
      id: 'a1',
      type: 'sale',
      title: 'New sale completed',
      description: 'Invoice #INV-2026-092 for LKR 1,240.00 (Cash)',
      time: '5 mins ago',
      color: 'text-[#43B02A]',
      bg: 'bg-[#43B02A]/10',
    },
    {
      id: 'a2',
      type: 'product',
      title: 'Product added',
      description: 'Atlas Chooty Gel Pen (0.5mm) added to catalog',
      time: '24 mins ago',
      color: 'text-[#0B3B60]',
      bg: 'bg-[#0B3B60]/10',
    },
    {
      id: 'a3',
      type: 'stock',
      title: 'Stock received',
      description: '50 units of A4 Copier Paper 80GSM restocked',
      time: '1 hour ago',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      id: 'a4',
      type: 'customer',
      title: 'Customer added',
      description: 'Sandun Jayasuriya (ID: ST-2088) registered for discounts',
      time: '2 hours ago',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      id: 'a5',
      type: 'refund',
      title: 'Refund processed',
      description: 'LKR 850.00 refunded for defective USB cable (#INV-2026-088)',
      time: '4 hours ago',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  const list = activities.length > 0 ? activities : defaultActivities;

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

      {/* Activity Timeline List */}
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

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Logged automatically</span>
        <span className="font-mono text-[11px]">Campus Branch #01</span>
      </div>
    </div>
  );
}
