import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Filter,
  Search,
  DollarSign,
  Save,
  X,
  Cloud,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [newExp, setNewExp] = useState({ title: '', category: 'Printer Consumables', amount: '', paidBy: 'Petty Cash' });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.warn('Could not load expenses from Firestore:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newExp.title || !newExp.amount) return;

    try {
      const saved = await firestoreService.addExpense({
        title: newExp.title,
        category: newExp.category,
        amount: Number(newExp.amount),
        paidBy: newExp.paidBy,
        date: new Date().toISOString().split('T')[0],
      });
      setExpenses((prev) => [saved, ...prev]);
      setModalOpen(false);
      setNewExp({ title: '', category: 'Printer Consumables', amount: '', paidBy: 'Petty Cash' });
      setActionSuccess('Expense recorded and stored in Cloud Firestore!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('[Firestore Error - addExpense]:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{actionSuccess}</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4 text-[#43B02A]" />
            <span>Petty Cash & Shop Overhead</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Operational Expenses</h1>
          <p className="text-sm text-slate-500">
            Log shop overhead, printer toner refills, and station maintenance stored in Firestore.
          </p>
        </div>

        {/* PRIMARY BUTTON: [ Record Expense ] */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Outflow Logged</span>
          <p className="text-2xl font-bold text-[#0B3B60] mt-1">LKR {totalExpense.toFixed(2)}</p>
          <span className="text-xs text-slate-500 mt-2 inline-block">Real-time Firestore records</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Expenses Count</span>
          <p className="text-2xl font-bold text-[#0B3B60] mt-1">{expenses.length} Entries</p>
          <span className="text-xs text-[#43B02A] mt-2 inline-block font-semibold">Tracked in Cloud</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Database Status</span>
            <p className="text-sm font-bold text-[#43B02A] mt-1">Firestore Active</p>
            <span className="text-xs text-slate-400 font-mono">collection: expenses</span>
          </div>
          <button onClick={fetchExpenses} className="btn-glass text-xs py-1 px-2.5">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading expenses from Firestore...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Expenses Recorded in Firestore Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click Record Expense to track shop expenses and receipts in your cloud database.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Record First Expense</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Expense Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{e.title}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <span className="badge-navy px-2 py-0.5 rounded text-xs">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">{e.date}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">{e.paidBy}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-red-600">
                      - LKR {Number(e.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3B60]">Record Shop Expense</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toner Refill (Black)"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                  >
                    <option value="Printer Consumables">Printer Consumables</option>
                    <option value="Binding Supplies">Binding Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Operations">Operations</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (LKR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500.00"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold text-[#0B3B60]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={newExp.paidBy}
                  onChange={(e) => setNewExp({ ...newExp, paidBy: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                >
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Cash Counter">Cash Counter</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-glass">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4" />
                  <span>Save to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
