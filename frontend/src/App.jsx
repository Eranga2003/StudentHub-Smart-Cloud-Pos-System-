import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

// Module Pages (Single-file JSX+Tailwind implementations in src/pages/)
import DashboardPage from './pages/DashboardPage.jsx';
import POSPage from './pages/POSPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import PurchasesPage from './pages/PurchasesPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import DesignSystemPage from './pages/DesignSystemPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />

          {/* POS Terminal & Sub-pages */}
          <Route path="pos" element={<POSPage />} />

          {/* Products & Department Sub-pages */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:subCategory" element={<ProductsPage />} />

          {/* Student Services Sub-pages */}
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:serviceType" element={<ServicesPage />} />

          {/* Inventory & Sub-pages */}
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:subView" element={<InventoryPage />} />

          {/* Sales & Invoices Sub-pages */}
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/:subTab" element={<SalesPage />} />

          {/* Purchases & Suppliers */}
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="purchases/:subTab" element={<PurchasesPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />

          {/* Customers & Members */}
          <Route path="customers" element={<CustomersPage />} />

          {/* Expenses */}
          <Route path="expenses" element={<ExpensesPage />} />

          {/* Reports & Analytics Sub-pages */}
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:reportType" element={<ReportsPage />} />

          {/* Employees & Roster Sub-pages */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:subTab" element={<EmployeesPage />} />

          {/* Notifications & System Alerts */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Settings & Hardware Configuration */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Living Design System Showroom */}
          <Route path="design-system" element={<DesignSystemPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
