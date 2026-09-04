import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  Filter,
  Package,
  Boxes,
  Cloud,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  DollarSign,
  Layers,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import saveAs from 'file-saver';
import { firestoreService } from '../services/firestoreService.js';

// Safe PDF creator helper that handles bundler variations
function createJsPDFInstance(options = {}) {
  const Cls = typeof jsPDF === 'function' ? jsPDF : (jsPDF?.default?.jsPDF || jsPDF?.default || window?.jspdf?.jsPDF);
  if (!Cls) {
    throw new Error('jsPDF library could not be initialized');
  }
  return new Cls(options);
}

// Safe autoTable executor
function applyAutoTable(doc, tableConfig) {
  const fn = typeof autoTable === 'function' ? autoTable : (autoTable?.default || window?.jspdf?.autoTable);
  if (typeof fn === 'function') {
    fn(doc, tableConfig);
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(tableConfig);
  } else {
    throw new Error('autoTable plugin could not be initialized');
  }
}

// Bulletproof file download trigger with guaranteed .pdf extension & MIME type across all browsers (including Microsoft Edge)
async function triggerPdfDownload(doc, filename) {
  let cleanName = (filename || 'StudentHub_Report.pdf').trim();
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  const dataUri = doc.output('datauristring');

  // 1. Primary Strategy: Server-backed real HTTP attachment stream
  // This completely resolves Microsoft Edge's localhost quirk where client-side blob/data URLs
  // are saved with raw internal UUIDs without the .pdf extension.
  try {
    const res = await fetch('/api/v1/reports/prepare-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64: dataUri, filename: cleanName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.downloadUrl) {
        // Trigger native browser download using the real HTTP attachment URL
        // Under RFC 6266, Microsoft Edge and Chrome strictly follow the server's Content-Disposition
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', cleanName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 2000);

        return { success: true, url: data.downloadUrl, filename: cleanName };
      }
    }
  } catch (err) {
    console.warn('[PDF] Server-assisted download failed, trying client fallback:', err);
  }

  // 2. Client-side fallback if backend server is unreachable
  try {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);
    return { success: true, url: dataUri, filename: cleanName };
  } catch (err2) {
    console.error('[PDF] Complete failure:', err2);
    throw err2;
  }
}

