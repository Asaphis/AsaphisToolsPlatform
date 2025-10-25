import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '../../uploads');

// POST /api/v1/pdf/merge - merge multiple PDFs
router.post('/merge', upload.array('files[]', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 PDF files required' });
    }
    const mergedPdf = await PDFDocument.create();
    for (const f of req.files) {
      const bytes = fs.readFileSync(f.path);
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }
    const out = await mergedPdf.save();
    // cleanup
    req.files.forEach(f => cleanupFile(f.path));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/pdf/split - split pages using ranges (e.g., "1-3,5,7-8")
router.post('/split', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });
    const ranges = (req.body.ranges || '').toString();
    const bytes = fs.readFileSync(req.file.path);
    const srcPdf = await PDFDocument.load(bytes);

    // parse ranges into zero-based indices
    const pageCount = srcPdf.getPageCount();
    const indices = new Set();
    ranges.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
      if (/^\d+$/.test(part)) {
        const p = Math.min(Math.max(parseInt(part, 10), 1), pageCount) - 1;
        indices.add(p);
      } else if (/^\d+-\d+$/.test(part)) {
        const [a, b] = part.split('-').map(n => parseInt(n, 10));
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= pageCount) indices.add(i - 1);
        }
      }
    });
    const picks = Array.from(indices).sort((a, b) => a - b);
    if (!picks.length) return res.status(400).json({ success: false, error: 'No valid page ranges' });

    const outPdf = await PDFDocument.create();
    const copied = await outPdf.copyPages(srcPdf, picks);
    copied.forEach(p => outPdf.addPage(p));
    const out = await outPdf.save();

    cleanupFile(req.file.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="split.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) { next(e); }
});

export default router;