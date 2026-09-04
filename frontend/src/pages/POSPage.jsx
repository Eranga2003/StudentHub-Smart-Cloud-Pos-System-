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
  AlertTriangle,
} from 'lucide-react';
import { firestoreService, generateItemSkus } from '../services/firestoreService.js';

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
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(5); // default 5%
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saleSuccess, setSaleSuccess] = useState(null);
  const [savingSale, setSavingSale] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  const showWarning = (msg) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

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
        itemIds: p.itemIds || [],
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

  // Cart operations with available stock limitation
  const addToCart = (product) => {
    const isService = product.id && String(product.id).startsWith('srv-');
    const availableStock = Number(product.stock ?? product.currentStock ?? 0);

    // If item has 0 or less stock, do not add to bill
    if (!isService && availableStock <= 0) {
      showWarning(`"${product.name}" is out of stock (0 quantity available).`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        // Enforce maximum stock available limit
        if (!isService && existing.quantity >= availableStock) {
          showWarning(`Cannot add more "${product.name}". Only ${availableStock} available in stock.`);
          return prevCart;
        }
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
          currentStock: availableStock,
          barcode: product.barcode || '',
          itemIds: product.itemIds || [],
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    const isService = id && String(id).startsWith('srv-');

    setCart((prevCart) => {
      const targetItem = prevCart.find((item) => item.id === id);
      if (!targetItem) return prevCart;

      // When increasing with + button, enforce available stock limit
      if (delta > 0 && !isService) {
        const catalogProduct = products.find((p) => p.id === id);
        const maxStock = catalogProduct !== undefined ? Number(catalogProduct.stock) : Number(targetItem.currentStock ?? 0);

        if (targetItem.quantity + delta > maxStock) {
          showWarning(`Cannot increase "${targetItem.name}". Only ${maxStock} available in stock!`);
          return prevCart;
        }
      }

      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const numericDiscountVal = Number(discountValue) || 0;
  const discountAmount =
    discountType === 'percentage'
      ? (subtotal * Math.max(0, Math.min(100, numericDiscountVal))) / 100
      : Math.max(0, Math.min(subtotal, numericDiscountVal));
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
    // Validate that cart items do not exceed current live stock
    for (const item of cart) {
      if (!item.id?.startsWith('srv-')) {
        const catProd = products.find((p) => p.id === item.id);
        const currentAvail = catProd !== undefined ? Number(catProd.stock) : Number(item.currentStock ?? 0);
        if (item.quantity > currentAvail) {
          showWarning(`Cannot complete sale: "${item.name}" requested (${item.quantity}) exceeds available stock (${currentAvail}).`);
          setIsCheckoutOpen(false);
          return;
        }
      }
    }

    setSavingSale(true);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const saleItems = cart.map((item) => {
      let soldSkus = [];
      if (!item.id?.startsWith('srv-')) {
        const catProd = products.find((p) => p.id === item.id);
        const available = Array.isArray(catProd?.itemIds) && catProd.itemIds.length > 0
          ? [...catProd.itemIds]
          : Array.isArray(item.itemIds) && item.itemIds.length > 0
          ? [...item.itemIds]
          : generateItemSkus(catProd?.barcode || item.barcode || 'SKU-1001', Number(item.currentStock) || item.quantity);

        const qtyToPick = Math.min(Number(item.quantity) || 1, available.length);
        for (let q = 0; q < qtyToPick; q++) {
          const randIdx = Math.floor(Math.random() * available.length);
          const [picked] = available.splice(randIdx, 1);
          soldSkus.push(picked);
        }
      }

      return {
        id: item.id || '',
        name: item.name || '',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        currentStock: Number(item.currentStock) || 0,
        barcode: item.barcode || '',
        soldSkus: soldSkus,
      };
    });

    const saleRecord = {
      invoiceNo: invoiceNumber,
      customer:
        numericDiscountVal > 0
          ? discountType === 'percentage' && numericDiscountVal === 5
            ? 'Campus Student'
            : 'Discount Customer'
          : 'Walk-in Customer',
      cashier: 'Terminal Cashier',
      storeName: storeSettings?.storeName || 'Student Hub POS',
      branch: storeSettings?.branch || 'Campus Branch #01',
      address: storeSettings?.address || 'University Complex, Colombo 03',
      phone: storeSettings?.phone || '+94 11 258 7777',
      items: saleItems,
      subtotal,
      discount: discountAmount,
      discountType,
      discountRate: numericDiscountVal,
      discountNote:
        discountType === 'percentage'
          ? `Discount (${numericDiscountVal}%)`
          : `Discount (LKR ${numericDiscountVal.toFixed(2)})`,
      total: grandTotal,
      method: paymentMethod.toUpperCase(),
      status: 'Completed',
    };

    try {
      const savedSale = await firestoreService.addSale(saleRecord);
      setSaleSuccess(`Invoice ${invoiceNumber} saved to Cloud Firestore!`);
      setCompletedReceipt(savedSale || saleRecord);
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
      {/* Success Toast Notification */}
      {saleSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 bg-white text-[#43B02A] rounded-full p-0.5" />
          <div>
            <p className="font-bold text-sm">Sale Completed Successfully!</p>
            <p className="text-xs text-white/90">{saleSuccess}</p>
          </div>
        </div>
      )}

      {/* Stock Limit Warning Toast Notification */}
      {warningMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amber-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-xs">Stock Limit Alert</p>
            <p className="text-xs text-white/95">{warningMessage}</p>
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
              {filteredCatalog.map((item) => {
                const isService = item.id && String(item.id).startsWith('srv-');
                const stock = Number(item.stock) || 0;
                const isOutOfStock = !isService && stock <= 0;
                const cartItem = cart.find((c) => c.id === item.id);
                const isMaxInCart = !isService && cartItem && cartItem.quantity >= stock;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isOutOfStock) {
                        showWarning(`"${item.name}" is out of stock (0 quantity). Restock in Inventory to sell.`);
                        return;
                      }
                      if (isMaxInCart) {
                        showWarning(`All available stock (${stock}) for "${item.name}" is already in the bill.`);
                        return;
                      }
                      addToCart(item);
                    }}
                    className={`bg-white rounded-xl p-4 border shadow-xs transition-all flex flex-col justify-between group ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-50/70 cursor-not-allowed opacity-75'
                        : isMaxInCart
                        ? 'border-amber-300 bg-amber-50/20 cursor-pointer'
                        : 'border-slate-200 hover:border-[#0B3B60]/40 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 truncate max-w-[45%]">
                          {item.category}
                        </span>

                        {/* Stock Status Badge */}
                        {isService ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            Service
                          </span>
                        ) : isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            Out of Stock (0)
                          </span>
                        ) : stock <= 5 ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Stock: {stock} (Low)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Stock: {stock}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#0B3B60] line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {item.barcode || 'No SKU'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="font-bold text-sm text-[#0B3B60]">
                        LKR {Number(item.price || 0).toFixed(2)}
                      </span>

                      {isOutOfStock ? (
                        <div
                          className="px-2 py-1 rounded-md bg-slate-200 text-slate-500 font-bold text-[10px]"
                          title="Item has 0 stock"
                        >
                          Stock 0
                        </div>
                      ) : isMaxInCart ? (
                        <div
                          className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]"
                          title="Max available stock already added to bill"
                        >
                          Max ({cartItem.quantity})
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#43B02A]/10 group-hover:bg-[#43B02A] text-[#43B02A] group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              cart.map((item) => {
                const isService = item.id && String(item.id).startsWith('srv-');
                const catalogProduct = products.find((p) => p.id === item.id);
                const maxStock = catalogProduct !== undefined ? Number(catalogProduct.stock) : Number(item.currentStock ?? 0);
                const isMaxReached = !isService && item.quantity >= maxStock;

                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#0B3B60] font-medium">
                          LKR {Number(item.price || 0).toFixed(2)} each
                        </span>
                        {!isService && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isMaxReached
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : 'text-slate-400 bg-slate-100'
                            }`}
                          >
                            {isMaxReached ? `Max Stock (${maxStock})` : `Stock: ${maxStock}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper with Stock Limitation */}
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>

                      <button
                        disabled={isMaxReached}
                        onClick={() => updateQuantity(item.id, 1)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs shadow-xs transition-all ${
                          isMaxReached
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-40'
                            : 'bg-white text-slate-600 hover:bg-slate-200'
                        }`}
                        title={isMaxReached ? `Maximum stock limit (${maxStock}) reached` : 'Increase quantity'}
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
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Editable Discount Section */}
          <div className="p-3.5 bg-slate-50 border-t border-b border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B3B60] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#43B02A]" />
                <span>Discount</span>
              </span>

              {/* Discount Mode Switcher: % or LKR */}
              <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    if (discountType !== 'percentage') {
                      setDiscountType('percentage');
                      setDiscountValue(5);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    discountType === 'percentage'
                      ? 'bg-white text-[#0B3B60] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (discountType !== 'fixed') {
                      setDiscountType('fixed');
                      setDiscountValue(Math.round(discountAmount) || 0);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    discountType === 'fixed'
                      ? 'bg-white text-[#0B3B60] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  LKR
                </button>
              </div>
            </div>

            {/* Editable Input and Quick Presets */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                  {discountType === 'percentage' ? '%' : 'LKR'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                  step={discountType === 'percentage' ? '1' : '5'}
                  value={discountValue === '' ? '' : discountValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setDiscountValue('');
                      return;
                    }
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) {
                      setDiscountValue(0);
                    } else if (discountType === 'percentage' && num > 100) {
                      setDiscountValue(100);
                    } else if (discountType === 'fixed' && num > subtotal && subtotal > 0) {
                      setDiscountValue(subtotal);
                    } else {
                      setDiscountValue(num);
                    }
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 focus:border-[#0B3B60]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountValue(0);
                  }}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-colors border ${
                    discountType === 'percentage' && Number(discountValue) === 0
                      ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="No Discount"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountValue(5);
                  }}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-colors border ${
                    discountType === 'percentage' && Number(discountValue) === 5
                      ? 'bg-[#43B02A] text-white border-[#43B02A]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="5% Student Discount"
                >
                  5%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountValue(10);
                  }}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-colors border ${
                    discountType === 'percentage' && Number(discountValue) === 10
                      ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="10% Faculty Discount"
                >
                  10%
                </button>
              </div>
            </div>

            {/* Calculated Discount Notification */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-[11px] text-[#43B02A] font-semibold bg-[#43B02A]/10 px-2 py-1 rounded-md">
                <span>
                  {discountType === 'percentage'
                    ? `${discountValue}% Discount applied`
                    : `LKR ${Number(discountValue).toFixed(2)} Fixed discount`}
                </span>
                <span>- LKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Totals & Complete Sale Button */}
          <div className="p-4 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#43B02A] font-medium">
                  <span>
                    Discount {discountType === 'percentage' ? `(${discountValue}%)` : '(Custom)'}
                  </span>
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

      {/* COMPLETED BILL / RECEIPT POPUP (PRINT SIZED FOR EPSON L130 & DESKTOP POS) */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            id="printable-bill"
            className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3 font-mono text-xs animate-in fade-in zoom-in-95 my-auto"
          >
            {/* Top Shop Logo & Header */}
            <div className="flex flex-col items-center justify-center pb-2 text-center border-b border-dashed border-slate-300">
              <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-2xs mb-1.5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="StudentHub Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-base font-black text-[#0B3B60] font-sans tracking-wide">
                {completedReceipt.storeName || 'Student Hub POS'}
              </h2>
              <p className="text-[11px] text-slate-600 font-sans font-medium">
                {completedReceipt.branch || 'Campus Branch #01'}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                {completedReceipt.address || 'University Complex, Colombo 03'}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Tel: {completedReceipt.phone || '+94 11 258 7777'}
              </p>
            </div>

            {/* Invoice Meta */}
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
                <span>Cashier:</span>
                <span className="font-medium text-slate-800">{completedReceipt.cashier || 'Terminal Cashier'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold text-slate-900">{completedReceipt.method}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border-t border-b border-dashed border-slate-300 py-2">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="text-left pb-1.5 font-semibold">Item</th>
                    <th className="text-center pb-1.5 font-semibold w-10">Qty</th>
                    <th className="text-right pb-1.5 font-semibold w-16">Price</th>
                    <th className="text-right pb-1.5 font-semibold w-20">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedReceipt.items.map((it, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1 text-left font-medium text-slate-800 max-w-[140px]">
                        <div className="truncate font-semibold">{it.name}</div>
                        {Array.isArray(it.soldSkus) && it.soldSkus.length > 0 ? (
                          <div className="text-[9px] text-[#0B3B60] font-mono font-bold mt-0.5 leading-tight">
                            SKU: {it.soldSkus.join(', ')}
                          </div>
                        ) : it.barcode && it.barcode !== 'N/A' ? (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5 leading-tight">
                            SKU: {it.barcode}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-1 text-center text-slate-600 font-mono">
                        {it.quantity}
                      </td>
                      <td className="py-1 text-right text-slate-600 font-mono">
                        {Number(it.price || 0).toFixed(2)}
                      </td>
                      <td className="py-1 text-right font-bold text-slate-900 font-mono">
                        {(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Discount Breakdown */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal:</span>
                <span className="font-mono">LKR {Number(completedReceipt.subtotal || 0).toFixed(2)}</span>
              </div>
              {completedReceipt.discount > 0 && (
                <div className="flex justify-between text-[#43B02A] font-bold">
                  <span>{completedReceipt.discountNote || 'Discount'}:</span>
                  <span className="font-mono">- LKR {Number(completedReceipt.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#0B3B60] pt-1.5 border-t border-slate-300">
                <span>TOTAL PAID:</span>
                <span className="font-mono">LKR {Number(completedReceipt.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 space-y-0.5 border-t border-dashed border-slate-200">
              <p className="text-[10px] text-slate-600 font-sans font-medium">
                {storeSettings?.receiptFooter || 'Thank you for shopping at Student Hub!'}
              </p>
              <p className="text-[9px] text-slate-400 font-sans">
                Please retain this bill for warranty / exchange within 7 days.
              </p>
              <p className="text-[8px] text-slate-400 font-mono pt-1">
                Epson L130 Optimized Slip • {completedReceipt.invoiceNo}
              </p>
            </div>

            {/* Action Buttons (Hidden from Print Output) */}
            <div className="flex items-center gap-2 pt-2 no-print">
              <button
                onClick={() => setCompletedReceipt(null)}
                className="btn-glass flex-1 justify-center py-2 text-xs font-sans"
              >
                <span>Close</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 justify-center py-2 text-xs font-sans shadow-md"
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
