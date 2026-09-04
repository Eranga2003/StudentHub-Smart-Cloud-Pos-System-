import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 flex">
      {/* Brand Navy Floating Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area with Distance & Balanced Margins */}
      <div className="flex-1 lg:pl-[318px] flex flex-col min-w-0 min-h-screen transition-all">
        <div className="flex-1 flex flex-col min-w-0 lg:pr-3.5 lg:py-3.5">
          <Navbar onMenuToggle={() => setSidebarOpen(true)} />

          <main className="flex-1 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-1 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
