import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Printer,
  Store,
  Receipt,
  Check,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [branch, setBranch] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [printerWidth, setPrinterWidth] = useState('80mm');
  const [studentDiscountRate, setStudentDiscountRate] = useState('5');
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch real store settings from Cloud Firestore
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getStoreSettings();
      if (data) {
        setStoreName(data.storeName || 'Student Hub POS');
        setBranch(data.branch || 'Campus Branch #01');
        setAddress(data.address || 'University Complex, Colombo 03');
        setPhone(data.phone || '+94 11 258 7777');
        setCurrency(data.currency || 'LKR');
        setPrinterWidth(data.printerWidth || '80mm');
        setStudentDiscountRate(String(data.studentDiscountRate || '5'));
        setReceiptHeader(data.receiptHeader || 'Student Hub Bookshop & Services');
        setReceiptFooter(data.receiptFooter || 'Thank you for your purchase! Come back soon.');
      }
    } catch (err) {
      console.error('[Settings] Error loading store details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await firestoreService.saveStoreSettings({
        storeName,
        branch,
        address,
        phone,
        currency,
        printerWidth,
        studentDiscountRate: Number(studentDiscountRate) || 5,
        receiptHeader,
        receiptFooter,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[Settings] Error saving store details to DB:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5" />
          <p className="font-bold text-sm">Store billing details saved to Cloud Firestore!</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-[#43B02A]" />
            <span>Billing Profile & Hardware Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">POS System Settings</h1>
          <p className="text-sm text-slate-500">
            Store and billing details stored in Cloud Firestore for receipt printing and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadSettings}
            className="btn-glass text-xs py-2 px-3"
          >
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync DB</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold">Loading store settings from Firestore...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Profile / Receipt Billing Details */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0B3B60] flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#0B3B60]" />
                  <span>Store & Terminal Details (Receipt Billing Information)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  These details will be printed on all student receipts and sales invoices.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#43B02A] bg-[#43B02A]/10 px-2.5 py-1 rounded-full">
                Saved in Firestore DB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Student Hub POS"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Terminal ID
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Campus Counter #01"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Address (Printed on Bill) *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. University Complex, Colombo 03"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +94 11 258 7777"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receipt Header Note
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  placeholder="e.g. Student Hub Bookshop & Services"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receipt Footer Thank You Message
                </label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="e.g. Thank you for shopping with us! Please visit again."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                />
              </div>
            </div>
          </div>

          {/* Printer & Hardware */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#0B3B60] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#0B3B60]" />
                <span>Thermal Receipt Printer & POS Rules</span>
              </h2>

              <button
                type="button"
                onClick={() => alert(`Sending test print to ${printerWidth} thermal printer...`)}
                className="btn-glass text-xs py-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Test Print</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Width</label>
                <select
                  value={printerWidth}
                  onChange={(e) => setPrinterWidth(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                >
                  <option value="80mm">80mm (Standard POS Thermal)</option>
                  <option value="58mm">58mm (Compact Mobile)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={studentDiscountRate}
                  onChange={(e) => setStudentDiscountRate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
