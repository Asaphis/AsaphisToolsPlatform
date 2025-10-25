import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { parse as csvParse } from 'csv-parse/sync';

const router = express.Router();

// POST /api/v1/utils/json - format/minify JSON
router.post('/json', async (req, res, next) => {
  try {
    const { json, minify } = req.body || {};
    if (typeof json !== 'string') return res.status(400).json({ success: false, error: 'json text required' });
    const obj = JSON.parse(json);
    const text = minify ? JSON.stringify(obj) : JSON.stringify(obj, null, 2);
    res.json({ success: true, text });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/utils/base64 - encode/decode
router.post('/base64', async (req, res, next) => {
  try {
    const { mode, data } = req.body || {};
    if (!data) return res.status(400).json({ success: false, error: 'data required' });
    let result;
    if (mode === 'decode') {
      result = Buffer.from(data, 'base64').toString('utf8');
    } else {
      result = Buffer.from(data, 'utf8').toString('base64');
    }
    res.json({ success: true, result });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/url - encode/decode URL
router.post('/url', async (req, res, next) => {
  try {
    const { mode, data } = req.body || {};
    if (typeof data !== 'string') return res.status(400).json({ success: false, error: 'data required' });
    const result = mode === 'decode' ? decodeURIComponent(data) : encodeURIComponent(data);
    res.json({ success: true, result });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/qrcode - generate QR code PNG data URL
router.post('/qrcode', async (req, res, next) => {
  try {
    const { data, options } = req.body || {};
    if (typeof data !== 'string' || !data.length) return res.status(400).json({ success: false, error: 'data required' });
    const image = await QRCode.toDataURL(data, options || { width: 256, margin: 1 });
    res.json({ success: true, image });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/password - generate password
router.post('/password', async (req, res, next) => {
  try {
    const { length = 16, upper = true, lower = true, number = true, symbol = false } = req.body || {};
    const sets = [
      upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      lower ? 'abcdefghijklmnopqrstuvwxyz' : '',
      number ? '0123456789' : '',
      symbol ? '!@#$%^&*()-_=+[]{};:,.?/\\' : '',
    ].join('');
    if (!sets) return res.status(400).json({ success: false, error: 'No character sets selected' });
    let pwd = '';
    for (let i = 0; i < Math.max(4, Math.min(512, length)); i++) {
      const idx = Math.floor(Math.random() * sets.length);
      pwd += sets[idx];
    }
    res.json({ success: true, password: pwd });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/password-strength - check strength
router.post('/password-strength', async (req, res, next) => {
  try {
    const { password } = req.body || {};
    if (typeof password !== 'string') return res.status(400).json({ success: false, error: 'password required' });
    // lazy import to reduce startup
    const zxcvbn = (await import('zxcvbn')).default;
    const result = zxcvbn(password);
    res.json({ success: true, result });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/word-counter - counts
router.post('/word-counter', async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (typeof text !== 'string') return res.status(400).json({ success: false, error: 'text required' });
    const chars = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    const sentences = (text.match(/[.!?]+\s|$/g) || []).length;
    const paragraphs = (text.split(/\n\s*\n/) || []).filter(x => x.trim()).length;
    res.json({ success: true, counts: { chars, words, sentences, paragraphs } });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/uuid - generate UUID(s)
router.post('/uuid', async (req, res, next) => {
  try {
    const { count = 1 } = req.body || {};
    const n = Math.max(1, Math.min(1000, parseInt(count)));
    const uuids = Array.from({ length: n }, () => uuidv4());
    res.json({ success: true, uuids });
  } catch (e) { next(e); }
});

// POST /api/v1/utils/csv-to-json - convert csv text
router.post('/csv-to-json', async (req, res, next) => {
  try {
    const { csv, delimiter = ',' } = req.body || {};
    if (typeof csv !== 'string') return res.status(400).json({ success: false, error: 'csv text required' });
    const records = csvParse(csv, { columns: true, skip_empty_lines: true, delimiter });
    res.json({ success: true, json: records });
  } catch (e) { next(e); }
});

export default router;