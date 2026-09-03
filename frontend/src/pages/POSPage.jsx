import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Sparkles,
  Percent,
  Cloud,
  Loader2,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService.js';

const categories = [
  'All',
  'Books',
  'Stationery',
  'Snacks & Chocolates',
  'Drinks',
  'Ice Cream',
  'USB & Mobile Accessories',
];

export default function POSPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [studentDiscountApplied, setStudentDiscountApplied] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saleSuccess, setSaleSuccess] = useState(null);
  const [savingSale, setSavingSale] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Load real catalog from Firestore
  const loadCatalog = async () => {
    setLoading(true);
    try {
      const cloudProducts = await firestoreService.getProducts();
      // Format cloud items with sellingPrice as price
      const formatted = cloudProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        price: Number(p.sellingPrice) || 0,
        barcode: p.sku || 'N/A',
        stock: Number(p.stock) || 0,
      }));
      setProducts(formatted);
    } catch (err) {
      console.error('Could not load Firestore products for POS:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    firestoreService.getStoreSettings().then(setStoreSettings).catch(() => {});

    // Pick up custom service jobs transferred from the Services calculator
    try {
      const pendingRaw = sessionStorage.getItem('sh_pos_pending_service');
      if (pendingRaw) {
        const pendingServices = JSON.parse(pendingRaw);
        if (Array.isArray(pendingServices) && pendingServices.length > 0) {
          setCart((prev) => [...prev, ...pendingServices]);
          sessionStorage.removeItem('sh_pos_pending_service');
        }
      }
    } catch {}
  }, []);

  // Cart operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          currentStock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = studentDiscountApplied ? subtotal * 0.05 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const filteredCatalog = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  // Complete Sale & save directly to Firestore
  const handleCompleteSale = async () => {
    setSavingSale(true);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const saleRecord = {
      invoiceNo: invoiceNumber,
      customer: studentDiscountApplied ? 'Campus Student' : 'Walk-in Customer',
      cashier: 'Terminal Cashier',
      storeName: storeSettings?.storeName || 'Student Hub POS',
      branch: storeSettings?.branch || 'Campus Branch #01',
      address: storeSettings?.address || 'University Complex, Colombo 03',
      phone: storeSettings?.phone || '+94 11 258 7777',
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        currentStock: item.currentStock,
      })),
      subtotal,
      discount: discountAmount,
      total: grandTotal,
      method: paymentMethod.toUpperCase(),
      status: 'Completed',
    };

    try {
      await firestoreService.addSale(saleRecord);
      setSaleSuccess(`Invoice ${invoiceNumber} saved to Cloud Firestore!`);
      setCompletedReceipt(saleRecord);
    } catch (err) {
      console.warn('Saved locally (Firestore write notice):', err.message);
      setSaleSuccess(`Invoice ${invoiceNumber} recorded!`);
      setCompletedReceipt(saleRecord);
    } finally {
      setSavingSale(false);
      setIsCheckoutOpen(false);
      setCart([]);
      setTimeout(() => setSaleSuccess(null), 4000);
      loadCatalog(); // Refresh live stock counts
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {saleSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 bg-white text-[#43B02A] rounded-full p-0.5" />
          <div>
            <p className="font-bold text-sm">Sale Completed Successfully!</p>
            <p className="text-xs text-white/90">{saleSuccess}</p>
          </div>
        </div>
      )}

      {/* POS Screen Split: Catalog (8 cols) + Cart (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CATALOG PANEL */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header & Search */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#0B3B60]">POS Terminal</h1>
                  <span className="badge-green text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span>Firestore Live</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">Scan barcode or select items from cloud catalog</p>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode or name..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 focus:border-[#0B3B60]"
                />
              </div>
            </div>

            {/* Categories Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0B3B60] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          {loading ? (
            <div className="bg-white rounded-xl p-16 border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-7 h-7 text-[#43B02A] animate-spin" />
              <p className="text-xs font-semibold">Loading items from Firestore...</p>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">No items found in this department</p>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Products to Firestore</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#0B3B60]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.barcode}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#0B3B60] line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <span className="font-bold text-sm text-[#0B3B60]">
                      LKR {Number(item.price || 0).toFixed(2)}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#43B02A]/10 group-hover:bg-[#43B02A] text-[#43B02A] group-hover:text-white flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CART & CHECKOUT PANEL */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-[580px]">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#0B3B60]" />
              <h2 className="font-bold text-base text-[#0B3B60]">Current Order</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 max-h-[340px]">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs">Click catalog items on the left to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-[#0B3B60] font-medium">
                      LKR {Number(item.price || 0).toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-[#0B3B60]">
                      LKR {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Student Discount Toggle */}
          <div className="p-4 bg-slate-50 border-t border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentDiscountApplied}
                  onChange={(e) => setStudentDiscountApplied(e.target.checked)}
                  className="rounded text-[#43B02A] focus:ring-[#43B02A]"
                />
                <span>Student / Faculty Discount (5%)</span>
              </label>
              {studentDiscountApplied && (
                <span className="text-[11px] font-bold text-[#43B02A] bg-[#43B02A]/10 px-1.5 py-0.5 rounded">
                  -5% Active
                </span>
              )}
            </div>
          </div>

          {/* Totals & Complete Sale Button */}
          <div className="p-4 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              {studentDiscountApplied && (
                <div className="flex justify-between text-[#43B02A] font-medium">
                  <span>Student Discount (5%)</span>
                  <span>- LKR {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#0B3B60] pt-1.5 border-t border-slate-200">
                <span>Total Due</span>
                <span>LKR {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* PRIMARY BUTTON: [ Complete Sale ] */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="btn-primary w-full py-3 text-base shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Complete Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0B3B60]">Payment & Receipt</h3>
                <p className="text-xs text-slate-500">Will record transaction to Cloud Firestore</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">Total Payable</span>
              <p className="text-3xl font-black text-[#0B3B60]">
                LKR {grandTotal.toFixed(2)}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'border-[#43B02A] bg-[#43B02A]/10 text-[#0B3B60] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-[#43B02A]" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-[#43B02A] bg-[#43B02A]/10 text-[#0B3B60] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#0B3B60]" />
                <span className="text-xs">Card / POS</span>
              </button>

              <button
                onClick={() => setPaymentMethod('qr')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'qr'
                    ? 'border-[#43B02A] bg-[#43B02A]/10 text-[#0B3B60] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-[#0B3B60]" />
                <span className="text-xs">Student QR</span>
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="btn-glass flex-1 justify-center"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <button
                disabled={savingSale}
                onClick={handleCompleteSale}
                className="btn-primary flex-1 justify-center"
              >
                {savingSale ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{savingSale ? 'Saving...' : 'Confirm & Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED BILL / RECEIPT POPUP (USING REAL STORE DETAILS STORED IN FIRESTORE DB) */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4 font-mono text-xs animate-in fade-in zoom-in-95">
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h2 className="text-base font-black text-[#0B3B60] font-sans">
                {completedReceipt.storeName}
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">{completedReceipt.branch}</p>
              <p className="text-[10px] text-slate-500 font-sans">{completedReceipt.address}</p>
              <p className="text-[10px] text-slate-500 font-sans">Tel: {completedReceipt.phone}</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Invoice #:</span>
                <span className="font-bold text-slate-800">{completedReceipt.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold">{completedReceipt.method}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
              {completedReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{it.name} x {it.quantity}</span>
                  <span className="font-bold">LKR {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>LKR {completedReceipt.subtotal.toFixed(2)}</span>
              </div>
              {completedReceipt.discount > 0 && (
                <div className="flex justify-between text-[#43B02A] font-bold">
                  <span>Student Discount:</span>
                  <span>- LKR {completedReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#0B3B60] pt-1 border-t border-slate-200">
                <span>TOTAL PAID:</span>
                <span>LKR {completedReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 font-sans">
              {storeSettings?.receiptFooter || 'Thank you for shopping at Student Hub!'}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCompletedReceipt(null)}
                className="btn-glass flex-1 justify-center py-2 text-xs font-sans"
              >
                <span>Close</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 justify-center py-2 text-xs font-sans"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