export default function ReportsPage() {
  const { reportType } = useParams();
  const navigate = useNavigate();

  // Allowed tabs: only Sales Report and Product Report
  const [activeReport, setActiveReport] = useState('sales');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadNotification, setDownloadNotification] = useState(null);

  // ==================== SALES REPORT FILTER STATES ====================
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', 'yesterday', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [timePreset, setTimePreset] = useState('all'); // 'all', 'morning', 'afternoon', 'evening', 'custom'
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [salesSearch, setSalesSearch] = useState('');

  // ==================== PRODUCT REPORT FILTER STATES ====================
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockAvailabilityFilter, setStockAvailabilityFilter] = useState('available'); // 'available', 'all', 'low-stock', 'out-of-stock'
  const [productSearch, setProductSearch] = useState('');

  // Sync active report from route param
  useEffect(() => {
    if (reportType === 'products') {
      setActiveReport('products');
    } else {
      setActiveReport('sales');
      if (reportType && reportType !== 'sales') {
        navigate('/reports/sales', { replace: true });
      }
    }
  }, [reportType, navigate]);

  // Load live data from Firestore
  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [sls, prods] = await Promise.all([
        firestoreService.getSales().catch(() => []),
        firestoreService.getProducts().catch(() => []),
      ]);
      setSales(sls);
      setProducts(prods);
    } catch (err) {
      console.error('[Firestore Error - getReports]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  // Tabs list: only Sales and Products
  const reportTabs = [
    { id: 'sales', label: 'Sales Report', path: '/reports/sales' },
    { id: 'products', label: 'Product Report', path: '/reports/products' },
  ];

  // Helper: Parse date and time from a sale record
  const parseSaleDateTime = (sale) => {
    let dateStr = '';
    let timeStr = '';

    if (sale.date && typeof sale.date === 'string') {
      const parts = sale.date.trim().split(/[ T]/);
      if (parts.length >= 1) dateStr = parts[0];
      if (parts.length >= 2) timeStr = parts[1].slice(0, 5);
    } else if (sale.createdAt) {
      let d;
      if (typeof sale.createdAt.toDate === 'function') {
        d = sale.createdAt.toDate();
      } else if (sale.createdAt.seconds) {
        d = new Date(sale.createdAt.seconds * 1000);
      } else {
        d = new Date(sale.createdAt);
      }
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 10);
        timeStr = d.toTimeString().slice(0, 5);
      }
    }

    return {
      date: dateStr || 'N/A',
      time: timeStr || '—',
      rawDate: dateStr,
      rawTime: timeStr,
    };
  };

  // Helper: Separate items into Products and Services
  const separateSaleItems = (items) => {
    const prods = [];
    const servs = [];

    if (Array.isArray(items)) {
      items.forEach((item) => {
        const isService =
          (item.id && String(item.id).startsWith('srv-')) ||
          item.category === 'Services' ||
          item.category === 'Printing & Photocopy' ||
          item.isService === true;

        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const skuInfo = Array.isArray(item.soldSkus) && item.soldSkus.length > 0
          ? ` [${item.soldSkus.join(', ')}]`
          : '';
        const formatted = `${item.name || 'Item'} (×${qty})${skuInfo}`;

        if (isService) {
          servs.push({
            name: item.name || 'Service',
            quantity: qty,
            price,
            formatted,
          });
        } else {
          prods.push({
            name: item.name || 'Product',
            quantity: qty,
            price,
            soldSkus: item.soldSkus || [],
            formatted,
          });
        }
      });
    }

    return { products: prods, services: servs };
  };

  // Filter Sales Records
  const filteredSales = useMemo(() => {
    // Current date in Sri Lanka Time
    const nowSL = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdaySL = yesterdayDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgoSL = sevenDaysAgoDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

    const currentMonthPrefix = nowSL.slice(0, 7); // "YYYY-MM"

    return sales.filter((sale) => {
      const dt = parseSaleDateTime(sale);

      // --- 1. Date Filter ---
      if (datePreset === 'today') {
        if (dt.rawDate !== nowSL) return false;
      } else if (datePreset === 'yesterday') {
        if (dt.rawDate !== yesterdaySL) return false;
      } else if (datePreset === 'week') {
        if (dt.rawDate < sevenDaysAgoSL || dt.rawDate > nowSL) return false;
      } else if (datePreset === 'month') {
        if (!dt.rawDate.startsWith(currentMonthPrefix)) return false;
      } else if (datePreset === 'custom') {
        if (startDate && dt.rawDate < startDate) return false;
        if (endDate && dt.rawDate > endDate) return false;
      }

      // --- 2. Time Filter ---
      if (timePreset === 'morning') {
        if (dt.rawTime < '06:00' || dt.rawTime >= '12:00') return false;
      } else if (timePreset === 'afternoon') {
        if (dt.rawTime < '12:00' || dt.rawTime >= '17:00') return false;
      } else if (timePreset === 'evening') {
        if (dt.rawTime < '17:00' || dt.rawTime > '23:59') return false;
      } else if (timePreset === 'custom') {
        if (startTime && dt.rawTime < startTime) return false;
        if (endTime && dt.rawTime > endTime) return false;
      }

      // --- 3. Search query ---
      if (salesSearch.trim()) {
        const query = salesSearch.toLowerCase();
        const invoiceMatch = String(sale.invoiceNo || '').toLowerCase().includes(query);
        const cashierMatch = String(sale.cashier || '').toLowerCase().includes(query);
        const customerMatch = String(sale.customer || '').toLowerCase().includes(query);
        const itemsMatch = Array.isArray(sale.items) && sale.items.some((i) =>
          String(i.name || '').toLowerCase().includes(query) ||
          (Array.isArray(i.soldSkus) && i.soldSkus.some((sku) => String(sku).toLowerCase().includes(query)))
        );
        if (!invoiceMatch && !cashierMatch && !customerMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort newest sales first
      const dateA = a.date || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toISOString() : '');
      const dateB = b.date || (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toISOString() : '');
      return String(dateB).localeCompare(String(dateA));
    });
  }, [sales, datePreset, startDate, endDate, timePreset, startTime, endTime, salesSearch]);

  // Sales KPIs
  const filteredSalesTotal = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  }, [filteredSales]);

  const filteredProductsSoldUnits = useMemo(() => {
    let units = 0;
    filteredSales.forEach((s) => {
      const { products: pList } = separateSaleItems(s.items);
      pList.forEach((p) => {
        units += p.quantity;
      });
    });
    return units;
  }, [filteredSales]);

  const filteredServicesCount = useMemo(() => {
    let count = 0;
    filteredSales.forEach((s) => {
      const { services: sList } = separateSaleItems(s.items);
      sList.forEach((srv) => {
        count += srv.quantity;
      });
    });
    return count;
  }, [filteredSales]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const stock = Number(prod.stock) || 0;

      // 1. Availability Filter
      if (stockAvailabilityFilter === 'available') {
        if (stock <= 0) return false;
      } else if (stockAvailabilityFilter === 'low-stock') {
        if (stock <= 0 || stock > 5) return false;
      } else if (stockAvailabilityFilter === 'out-of-stock') {
        if (stock > 0) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (String(prod.category || '').toLowerCase() !== String(categoryFilter).toLowerCase()) {
          return false;
        }
      }

      // 3. Search Filter
      if (productSearch.trim()) {
        const query = productSearch.toLowerCase();
        const nameMatch = String(prod.name || '').toLowerCase().includes(query);
        const skuMatch = String(prod.sku || '').toLowerCase().includes(query);
        const catMatch = String(prod.category || '').toLowerCase().includes(query);
        if (!nameMatch && !skuMatch && !catMatch) return false;
      }

      return true;
    }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [products, categoryFilter, stockAvailabilityFilter, productSearch]);

  // Unique product categories for filter dropdown
  const productCategories = useMemo(() => {
    const defaultCats = [
      'Books',
      'Stationery',
      'Snacks & Chocolates',
      'Drinks',
      'Ice Cream',
      'USB & Mobile Accessories',
    ];
    const fromProds = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...fromProds])).sort();
  }, [products]);

  // Products KPIs
  const totalStockUnits = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }, [filteredProducts]);

  const totalStockValue = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.sellingPrice) || 0)), 0);
  }, [filteredProducts]);

  // ==================== PDF DOWNLOAD HANDLERS ====================
  const downloadSalesPDF = async () => {
    setDownloadingPdf(true);
    try {
      const doc = createJsPDFInstance({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      // Official Header Banner
      doc.setFillColor(11, 59, 96); // #0B3B60 Brand Navy Blue
      doc.rect(0, 0, doc.internal.pageSize.width, 68, 'F');

      // Accent line
      doc.setFillColor(67, 176, 42); // #43B02A Brand Green
      doc.rect(0, 68, doc.internal.pageSize.width, 3, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT HUB — SMART CLOUD POS', 30, 32);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(67, 176, 42);
      doc.text('OFFICIAL SALES AUDIT REPORT', 30, 48);

      // Right-aligned Metadata
      doc.setFontSize(9);
      doc.setTextColor(220, 230, 242);
      const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
      doc.text(`Generated: ${nowStr} (SL Time)`, doc.internal.pageSize.width - 30, 28, { align: 'right' });
      doc.text(
        `Filter: Date [${datePreset.toUpperCase()}] • Time [${timePreset.toUpperCase()}] • Records: ${filteredSales.length}`,
        doc.internal.pageSize.width - 30,
        44,
        { align: 'right' }
      );

      // Table Data preparation
      const tableData = filteredSales.map((s, idx) => {
        const dt = parseSaleDateTime(s);
        const { products: pList, services: sList } = separateSaleItems(s.items);
        const prodStr = pList.length > 0 ? pList.map((p) => p.formatted).join('\n') : '—';
        const srvStr = sList.length > 0 ? sList.map((srv) => srv.formatted).join('\n') : '—';
        const amountStr = `LKR ${Number(s.total || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        return [
          idx + 1,
          dt.date,
          dt.time,
          s.invoiceNo || 'INV-N/A',
          prodStr,
          srvStr,
          s.method || 'CASH',
          amountStr,
        ];
      });

      applyAutoTable(doc, {
        startY: 85,
        head: [['#', 'Date', 'Time', 'Invoice #', 'Products', 'Services', 'Payment', 'Amount (LKR)']],
        body: tableData,
        foot: [
          [
            '',
            '',
            '',
            'TOTAL AUDIT',
            `Total Orders: ${filteredSales.length}`,
            `Products: ${filteredProductsSoldUnits} | Services: ${filteredServicesCount}`,
            '',
            `LKR ${filteredSalesTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [11, 59, 96],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
        },
        footStyles: {
          fillColor: [240, 244, 248],
          textColor: [11, 59, 96],
          fontStyle: 'bold',
          fontSize: 9.5,
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 6,
          valign: 'top',
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 50 },
          3: { cellWidth: 85 },
          4: { cellWidth: 215 },
          5: { cellWidth: 165 },
          6: { cellWidth: 60, halign: 'center' },
          7: { cellWidth: 95, halign: 'right', fontStyle: 'bold' },
        },
        didDrawPage: () => {
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(str, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 15);
          doc.text(
            'Student Hub Campus Bookshop & Student Service Center — Confidential Financial Audit Record',
            30,
            doc.internal.pageSize.height - 15
          );
        },
      });

      const fileDate = new Date().toISOString().slice(0, 10);
      const filename = `StudentHub_Sales_Report_${fileDate}.pdf`;
      const result = await triggerPdfDownload(doc, filename);
      setDownloadNotification({
        filename,
        url: result.url,
        message: 'Sales Report PDF downloaded successfully!',
      });
      setTimeout(() => setDownloadNotification(null), 12000);
    } catch (err) {
      console.error('[PDF Export Error]:', err);
      alert('Error generating Sales PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadProductPDF = async () => {
    setDownloadingPdf(true);
    try {
      const doc = createJsPDFInstance({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      // Official Header Banner
      doc.setFillColor(11, 59, 96);
      doc.rect(0, 0, doc.internal.pageSize.width, 68, 'F');

      // Accent line
      doc.setFillColor(67, 176, 42);
      doc.rect(0, 68, doc.internal.pageSize.width, 3, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT HUB — SMART CLOUD POS', 30, 32);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(67, 176, 42);
      doc.text('PRODUCT INVENTORY & STOCK AUDIT REPORT', 30, 48);

      // Metadata
      doc.setFontSize(9);
      doc.setTextColor(220, 230, 242);
      const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
      doc.text(`Generated: ${nowStr} (SL Time)`, doc.internal.pageSize.width - 30, 28, { align: 'right' });
      doc.text(
        `Category: [${categoryFilter.toUpperCase()}] • Stock: [${stockAvailabilityFilter.toUpperCase()}] • Items: ${filteredProducts.length}`,
        doc.internal.pageSize.width - 30,
        44,
        { align: 'right' }
      );

      const tableData = filteredProducts.map((p, idx) => {
        const cost = Number(p.costPrice || 0);
        const price = Number(p.sellingPrice || 0);
        const stock = Number(p.stock || 0);
        const val = stock * price;
        const status = stock > 5 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';

        return [
          idx + 1,
          p.name || 'Unnamed Product',
          p.category || 'General',
          p.sku || 'SKU-N/A',
          `LKR ${cost.toFixed(2)}`,
          `LKR ${price.toFixed(2)}`,
          `${stock} units`,
          status,
          `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ];
      });

      applyAutoTable(doc, {
        startY: 85,
        head: [['#', 'Product Name', 'Category', 'SKU', 'Cost (LKR)', 'Price (LKR)', 'Stock', 'Status', 'Total Value (LKR)']],
        body: tableData,
        foot: [
          [
            '',
            'TOTAL INVENTORY',
            `Products: ${filteredProducts.length}`,
            '',
            '',
            '',
            `Total: ${totalStockUnits} units`,
            '',
            `LKR ${totalStockValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [11, 59, 96],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
        },
        footStyles: {
          fillColor: [240, 244, 248],
          textColor: [11, 59, 96],
          fontStyle: 'bold',
          fontSize: 9.5,
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 6,
          valign: 'middle',
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 170 },
          2: { cellWidth: 95 },
          3: { cellWidth: 75 },
          4: { cellWidth: 65, halign: 'right' },
          5: { cellWidth: 65, halign: 'right' },
          6: { cellWidth: 65, halign: 'center' },
          7: { cellWidth: 70, halign: 'center' },
          8: { cellWidth: 95, halign: 'right', fontStyle: 'bold' },
        },
        didDrawPage: () => {
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(str, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 15);
          doc.text(
            'Student Hub Campus Bookshop & Student Service Center — Confidential Stock Inventory Record',
            30,
            doc.internal.pageSize.height - 15
          );
        },
      });

      const fileDate = new Date().toISOString().slice(0, 10);
      const filename = `StudentHub_Product_Report_${fileDate}.pdf`;
      const result = await triggerPdfDownload(doc, filename);
      setDownloadNotification({
        filename,
        url: result.url,
        message: 'Product Report PDF downloaded successfully!',
      });
      setTimeout(() => setDownloadNotification(null), 12000);
    } catch (err) {
      console.error('[PDF Export Error]:', err);
      alert('Error generating Product PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3B60] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-[#43B02A]" />
            <span>Official Business Intelligence & Audits</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B3B60]">
            {activeReport === 'sales' ? 'Sales Audit & Performance Report' : 'Product Inventory & Availability Report'}
          </h1>
          <p className="text-sm text-slate-500">
            {activeReport === 'sales'
              ? 'Itemized transaction records with detailed products, student services, and date-time auditing.'
              : 'Real-time stock catalog showing available merchandise, department categories, and asset valuations.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadReportsData}
            disabled={loading}
            className="btn-glass text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Refresh Firestore records"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#43B02A] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>

          {activeReport === 'sales' ? (
            <button
              id="download-sales-pdf-btn"
              onClick={downloadSalesPDF}
              disabled={loading || filteredSales.length === 0 || downloadingPdf}
              className="bg-[#0B3B60] hover:bg-[#082d49] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 text-[#43B02A] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#43B02A]" />
              )}
              <span>{downloadingPdf ? 'Preparing PDF...' : 'Download Sales PDF'}</span>
            </button>
          ) : (
            <button
              id="download-products-pdf-btn"
              onClick={downloadProductPDF}
              disabled={loading || filteredProducts.length === 0 || downloadingPdf}
              className="bg-[#0B3B60] hover:bg-[#082d49] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 text-[#43B02A] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#43B02A]" />
              )}
              <span>{downloadingPdf ? 'Preparing PDF...' : 'Download Products PDF'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-page Navigation Tabs: ONLY Sales Report and Product Report */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {reportTabs.map((tab) => {
          const isSelected = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReport(tab.id);
                navigate(tab.path);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.id === 'sales' ? <BarChart3 className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.id === 'sales' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {sales.length}
                </span>
              )}
              {tab.id === 'products' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#43B02A] text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {products.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SALES REPORT VIEW */}
      {/* ========================================================================= */}
      {activeReport === 'sales' && (
        <div className="space-y-5">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Filtered Revenue</span>
              <p className="text-xl font-black text-[#0B3B60] mt-1">
                LKR {filteredSalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Total gross earnings</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Sales Count</span>
              <p className="text-xl font-black text-slate-800 mt-1">{filteredSales.length} Orders</p>
              <span className="text-[11px] text-[#43B02A] font-semibold mt-1 inline-block">Matches active filters</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Products Sold</span>
              <p className="text-xl font-black text-[#0B3B60] mt-1">{filteredProductsSoldUnits} Units</p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Physical retail items</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Services Done</span>
              <p className="text-xl font-black text-[#43B02A] mt-1">{filteredServicesCount} Jobs</p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Print, Copy, Laminate, etc.</span>
            </div>
          </div>

          {/* Filter Bar with Date & Time Controls */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B60]">
                <Filter className="w-4 h-4 text-[#43B02A]" />
                <span>Sales Filter Console (Date & Time Controls)</span>
              </div>

              {/* Reset Filters button */}
              {(datePreset !== 'all' || timePreset !== 'all' || salesSearch || startDate || endDate || startTime || endTime) && (
                <button
                  onClick={() => {
                    setDatePreset('all');
                    setStartDate('');
                    setEndDate('');
                    setTimePreset('all');
                    setStartTime('');
                    setEndTime('');
                    setSalesSearch('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start lg:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Date and Time Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* DATE FILTER CONTROLS */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-[#0B3B60]">
                  <Calendar className="w-3.5 h-3.5 text-[#43B02A]" />
                  <span>Filter by Date</span>
                </div>

                {/* Date presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Dates' },
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: 'custom', label: 'Custom Range' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDatePreset(p.id)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        datePreset === p.id
                          ? 'bg-[#0B3B60] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Inputs */}
                {datePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TIME FILTER CONTROLS */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-[#0B3B60]">
                  <Clock className="w-3.5 h-3.5 text-[#43B02A]" />
                  <span>Filter by Time</span>
                </div>

                {/* Time presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Hours' },
                    { id: 'morning', label: 'Morning (06:00 - 12:00)' },
                    { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)' },
                    { id: 'evening', label: 'Evening (17:00+)' },
                    { id: 'custom', label: 'Custom' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimePreset(t.id)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        timePreset === t.id
                          ? 'bg-[#0B3B60] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom Time Range Inputs */}
                {timePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEARCH & QUICK ACTIONS */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#0B3B60] mb-1.5">
                    <Search className="w-3.5 h-3.5 text-[#43B02A]" />
                    <span>Search Sales</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Invoice #, product name, cashier..."
                      value={salesSearch}
                      onChange={(e) => setSalesSearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B60]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Showing <span className="font-bold text-[#0B3B60]">{filteredSales.length}</span> of {sales.length} transactions
                  </span>
                  <button
                    onClick={downloadSalesPDF}
                    disabled={filteredSales.length === 0 || downloadingPdf}
                    className="bg-[#43B02A] hover:bg-[#389423] text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingPdf ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMIZED SALES TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B3B60]" />
                <h2 className="text-sm font-bold text-[#0B3B60]">
                  Itemized Sales Audit Records
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredSales.length} records matching criteria
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
                <p className="text-xs font-semibold">Loading live sales audit from Cloud Firestore...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <BarChart3 className="w-12 h-12 mx-auto opacity-30 text-slate-500" />
                <p className="text-base font-bold text-slate-700">No Sales Records Found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No transactions match the selected date/time filters or search keywords. Try adjusting your filter parameters above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0B3B60] text-white uppercase text-[11px] tracking-wider">
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Time</th>
                      <th className="px-4 py-3.5">Invoice #</th>
                      <th className="px-4 py-3.5">Products</th>
                      <th className="px-4 py-3.5">Services</th>
                      <th className="px-4 py-3.5 text-center">Payment</th>
                      <th className="px-4 py-3.5 text-right">Amount (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSales.map((sale, idx) => {
                      const dt = parseSaleDateTime(sale);
                      const { products: pList, services: sList } = separateSaleItems(sale.items);

                      return (
                        <tr key={sale.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          {/* Date */}
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dt.date}</span>
                            </div>
                          </td>

                          {/* Time */}
                          <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dt.time}</span>
                            </div>
                          </td>

                          {/* Invoice # */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-[#0B3B60] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {sale.invoiceNo || 'INV-N/A'}
                            </span>
                          </td>

                          {/* Products */}
                          <td className="px-4 py-3">
                            {pList.length === 0 ? (
                              <span className="text-slate-400 italic">—</span>
                            ) : (
                              <div className="space-y-1">
                                {pList.map((p, pIdx) => (
                                  <div key={pIdx} className="flex flex-wrap items-center gap-1 text-slate-800">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                      ×{p.quantity}
                                    </span>
                                    {Array.isArray(p.soldSkus) && p.soldSkus.length > 0 && (
                                      <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
                                        {p.soldSkus.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Services */}
                          <td className="px-4 py-3">
                            {sList.length === 0 ? (
                              <span className="text-slate-400 italic">—</span>
                            ) : (
                              <div className="space-y-1">
                                {sList.map((srv, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-1 text-slate-800">
                                    <Printer className="w-3 h-3 text-[#43B02A] shrink-0" />
                                    <span className="font-medium text-[#0B3B60]">{srv.name}</span>
                                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                                      ×{srv.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                              {sale.method || 'CASH'}
                            </span>
                          </td>

                          {/* Amount (LKR) */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className="font-black text-[#0B3B60] text-sm">
                              LKR {Number(sale.total || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Table Footer with Grand Total */}
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={3} className="px-4 py-3 uppercase tracking-wider text-[11px] text-[#0B3B60]">
                        Filtered Grand Total
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        Total Units: {filteredProductsSoldUnits}
                      </td>
                      <td className="px-4 py-3 text-[#43B02A]">
                        Total Jobs: {filteredServicesCount}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">
                        {filteredSales.length} orders
                      </td>
                      <td className="px-4 py-3 text-right text-base text-[#0B3B60] font-black">
                        LKR {filteredSalesTotal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCT REPORT VIEW */}
      {/* ========================================================================= */}
      {activeReport === 'products' && (
        <div className="space-y-5">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Filtered Products</span>
              <p className="text-xl font-black text-[#0B3B60] mt-1">{filteredProducts.length} Items</p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Catalog product lines</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Available Stock</span>
              <p className="text-xl font-black text-[#43B02A] mt-1">{totalStockUnits} Units</p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Units currently on shelves</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Inventory Retail Value</span>
              <p className="text-xl font-black text-[#0B3B60] mt-1">
                LKR {totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Based on selling price</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Selected Category</span>
              <p className="text-base font-black text-slate-800 mt-1 truncate">
                {categoryFilter === 'all' ? 'All Departments' : categoryFilter}
              </p>
              <span className="text-[11px] text-[#43B02A] font-semibold mt-1 inline-block capitalize">
                Status: {stockAvailabilityFilter.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Filter Bar with Category & Stock Availability Controls */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B60]">
                <Filter className="w-4 h-4 text-[#43B02A]" />
                <span>Product Report Filter Console</span>
              </div>

              {/* Reset Filters button */}
              {(categoryFilter !== 'all' || stockAvailabilityFilter !== 'available' || productSearch) && (
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setStockAvailabilityFilter('available');
                    setProductSearch('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start lg:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* CATEGORY SELECTOR */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0B3B60] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#43B02A]" />
                  <span>Select Product Category</span>
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B60] cursor-pointer"
                >
                  <option value="all">All Categories (Book, Stationery, Snacks, etc.)</option>
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* STOCK AVAILABILITY SELECTOR */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0B3B60] flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#43B02A]" />
                  <span>Stock Availability</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'available', label: 'Available Now' },
                    { id: 'all', label: 'All Products' },
                    { id: 'low-stock', label: 'Low Stock (<=5)' },
                    { id: 'out-of-stock', label: 'Out of Stock (0)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setStockAvailabilityFilter(opt.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        stockAvailabilityFilter === opt.id
                          ? 'bg-[#0B3B60] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEARCH & DOWNLOAD BUTTON */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0B3B60] flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#43B02A]" />
                  <span>Search Product / SKU</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Product name, SKU code..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B60]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                  <button
                    id="download-products-export-btn"
                    onClick={downloadProductPDF}
                    disabled={filteredProducts.length === 0 || downloadingPdf}
                    className="bg-[#43B02A] hover:bg-[#389423] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT INVENTORY TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0B3B60]" />
                <h2 className="text-sm font-bold text-[#0B3B60]">
                  Available Products Catalog & Stock Valuation
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredProducts.length} items listed
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Loader2 className="w-8 h-8 text-[#43B02A] animate-spin" />
                <p className="text-xs font-semibold">Auditing Firestore product catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <Package className="w-12 h-12 mx-auto opacity-30 text-slate-500" />
                <p className="text-base font-bold text-slate-700">No Products Found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No products match the selected category '{categoryFilter}' or availability filter. Try selecting 'All Products' or 'All Categories'.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0B3B60] text-white uppercase text-[11px] tracking-wider">
                      <th className="px-4 py-3.5">Product Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">SKU / Code</th>
                      <th className="px-4 py-3.5 text-right">Cost Price</th>
                      <th className="px-4 py-3.5 text-right">Selling Price</th>
                      <th className="px-4 py-3.5 text-center">Available Stock</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-right">Total Value (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((prod, idx) => {
                      const cost = Number(prod.costPrice || 0);
                      const price = Number(prod.sellingPrice || 0);
                      const stock = Number(prod.stock || 0);
                      const val = stock * price;

                      return (
                        <tr key={prod.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          {/* Product Name */}
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            <div>{prod.name || 'Unnamed Product'}</div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="bg-slate-100 text-[#0B3B60] font-semibold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                              {prod.category || 'General'}
                            </span>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                            {prod.sku || 'SKU-N/A'}
                          </td>

                          {/* Cost Price */}
                          <td className="px-4 py-3 text-right text-slate-500 font-mono">
                            LKR {cost.toFixed(2)}
                          </td>

                          {/* Selling Price */}
                          <td className="px-4 py-3 text-right font-bold text-[#0B3B60] font-mono">
                            LKR {price.toFixed(2)}
                          </td>

                          {/* Available Stock */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[11px] ${
                              stock > 5
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : stock > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {stock} units
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {stock > 5 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                In Stock
                              </span>
                            ) : stock > 0 ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[10px]">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[10px]">
                                <XCircle className="w-3 h-3" />
                                Out of Stock
                              </span>
                            )}
                          </td>

                          {/* Total Value */}
                          <td className="px-4 py-3 text-right font-black text-[#0B3B60] whitespace-nowrap">
                            LKR {val.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Table Footer with Totals */}
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={3} className="px-4 py-3 uppercase tracking-wider text-[11px] text-[#0B3B60]">
                        Total Inventory Valuation
                      </td>
                      <td colSpan={2} className="px-4 py-3 text-slate-500 text-right">
                        {filteredProducts.length} product lines
                      </td>
                      <td className="px-4 py-3 text-center text-[#43B02A] font-black">
                        {totalStockUnits} units
                      </td>
                      <td></td>
                      <td className="px-4 py-3 text-right text-base text-[#0B3B60] font-black">
                        LKR {totalStockValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Download Success Notification Toast */}
      {downloadNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3B60] text-white p-4 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-9 h-9 rounded-lg bg-[#43B02A] flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{downloadNotification.message}</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono truncate max-w-xs mt-0.5">
              {downloadNotification.filename}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px]">
              <a
                href={downloadNotification.url}
                download={downloadNotification.filename}
                className="text-[#43B02A] hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Save PDF</span>
              </a>
              <span className="text-white/30">•</span>
              <a
                href={downloadNotification.url ? `${downloadNotification.url}${downloadNotification.url.includes('?') ? '&' : '?'}view=inline` : '#'}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 hover:text-cyan-200 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open & Print PDF</span>
              </a>
            </div>
          </div>
          <button
            onClick={() => setDownloadNotification(null)}
            className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
