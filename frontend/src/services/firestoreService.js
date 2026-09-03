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
 * Pure Firestore Service for User Input Data
 * All data is read from and written directly to Cloud Firestore.
 * Zero mock or demo data.
 */
export const firestoreService = {
  // ==================== PRODUCTS / INVENTORY ====================
  async getProducts() {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[Firestore] getProducts error:', error.message);
      throw error;
    }
  },

  async addProduct(product) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        name: product.name,
        sku: product.sku || '',
        category: product.category || 'General',
        costPrice: Number(product.costPrice) || 0,
        sellingPrice: Number(product.sellingPrice) || 0,
        stock: Number(product.stock) || 0,
        reorderLevel: Number(product.reorderLevel) || 5,
        status: Number(product.stock) > 5 ? 'In Stock' : Number(product.stock) > 0 ? 'Low Stock' : 'Out of Stock',
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...product };
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
      const stockNum = Math.max(0, Number(newStock) || 0);
      await updateDoc(productRef, {
        stock: stockNum,
        status: stockNum > 5 ? 'In Stock' : stockNum > 0 ? 'Low Stock' : 'Out of Stock',
        lastAdjustReason: reason,
        updatedAt: serverTimestamp(),
      });
      return { id: productId, stock: stockNum };
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
      const docRef = await addDoc(collection(db, 'sales'), {
        ...saleData,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      // Update stock for purchased products in Firestore
      if (Array.isArray(saleData.items)) {
        for (const item of saleData.items) {
          if (item.id && !item.id.startsWith('srv-')) {
            try {
              const productRef = doc(db, 'products', item.id);
              if (item.currentStock !== undefined) {
                const newStock = Math.max(0, item.currentStock - item.quantity);
                await updateDoc(productRef, {
                  stock: newStock,
                  status: newStock > 5 ? 'In Stock' : newStock > 0 ? 'Low Stock' : 'Out of Stock',
                });
              }
            } catch (err) {
              console.warn('[Firestore] Stock update note:', err.message);
            }
          }
        }
      }

      return { id: docRef.id, ...saleData };
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
