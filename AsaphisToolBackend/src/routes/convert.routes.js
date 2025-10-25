import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import potrace from 'potrace';

const router = express.Router();

// POST /api/v1/convert/svg - raster (PNG/JPG) to SVG using potrace
router.post('/svg', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const params = new potrace.Potrace();
    params.setParameter({ turdSize: 2, optTolerance: 0.4, color: 'black' });
    potrace.trace(req.file.path, params, (err, svg) => {
      cleanupFile(req.file.path);
      if (err) return next(err);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', 'attachment; filename="vectorized.svg"');
      res.send(svg);
    });
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/convert/archive - Zip files
router.post('/archive', upload.array('files[]', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, error: 'files required' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="archive.zip"');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => next(err));
    archive.pipe(res);
    for (const f of req.files) {
      archive.append(fs.createReadStream(f.path), { name: path.basename(f.originalname) });
    }
    archive.finalize();
    archive.on('end', () => {
      req.files.forEach(f => cleanupFile(f.path));
    });
  } catch (e) { if (req.files) req.files.forEach(f => cleanupFile(f.path)); next(e); }
});

export default router;
