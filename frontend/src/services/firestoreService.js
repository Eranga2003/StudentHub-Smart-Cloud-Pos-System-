import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Generates an array of individual item SKUs for bulk inventory.
 * Example: baseSku="SKU-1107", count=4 -> ["SKU-1107", "SKU-1108", "SKU-1109", "SKU-1110"]
 * Preserves any existing SKUs in existingSkus and continues numbering without duplicate collision.
 */
export function generateItemSkus(baseSku, count, existingSkus = []) {
  const current = Array.isArray(existingSkus) ? [...existingSkus] : [];
  const targetCount = Math.max(0, Number(count) || 0);

  if (targetCount === 0) {
    return [];
  }

  if (current.length >= targetCount) {
    return current.slice(0, targetCount);
  }

  // Parse baseSku to extract prefix, separator, and start number
  // e.g. "SKU-1107" -> prefix "SKU-", number 1107, length 4
  const match = String(baseSku || 'SKU-1001').match(/^(.*?)(-|\s|_)?(\d+)$/);
  let prefix = 'SKU-';
  let startNum = 1001;
  let padLen = 0;

  if (match) {
    prefix = (match[1] || 'SKU') + (match[2] || '-');
    startNum = parseInt(match[3], 10);
    padLen = match[3].length;
  } else {
    prefix = `${baseSku ? baseSku.trim() : 'SKU'}-`;
    startNum = 1001;
  }

  // Find max existing number in current list to prevent duplicate collisions
  let maxNum = startNum - 1;
  current.forEach((itemSku) => {
    const numMatch = String(itemSku).match(/(\d+)$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });

  let nextNum = maxNum >= startNum ? maxNum + 1 : startNum;
  const needed = targetCount - current.length;

  for (let i = 0; i < needed; i++) {
    const numStr = padLen > 0 ? String(nextNum).padStart(padLen, '0') : String(nextNum);
    current.push(`${prefix}${numStr}`);
    nextNum++;
  }

  return current;
}

/**
 * Pure Firestore Service for User Input Data
 * All data is read from and written directly to Cloud Firestore.
 * Zero mock or demo data.
 */
export const firestoreService = {
  // ==================== PRODUCTS / INVENTORY ====================
  async getProducts() {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      return snapshot.docs.map((d) => {
        const data = d.data();
        const stock = Number(data.stock) || 0;
        const baseSku = data.sku || 'SKU-1001';
        const itemIds = Array.isArray(data.itemIds) && data.itemIds.length === stock
          ? data.itemIds
          : generateItemSkus(baseSku, stock, data.itemIds || []);
        return {
          id: d.id,
          ...data,
          stock,
          itemIds,
        };
      });
    } catch (error) {
      console.error('[Firestore] getProducts error:', error.message);
      throw error;
    }
  },

  async addProduct(product) {
    try {
      const stockNum = Math.max(0, Number(product.stock) || 0);
      const baseSku = product.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`;
      const itemIds = generateItemSkus(baseSku, stockNum);
      const docRef = await addDoc(collection(db, 'products'), {
        name: product.name,
        sku: baseSku,
        category: product.category || 'General',
        costPrice: Number(product.costPrice) || 0,
        sellingPrice: Number(product.sellingPrice) || 0,
        stock: stockNum,
        itemIds: itemIds,
        reorderLevel: Number(product.reorderLevel) || 5,
        status: stockNum > 5 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock',
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...product, sku: baseSku, stock: stockNum, itemIds };
    } catch (error) {
      console.error('[Firestore] addProduct error:', error.message);
      throw error;
    }
  },

  async updateProduct(id, updates) {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { id, ...updates };
    } catch (error) {
      console.error('[Firestore] updateProduct error:', error.message);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, 'products', id));
      return id;
    } catch (error) {
      console.error('[Firestore] deleteProduct error:', error.message);
      throw error;
    }
  },

  async adjustStock(productId, newStock, reason = 'Manual Adjustment') {
    try {
      const productRef = doc(db, 'products', productId);
      const snap = await getDoc(productRef);
      const stockNum = Math.max(0, Number(newStock) || 0);
      let newItemIds = [];
      if (snap.exists()) {
        const data = snap.data();
        newItemIds = generateItemSkus(data.sku || 'SKU-1001', stockNum, data.itemIds || []);
      }
      await updateDoc(productRef, {
        stock: stockNum,
        itemIds: newItemIds,
        status: stockNum > 5 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock',
        lastAdjustReason: reason,
        updatedAt: serverTimestamp(),
      });
      return { id: productId, stock: stockNum, itemIds: newItemIds };
    } catch (error) {
      console.error('[Firestore] adjustStock error:', error.message);
      throw error;
    }
  },

  // ==================== SALES ====================
  async getSales() {
    try {
      const snapshot = await getDocs(collection(db, 'sales'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getSales error:', error.message);
      throw error;
    }
  },

  async addSale(saleData) {
    try {
      // Process and randomly select/remove stock items for purchased products
      const processedItems = [];
      if (Array.isArray(saleData.items)) {
        for (const item of saleData.items) {
          const itemCopy = { ...item };
          if (itemCopy.id && !itemCopy.id.startsWith('srv-')) {
            try {
              const productRef = doc(db, 'products', itemCopy.id);
              const snap = await getDoc(productRef);
              if (snap.exists()) {
                const prodData = snap.data();
                const currentStock = Number(prodData.stock) || itemCopy.currentStock || 0;
                let availableSkus = Array.isArray(prodData.itemIds) && prodData.itemIds.length > 0
                  ? [...prodData.itemIds]
                  : generateItemSkus(prodData.sku || itemCopy.barcode || 'SKU-1001', currentStock);

                // Use pre-selected soldSkus if provided, or pick randomly now
                let soldSkus = Array.isArray(itemCopy.soldSkus) && itemCopy.soldSkus.length > 0
                  ? [...itemCopy.soldSkus]
                  : [];

                if (soldSkus.length === 0) {
                  const qtyToDeduct = Math.min(Number(itemCopy.quantity) || 1, availableSkus.length);
                  for (let q = 0; q < qtyToDeduct; q++) {
                    const randomIndex = Math.floor(Math.random() * availableSkus.length);
                    const [pickedSku] = availableSkus.splice(randomIndex, 1);
                    soldSkus.push(pickedSku);
                  }
                } else {
                  // Deduct the pre-selected soldSkus from availableSkus
                  soldSkus.forEach((sku) => {
                    const idx = availableSkus.indexOf(sku);
                    if (idx !== -1) availableSkus.splice(idx, 1);
                  });
                }

                itemCopy.soldSkus = soldSkus;
                const newStock = availableSkus.length;

                await updateDoc(productRef, {
                  stock: newStock,
                  itemIds: availableSkus,
                  status: newStock > 5 ? 'In Stock' : newStock > 0 ? 'Low Stock' : 'Out of Stock',
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (err) {
              console.warn('[Firestore] Stock deduction note for product ' + itemCopy.id + ':', err.message);
            }
          }
          processedItems.push(itemCopy);
        }
      }

      // Sanitize data to avoid any undefined field errors in Firestore
      const sanitizedData = JSON.parse(JSON.stringify({
        ...saleData,
        items: processedItems,
      }));

      const docRef = await addDoc(collection(db, 'sales'), {
        ...sanitizedData,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      return { id: docRef.id, ...sanitizedData };
    } catch (error) {
      console.error('[Firestore] addSale error:', error.message);
      throw error;
    }
  },

  // ==================== CUSTOMERS ====================
  async getCustomers() {
    try {
      const snapshot = await getDocs(collection(db, 'customers'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getCustomers error:', error.message);
      throw error;
    }
  },

  async addCustomer(customer) {
    try {
      const docRef = await addDoc(collection(db, 'customers'), {
        name: customer.name,
        studentId: customer.studentId,
        faculty: customer.faculty || '',
        phone: customer.phone || '',
        loyaltyPoints: Number(customer.loyaltyPoints) || 0,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...customer };
    } catch (error) {
      console.error('[Firestore] addCustomer error:', error.message);
      throw error;
    }
  },

  // ==================== EXPENSES ====================
  async getExpenses() {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getExpenses error:', error.message);
      throw error;
    }
  },

  async addExpense(expense) {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        title: expense.title,
        category: expense.category || 'General',
        amount: Number(expense.amount) || 0,
        paidBy: expense.paidBy || 'Cash',
        date: expense.date || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...expense };
    } catch (error) {
      console.error('[Firestore] addExpense error:', error.message);
      throw error;
    }
  },

  // ==================== PURCHASES ====================
  async getPurchases() {
    try {
      const snapshot = await getDocs(collection(db, 'purchases'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getPurchases error:', error.message);
      throw error;
    }
  },

  async addPurchase(purchase) {
    try {
      const docRef = await addDoc(collection(db, 'purchases'), {
        ...purchase,
        amount: Number(purchase.amount) || 0,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      });
      return { id: docRef.id, ...purchase };
    } catch (error) {
      console.error('[Firestore] addPurchase error:', error.message);
      throw error;
    }
  },

  // ==================== SUPPLIERS ====================
  async getSuppliers() {
    try {
      const snapshot = await getDocs(collection(db, 'suppliers'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getSuppliers error:', error.message);
      throw error;
    }
  },

  async addSupplier(supplier) {
    try {
      const docRef = await addDoc(collection(db, 'suppliers'), {
        ...supplier,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...supplier };
    } catch (error) {
      console.error('[Firestore] addSupplier error:', error.message);
      throw error;
    }
  },

  // ==================== EMPLOYEES ====================
  async getEmployees() {
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getEmployees error:', error.message);
      throw error;
    }
  },

  async addEmployee(employee) {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employee,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...employee };
    } catch (error) {
      console.error('[Firestore] addEmployee error:', error.message);
      throw error;
    }
  },

  // ==================== STORE SETTINGS & BILLING DETAILS ====================
  async getStoreSettings() {
    try {
      const docRef = doc(db, 'settings', 'store_details');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {
        storeName: 'Student Hub POS',
        branch: 'Campus Branch #01',
        address: 'University Complex, Colombo 03',
        phone: '+94 11 258 7777',
        currency: 'LKR',
        printerWidth: '80mm',
        studentDiscountRate: '5',
        receiptHeader: 'Official Student Hub Store Receipt',
        receiptFooter: 'Thank you for shopping at Student Hub! Please visit again.',
      };
    } catch (error) {
      console.error('[Firestore] getStoreSettings error:', error.message);
      return {
        storeName: 'Student Hub POS',
        branch: 'Campus Branch #01',
        address: 'University Complex, Colombo 03',
        phone: '+94 11 258 7777',
        currency: 'LKR',
        printerWidth: '80mm',
        studentDiscountRate: '5',
        receiptHeader: 'Official Student Hub Store Receipt',
        receiptFooter: 'Thank you for shopping at Student Hub! Please visit again.',
      };
    }
  },

  async saveStoreSettings(settings) {
    try {
      const docRef = doc(db, 'settings', 'store_details');
      await setDoc(
        docRef,
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return settings;
    } catch (error) {
      console.error('[Firestore] saveStoreSettings error:', error.message);
      throw error;
    }
  },
};

export default firestoreService;
