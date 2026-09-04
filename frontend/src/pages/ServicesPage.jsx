import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  Copy,
  Scan,
  Shield,
  BookOpen,
  ShoppingCart,
  RotateCcw,
  CheckCircle,
  Settings2,
  DollarSign,
  Save,
  Check,
} from 'lucide-react';

const defaultRates = {
  // Printing rates
  printA4BW: 10.0,
  printA4Color: 25.0,
  printA3BW: 20.0,
  printA3Color: 50.0,
  printLegalBW: 15.0,
  printLegalColor: 35.0,

  // Photocopy rates
  copyA4BW: 8.0,
  copyA4Color: 20.0,
  copyA3BW: 16.0,

  // Scanning rates
  scanPerPage: 15.0,

  // Laminating rates
  lamiID: 50.0,
  lamiA4: 100.0,
  lamiA3: 200.0,

  // Binding rates
  bindSpiral: 150.0,
  bindTape: 100.0,
  bindHardcover: 650.0,
};

export default function ServicesPage() {
  const { serviceType: routeService } = useParams();
  const navigate = useNavigate();

  // Load custom rates from localStorage if saved by user
  const [rates, setRates] = useState(() => {
    try {
      const saved = localStorage.getItem('sh_pos_service_rates');
      return saved ? { ...defaultRates, ...JSON.parse(saved) } : defaultRates;
    } catch {
      return defaultRates;
    }
  });

  // Active service tab: 'printing', 'photocopy', 'scanning', 'laminating', 'binding'
  const [activeService, setActiveService] = useState('printing');
  const [paperSize, setPaperSize] = useState('A4');
  const [pageCount, setPageCount] = useState(1);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [bindingStyle, setBindingStyle] = useState('spiral');
  const [laminationSize, setLaminationSize] = useState('A4');
  const [orderAdded, setOrderAdded] = useState(false);
  const [ratesSavedNotice, setRatesSavedNotice] = useState(false);
  const [showRateSettings, setShowRateSettings] = useState(false);

  // Custom rate overrides per specific job session
  const [customUnitPrice, setCustomUnitPrice] = useState(10.0);

  useEffect(() => {
    if (routeService) {
      if (['printing', 'photocopy', 'scanning', 'laminating', 'binding'].includes(routeService.toLowerCase())) {
        setActiveService(routeService.toLowerCase());
      }
    }
  }, [routeService]);

  // Synchronize current unit price whenever options change
  useEffect(() => {
    if (activeService === 'printing') {
      let key = 'printA4BW';
      if (paperSize === 'A4') key = isColor ? 'printA4Color' : 'printA4BW';
      else if (paperSize === 'A3') key = isColor ? 'printA3Color' : 'printA3BW';
      else if (paperSize === 'Legal') key = isColor ? 'printLegalColor' : 'printLegalBW';
      setCustomUnitPrice(rates[key] || 10.0);
    } else if (activeService === 'photocopy') {
      let key = 'copyA4BW';
      if (isColor) key = 'copyA4Color';
      else if (paperSize === 'A3') key = 'copyA3BW';
      else key = 'copyA4BW';
      setCustomUnitPrice(rates[key] || 8.0);
    } else if (activeService === 'scanning') {
      setCustomUnitPrice(rates.scanPerPage || 15.0);
    } else if (activeService === 'laminating') {
      const key = laminationSize === 'ID' ? 'lamiID' : laminationSize === 'A3' ? 'lamiA3' : 'lamiA4';
      setCustomUnitPrice(rates[key] || 100.0);
    } else if (activeService === 'binding') {
      const key = bindingStyle === 'tape' ? 'bindTape' : bindingStyle === 'hardcover' ? 'bindHardcover' : 'bindSpiral';
      setCustomUnitPrice(rates[key] || 150.0);
    }
  }, [activeService, paperSize, isColor, laminationSize, bindingStyle, rates]);

  // Save customized rates permanently to localStorage
  const saveRatePreset = (key, val) => {
    const numVal = Math.max(0, Number(val) || 0);
    const updated = { ...rates, [key]: numVal };
    setRates(updated);
    localStorage.setItem('sh_pos_service_rates', JSON.stringify(updated));
    setRatesSavedNotice(true);
    setTimeout(() => setRatesSavedNotice(false), 2000);
  };

  // Pricing calculations
  const calculateTotal = () => {
    const unit = Number(customUnitPrice) || 0;
    if (activeService === 'printing' || activeService === 'photocopy') {
      const discount = isDoubleSided ? 0.9 : 1.0;
      return Math.round(pageCount * copies * unit * discount);
    }
    if (activeService === 'scanning') {
      return Math.round(pageCount * unit);
    }
    if (activeService === 'laminating' || activeService === 'binding') {
      return Math.round(copies * unit);
    }
    return 0;
  };

  const totalCost = calculateTotal();

  const handleAddToOrder = () => {
    const spec = activeService === 'laminating' 
      ? `${laminationSize} Pouch` 
      : activeService === 'binding' 
      ? `${bindingStyle} Binding` 
      : `${paperSize} ${isColor ? 'Color' : 'B&W'}`;

    const serviceItem = {
      id: `srv-${Date.now()}`,
      name: `${servicesList.find(s => s.id === activeService)?.name} (${spec})`,
      price: Number(customUnitPrice),
      quantity: activeService === 'scanning' ? pageCount : activeService === 'laminating' || activeService === 'binding' ? copies : pageCount * copies,
    };

    // Store in session storage for POS terminal pickup
    try {
      const existing = JSON.parse(sessionStorage.getItem('sh_pos_pending_service') || '[]');
      sessionStorage.setItem('sh_pos_pending_service', JSON.stringify([...existing, serviceItem]));
    } catch {}

    setOrderAdded(true);
    setTimeout(() => {
      setOrderAdded(false);
      navigate('/pos');
    }, 900);
  };

  const servicesList = [
    { id: 'printing', name: 'Printing', icon: Printer, subtitle: 'B&W & Color Laser' },
    { id: 'photocopy', name: 'Photocopy', icon: Copy, subtitle: 'High Speed Duplex' },
    { id: 'scanning', name: 'Scanning', icon: Scan, subtitle: 'OCR & PDF to USB' },
    { id: 'laminating', name: 'Laminating', icon: Shield, subtitle: 'ID Cards & Certificates' },
    { id: 'binding', name: 'Binding', icon: BookOpen, subtitle: 'Spiral, Tape, Hardcover' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {orderAdded && (
        <div className="fixed top-20 right-6 z-50 bg-[#43B02A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <p className="font-bold text-sm">Service job transferred to POS terminal!</p>
        </div>
      )}

      {ratesSavedNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B3B60] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-[#43B02A]" />
          <p className="font-bold text-sm">Custom rate updated & saved!</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <Printer className="w-4 h-4 text-[#43B02A]" />
            <span>Student Printing & Finishing Center</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            Services Desk — {servicesList.find((s) => s.id === activeService)?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Real-time job calculator with user-customizable unit amounts and paper rates.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowRateSettings(!showRateSettings)}
            className={`btn-glass text-xs py-2 px-3 ${showRateSettings ? 'bg-[#0B3B60] text-white' : ''}`}
          >
            <Settings2 className="w-4 h-4 text-[#43B02A]" />
            <span>{showRateSettings ? 'Hide Rate Settings' : 'Configure Base Rates'}</span>
          </button>

          <button
            onClick={handleAddToOrder}
            className="btn-primary"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Transfer to POS</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE BASE RATE CONFIGURATION PANEL */}
      {showRateSettings && (
        <div className="bg-white rounded-xl p-6 border-2 border-[#0B3B60]/20 shadow-md space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0B3B60]">Store Base Rates (LKR)</h2>
              <p className="text-xs text-slate-500">Customize the default paper and service prices for your shop. Saved locally.</p>
            </div>
            <button
              onClick={() => {
                setRates(defaultRates);
                localStorage.removeItem('sh_pos_service_rates');
                setRatesSavedNotice(true);
                setTimeout(() => setRatesSavedNotice(false), 2000);
              }}
              className="text-xs text-slate-500 hover:text-red-600 underline"
            >
              Reset All to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">A4 B&W Print (1 Page)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="0.5"
                  value={rates.printA4BW}
                  onChange={(e) => saveRatePreset('printA4BW', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">A4 Color Print (1 Page)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="0.5"
                  value={rates.printA4Color}
                  onChange={(e) => saveRatePreset('printA4Color', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">A4 Photocopy (1 Page)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="0.5"
                  value={rates.copyA4BW}
                  onChange={(e) => saveRatePreset('copyA4BW', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">Scanning (1 Page)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="0.5"
                  value={rates.scanPerPage}
                  onChange={(e) => saveRatePreset('scanPerPage', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">A4 Lamination (1 Sheet)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="5"
                  value={rates.lamiA4}
                  onChange={(e) => saveRatePreset('lamiA4', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">ID Card Lamination</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="5"
                  value={rates.lamiID}
                  onChange={(e) => saveRatePreset('lamiID', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">Spiral Project Binding</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="10"
                  value={rates.bindSpiral}
                  onChange={(e) => saveRatePreset('bindSpiral', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="font-bold text-slate-700 block">Hardcover Thesis</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                <input
                  type="number"
                  step="25"
                  value={rates.bindHardcover}
                  onChange={(e) => saveRatePreset('bindHardcover', e.target.value)}
                  className="w-full pl-10 pr-2 py-1.5 font-bold text-[#0B3B60] bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        {servicesList.map((srv) => {
          const Icon = srv.icon;
          const isSelected = activeService === srv.id;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                setActiveService(srv.id);
                navigate(`/services/${srv.id}`);
              }}
              className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                isSelected
                  ? 'border-[#0B3B60] bg-[#0B3B60] text-white shadow-md'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-[#43B02A]' : 'text-[#0B3B60]'}`} />
              <span className="text-xs font-bold">{srv.name}</span>
              <span className={`text-[10px] truncate max-w-full ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                {srv.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Calculator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Options (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5 sm:space-y-6">
          {/* PROMINENT USER INPUT RATE CARD FOR THE ACTIVE JOB */}
          <div className="p-4 rounded-xl bg-[#0B3B60]/5 border border-[#0B3B60]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-[#0B3B60] block">
                User-Defined Rate for this Job
              </span>
              <p className="text-xs text-slate-500">
                You can change the unit rate directly right now. It recalculates the quotation immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Unit Rate (LKR):</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={customUnitPrice}
                onChange={(e) => setCustomUnitPrice(Math.max(0, Number(e.target.value)))}
                className="w-28 px-3 py-1.5 bg-white border border-[#0B3B60]/30 rounded-lg text-sm font-bold text-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/20 text-right"
              />
            </div>
          </div>

          {/* PRINTING & PHOTOCOPY CONTROLS */}
          {(activeService === 'printing' || activeService === 'photocopy') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-2">
                    Color Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsColor(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        !isColor
                          ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      B&W (Monochrome)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsColor(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        isColor
                          ? 'bg-[#43B02A] text-white border-[#43B02A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Color Graphic
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-2">
                    Paper Size
                  </label>
                  <div className="flex gap-2">
                    {['A4', 'A3', 'Legal'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPaperSize(sz)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          paperSize === sz
                            ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Pages in File
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Copies / Sets Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDoubleSided}
                    onChange={(e) => setIsDoubleSided(e.target.checked)}
                    className="rounded text-[#43B02A] focus:ring-[#43B02A]"
                  />
                  <span>Double-Sided Duplex Print (10% Discount applied automatically)</span>
                </label>
              </div>
            </div>
          )}

          {/* SCANNING CONTROLS */}
          {activeService === 'scanning' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                High-speed automatic document feeder (ADF) scanning to PDF or high-res JPG. Transferred via USB flash drive or student email.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Pages to Scan
                </label>
                <input
                  type="number"
                  min="1"
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, Number(e.target.value)))}
                  className="w-full sm:w-60 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                />
              </div>
            </div>
          )}

          {/* LAMINATING CONTROLS */}
          {activeService === 'laminating' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-2">
                Select Lamination Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'ID', label: 'ID Card / Badge', key: 'lamiID' },
                  { id: 'A4', label: 'A4 Certificate / Sheet', key: 'lamiA4' },
                  { id: 'A3', label: 'A3 Poster / Map', key: 'lamiA3' },
                ].map((lami) => (
                  <button
                    key={lami.id}
                    type="button"
                    onClick={() => {
                      setLaminationSize(lami.id);
                      setCustomUnitPrice(rates[lami.key] || 100);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      laminationSize === lami.id
                        ? 'border-[#0B3B60] bg-[#0B3B60]/10 text-[#0B3B60] font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{lami.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Preset: LKR {rates[lami.key]}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Number of Items to Laminate
                </label>
                <input
                  type="number"
                  min="1"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  className="w-full sm:w-60 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                />
              </div>
            </div>
          )}

          {/* BINDING CONTROLS */}
          {activeService === 'binding' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-2">
                Select Binding Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'spiral', label: 'Plastic Spiral Binding', key: 'bindSpiral' },
                  { id: 'tape', label: 'Tape / Strip Binding', key: 'bindTape' },
                  { id: 'hardcover', label: 'Hardcover Thesis (Gold Foil)', key: 'bindHardcover' },
                ].map((bnd) => (
                  <button
                    key={bnd.id}
                    type="button"
                    onClick={() => {
                      setBindingStyle(bnd.id);
                      setCustomUnitPrice(rates[bnd.key] || 150);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      bindingStyle === bnd.id
                        ? 'border-[#0B3B60] bg-[#0B3B60]/10 text-[#0B3B60] font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{bnd.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Preset: LKR {rates[bnd.key]}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Number of Books / Documents to Bind
                </label>
                <input
                  type="number"
                  min="1"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  className="w-full sm:w-60 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60]/20 font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Live Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0B3B60] pb-2 border-b border-slate-100">
              Live Quotation
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Service</span>
                <span className="font-semibold text-slate-800 capitalize">{activeService}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Specification</span>
                <span className="font-semibold text-slate-800">
                  {activeService === 'laminating' ? `${laminationSize} Size` : activeService === 'binding' ? `${bindingStyle} Style` : `${paperSize} ${isColor ? 'Color' : 'B&W'}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unit Rate Used</span>
                <span className="font-bold text-[#0B3B60]">
                  LKR {Number(customUnitPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantity / Impressions</span>
                <span className="font-semibold text-slate-800">
                  {activeService === 'scanning' ? `${pageCount} scans` : activeService === 'laminating' || activeService === 'binding' ? `${copies} documents` : `${pageCount * copies} pages`}
                </span>
              </div>
              {isDoubleSided && (
                <div className="flex justify-between text-[#43B02A] font-semibold">
                  <span>Duplex Discount</span>
                  <span>-10%</span>
                </div>
              )}
            </div>

            <div className="bg-[#0B3B60]/5 p-4 rounded-xl border border-[#0B3B60]/10 text-center space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400">Total Calculated Amount</span>
              <p className="text-3xl font-black text-[#0B3B60]">
                LKR {totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToOrder}
              className="btn-primary w-full py-3 justify-center shadow-md text-sm font-semibold"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Send to POS Terminal</span>
            </button>

            <button
              onClick={() => {
                setPageCount(1);
                setCopies(1);
                setIsColor(false);
                setIsDoubleSided(false);
              }}
              className="btn-glass w-full justify-center text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Quantities</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
