import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Package,
  Boxes,
  PieChart,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function ReportsPage() {
  const { reportType } = useParams();
  const navigate = useNavigate();

  const [activeReport, setActiveReport] = useState('sales');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportType && ['sales', 'products', 'services', 'inventory', 'profit-loss'].includes(reportType)) {
      setActiveReport(reportType);
    } else {
      setActiveReport('sales');
    }
  }, [reportType]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [sls, prods, exps] = await Promise.all([
        firestoreService.getSales().catch(() => []),
        firestoreService.getProducts().catch(() => []),
        firestoreService.getExpenses().catch(() => []),
      ]);
      setSales(sls);
      setProducts(prods);
      setExpenses(exps);
    } catch (err) {
      console.error('[Firestore Error - getReports]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const reportTabs = [
    { id: 'sales', label: 'Sales Report', path: '/reports/sales' },
    { id: 'products', label: 'Product Report', path: '/reports/products' },
    { id: 'services', label: 'Service Report', path: '/reports/services' },
    { id: 'inventory', label: 'Inventory Report', path: '/reports/inventory' },
    { id: 'profit-loss', label: 'Profit & Loss', path: '/reports/profit-loss' },
  ];

  // Live analytics calculated from Firestore records
  const totalGrossRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalGrossRevenue - totalExpensesAmount;

  // Extract top items sold from sales items
  const itemMap = {};
  sales.forEach((s) => {
    if (Array.isArray(s.items)) {
      s.items.forEach((item) => {
        const name = item.name || 'Unnamed Item';
        const qty = Number(item.quantity) || 1;
        const revenue = (Number(item.price) || 0) * qty;
        if (!itemMap[name]) itemMap[name] = { units: 0, revenue: 0 };
        itemMap[name].units += qty;
        itemMap[name].revenue += revenue;
      });
    }
  });

  const topItemsList = Object.keys(itemMap).map((k) => ({
    name: k,
    units: itemMap[k].units,
    revenue: itemMap[k].revenue,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-[#43B02A]" />
            <span>Cloud Business Intelligence & Audits</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            {reportTabs.find((r) => r.id === activeReport)?.label || 'Financial Reports'}
          </h1>
          <p className="text-sm text-slate-500">
            Real-time turnover, product velocity, and profit audits computed from Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={loadReportsData} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>
        </div>
      </div>

      {/* Sub-page Navigation Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {reportTabs.map((tab) => {
          const isSelected = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReport(tab.id);
                navigate(tab.path);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Real Live KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Gross Sales</span>
          <p className="text-2xl font-bold text-[#0B3B60] mt-1">LKR {totalGrossRevenue.toFixed(2)}</p>
          <span className="text-xs text-slate-500 mt-2 inline-block font-mono">{sales.length} orders recorded</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Recorded Store Expenses</span>
          <p className="text-2xl font-bold text-red-600 mt-1">LKR {totalExpensesAmount.toFixed(2)}</p>
          <span className="text-xs text-slate-500 mt-2 inline-block font-mono">{expenses.length} expense logs</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net Operating Profit</span>
          <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-[#43B02A]' : 'text-red-600'}`}>
            LKR {netProfit.toFixed(2)}
          </p>
          <span className="text-xs text-slate-500 mt-2 inline-block">Gross sales minus operational outflow</span>
        </div>
      </div>

      {/* Top Items Performance Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#0B3B60]">
          Performance Breakdown — {reportTabs.find((r) => r.id === activeReport)?.label}
        </h2>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="w-7 h-7 text-[#43B02A] animate-spin" />
            <p className="text-xs font-semibold">Auditing Firestore records...</p>
          </div>
        ) : topItemsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-semibold text-slate-600">No Sales Data Recorded Yet</p>
            <p className="text-xs">Complete sales in the POS terminal to generate performance velocity reports.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-4 py-3">Item / Service Name</th>
                  <th className="px-4 py-3 text-center">Volume Sold</th>
                  <th className="px-4 py-3 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topItemsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-center text-slate-600 font-medium">{item.units}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#0B3B60]">
                      LKR {Number(item.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
