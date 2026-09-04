import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ArrowUpDown,
  Search,
  CheckCircle,
  Plus,
  X,
  Save,
  Cloud,
  Loader2,
  Package,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

export default function InventoryPage() {
  const { subView } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Restock Batch');
  const [savingAdjust, setSavingAdjust] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch real inventory items from Firestore
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getProducts();
      setItems(data);
    } catch (err) {
      console.error('[Firestore Error - getInventory]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle URL subView: 'low-stock' or 'out-of-stock' / 'stock-out'
  useEffect(() => {
    if (subView === 'low-stock') {
      setActiveTab('low-stock');
    } else if (subView === 'out-of-stock' || subView === 'stock-out') {
      setActiveTab('out-of-stock');
    } else {
      setActiveTab('overview');
    }
  }, [subView]);

  // Filter items according to active tab
  const filtered = items.filter((item) => {
    const nameMatch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const skuMatch = (item.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || skuMatch;
    const stockNum = Number(item.stock) || 0;

    // STOCK OUT PAGE: SHOW ONLY 0 STOCKS
    if (activeTab === 'out-of-stock') {
      return matchesSearch && stockNum === 0;
    }

    // LOW STOCK PAGE: SHOW ITEMS WITH 1 TO 5 UNITS
    if (activeTab === 'low-stock') {
      return matchesSearch && stockNum > 0 && stockNum <= 5;
    }

    // OVERVIEW: SHOW ALL
    return matchesSearch;
  });

  // Save stock adjustment directly to Firestore
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedItem || adjustQty === '') return;

    setSavingAdjust(true);
    try {
      const newStockNum = Math.max(0, Number(adjustQty));
      await firestoreService.adjustStock(selectedItem.id, newStockNum, adjustReason);

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                stock: newStockNum,
                status: newStockNum > 5 ? 'In Stock' : newStockNum > 0 ? 'Low Stock' : 'Out of Stock',
              }
            : item
        )
      );

      setAdjustModalOpen(false);
      setSelectedItem(null);
      setActionSuccess(`Stock for "${selectedItem.name}" updated to ${newStockNum} in Firestore!`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error('[Firestore Error - adjustStock]:', err.message);
    } finally {
      setSavingAdjust(false);
    }
  };

  const totalSKUs = items.length;
  const lowStockCount = items.filter((i) => Number(i.stock || 0) <= 5 && Number(i.stock || 0) > 0).length;
  const outOfStockCount = items.filter((i) => Number(i.stock || 0) === 0).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <p className="font-bold text-sm">{actionSuccess}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-[#43B02A]" />
            <span>Cloud Inventory • Real-Time Stock Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            {activeTab === 'out-of-stock'
              ? 'Stock Out (0 Stock)'
              : activeTab === 'low-stock'
              ? 'Low Stock Alerts'
              : 'Inventory Management'}
          </h1>
          <p className="text-sm text-slate-500">
            {activeTab === 'out-of-stock'
              ? 'List of exhausted inventory items with exactly 0 units remaining.'
              : activeTab === 'low-stock'
              ? 'Items requiring replenishment soon (1 to 5 units remaining).'
              : 'Real-time stock tracking stored in Cloud Firestore.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={fetchInventory} className="btn-glass text-xs py-2 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync Firestore</span>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setActiveTab('overview');
            navigate('/inventory');
          }}
          className={`p-5 rounded-xl border text-left transition-all ${
            activeTab === 'overview'
              ? 'bg-white border-[#0B3B60] shadow-md ring-2 ring-[#0B3B60]/10'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Catalog</span>
          <p className="text-2xl font-black text-[#0B3B60] mt-1">{totalSKUs} SKUs</p>
          <span className="text-xs text-slate-500">All registered items</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('low-stock');
            navigate('/inventory/low-stock');
          }}
          className={`p-5 rounded-xl border text-left transition-all ${
            activeTab === 'low-stock'
              ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-xs uppercase font-bold text-amber-600 block">Low Stock (1-5 units)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount} Items</p>
          <span className="text-xs text-slate-500">Replenish soon</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('out-of-stock');
            navigate('/inventory/out-of-stock');
          }}
          className={`p-5 rounded-xl border text-left transition-all ${
            activeTab === 'out-of-stock'
              ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-xs uppercase font-bold text-red-600 block">Stock Out (0 units)</span>
          <p className="text-2xl font-black text-red-600 mt-1">{outOfStockCount} Items</p>
          <span className="text-xs text-slate-500">Requires immediate restock</span>
        </button>
      </div>

      {/* Sub-page Navigation Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Stock Overview', path: '/inventory' },
          { id: 'low-stock', label: `Low Stock (${lowStockCount})`, path: '/inventory/low-stock' },
          { id: 'out-of-stock', label: `Stock Out (${outOfStockCount})`, path: '/inventory/out-of-stock' },
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
            placeholder={`Search ${activeTab === 'out-of-stock' ? 'out-of-stock' : activeTab === 'low-stock' ? 'low-stock' : 'all'} items by name or SKU...`}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
          />
        </div>
      </div>

      {/* Real Inventory Table / Empty States */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-xs font-semibold text-[#0B3B60]">Loading stock data from Cloud Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
          {activeTab === 'out-of-stock' ? (
            <CheckCircle className="w-12 h-12 text-[#43B02A] mx-auto" />
          ) : (
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
          )}
          <h3 className="text-sm font-bold text-slate-700">
            {activeTab === 'out-of-stock'
              ? 'No Stock Out Items!'
              : activeTab === 'low-stock'
              ? 'No Low Stock Items!'
              : 'No Inventory Items Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'out-of-stock'
              ? 'Great! There are currently zero exhausted items with 0 stock in your store.'
              : activeTab === 'low-stock'
              ? 'All items currently have healthy stock levels (> 5 units).'
              : 'Add items in the Products section to start tracking real inventory levels.'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Products to Inventory</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">SKU / Code</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-center">Current Stock</th>
                  <th className="px-5 py-3.5 text-right">Cost Price</th>
                  <th className="px-5 py-3.5 text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-center">Stock Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const stockNum = Number(item.stock || 0);
                  const isLow = stockNum <= 5 && stockNum > 0;
                  const isOut = stockNum === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{item.sku || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <span className="badge-navy px-2 py-0.5 rounded text-[11px]">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-base">
                        <span
                          className={`px-3 py-1 rounded-lg ${
                            isOut
                              ? 'bg-red-100 text-red-700 font-black'
                              : isLow
                              ? 'bg-amber-100 text-amber-700 font-bold'
                              : 'text-[#0B3B60]'
                          }`}
                        >
                          {stockNum}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500">
                        LKR {Number(item.costPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#0B3B60]">
                        LKR {Number(item.sellingPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isOut
                              ? 'bg-red-500/10 text-red-700 border border-red-500/20'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                              : 'badge-green'
                          }`}
                        >
                          {isOut ? 'Stock Out (0)' : isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustQty(item.stock || 0);
                            setAdjustModalOpen(true);
                          }}
                          className={`btn-glass text-xs py-1 px-2.5 ${
                            isOut ? 'border-red-300 text-red-700 hover:bg-red-50' : ''
                          }`}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>{isOut ? 'Restock' : 'Adjust'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment / Restock Modal */}
      {adjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3B60]">
                {Number(selectedItem.stock || 0) === 0 ? 'Restock Product' : 'Adjust Inventory Stock'}
              </h3>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-bold text-slate-800">{selectedItem.name}</p>
                <p className="text-xs text-slate-500 font-mono">SKU: {selectedItem.sku}</p>
                <p className="text-xs font-semibold mt-1">
                  Current Stock in DB:{' '}
                  <span
                    className={
                      Number(selectedItem.stock || 0) === 0
                        ? 'text-red-600 font-bold'
                        : 'text-[#0B3B60] font-bold'
                    }
                  >
                    {selectedItem.stock} units
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Stock Count in Database *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter new quantity..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold text-[#0B3B60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Restock / Adjustment Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20"
                >
                  <option value="Restock Batch Inward">Restock Batch Inward</option>
                  <option value="Physical Stock Audit">Physical Stock Audit</option>
                  <option value="Supplier Inward Batch">Supplier Inward Batch</option>
                  <option value="Damaged / Expired Goods">Damaged / Expired Goods</option>
                  <option value="Internal Store Consumption">Internal Store Consumption</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn-glass"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="btn-primary"
                >
                  {savingAdjust ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
