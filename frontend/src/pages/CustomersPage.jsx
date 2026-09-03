import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  GraduationCap,
  Award,
  Phone,
  Eye,
  Save,
  X,
  Cloud,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [newCust, setNewCust] = useState({ name: '', studentId: '', faculty: 'Faculty of Science', phone: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.warn('Could not load customers from Firestore:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.studentId) return;

    try {
      const saved = await firestoreService.addCustomer({
        name: newCust.name,
        studentId: newCust.studentId,
        faculty: newCust.faculty,
        phone: newCust.phone,
        loyaltyPoints: 50,
      });
      setCustomers((prev) => [saved, ...prev]);
      setModalOpen(false);
      setNewCust({ name: '', studentId: '', faculty: 'Faculty of Science', phone: '' });
      setActionSuccess('Student registered and saved to Cloud Firestore!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('[Firestore Error - addCustomer]:', err.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.studentId && c.studentId.toLowerCase().includes(search.toLowerCase()))
  );

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
            <Users className="w-4 h-4 text-[#43B02A]" />
            <span>Campus Member Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Students & Faculty</h1>
          <p className="text-sm text-slate-500">
            Manage student loyalty points and student discount accounts stored in Firestore.
          </p>
        </div>

        {/* PRIMARY BUTTON: [ Register Student ] */}
        <button onClick={() => setModalOpen(true)} className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Register Student</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or student ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
          />
        </div>

        <button onClick={fetchCustomers} className="btn-glass text-xs py-1.5 px-3">
          <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
          <span>Sync Firestore</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading members from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Students in Firestore Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click Register Student to add campus accounts to your cloud database.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Register First Student</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Student / Member</th>
                  <th className="px-5 py-3.5">Student / Staff ID</th>
                  <th className="px-5 py-3.5">Faculty / Department</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5 text-center">Loyalty Points</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{c.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0B3B60]">{c.studentId}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{c.faculty}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{c.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="badge-green px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {c.loyaltyPoints || 0} pts
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="btn-glass text-xs py-1 px-2.5">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3B60]">Register Student Account</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Bandara"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student / Staff ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ST-2026"
                    value={newCust.studentId}
                    onChange={(e) => setNewCust({ ...newCust, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+94 77 000 0000"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty</label>
                <select
                  value={newCust.faculty}
                  onChange={(e) => setNewCust({ ...newCust, faculty: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                >
                  <option value="Faculty of Science">Faculty of Science</option>
                  <option value="Faculty of Engineering">Faculty of Engineering</option>
                  <option value="Faculty of Arts">Faculty of Arts</option>
                  <option value="Faculty of Medicine">Faculty of Medicine</option>
                  <option value="Faculty of Management">Faculty of Management</option>
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
