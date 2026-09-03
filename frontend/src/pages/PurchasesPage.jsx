import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  Eye,
  X,
  Save,
  Building2,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function PurchasesPage() {
  const { subTab } = useParams();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPO, setNewPO] = useState({ supplier: '', itemsCount: '', total: '' });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getPurchases();
      setPurchases(data);
    } catch (err) {
      console.error('[Firestore Error - getPurchases]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (subTab === 'new') {
      setActiveTab('new');
      setModalOpen(true);
    } else {
      setActiveTab('history');
    }
  }, [subTab]);

  const handleSavePO = async (e) => {
    e.preventDefault();
    if (!newPO.supplier || !newPO.total) return;

    setIsSaving(true);
    try {
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const saved = await firestoreService.addPurchase({
        poNumber,
        supplier: newPO.supplier,
        itemsCount: Number(newPO.itemsCount) || 1,
        total: Number(newPO.total),
        status: 'Received',
      });
      setPurchases([saved, ...purchases]);
      setModalOpen(false);
      setNewPO({ supplier: '', itemsCount: '', total: '' });
    } catch (err) {
      console.error('[Firestore Error - addPurchase]:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-[#43B02A]" />
            <span>Procurement & Supplier Invoices</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Purchase Orders</h1>
          <p className="text-sm text-slate-500">
            Stock replenishment orders stored in Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={fetchPurchases} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>

          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Sub-page Navigation Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'history', label: 'Purchase History', path: '/purchases' },
          { id: 'new', label: 'New Purchase Order', path: '/purchases/new' },
          { id: 'suppliers', label: 'Suppliers Directory', path: '/suppliers' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'new') {
                  setModalOpen(true);
                } else if (tab.id === 'suppliers') {
                  navigate('/suppliers');
                } else {
                  setActiveTab('history');
                  navigate('/purchases');
                }
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

      {/* Purchases Table / Empty State */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading purchase orders from Firestore...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Purchase Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first purchase order to log supplier replenishment into Firestore.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Purchase Order</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">PO Number</th>
                  <th className="px-5 py-3.5">Supplier Name</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-center">Items Count</th>
                  <th className="px-5 py-3.5 text-right">Total (LKR)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0B3B60]">
                      {po.poNumber || po.id}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{po.supplier}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{po.date || 'Today'}</td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-700">{po.itemsCount}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0B3B60]">
                      LKR {Number(po.total || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="badge-green px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        {po.status || 'Received'}
                      </span>
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
              <h3 className="text-base font-bold text-[#0B3B60]">New Purchase Order</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atlas Axillia PLC"
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Units Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={newPO.itemsCount}
                    onChange={(e) => setNewPO({ ...newPO, itemsCount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Bill (LKR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25000.00"
                    value={newPO.total}
                    onChange={(e) => setNewPO({ ...newPO, total: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-glass">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save PO to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
