import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Printer,
  Boxes,
  Receipt,
  Truck,
  Users,
  Wallet,
  BarChart3,
  UserCheck,
  Bell,
  Settings,
  Palette,
  ChevronDown,
  ChevronRight,
  X,
  BookOpen,
  Coffee,
  Sparkles,
  Smartphone,
  Scan,
  Shield,
  FileText,
  RotateCcw,
  ArrowDownCircle,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

const navStructure = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'POS',
    icon: ShoppingCart,
    path: '/pos',
    highlight: true,
    subPages: [
      { title: 'New Sale', path: '/pos' },
    ],
  },
  {
    title: 'Products',
    icon: Package,
    path: '/products',
    subPages: [
      { title: 'All Products', path: '/products' },
      { title: 'Books', path: '/products/books' },
      { title: 'Stationery', path: '/products/stationery' },
      { title: 'Snacks & Chocolates', path: '/products/snacks' },
      { title: 'Drinks', path: '/products/drinks' },
      { title: 'Ice Cream', path: '/products/ice-cream' },
      { title: 'USB & Mobile Accessories', path: '/products/accessories' },
    ],
  },
  {
    title: 'Services',
    icon: Printer,
    path: '/services',
    subPages: [
      { title: 'Printing', path: '/services/printing' },
      { title: 'Photocopy', path: '/services/photocopy' },
      { title: 'Scanning', path: '/services/scanning' },
      { title: 'Laminating', path: '/services/laminating' },
      { title: 'Binding', path: '/services/binding' },
    ],
  },
  {
    title: 'Inventory',
    icon: Boxes,
    path: '/inventory',
    subPages: [
      { title: 'Stock Overview', path: '/inventory' },
      { title: 'Low Stock', path: '/inventory/low-stock' },
      { title: 'Stock Out', path: '/inventory/out-of-stock' },
    ],
  },
  {
    title: 'Sales',
    icon: Receipt,
    path: '/sales',
    subPages: [
      { title: 'Sales History', path: '/sales' },
      { title: 'Invoices', path: '/sales/invoices' },
      { title: 'Returns & Refunds', path: '/sales/returns' },
    ],
  },
  {
    title: 'Purchases',
    icon: Truck,
    path: '/purchases',
    subPages: [
      { title: 'New Purchase', path: '/purchases/new' },
      { title: 'Purchase History', path: '/purchases' },
      { title: 'Suppliers', path: '/suppliers' },
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    path: '/customers',
  },
  {
    title: 'Expenses',
    icon: Wallet,
    path: '/expenses',
  },
  {
    title: 'Reports',
    icon: BarChart3,
    path: '/reports',
    subPages: [
      { title: 'Sales Report', path: '/reports/sales' },
      { title: 'Product Report', path: '/reports/products' },
      { title: 'Service Report', path: '/reports/services' },
      { title: 'Inventory Report', path: '/reports/inventory' },
      { title: 'Profit & Loss', path: '/reports/profit-loss' },
    ],
  },
  {
    title: 'Employees',
    icon: UserCheck,
    path: '/employees',
    subPages: [
      { title: 'Employees', path: '/employees' },
      { title: 'Roles & Permissions', path: '/employees/roles' },
      { title: 'Activity Logs', path: '/employees/logs' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    path: '/notifications',
    badge: '3',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
  {
    title: 'Design System',
    icon: Palette,
    path: '/design-system',
    special: true,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Manage open states for accordion items
  const [openSections, setOpenSections] = useState({});

  // Auto-expand the active section based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = navStructure.find(
      (item) =>
        item.subPages &&
        (item.subPages.some((sub) => sub.path === currentPath) ||
          currentPath.startsWith(item.path + '/'))
    );
    if (activeSection) {
      setOpenSections((prev) => ({
        ...prev,
        [activeSection.title]: true,
      }));
    }
  }, [location.pathname]);

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar: Official Brand Navy Blue (#0B3B60) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B3B60] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Real Official Logo */}
        <div className="p-4 border-b border-white/10 bg-[#082d49]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Real Logo Image Container */}
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-white/20 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="Student Hub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-base tracking-wide text-white block leading-tight truncate">
                STUDENT<span className="text-[#43B02A]">HUB</span>
              </span>
              <span className="text-[9px] uppercase font-bold text-white/70 tracking-wider block truncate">
                Student Service Center
              </span>
              <span className="text-[8px] text-[#43B02A] font-semibold tracking-tight block truncate">
                Smart Cloud POS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter & Branch Live Tag */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/15 flex items-center justify-between text-xs">
          <span className="text-white/60 font-medium">Campus Branch #01</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#43B02A]">
            <span className="w-2 h-2 rounded-full bg-[#43B02A] animate-pulse"></span>
            Terminal Online
          </span>
        </div>

        {/* Navigation List with Sub-page Tree */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm font-medium">
          {navStructure.map((item) => {
            const Icon = item.icon;
            const hasSubPages = item.subPages && item.subPages.length > 0;
            const isSectionOpen = openSections[item.title];

            const isCurrentMainActive =
              location.pathname === item.path ||
              (item.subPages && item.subPages.some((sub) => sub.path === location.pathname));

            return (
              <div key={item.title} className="space-y-0.5">
                {/* Main Item Row */}
                {hasSubPages ? (
                  <div
                    onClick={() => toggleSection(item.title)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all select-none group ${
                      isCurrentMainActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isCurrentMainActive ? 'text-[#43B02A]' : 'text-white/70'
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.highlight && (
                        <span className="w-2 h-2 rounded-full bg-[#43B02A]"></span>
                      )}
                      {isSectionOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-white/60 transition-transform" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-white/40 transition-transform" />
                      )}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-[#43B02A] text-white shadow-md font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      } ${item.special ? 'mt-3 border border-white/15 bg-white/5' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-white/70'
                            }`}
                          />
                          <span>{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white text-[#0B3B60]'
                                : 'bg-[#43B02A] text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )}

                {/* Sub-pages Tree Display (├── / └── style) */}
                {hasSubPages && isSectionOpen && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-white/15 ml-4 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.subPages.map((sub, index) => {
                      const isLast = index === item.subPages.length - 1;
                      const isSubActive = location.pathname === sub.path;

                      return (
                        <NavLink
                          key={sub.path + sub.title}
                          to={sub.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all relative ${
                            isSubActive
                              ? 'bg-[#43B02A] text-white font-bold shadow-xs'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-white/40 select-none">
                            {isLast ? '└──' : '├──'}
                          </span>
                          <span className="truncate">{sub.title}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Cashier Footer */}
        <div className="p-3 border-t border-white/10 bg-[#062033]/80">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-[#43B02A] text-white font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
              EC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Eranga C.</p>
              <p className="text-[11px] text-white/60 truncate">Senior Cashier • Shift 01</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
