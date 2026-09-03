import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  Clock,
  Eye,
  Save,
  X,
  Lock,
  History,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

const roleDescriptions = [
  { role: 'Store Manager', permissions: 'Full Access (Inventory, Sales, Reports, Settings, Discounts)' },
  { role: 'Senior Cashier', permissions: 'POS Terminal, Invoices, Returns, Customer Registration, Petty Cash' },
  { role: 'Shift Cashier', permissions: 'POS Terminal, Daily Cash Drawer, Receipt Printing' },
  { role: 'Print Services Operator', permissions: 'Services Calculator, Job Queue, Paper Stock Usage' },
];

export default function EmployeesPage() {
  const { subTab } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: 'Shift Cashier', phone: '', shift: 'Morning (08:00 - 16:00)' });

  const fetchEmployeesData = async () => {
    setLoading(true);
    try {
      const [emps, sls] = await Promise.all([
        firestoreService.getEmployees().catch(() => []),
        firestoreService.getSales().catch(() => []),
      ]);
      setEmployees(emps);
      setSalesLogs(sls);
    } catch (err) {
      console.error('[Firestore Error - getEmployees]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  useEffect(() => {
    if (subTab === 'roles') {
      setActiveTab('roles');
    } else if (subTab === 'logs') {
      setActiveTab('logs');
    } else {
      setActiveTab('employees');
    }
  }, [subTab]);

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
            <span>Staff Administration & Security</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Employees & Permissions</h1>
          <p className="text-sm text-slate-500">
            Cashier terminal accounts and activity logs stored in Cloud Firestore.
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

      {/* Sub-page Navigation Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'employees', label: 'Staff Roster', path: '/employees' },
          { id: 'roles', label: 'Roles & Permissions', path: '/employees/roles' },
          { id: 'logs', label: 'Activity Logs', path: '/employees/logs' },
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

      {/* TAB 1: EMPLOYEES LIST */}
      {activeTab === 'employees' && (
        <>
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
        </>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleDescriptions.map((r) => {
            const count = employees.filter((e) => e.role === r.role).length;
            return (
              <div key={r.role} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0B3B60]" />
                    <h3 className="font-bold text-sm text-[#0B3B60]">{r.role}</h3>
                  </div>
                  <span className="badge-navy text-xs px-2 py-0.5 rounded-full font-semibold">
                    {count} Staff Assigned
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {r.permissions}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS (Based on live Firestore Sales and Terminal Activity) */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B3B60] flex items-center gap-2">
              <History className="w-4 h-4 text-[#0B3B60]" />
              <span>Real-Time POS Terminal Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">Live transaction telemetry</span>
          </div>

          {salesLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No Activity Logs Yet</p>
              <p className="text-xs">Terminal sales and cashier events will be recorded here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {salesLogs.map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">
                      Completed POS Sale #{sale.invoiceNo || sale.id} (LKR {Number(sale.total || 0).toFixed(2)})
                    </p>
                    <p className="text-slate-400">Cashier: {sale.cashier || 'Store Staff'} • Method: {sale.method}</p>
                  </div>
                  <span className="text-slate-400 font-mono">{sale.date || 'Today'}</span>
                </div>
              ))}
            </div>
          )}
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
