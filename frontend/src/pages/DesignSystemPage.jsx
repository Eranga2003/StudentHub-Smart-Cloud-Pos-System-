import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layers,
  Sparkles,
  ArrowLeft,
  Filter,
  Eye,
  X,
  Check,
  Save,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Copy,
} from 'lucide-react';

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState(null);

  const copyToClipboard = (tokenText) => {
    navigator.clipboard.writeText(tokenText);
    setCopiedToken(tokenText);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const brandColors = [
    {
      name: 'Navy Blue',
      hex: '#0B3B60',
      variable: '--color-primary',
      tailwind: 'bg-[#0B3B60] / text-[#0B3B60]',
      usage: 'Main navigation, Sidebar elements, Headings, Secondary actions, Sub-page glass buttons, Professional UI accents',
      textColor: 'text-white',
      bgClass: 'bg-[#0B3B60]',
    },
    {
      name: 'Green',
      hex: '#43B02A',
      variable: '--color-secondary',
      tailwind: 'bg-[#43B02A] / text-[#43B02A]',
      usage: 'Primary buttons, Main CTA buttons, POS action buttons, Confirm/Save buttons, Success indicators',
      textColor: 'text-white',
      bgClass: 'bg-[#43B02A]',
    },
    {
      name: 'White',
      hex: '#FFFFFF',
      variable: '--color-white',
      tailwind: 'bg-[#FFFFFF] / text-[#FFFFFF]',
      usage: 'Main text on dark backgrounds, Button text on Green/Navy, Card backgrounds, Clean UI surfaces',
      textColor: 'text-slate-800',
      bgClass: 'bg-white border border-slate-200',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#43B02A]" />
            <span>Brand Guidelines & Token Specification</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0B3B60]">
            Global Design System
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory architectural specification for Student Hub Smart Cloud POS.
            Consuming centralized design tokens across all components.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#43B02A]/10 border border-[#43B02A]/20 text-[#43B02A] text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Brand Compliant System</span>
        </div>
      </div>

      {/* SECTION 1: MANDATORY BRAND COLORS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0B3B60] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B3B60]"></span>
              Official Brand Colors
            </h2>
            <p className="text-xs text-slate-500">
              Defined centrally in <code className="text-[#0B3B60] bg-slate-100 px-1 py-0.5 rounded font-mono">src/styles/variables.css</code>. No unauthorized primary colors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {brandColors.map((color) => (
            <div
              key={color.name}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Swatch */}
              <div
                className={`h-32 ${color.bgClass} flex flex-col justify-between p-4 relative`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${color.textColor}`}>
                  {color.name}
                </span>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-lg font-black tracking-wider ${color.textColor}`}>
                    {color.hex}
                  </span>
                  <button
                    onClick={() => copyToClipboard(color.variable)}
                    className="p-1.5 rounded-md bg-black/20 hover:bg-black/30 text-white backdrop-blur-xs transition-colors"
                    title={`Copy token: var(${color.variable})`}
                  >
                    {copiedToken === color.variable ? (
                      <Check className="w-4 h-4 text-[#43B02A]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Specs */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Design Variable
                  </label>
                  <code className="block text-xs font-mono font-bold text-[#0B3B60] bg-slate-50 p-1.5 rounded mt-0.5 border border-slate-100">
                    var({color.variable})
                  </code>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Mandatory Usage
                  </label>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {color.usage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: BUTTON DESIGN SYSTEM */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B3B60] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#43B02A]"></span>
            Button Specification & States
          </h2>
          <p className="text-xs text-slate-500">
            Primary buttons strictly use Green (<code className="font-mono text-[#43B02A]">#43B02A</code>). Sub-page & secondary buttons use Navy Blue (<code className="font-mono text-[#0B3B60]">#0B3B60</code>) glass-style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Buttons Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0B3B60]">
                  Primary Buttons (Brand Green)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Background: var(--color-secondary) | Text: var(--color-white)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#43B02A]/10 text-[#43B02A]">
                CTA / Pos Action
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Used for confirming, completing transactions, creating items, and primary positive actions.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="btn-primary">
                <Save className="w-4 h-4" />
                <span>Save Product</span>
              </button>

              <button className="btn-primary">
                <ShoppingCart className="w-4 h-4" />
                <span>Complete Sale</span>
              </button>

              <button className="btn-primary">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button className="btn-primary">
                <Check className="w-4 h-4" />
                <span>Confirm</span>
              </button>
            </div>
          </div>

          {/* Sub-page / Secondary Glass Buttons Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0B3B60]">
                  Sub-Page / Secondary Glass Buttons (Navy Blue)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Base: var(--color-primary) | Backdrop: blur(8px)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B3B60]/10 text-[#0B3B60]">
                Glass Nav / Filter
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Modern, subtle, slightly glass-like, clean, and professional. Not visually heavier than primary buttons.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="btn-glass">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>

              <button className="btn-glass">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>

              <button className="btn-glass">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>

              <button className="btn-glass">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TYPOGRAPHY HIERARCHY */}
      <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0B3B60] flex items-center gap-2">
              <Type className="w-5 h-5 text-[#0B3B60]" />
              Typography Hierarchy — Roboto
            </h2>
            <p className="text-xs text-slate-500">
              Centrally configured: <code className="font-mono text-[#0B3B60]">font-family: 'Roboto', sans-serif;</code>.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono">
            Roboto Google Font
          </span>
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          <div className="pt-2 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <h1 className="text-3xl font-bold text-[#0B3B60]">
              Heading 1 (30px Bold) — Student Hub POS
            </h1>
            <span className="text-xs font-mono text-slate-400">text-3xl font-bold text-[#0B3B60]</span>
          </div>

          <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold text-[#0B3B60]">
              Heading 2 (24px Bold) — Inventory Management
            </h2>
            <span className="text-xs font-mono text-slate-400">text-2xl font-bold text-[#0B3B60]</span>
          </div>

          <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <h3 className="text-xl font-semibold text-[#0B3B60]">
              Heading 3 (20px Semibold) — Quick Services & Printing
            </h3>
            <span className="text-xs font-mono text-slate-400">text-xl font-semibold text-[#0B3B60]</span>
          </div>

          <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <p className="text-base text-slate-700">
              Body Text (16px Regular) — Clean high-readability text for customer receipts, product descriptions, and tabular reports.
            </p>
            <span className="text-xs font-mono text-slate-400">text-base text-slate-700</span>
          </div>

          <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <p className="text-sm text-slate-500">
              Secondary Text (14px) — Metadata, timestamps, item barcodes, and cashier notes.
            </p>
            <span className="text-xs font-mono text-slate-400">text-sm text-slate-500</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEMANTIC BADGES & STATES */}
      <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#0B3B60] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0B3B60]" />
          Semantic Indicators & Status Badges
        </h2>
        <p className="text-xs text-slate-500">
          Standardized badges consuming design tokens for state communication.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <span className="badge-green px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43B02A]"></span>
            Active / In Stock (Brand Green)
          </span>

          <span className="badge-navy px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B60]"></span>
            Processing / Verified (Brand Navy)
          </span>

          <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Low Stock Warning
          </span>

          <span className="bg-red-500/10 text-red-700 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Out of Stock / Danger
          </span>
        </div>
      </section>
    </div>
  );
}
