import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// In-memory cache for temporary prepared PDF downloads
const pdfCache = new Map();

// Periodic cleanup of PDF cache older than 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pdfCache.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) {
      pdfCache.delete(token);
    }
  }
}, 5 * 60 * 1000);

// GET /api/v1/reports
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  reportController.getReports
);

// POST /api/v1/reports/prepare-download
// Receives { pdfBase64, filename } and stores buffer in memory.
// Returns a real HTTP download URL ending in .pdf with Content-Disposition headers.
router.post('/prepare-download', (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'pdfBase64 string is required' });
    }

    let cleanName = (filename || 'StudentHub_Report.pdf').trim();
    if (!cleanName.toLowerCase().endsWith('.pdf')) {
      cleanName += '.pdf';
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const token = Math.random().toString(36).substring(2, 12) + '_' + Date.now();

    pdfCache.set(token, {
      buffer,
      filename: cleanName,
      createdAt: Date.now(),
    });

    const downloadUrl = `/api/v1/reports/download-file/${token}/${encodeURIComponent(cleanName)}`;
    return res.json({ success: true, token, downloadUrl, filename: cleanName });
  } catch (err) {
    console.error('[ReportRoutes] prepare-download error:', err);
    return res.status(500).json({ error: 'Failed to prepare PDF download' });
  }
});

// GET /api/v1/reports/download-file/:token/:filename?
// Delivers the PDF binary with strict Content-Disposition: attachment header
router.get('/download-file/:token/:filename?', (req, res) => {
  try {
    const { token } = req.params;
    const item = pdfCache.get(token);
    if (!item) {
      return res.status(404).send('PDF download link expired or not found. Please re-export from the Reports page.');
    }

    const isInline = req.query.view === 'inline' || req.query.inline === 'true';
    const dispositionType = isInline ? 'inline' : 'attachment';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${item.filename}"`);
    res.setHeader('Content-Length', item.buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.end(item.buffer);
  } catch (err) {
    console.error('[ReportRoutes] download-file error:', err);
    return res.status(500).send('Error delivering PDF file');
  }
});

// POST /api/v1/reports/download-pdf
// Direct stream endpoint
router.post('/download-pdf', (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'pdfBase64 string is required' });
    }

    let cleanName = (filename || 'StudentHub_Report.pdf').trim();
    if (!cleanName.toLowerCase().endsWith('.pdf')) {
      cleanName += '.pdf';
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.end(buffer);
  } catch (err) {
    console.error('[ReportRoutes] PDF download stream error:', err);
    return res.status(500).json({ error: 'Failed to process PDF stream' });
  }
});

export default router;
