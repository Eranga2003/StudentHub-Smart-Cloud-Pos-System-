import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const products = await firestoreService.getProducts();
      // Generate live alerts for low stock items in Firestore
      const lowStockAlerts = products
        .filter((p) => Number(p.stock || 0) <= 5)
        .map((p) => {
          const isOut = Number(p.stock || 0) === 0;
          return {
            id: p.id,
            title: isOut ? `Out of Stock: ${p.name}` : `Low Stock Alert: ${p.name}`,
            desc: isOut
              ? `SKU ${p.sku || 'N/A'} has 0 units remaining. Replenish immediately.`
              : `Only ${p.stock} units remaining in inventory (Threshold: 5 units).`,
            time: 'Live Alert',
            type: isOut ? 'error' : 'warning',
            read: false,
          };
        });
      setAlerts(lowStockAlerts);
    } catch (err) {
      console.error('[Firestore Error - getNotifications]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAllRead = () => {
    setAlerts(alerts.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 text-[#43B02A]" />
            <span>Alert Center</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">Notifications</h1>
          <p className="text-sm text-slate-500">
            Real-time inventory alerts triggered by Cloud Firestore stock counts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadAlerts} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync</span>
          </button>
          <button onClick={clearAll} className="btn-glass text-xs">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
          <button onClick={markAllRead} className="btn-primary text-xs">
            <Check className="w-3.5 h-3.5" />
            <span>Mark All As Read</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="w-7 h-7 text-[#43B02A] animate-spin" />
            <p className="text-xs font-semibold">Checking Cloud Firestore for stock triggers...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#43B02A]" />
            <p className="text-base font-bold text-slate-700">All Systems Normal</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no low-stock or critical system alerts. All inventory items are at healthy levels.
            </p>
          </div>
        ) : (
          alerts.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl p-4 border transition-all flex items-start gap-3.5 ${
                !n.read
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'error'
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
