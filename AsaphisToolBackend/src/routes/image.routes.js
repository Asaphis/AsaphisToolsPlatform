import express from 'express';
import sharp from 'sharp';
import { upload, cleanupFile } from '../middleware/upload.js';

const router = express.Router();

// POST /api/v1/image/crop  body: x,y,w,h
router.post('/crop', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const x = parseInt(req.body.x || '0');
    const y = parseInt(req.body.y || '0');
    const w = parseInt(req.body.w || '256');
    const h = parseInt(req.body.h || '256');
    const buf = await sharp(req.file.path).extract({ left: x, top: y, width: w, height: h }).toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/rotate  body: angle
router.post('/rotate', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const angle = parseInt(req.body.angle || '90');
    const buf = await sharp(req.file.path).rotate(angle).toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/flip  body: axis ('h'|'v')
router.post('/flip', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const axis = (req.body.axis || 'h').toLowerCase();
    let s = sharp(req.file.path);
    s = axis === 'v' ? s.flip() : s.flop();
    const buf = await s.toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/upscale  body: factor
router.post('/upscale', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const factor = Math.max(1, Math.min(4, parseInt(req.body.factor || '2')));
    const meta = await sharp(req.file.path).metadata();
    const width = meta.width ? Math.round(meta.width * factor) : undefined;
    const buf = await sharp(req.file.path).resize({ width, withoutEnlargement: false }).toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/watermark-remove - simple cleanup
router.post('/watermark-remove', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const buf = await sharp(req.file.path)
      .median(3)
      .blur(0.8)
      .sharpen()
      .toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

export default router;
