import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import DashboardHeader from '../components/DashboardHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import SalesTrendChart from '../components/SalesTrendChart.jsx';
import SalesCategoryChart from '../components/SalesCategoryChart.jsx';
import TopProductsChart from '../components/TopProductsChart.jsx';
import PaymentMethodsChart from '../components/PaymentMethodsChart.jsx';
import RecentSalesTable from '../components/RecentSalesTable.jsx';
import QuickActions from '../components/QuickActions.jsx';

import dashboardService from '../services/dashboardService.js';

/**
 * Dashboard Page
 * Main Executive Dashboard orchestrating KPI summary cards, sales trend charts,
 * category distribution, top velocity products, payment channels, low-stock warnings,
 * recent transactions, and store activity feed.
 */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        summaryRes,
        trendRes,
        categoryRes,
        topProdRes,
        paymentsRes,
        salesRes,
      ] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getSalesTrend(),
        dashboardService.getCategorySales(),
        dashboardService.getTopProducts(),
        dashboardService.getPaymentMethods(),
        dashboardService.getRecentSales(),
      ]);

      setSummary(summaryRes);
      setSalesTrend(trendRes);
      setCategorySales(categoryRes);
      setTopProducts(topProdRes);
      setPaymentMethods(paymentsRes);
      setRecentSales(salesRes);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
      setError('Unable to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header */}
      <DashboardHeader onRefresh={fetchDashboardData} loading={loading} />

      {/* Error Banner if API fails */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn-glass text-xs py-1 px-2.5 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Quick Actions Bar */}
      <QuickActions />

      {/* 3. Top Summary Cards (6 KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Card 1: Today's Sales */}
        <StatCard
          title={summary?.todaySales?.title || "Today's Sales"}
          value={summary?.todaySales?.formatted || "LKR 0.00"}
          change={summary?.todaySales?.change || "0 orders"}
          comparison={summary?.todaySales?.comparison || "recorded"}
          isPositive={summary?.todaySales?.isPositive ?? true}
          icon={DollarSign}
          iconBg="bg-[#43B02A]/10"
          iconColor="text-[#43B02A]"
          loading={loading}
        />

        {/* Card 2: Today's Profit */}
        <StatCard
          title={summary?.todayProfit?.title || "Today's Profit"}
          value={summary?.todayProfit?.formatted || "LKR 0.00"}
          change={summary?.todayProfit?.change || "Net margin"}
          comparison={summary?.todayProfit?.comparison || "operational"}
          isPositive={summary?.todayProfit?.isPositive ?? true}
          icon={TrendingUp}
          iconBg="bg-[#0B3B60]/10"
          iconColor="text-[#0B3B60]"
          loading={loading}
        />

        {/* Card 3: Today's Transactions */}
        <StatCard
          title={summary?.todayTransactions?.title || "Today's Orders"}
          value={summary?.todayTransactions?.formatted || "0 Orders"}
          change={summary?.todayTransactions?.change || "0 receipts"}
          comparison={summary?.todayTransactions?.comparison || "today"}
          isPositive={summary?.todayTransactions?.isPositive ?? true}
          icon={ShoppingCart}
          iconBg="bg-[#0B3B60]/10"
          iconColor="text-[#0B3B60]"
          loading={loading}
        />

        {/* Card 4: Total Products */}
        <StatCard
          title={summary?.totalProducts?.title || "Total Products"}
          value={summary?.totalProducts?.formatted || "0 SKUs"}
          change={summary?.totalProducts?.change || "0 items"}
          comparison={summary?.totalProducts?.comparison || "in catalog"}
          isPositive={summary?.totalProducts?.isPositive ?? true}
          icon={Package}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          loading={loading}
        />

        {/* Card 5: Low Stock Items */}
        <StatCard
          title={summary?.lowStockItems?.title || "Low Stock"}
          value={summary?.lowStockItems?.formatted || "0 Items"}
          change={summary?.lowStockItems?.change || "0 critical"}
          comparison={summary?.lowStockItems?.comparison || "stock ≤ 5"}
          isPositive={summary?.lowStockItems?.isPositive ?? true}
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={loading}
        />

        {/* Card 6: Total Customers */}
        <StatCard
          title={summary?.totalCustomers?.title || "Customers"}
          value={summary?.totalCustomers?.formatted || "0 Students"}
          change={summary?.totalCustomers?.change || "0 profiles"}
          comparison={summary?.totalCustomers?.comparison || "registered"}
          isPositive={summary?.totalCustomers?.isPositive ?? true}
          icon={Users}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          loading={loading}
        />
      </div>

      {/* 4. Primary Charts Section (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 2: Sales Trend Line Chart */}
        <SalesTrendChart data={salesTrend} loading={loading} />

        {/* Section 3: Sales by Category Bar Chart */}
        <SalesCategoryChart data={categorySales} loading={loading} />
      </div>

      {/* 5. Secondary Charts Section (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 4: Top Selling Products Horizontal Bar Chart */}
        <TopProductsChart data={topProducts} loading={loading} />

        {/* Section 5: Payment Methods Donut Chart */}
        <PaymentMethodsChart data={paymentMethods} loading={loading} />
      </div>

      {/* 6. Recent Sales Section */}
      <RecentSalesTable sales={recentSales} loading={loading} />
    </div>
  );
}
