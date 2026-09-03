import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react';

/**
 * RecentSalesTable Component
 * Displays recent sales transactions with statuses, items, and billing totals.
 */
export default function RecentSalesTable({ sales = [], loading = false }) {
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

  const salesList = sales.length > 0 ? sales : [
    {
      id: '1',
      invoiceNo: 'INV-2026-092',
      customer: 'Kasun Bandara (ST-1044)',
      items: 'CR Book 120p (x2), Gel Pen Box',
      method: 'Cash',
      total: 1240.0,
      date: 'Today 14:28',
      status: 'Completed',
    },
    {
      id: '2',
      invoiceNo: 'INV-2026-091',
      customer: 'Nimali Senanayake',
      items: 'Scientific Calculator fx-991EX',
      method: 'Card',
      total: 6900.0,
      date: 'Today 13:50',
      status: 'Completed',
    },
    {
      id: '3',
      invoiceNo: 'INV-2026-090',
      customer: 'Walk-in Student',
      items: 'A4 Color Printing (35 pgs)',
      method: 'Cash',
      total: 875.0,
      date: 'Today 12:45',
      status: 'Completed',
    },
    {
      id: '4',
      invoiceNo: 'INV-2026-089',
      customer: 'Amara Weerasinghe',
      items: 'Thesis Hardcover Binding (x2)',
      method: 'Bank Transfer',
      total: 1300.0,
      date: 'Today 11:15',
      status: 'Pending',
    },
    {
      id: '5',
      invoiceNo: 'INV-2026-088',
      customer: 'Faculty Bio Dept',
      items: 'Damaged USB Cable Return',
      method: 'Card',
      total: 850.0,
      date: 'Today 09:30',
      status: 'Refunded',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="badge-green px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'Refunded':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <ShoppingCart className="w-4 h-4 text-[#43B02A]" />
            <span>Real-Time Invoicing</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Recent Sales</h2>
          <p className="text-xs text-slate-500">Latest cashier receipts and billing records</p>
        </div>

        {/* View All Sales Button */}
        <button
          onClick={() => navigate('/sales')}
          className="btn-glass text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>View All Sales</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
              <th className="px-5 py-3">Invoice No</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Payment Method</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-center">Date</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesList.map((sale) => (
              <tr key={sale.id || sale.invoiceNo} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0B3B60]">
                  {sale.invoiceNo}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800 text-xs">
                  {sale.customer}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                  {sale.items}
                </td>
                <td className="px-5 py-3.5 text-xs">
                  <span className="badge-navy px-2 py-0.5 rounded text-[11px]">
                    {sale.method}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-black text-sm text-[#0B3B60]">
                  LKR {Number(sale.total || 0).toFixed(2)}
                </td>
                <td className="px-5 py-3.5 text-center text-xs font-mono text-slate-500 whitespace-nowrap">
                  {sale.date}
                </td>
                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                  {getStatusBadge(sale.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing last 5 completed transactions</span>
        <span className="font-mono text-[11px] text-slate-400">Terminal: Counter #01</span>
      </div>
    </div>
  );
}
