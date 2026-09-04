import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  Eye,
  Save,
  X,
  Trash2,
  Cloud,
  CheckCircle2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import { firestoreService, generateItemSkus } from '../services/firestoreService.js';

const categoryMap = {
  books: 'Books',
  stationery: 'Stationery',
  snacks: 'Snacks & Chocolates',
  drinks: 'Drinks',
  'ice-cream': 'Ice Cream',
  accessories: 'USB & Mobile Accessories',
};

const prefixes = {
  'Books': 'BK',
  'Stationery': 'ST',
  'Snacks & Chocolates': 'SN',
  'Drinks': 'DR',
  'Ice Cream': 'IC',
  'USB & Mobile Accessories': 'AC',
};

export const generateProductSKU = (cat = 'Books') => {
  const prefix = prefixes[cat] || 'SH';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

const categories = [
  'All',
  'Books',
  'Stationery',
  'Snacks & Chocolates',
  'Drinks',
  'Ice Cream',
  'USB & Mobile Accessories',
];

export default function ProductsPage() {
  const { subCategory } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSkus, setCopiedSkus] = useState(false);

  const handleCopySkus = (skus) => {
    if (!skus || skus.length === 0) return;
    const text = skus.map((s) => `SKU: ${s}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSkus(true);
    setTimeout(() => setCopiedSkus(false), 2000);
  };

  // User input form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Books',
    costPrice: '',
    sellingPrice: '',
    stock: '',
  });

  const openAddModal = () => {
    const activeCat = selectedCategory === 'All' ? 'Books' : selectedCategory;
    setNewProduct({
      name: '',
      sku: generateProductSKU(activeCat),
      category: activeCat,
      costPrice: '',
      sellingPrice: '',
      stock: '',
    });
    setIsAddModalOpen(true);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getProducts();
      setProducts(data);
    } catch (err) {
      // Log only to web console / terminal as requested
      console.error('[Firestore Error - getProducts]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (subCategory && categoryMap[subCategory]) {
      setSelectedCategory(categoryMap[subCategory]);
    } else {
      setSelectedCategory('All');
    }
  }, [subCategory]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sellingPrice) return;

    setIsSaving(true);
    try {
      const savedDoc = await firestoreService.addProduct({
        name: newProduct.name,
        sku: newProduct.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        category: newProduct.category,
        costPrice: Number(newProduct.costPrice) || 0,
        sellingPrice: Number(newProduct.sellingPrice),
        stock: Number(newProduct.stock) || 0,
      });

      setProducts((prev) => [savedDoc, ...prev]);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', sku: '', category: 'Books', costPrice: '', sellingPrice: '', stock: '' });
      setActionSuccess(`"${savedDoc.name}" saved!`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      // Log only to web console / terminal as requested
      console.error('[Firestore Error - addProduct]:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();
    try {
      await firestoreService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setActionSuccess('Product deleted');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('[Firestore Error - deleteProduct]:', err.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold text-sm">{actionSuccess}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-[#43B02A]" />
            <span>Cloud Inventory • {selectedCategory === 'All' ? 'All Departments' : selectedCategory}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            {selectedCategory === 'All' ? 'Product Catalog' : selectedCategory}
          </h1>
          <p className="text-sm text-slate-500">
            Real user-input catalog stored in Cloud Firestore.
          </p>
        </div>

        {/* PRIMARY BUTTON: [ Add Product ] */}
        <button
          onClick={openAddModal}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Category Navigation Pills */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const reverseKey = Object.keys(categoryMap).find((k) => categoryMap[k] === cat);
                navigate(reverseKey ? `/products/${reverseKey}` : '/products');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedCategory === 'All' ? 'products' : selectedCategory.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {filteredProducts.length} items
          </span>
          <button onClick={fetchProducts} className="btn-glass text-xs py-1.5 px-3">
            <Cloud className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Table / Clean Empty State */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
          <p className="text-sm font-semibold text-[#0B3B60]">Connecting to Cloud Firestore...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B3B60]/10 text-[#0B3B60] flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B3B60]">No Products Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Add your shop products to store them in your Cloud Firestore database.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="btn-primary inline-flex"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-[#0B3B60] uppercase border-b border-slate-200">
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">SKU / Code</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 text-right">Cost Price</th>
                  <th className="px-5 py-3.5 text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span>{p.sku || 'N/A'}</span>
                        {p.stock > 1 && (
                          <span
                            className="text-[10px] font-sans font-semibold text-[#0B3B60] bg-[#0B3B60]/10 px-1.5 py-0.5 rounded"
                            title={`${p.stock} individual unit SKUs`}
                          >
                            {p.stock} units
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      <span className="badge-navy px-2 py-0.5 rounded text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-xs">
                      LKR {Number(p.costPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0B3B60]">
                      LKR {Number(p.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                      {p.stock}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.status === 'In Stock'
                            ? 'badge-green'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-700 border border-red-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewProduct(p)}
                          className="btn-glass text-xs py-1 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteProduct(p.id, e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PRODUCT FORM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0B3B60]">Input Product Data</h3>
                <p className="text-xs text-slate-500">Saves directly to Cloud Firestore</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product title..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      SKU / Barcode ID *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProduct((prev) => ({
                          ...prev,
                          sku: generateProductSKU(prev.category),
                        }))
                      }
                      className="text-[11px] font-semibold text-[#0B3B60] hover:text-[#43B02A] flex items-center gap-1 transition-colors"
                      title="Re-generate a fresh random SKU"
                    >
                      <Sparkles className="w-3 h-3 text-[#43B02A]" />
                      <span>Re-roll</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="e.g. BK-4821"
                      className="w-full pl-3 pr-16 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 font-mono font-bold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded">
                      Auto
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        category: newCat,
                        sku: generateProductSKU(newCat),
                      });
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost (LKR)
                  </label>
                  <input
                    type="number"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-glass"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT MODAL */}
      {viewProduct && (() => {
        const itemSkus = Array.isArray(viewProduct.itemIds) && viewProduct.itemIds.length === Number(viewProduct.stock)
          ? viewProduct.itemIds
          : generateItemSkus(viewProduct.sku, Number(viewProduct.stock) || 0, viewProduct.itemIds || []);

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0B3B60]/10 text-[#0B3B60] flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B3B60]">Product Inventory Details</h3>
                    <p className="text-xs text-slate-400">Single & Bulk stock tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewProduct(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{viewProduct.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Base Code: {viewProduct.sku || 'N/A'}</p>
                  </div>
                  <span className="badge-navy px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
                    {viewProduct.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Selling Price</span>
                    <span className="text-sm font-bold text-[#0B3B60]">
                      LKR {Number(viewProduct.sellingPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Price</span>
                    <span className="text-sm font-bold text-slate-600">
                      LKR {Number(viewProduct.costPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${viewProduct.stock > 0 ? 'bg-[#43B02A]' : 'bg-red-500'}`}></span>
                      {viewProduct.stock} {viewProduct.stock === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BULK / INDIVIDUAL ITEM ID LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0B3B60]" />
                    <span className="text-xs font-bold text-slate-800">
                      Individual Stock Unit IDs ({itemSkus.length} in stock)
                    </span>
                  </div>
                  {itemSkus.length > 0 && (
                    <button
                      onClick={() => handleCopySkus(itemSkus)}
                      className="text-[11px] font-semibold text-[#0B3B60] hover:text-[#43B02A] flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200/70 transition-colors"
                      title="Copy all SKU IDs to clipboard"
                    >
                      {copiedSkus ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#43B02A]" />
                          <span className="text-[#43B02A]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {itemSkus.length > 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-h-52 overflow-y-auto space-y-1.5 font-mono text-xs">
                    {itemSkus.map((skuId, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-3 bg-white hover:bg-slate-100/80 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#43B02A] shrink-0"></span>
                          <span className="font-bold text-slate-800 tracking-wide">
                            SKU: {skuId}
                          </span>
                        </div>
                        <span className="text-[10px] font-sans font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          Unit #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl text-center space-y-1">
                    <p className="text-xs font-bold text-amber-800">0 Units in Stock (Out of Stock)</p>
                    <p className="text-[11px] text-amber-600">
                      All individual unit SKUs have been sold or removed from inventory.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {itemSkus.length > 0 ? 'Randomly deducted unit-by-unit during POS checkout' : 'Restock product to generate fresh unit IDs'}
                </span>
                <button
                  onClick={() => setViewProduct(null)}
                  className="btn-glass text-xs py-1.5 px-3.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
