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
import LowStockTable from '../components/LowStockTable.jsx';
import RecentSalesTable from '../components/RecentSalesTable.jsx';
import QuickActions from '../components/QuickActions.jsx';
import RecentActivity from '../components/RecentActivity.jsx';

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
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

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
        lowStockRes,
        salesRes,
        activityRes,
      ] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getSalesTrend(),
        dashboardService.getCategorySales(),
        dashboardService.getTopProducts(),
        dashboardService.getPaymentMethods(),
        dashboardService.getLowStockItems(),
        dashboardService.getRecentSales(),
        dashboardService.getRecentActivity(),
      ]);

      setSummary(summaryRes);
      setSalesTrend(trendRes);
      setCategorySales(categoryRes);
      setTopProducts(topProdRes);
      setPaymentMethods(paymentsRes);
      setLowStock(lowStockRes);
      setRecentSales(salesRes);
      setRecentActivity(activityRes);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Sales */}
        <StatCard
          title={summary?.todaySales?.title || "Today's Sales"}
          value={summary?.todaySales?.formatted || "LKR 48,250.00"}
          change={summary?.todaySales?.change || "+14.2%"}
          comparison={summary?.todaySales?.comparison || "vs yesterday"}
          isPositive={summary?.todaySales?.isPositive ?? true}
          icon={DollarSign}
          iconBg="bg-[#43B02A]/10"
          iconColor="text-[#43B02A]"
          loading={loading}
        />

        {/* Card 2: Today's Profit */}
        <StatCard
          title={summary?.todayProfit?.title || "Today's Profit"}
          value={summary?.todayProfit?.formatted || "LKR 16,840.00"}
          change={summary?.todayProfit?.change || "+8.6%"}
          comparison={summary?.todayProfit?.comparison || "vs yesterday"}
          isPositive={summary?.todayProfit?.isPositive ?? true}
          icon={TrendingUp}
          iconBg="bg-[#0B3B60]/10"
          iconColor="text-[#0B3B60]"
          loading={loading}
        />

        {/* Card 3: Today's Transactions */}
        <StatCard
          title={summary?.todayTransactions?.title || "Today's Transactions"}
          value={summary?.todayTransactions?.formatted || "142 Orders"}
          change={summary?.todayTransactions?.change || "+18 orders"}
          comparison={summary?.todayTransactions?.comparison || "vs yesterday"}
          isPositive={summary?.todayTransactions?.isPositive ?? true}
          icon={ShoppingCart}
          iconBg="bg-[#0B3B60]/10"
          iconColor="text-[#0B3B60]"
          loading={loading}
        />

        {/* Card 4: Total Products */}
        <StatCard
          title={summary?.totalProducts?.title || "Total Products"}
          value={summary?.totalProducts?.formatted || "386 SKUs"}
          change={summary?.totalProducts?.change || "+4 new"}
          comparison={summary?.totalProducts?.comparison || "catalog items"}
          isPositive={summary?.totalProducts?.isPositive ?? true}
          icon={Package}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          loading={loading}
        />

        {/* Card 5: Low Stock Items */}
        <StatCard
          title={summary?.lowStockItems?.title || "Low Stock Items"}
          value={summary?.lowStockItems?.formatted || "7 Items"}
          change={summary?.lowStockItems?.change || "3 critical"}
          comparison={summary?.lowStockItems?.comparison || "requires restock"}
          isPositive={summary?.lowStockItems?.isPositive ?? false}
          icon={AlertTriangle}
          iconBg="bg-amber-100"
          iconColor="text-amber-700"
          loading={loading}
        />

        {/* Card 6: Total Customers */}
        <StatCard
          title={summary?.totalCustomers?.title || "Total Customers"}
          value={summary?.totalCustomers?.formatted || "1,248 Students"}
          change={summary?.totalCustomers?.change || "+24 new"}
          comparison={summary?.totalCustomers?.comparison || "this month"}
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

      {/* 6. Operations & Activity Layout (8 cols + 4 cols on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 7: Recent Sales */}
          <RecentSalesTable sales={recentSales} loading={loading} />

          {/* Section 6: Low Stock Items */}
          <LowStockTable items={lowStock} loading={loading} />
        </div>

        {/* Right Column (4 cols): Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 9: Recent Activity */}
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>
      </div>
    </div>
  );
}
