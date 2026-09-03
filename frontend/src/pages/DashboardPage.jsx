import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Printer,
  AlertTriangle,
  ArrowRight,
  Plus,
  DollarSign,
  Package,
  Boxes,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [prods, sls] = await Promise.all([
          firestoreService.getProducts().catch(() => []),
          firestoreService.getSales().catch(() => []),
        ]);
        setProducts(prods);
        setSales(sls);
      } catch (err) {
        console.error('[Dashboard Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute live metrics from Firestore data
  const totalSalesRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const completedOrdersCount = sales.length;
  const lowStockItems = products.filter((p) => Number(p.stock || 0) <= 5);
  const totalProductsCount = products.length;

  const stats = [
    {
      title: "Total Sales Revenue",
      value: `LKR ${totalSalesRevenue.toFixed(2)}`,
      change: sales.length > 0 ? `${sales.length} orders recorded` : "No sales yet",
      isPositive: true,
      icon: DollarSign,
      color: "text-[#43B02A]",
      bg: "bg-[#43B02A]/10",
    },
    {
      title: "Completed Transactions",
      value: `${completedOrdersCount} Orders`,
      change: "Live POS records",
      isPositive: true,
      icon: ShoppingCart,
      color: "text-[#0B3B60]",
      bg: "bg-[#0B3B60]/10",
    },
    {
      title: "Products in Catalog",
      value: `${totalProductsCount} SKUs`,
      change: "Stored in Firestore",
      isPositive: true,
      icon: Package,
      color: "text-[#0B3B60]",
      bg: "bg-[#0B3B60]/10",
    },
    {
      title: "Low Stock Alerts",
      value: `${lowStockItems.length} Items`,
      change: lowStockItems.length > 0 ? "Stock ≤ 5 units" : "Healthy levels",
      isPositive: lowStockItems.length === 0,
      icon: AlertTriangle,
      color: lowStockItems.length > 0 ? "text-red-600" : "text-[#43B02A]",
      bg: lowStockItems.length > 0 ? "bg-red-500/10" : "bg-[#43B02A]/10",
    },
  ];

  const recentSales = sales.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#43B02A] uppercase tracking-wider">
            POS Terminal Active • Campus Branch #01
          </span>
          <h1 className="text-2xl font-bold text-[#0B3B60] mt-0.5">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500">
            Real-time bookstore and student printing service metrics from Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pos')}
            className="btn-primary"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="btn-glass"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="w-7 h-7 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading dashboard metrics from Cloud Firestore...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0B3B60]/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#0B3B60]">
                    {stat.value}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className={stat.isPositive ? 'text-[#43B02A] font-semibold' : 'text-slate-500'}>
                      {stat.change}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Sales & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0B3B60]">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Live sales recorded in Cloud Firestore</p>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-semibold text-[#0B3B60] hover:text-[#43B02A] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentSales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold text-slate-600">No Transactions Yet</p>
                <p className="text-xs">Complete a sale in the POS terminal to see live receipts here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                    <th className="px-5 py-3">Invoice #</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0B3B60]">
                        {sale.invoiceNo || sale.id}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                        {sale.customer}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#0B3B60]">
                        LKR {Number(sale.total || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="badge-green px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          {sale.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Inventory Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-base text-[#0B3B60]">Low Stock Summary</h3>
            <p className="text-xs text-slate-500">Items with stock level ≤ 5 units in Firestore</p>

            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 space-y-2">
                <Boxes className="w-8 h-8 mx-auto text-[#43B02A]" />
                <p className="text-xs font-bold text-slate-700">Stock Levels Optimal</p>
                <p className="text-[11px]">All items currently have more than 5 units.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                    </div>
                    <span className="font-black text-amber-700 bg-white px-2 py-1 rounded border border-amber-200">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/inventory/low-stock')}
            className="btn-glass w-full justify-center text-xs"
          >
            <span>View All Stock Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
