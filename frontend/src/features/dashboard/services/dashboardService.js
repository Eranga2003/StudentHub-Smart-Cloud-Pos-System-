/**
 * Dashboard Service (Cloud Firestore DB Live Integration)
 *
 * Fetches real user-input records directly from Cloud Firestore:
 * - products
 * - sales
 * - customers
 * - expenses
 * Computes live KPIs, 7-day sales trends, category splits, velocity, tender methods,
 * low stock alerts, recent transactions, and activity telemetry directly from DB.
 */

import { firestoreService } from '../../../services/firestoreService.js';

export const dashboardService = {
  /**
   * Helper: Load all required collections in parallel from Firestore
   */
  async _getLiveStoreData() {
    try {
      const [products, sales, customers, expenses] = await Promise.all([
        firestoreService.getProducts().catch(() => []),
        firestoreService.getSales().catch(() => []),
        firestoreService.getCustomers().catch(() => []),
        firestoreService.getExpenses().catch(() => []),
      ]);
      return { products, sales, customers, expenses };
    } catch (err) {
      console.error('[DashboardService] Firestore DB fetch error:', err);
      return { products: [], sales: [], customers: [], expenses: [] };
    }
  },

  /**
   * 1. TOP SUMMARY CARDS (6 KPIs from Real Firestore DB)
   */
  async getDashboardSummary() {
    const { products, sales, customers, expenses } = await this._getLiveStoreData();

    // Today's Date String (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter today's sales
    const todaySalesList = sales.filter((s) => {
      if (!s.date) return true; // Include recent if date not specified
      return s.date.startsWith(todayStr);
    });

    const todaySalesTotal = todaySalesList.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const allSalesTotal = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const displaySales = todaySalesTotal > 0 ? todaySalesTotal : allSalesTotal;

    // Calculate profit: Total Revenue minus Total Expenses (or standard margin)
    const expensesTotal = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const profit = Math.max(0, displaySales - expensesTotal);

    // Low stock items (stock <= 5 units)
    const lowStockList = products.filter((p) => Number(p.stock || 0) <= 5);
    const criticalStockCount = products.filter((p) => Number(p.stock || 0) <= 2).length;

    return {
      todaySales: {
        title: "Today's Sales",
        value: displaySales,
        formatted: `LKR ${displaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: sales.length > 0 ? `${sales.length} orders` : '0 orders',
        comparison: 'recorded',
        isPositive: true,
        type: 'currency',
      },
      todayProfit: {
        title: "Today's Profit",
        value: profit,
        formatted: `LKR ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: expenses.length > 0 ? `${expenses.length} exp.` : 'Net margin',
        comparison: 'operational',
        isPositive: true,
        type: 'currency',
      },
      todayTransactions: {
        title: "Today's Orders",
        value: todaySalesList.length || sales.length,
        formatted: `${todaySalesList.length || sales.length} Orders`,
        change: `${todaySalesList.length || sales.length} receipts`,
        comparison: 'recorded',
        isPositive: true,
        type: 'count',
      },
      totalProducts: {
        title: 'Total Products',
        value: products.length,
        formatted: `${products.length} SKUs`,
        change: `${products.length} items`,
        comparison: 'in catalog',
        isPositive: true,
        type: 'count',
      },
      lowStockItems: {
        title: 'Low Stock',
        value: lowStockList.length,
        formatted: `${lowStockList.length} Items`,
        change: `${criticalStockCount} critical`,
        comparison: 'stock ≤ 5',
        isPositive: lowStockList.length === 0,
        type: 'alert',
      },
      totalCustomers: {
        title: 'Customers',
        value: customers.length,
        formatted: `${customers.length} Students`,
        change: `${customers.length} profiles`,
        comparison: 'registered',
        isPositive: true,
        type: 'count',
      },
    };
  },

  /**
   * 2. SALES TREND (Last 7 Days from Real Firestore DB)
   */
  async getSalesTrend() {
    const { sales } = await this._getLiveStoreData();

    const daysMap = [
      { day: 'Monday', short: 'Mon', sales: 0, orders: 0 },
      { day: 'Tuesday', short: 'Tue', sales: 0, orders: 0 },
      { day: 'Wednesday', short: 'Wed', sales: 0, orders: 0 },
      { day: 'Thursday', short: 'Thu', sales: 0, orders: 0 },
      { day: 'Friday', short: 'Fri', sales: 0, orders: 0 },
      { day: 'Saturday', short: 'Sat', sales: 0, orders: 0 },
      { day: 'Sunday', short: 'Sun', sales: 0, orders: 0 },
    ];

    // Map sales dates to day of week
    sales.forEach((s) => {
      let saleDate = new Date();
      if (s.date) {
        const parsed = new Date(s.date);
        if (!isNaN(parsed.getTime())) saleDate = parsed;
      }
      // getDay: 0 is Sunday, 1 is Monday... 6 is Saturday
      const dayIndex = saleDate.getDay();
      const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Map Sunday to 6, Monday to 0

      if (daysMap[mappedIndex]) {
        daysMap[mappedIndex].sales += Number(s.total || 0);
        daysMap[mappedIndex].orders += 1;
      }
    });

    return daysMap;
  },

  /**
   * 3. SALES BY CATEGORY (Aggregated from Real Sales in DB)
   */
  async getCategorySales() {
    const { products, sales } = await this._getLiveStoreData();

    // Standard POS Categories
    const categoryTotals = {
      'Books': 0,
      'Stationery': 0,
      'Snacks & Chocolates': 0,
      'Drinks': 0,
      'Ice Cream': 0,
      'USB & Mobile Accessories': 0,
    };

    // Product Category Lookup Map
    const prodCatMap = {};
    products.forEach((p) => {
      prodCatMap[p.id] = p.category;
      if (p.name) prodCatMap[p.name.toLowerCase()] = p.category;
    });

    // Aggregate real sales items
    sales.forEach((s) => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item) => {
          const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
          let cat = item.category;

          if (!cat && item.id && prodCatMap[item.id]) {
            cat = prodCatMap[item.id];
          }
          if (!cat && item.name && prodCatMap[item.name.toLowerCase()]) {
            cat = prodCatMap[item.name.toLowerCase()];
          }

          // Fallback matching
          if (!cat) {
            const nameLower = (item.name || '').toLowerCase();
            if (nameLower.includes('book') || nameLower.includes('novel')) cat = 'Books';
            else if (nameLower.includes('pen') || nameLower.includes('paper') || nameLower.includes('print')) cat = 'Stationery';
            else if (nameLower.includes('choco') || nameLower.includes('snack')) cat = 'Snacks & Chocolates';
            else if (nameLower.includes('drink') || nameLower.includes('beverage')) cat = 'Drinks';
            else if (nameLower.includes('ice') || nameLower.includes('cream')) cat = 'Ice Cream';
            else if (nameLower.includes('usb') || nameLower.includes('cable')) cat = 'USB & Mobile Accessories';
            else cat = 'Stationery';
          }

          if (categoryTotals[cat] !== undefined) {
            categoryTotals[cat] += itemTotal;
          } else {
            categoryTotals['Stationery'] += itemTotal;
          }
        });
      }
    });

    const totalCategoryRevenue = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const colors = {
      'Books': '#0B3B60',
      'Stationery': '#43B02A',
      'Snacks & Chocolates': '#F59E0B',
      'Drinks': '#3B82F6',
      'Ice Cream': '#EC4899',
      'USB & Mobile Accessories': '#8B5CF6',
    };

    return Object.keys(categoryTotals).map((cat) => {
      const salesVal = categoryTotals[cat];
      const share = totalCategoryRevenue > 0 ? Math.round((salesVal / totalCategoryRevenue) * 100) : 0;
      return {
        category: cat,
        sales: salesVal,
        share,
        color: colors[cat] || '#0B3B60',
      };
    });
  },

  /**
   * 4. TOP SELLING PRODUCTS (Aggregated from Real Sales in DB)
   */
  async getTopProducts() {
    const { sales, products } = await this._getLiveStoreData();

    const productSalesMap = {};

    sales.forEach((s) => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item) => {
          const name = item.name || 'Product';
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;

          if (!productSalesMap[name]) {
            productSalesMap[name] = {
              id: item.id || name,
              name,
              category: item.category || 'General',
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[name].quantity += qty;
          productSalesMap[name].revenue += price * qty;
        });
      }
    });

    const sortedList = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

    // If sales have occurred, return top 5
    if (sortedList.length > 0) {
      return sortedList.slice(0, 5);
    }

    // If no sales have occurred yet, show catalog products with 0 sold
    return products.slice(0, 5).map((p, idx) => ({
      id: p.id || idx,
      name: p.name,
      category: p.category || 'General',
      quantity: 0,
      revenue: 0,
    }));
  },

  /**
   * 5. PAYMENT METHODS (Calculated from Real Sales in DB)
   */
  async getPaymentMethods() {
    const { sales } = await this._getLiveStoreData();

    const totals = {
      Cash: 0,
      Card: 0,
      'Bank Transfer': 0,
    };

    sales.forEach((s) => {
      const method = (s.method || 'CASH').toUpperCase();
      const amount = Number(s.total || 0);

      if (method.includes('CASH')) totals.Cash += amount;
      else if (method.includes('CARD')) totals.Card += amount;
      else totals['Bank Transfer'] += amount;
    });

    const allRevenue = totals.Cash + totals.Card + totals['Bank Transfer'];

    return [
      {
        method: 'Cash',
        percentage: allRevenue > 0 ? Math.round((totals.Cash / allRevenue) * 100) : 0,
        amount: totals.Cash,
        color: '#43B02A',
      },
      {
        method: 'Card',
        percentage: allRevenue > 0 ? Math.round((totals.Card / allRevenue) * 100) : 0,
        amount: totals.Card,
        color: '#0B3B60',
      },
      {
        method: 'Bank Transfer',
        percentage: allRevenue > 0 ? Math.round((totals['Bank Transfer'] / allRevenue) * 100) : 0,
        amount: totals['Bank Transfer'],
        color: '#F59E0B',
      },
    ];
  },

  /**
   * 6. LOW STOCK ITEMS (Filtered from Real Products in DB: stock <= 5)
   */
  async getLowStockItems() {
    const { products } = await this._getLiveStoreData();

    return products
      .filter((p) => Number(p.stock || 0) <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'N/A',
        category: p.category || 'General',
        currentStock: Number(p.stock || 0),
        minStock: Number(p.reorderLevel) || 5,
        status: Number(p.stock || 0) <= 2 ? 'Critical' : 'Low',
        unitCost: Number(p.costPrice || 0),
      }));
  },

  /**
   * 7. RECENT SALES (Real Transactions from DB)
   */
  async getRecentSales() {
    const { sales } = await this._getLiveStoreData();

    return sales.slice(0, 5).map((s) => ({
      id: s.id,
      invoiceNo: s.invoiceNo || s.id,
      customer: s.customer || 'Walk-in Student',
      items: Array.isArray(s.items)
        ? s.items.map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')
        : 'Store Item',
      method: s.method || 'CASH',
      total: Number(s.total || 0),
      date: s.date || 'Today',
      status: s.status || 'Completed',
    }));
  },

  /**
   * 8. RECENT ACTIVITY (Aggregated Telemetry from Real DB Records)
   */
  async getRecentActivity() {
    const { sales, products, customers } = await this._getLiveStoreData();

    const activityList = [];

    // Add recent sales to activity
    sales.slice(0, 3).forEach((s) => {
      activityList.push({
        id: `sale-${s.id}`,
        type: 'sale',
        title: 'New sale completed',
        description: `Invoice #${s.invoiceNo || s.id} for LKR ${Number(s.total || 0).toFixed(2)} (${s.method || 'CASH'})`,
        time: s.date || 'Recently',
        color: 'text-[#43B02A]',
        bg: 'bg-[#43B02A]/10',
      });
    });

    // Add recent products to activity
    products.slice(0, 2).forEach((p) => {
      activityList.push({
        id: `prod-${p.id}`,
        type: 'product',
        title: 'Product in catalog',
        description: `${p.name} (SKU: ${p.sku || 'N/A'}) in ${p.category}`,
        time: 'Catalog Item',
        color: 'text-[#0B3B60]',
        bg: 'bg-[#0B3B60]/10',
      });
    });

    // Add recent customer if exists
    if (customers.length > 0) {
      const c = customers[0];
      activityList.push({
        id: `cust-${c.id}`,
        type: 'customer',
        title: 'Customer in database',
        description: `${c.name} registered for student discounts`,
        time: 'Active Profile',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
      });
    }

    return activityList;
  },
};

export default dashboardService;
