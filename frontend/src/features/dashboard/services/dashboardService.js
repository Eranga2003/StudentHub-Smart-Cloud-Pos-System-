/**
 * Dashboard Service
 *
 * Provides mock data for the StudentHub POS Dashboard.
 * Architecture Note:
 * Each function returns a Promise simulating an API latency.
 * When the Express backend endpoints are ready, simply replace the mock responses
 * with axios/fetch calls to:
 *   - GET /api/v1/dashboard/summary
 *   - GET /api/v1/dashboard/sales-trend
 *   - GET /api/v1/dashboard/category-sales
 *   - GET /api/v1/dashboard/top-products
 *   - GET /api/v1/dashboard/payment-methods
 *   - GET /api/v1/dashboard/low-stock
 *   - GET /api/v1/dashboard/recent-sales
 *   - GET /api/v1/dashboard/activity
 */

export const dashboardService = {
  /**
   * 1. TOP SUMMARY CARDS (6 KPIs)
   * GET /api/v1/dashboard/summary
   */
  async getDashboardSummary() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          todaySales: {
            title: "Today's Sales",
            value: 48250.0,
            formatted: 'LKR 48,250.00',
            change: '+14.2%',
            comparison: 'vs yesterday',
            isPositive: true,
            type: 'currency',
          },
          todayProfit: {
            title: "Today's Profit",
            value: 16840.0,
            formatted: 'LKR 16,840.00',
            change: '+8.6%',
            comparison: 'vs yesterday',
            isPositive: true,
            type: 'currency',
          },
          todayTransactions: {
            title: "Today's Transactions",
            value: 142,
            formatted: '142 Orders',
            change: '+18 orders',
            comparison: 'vs yesterday',
            isPositive: true,
            type: 'count',
          },
          totalProducts: {
            title: 'Total Products',
            value: 386,
            formatted: '386 SKUs',
            change: '+4 new',
            comparison: 'catalog items',
            isPositive: true,
            type: 'count',
          },
          lowStockItems: {
            title: 'Low Stock Items',
            value: 7,
            formatted: '7 Items',
            change: '3 critical',
            comparison: 'requires restock',
            isPositive: false,
            type: 'alert',
          },
          totalCustomers: {
            title: 'Total Customers',
            value: 1248,
            formatted: '1,248 Students',
            change: '+24 new',
            comparison: 'this month',
            isPositive: true,
            type: 'count',
          },
        });
      }, 150);
    });
  },

  /**
   * 2. SALES TREND (Last 7 Days)
   * GET /api/v1/dashboard/sales-trend
   */
  async getSalesTrend() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { day: 'Monday', short: 'Mon', sales: 34500, orders: 98, profit: 12100 },
          { day: 'Tuesday', short: 'Tue', sales: 42100, orders: 115, profit: 14800 },
          { day: 'Wednesday', short: 'Wed', sales: 38900, orders: 104, profit: 13600 },
          { day: 'Thursday', short: 'Thu', sales: 46700, orders: 128, profit: 16400 },
          { day: 'Friday', short: 'Fri', sales: 58200, orders: 165, profit: 20500 },
          { day: 'Saturday', short: 'Sat', sales: 52400, orders: 148, profit: 18300 },
          { day: 'Sunday', short: 'Sun', sales: 48250, orders: 142, profit: 16840 },
        ]);
      }, 150);
    });
  },

  /**
   * 3. SALES BY CATEGORY
   * GET /api/v1/dashboard/category-sales
   */
  async getCategorySales() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { category: 'Books', sales: 124500, share: 32, itemsSold: 285, color: '#0B3B60' },
          { category: 'Stationery', sales: 98200, share: 25, itemsSold: 540, color: '#43B02A' },
          { category: 'Snacks & Chocolates', sales: 62400, share: 16, itemsSold: 310, color: '#F59E0B' },
          { category: 'Drinks', sales: 44300, share: 11, itemsSold: 220, color: '#3B82F6' },
          { category: 'Ice Cream', sales: 31800, share: 8, itemsSold: 180, color: '#EC4899' },
          { category: 'USB & Mobile Accessories', sales: 28800, share: 8, itemsSold: 45, color: '#8B5CF6' },
        ]);
      }, 150);
    });
  },

  /**
   * 4. TOP SELLING PRODUCTS
   * GET /api/v1/dashboard/top-products
   */
  async getTopProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Exercise Book (120 Pages Ruled)', category: 'Books', quantity: 185, revenue: 38850, stock: 64 },
          { id: 2, name: 'Blue Gel Pen (0.5mm Point)', category: 'Stationery', quantity: 142, revenue: 7100, stock: 120 },
          { id: 3, name: 'A4 Copier Paper 80GSM Ream', category: 'Stationery', quantity: 98, revenue: 147000, stock: 18 },
          { id: 4, name: 'Popular Novel (Student Edition)', category: 'Books', quantity: 64, revenue: 38400, stock: 22 },
          { id: 5, name: 'High-Speed USB Cable (Type-C)', category: 'USB & Mobile Accessories', quantity: 52, revenue: 41600, stock: 14 },
        ]);
      }, 150);
    });
  },

  /**
   * 5. PAYMENT METHODS
   * GET /api/v1/dashboard/payment-methods
   */
  async getPaymentMethods() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { method: 'Cash', percentage: 58, amount: 27985, count: 88, color: '#43B02A' },
          { method: 'Card', percentage: 32, amount: 15440, count: 42, color: '#0B3B60' },
          { method: 'Bank Transfer', percentage: 10, amount: 4825, count: 12, color: '#F59E0B' },
        ]);
      }, 150);
    });
  },

  /**
   * 6. LOW STOCK SECTION
   * GET /api/v1/dashboard/low-stock
   */
  async getLowStockItems() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Scientific Calculator fx-991EX', sku: 'EL-CAS-991', category: 'Stationery', currentStock: 2, minStock: 10, status: 'Critical', unitCost: 5900 },
          { id: '2', name: 'Elephant House Wonder Bar', sku: 'IC-WON-01', category: 'Ice Cream', currentStock: 1, minStock: 15, status: 'Critical', unitCost: 110 },
          { id: '3', name: 'CR Book 200 Pages Ruled', sku: 'BK-CR-200', category: 'Books', currentStock: 4, minStock: 20, status: 'Low', unitCost: 320 },
          { id: '4', name: 'SanDisk 64GB USB 3.0 Flash', sku: 'AC-USB-64G', category: 'USB & Mobile Accessories', currentStock: 3, minStock: 12, status: 'Low', unitCost: 1850 },
          { id: '5', name: 'Graph Book 80 Pages A4', sku: 'BK-GRP-80', category: 'Books', currentStock: 5, minStock: 25, status: 'Low', unitCost: 150 },
        ]);
      }, 150);
    });
  },

  /**
   * 7. RECENT SALES
   * GET /api/v1/dashboard/recent-sales
   */
  async getRecentSales() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            invoiceNo: 'INV-2026-092',
            customer: 'Kasun Bandara (ST-1044)',
            items: 'CR Book 120p (x2), Gel Pen Box',
            method: 'Cash',
            total: 1240.0,
            date: 'Today 14:28',
            status: 'Completed',
          },
          {
            id: '2',
            invoiceNo: 'INV-2026-091',
            customer: 'Nimali Senanayake',
            items: 'Scientific Calculator fx-991EX',
            method: 'Card',
            total: 6900.0,
            date: 'Today 13:50',
            status: 'Completed',
          },
          {
            id: '3',
            invoiceNo: 'INV-2026-090',
            customer: 'Walk-in Student',
            items: 'A4 Color Printing (35 pgs)',
            method: 'Cash',
            total: 875.0,
            date: 'Today 12:45',
            status: 'Completed',
          },
          {
            id: '4',
            invoiceNo: 'INV-2026-089',
            customer: 'Amara Weerasinghe',
            items: 'Thesis Hardcover Binding (x2)',
            method: 'Bank Transfer',
            total: 1300.0,
            date: 'Today 11:15',
            status: 'Pending',
          },
          {
            id: '5',
            invoiceNo: 'INV-2026-088',
            customer: 'Faculty Bio Dept',
            items: 'Damaged USB Cable Return',
            method: 'Card',
            total: 850.0,
            date: 'Today 09:30',
            status: 'Refunded',
          },
        ]);
      }, 150);
    });
  },

  /**
   * 8. RECENT ACTIVITY
   * GET /api/v1/dashboard/activity
   */
  async getRecentActivity() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'a1',
            type: 'sale',
            title: 'New sale completed',
            description: 'Invoice #INV-2026-092 for LKR 1,240.00 (Cash)',
            time: '5 mins ago',
            color: 'text-[#43B02A]',
            bg: 'bg-[#43B02A]/10',
          },
          {
            id: 'a2',
            type: 'product',
            title: 'Product added',
            description: 'Atlas Chooty Gel Pen (0.5mm) added to catalog',
            time: '24 mins ago',
            color: 'text-[#0B3B60]',
            bg: 'bg-[#0B3B60]/10',
          },
          {
            id: 'a3',
            type: 'stock',
            title: 'Stock received',
            description: '50 units of A4 Copier Paper 80GSM restocked',
            time: '1 hour ago',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            id: 'a4',
            type: 'customer',
            title: 'Customer added',
            description: 'Sandun Jayasuriya (ID: ST-2088) registered for discounts',
            time: '2 hours ago',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            id: 'a5',
            type: 'refund',
            title: 'Refund processed',
            description: 'LKR 850.00 refunded for defective USB cable (#INV-2026-088)',
            time: '4 hours ago',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ]);
      }, 150);
    });
  },
};

export default dashboardService;
