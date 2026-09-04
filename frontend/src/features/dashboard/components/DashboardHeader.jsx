import React from 'react';

/**
 * DashboardHeader Component
 * Clean, modern, text-only title header for the Dashboard.
 */
export default function DashboardHeader() {
  return (
    <div className="pt-1">
      <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#0B3B60]">
        Dashboard
      </h1>
      <p className="text-xs text-slate-400 font-medium mt-0.5">
        Real-time store performance & operational overview
      </p>
    </div>
  );
}
