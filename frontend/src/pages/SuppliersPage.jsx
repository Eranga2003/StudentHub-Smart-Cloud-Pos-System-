import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Eye,
  Save,
  X,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSup, setNewSup] = useState({ name: '', contact: '', phone: '', email: '', category: 'Stationery & Books', address: '' });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('[Firestore Error - getSuppliers]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newSup.name) return;

    setIsSaving(true);
    try {
      const saved = await firestoreService.addSupplier(newSup);
      setSuppliers([saved, ...suppliers]);
      setModalOpen(false);
      setNewSup({ name: '', contact: '', phone: '', email: '', category: 'Stationery & Books', address: '' });
    } catch (err) {
      console.error('[Firestore Error - addSupplier]:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.contact && s.contact.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#43B02A]" />
            <span>Vendor Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Suppliers & Distributors</h1>
          <p className="text-sm text-slate-500">
            Wholesale vendor accounts stored in Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={fetchSuppliers} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>

          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name or contact person..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading suppliers from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Suppliers Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click Add Supplier to save your vendor partners directly into Firestore.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Supplier</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-[#0B3B60]/30 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#0B3B60]">{s.name}</h3>
                  <p className="text-xs text-slate-500">{s.contact}</p>
                </div>
                <span className="badge-navy text-xs px-2 py-0.5 rounded font-medium">
                  {s.category}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0B3B60]" />
                  <span>{s.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0B3B60]" />
                  <span>{s.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3B60]">Add Vendor Partner</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atlas Axillia PLC"
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Manager"
                  value={newSup.contact}
                  onChange={(e) => setNewSup({ ...newSup, contact: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+94 11 000 0000"
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@vendor.com"
                    value={newSup.email}
                    onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
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
                  <span>Save Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
