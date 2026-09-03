import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Save,
  X,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: 'Shift Cashier', phone: '', shift: 'Morning (08:00 - 16:00)' });

  const fetchEmployeesData = async () => {
    setLoading(true);
    try {
      const emps = await firestoreService.getEmployees().catch(() => []);
      setEmployees(emps);
    } catch (err) {
      console.error('[Firestore Error - getEmployees]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newEmp.name) return;

    setIsSaving(true);
    try {
      const empId = `EMP-0${employees.length + 1}`;
      const saved = await firestoreService.addEmployee({
        empId,
        name: newEmp.name,
        role: newEmp.role,
        phone: newEmp.phone,
        shift: newEmp.shift,
        status: 'Active',
      });
      setEmployees([...employees, saved]);
      setModalOpen(false);
      setNewEmp({ name: '', role: 'Shift Cashier', phone: '', shift: 'Morning (08:00 - 16:00)' });
    } catch (err) {
      console.error('[Firestore Error - addEmployee]:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-[#43B02A]" />
            <span>Staff Administration & Cashier Profiles</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Employees</h1>
          <p className="text-sm text-slate-500">
            Cashier terminal staff and operator accounts stored in Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={fetchEmployeesData} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>

          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* EMPLOYEES TABLE */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading staff accounts from Firestore...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Employees Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click Add Employee to register your first cashier or store operator into Firestore.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Register First Employee</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Employee ID</th>
                  <th className="px-5 py-3.5">Staff Name</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Shift Schedule</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0B3B60]">
                      {emp.empId || emp.id}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{emp.name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{emp.role}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{emp.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{emp.shift}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="badge-green px-2 py-0.5 rounded-full text-xs font-semibold">
                        {emp.status || 'Active'}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3B60]">Register Employee</h3>
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
                  placeholder="e.g. Kasun Fernando"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                >
                  <option value="Senior Cashier">Senior Cashier</option>
                  <option value="Shift Cashier">Shift Cashier</option>
                  <option value="Print Services Operator">Print Services Operator</option>
                  <option value="Store Manager">Store Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+94 77 000 0000"
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-glass">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Staff to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
