import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

/**
 * SalesTrendChart Component
 * Line Chart displaying the 7-day sales trend (Monday to Sunday) in LKR.
 * Built with precision responsive SVG with interactive hover tooltips.
 */
export default function SalesTrendChart({ data = [], loading = false }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs h-80 flex items-center justify-center animate-pulse">
        <div className="space-y-3 text-center">
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
          <div className="h-48 w-full max-w-md bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [
    { day: 'Monday', short: 'Mon', sales: 0 },
    { day: 'Tuesday', short: 'Tue', sales: 0 },
    { day: 'Wednesday', short: 'Wed', sales: 0 },
    { day: 'Thursday', short: 'Thu', sales: 0 },
    { day: 'Friday', short: 'Fri', sales: 0 },
    { day: 'Saturday', short: 'Sat', sales: 0 },
    { day: 'Sunday', short: 'Sun', sales: 0 },
  ];

  // SVG Chart Geometry calculations
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const maxSales = Math.max(...chartData.map((d) => d.sales), 1000) * 1.15;
  const minSales = 0;

  const points = chartData.map((item, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (chartData.length - 1);
    const y = height - paddingY - ((item.sales - minSales) / (maxSales - minSales)) * (height - 2 * paddingY);
    return { ...item, x, y };
  });

  // Generate smooth cubic bezier SVG path
  const pathData = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  // Fill gradient area below the line
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Y-axis grid ticks (e.g. 0, 20k, 40k, 60k)
  const yTicks = [0, maxSales * 0.33, maxSales * 0.66, maxSales];

  const totalWeekSales = chartData.reduce((acc, item) => acc + item.sales, 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-0.5">
            <TrendingUp className="w-4 h-4 text-[#43B02A]" />
            <span>Revenue Trajectory</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B3B60]">Sales Trend</h2>
          <p className="text-xs text-slate-500">Last 7 days daily performance</p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-bold text-slate-400 uppercase">7-Day Total</span>
          <p className="text-lg font-black text-[#0B3B60]">
            LKR {totalWeekSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* SVG Line Chart Viewport */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none"
        >
          <defs>
            <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#43B02A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#43B02A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-axis Grid Lines */}
          {yTicks.map((tick, i) => {
            const y = height - paddingY - ((tick - minSales) / (maxSales - minSales)) * (height - 2 * paddingY);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  {(tick / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          <path d={areaData} fill="url(#salesTrendGradient)" />

          {/* Trend Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#0B3B60"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((point, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.day === point.day ? '6' : '4'}
                fill="#FFFFFF"
                stroke="#43B02A"
                strokeWidth="3"
                className="transition-all duration-150"
              />

              {/* X-axis Labels */}
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={hoveredPoint?.day === point.day ? '#0B3B60' : '#64748B'}
              >
                {point.short}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none bg-[#0B3B60] text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <p className="font-bold text-[#43B02A]">{hoveredPoint.day}</p>
            <p className="text-white font-bold">LKR {hoveredPoint.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0B3B60]"></span>
          <span>Daily Revenue</span>
        </span>
        <span className="font-mono text-slate-400 text-[11px]">Values in LKR</span>
      </div>
    </div>
  );
}
