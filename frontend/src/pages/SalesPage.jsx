import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  ArrowLeft,
  X,
  CreditCard,
  Banknote,
  RotateCcw,
  Check,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function SalesPage() {
  const { subTab } = useParams();
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('history');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getSales();
      setSales(data);
    } catch (err) {
      console.warn('Could not load sales from Firestore:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (subTab === 'invoices') {
      setActiveTab('invoices');
    } else {
      setActiveTab('history');
    }
  }, [subTab]);

  const filtered = sales.filter((s) => {
    const invId = s.invoiceNo || s.id || '';
    const cust = s.customer || '';
    const matchesSearch =
      invId.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4 text-[#43B02A]" />
            <span>Cloud Firestore Transactions</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            Sales & Receipts
          </h1>
          <p className="text-sm text-slate-500">
            Audit live POS transactions stored in Cloud Firestore project <code className="text-[#0B3B60] font-semibold">student-hub-smart-pos-system</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={fetchSales} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>
        </div>
      </div>

      {/* Sub-page Navigation Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'history', label: 'Sales History', path: '/sales' },
          { id: 'invoices', label: 'Invoices & Receipts', path: '/sales/invoices' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
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

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, student name, or ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Reading transactions from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Sales Recorded in Firestore Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete a sale in the POS terminal to see real receipts recorded here in cloud Firestore.
          </p>
          <button
            onClick={() => navigate('/pos')}
            className="btn-primary text-xs"
          >
            <span>Go to POS Terminal</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Cashier</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Total Amount</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0B3B60]">
                      {sale.invoiceNo || sale.id}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {sale.date || 'Just now'}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {sale.customer}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {sale.cashier}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge-navy px-2 py-0.5 rounded text-xs font-medium">
                        {sale.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          sale.status === 'Completed'
                            ? 'badge-green'
                            : 'bg-red-500/10 text-red-700 border border-red-500/20'
                        }`}
                      >
                        {sale.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0B3B60]">
                      LKR {Number(sale.total || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(sale)}
                        className="btn-glass text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail / Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-[#0B3B60]">
                {selectedInvoice.invoiceNo || selectedInvoice.id}
              </span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Slip */}
            <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-lg font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-slate-900 text-sm">STUDENT HUB POS</p>
                <p className="text-[10px] text-slate-500">Campus Branch #01 • Colombo</p>
                <p className="text-[10px] text-slate-500">{selectedInvoice.date || 'Today'}</p>
              </div>

              <div className="space-y-1 pt-1">
                {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                <span>TOTAL</span>
                <span>LKR {Number(selectedInvoice.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn-glass flex-1 justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => alert(`Receipt printed for ${selectedInvoice.invoiceNo || selectedInvoice.id}`)}
                className="btn-primary flex-1 justify-center"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
