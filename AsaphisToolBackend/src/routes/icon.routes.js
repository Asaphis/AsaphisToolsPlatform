import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const exec = promisify(_exec);
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '../../uploads');

// Function to create ICO file from PNG using ImageMagick
async function createIcoWithImageMagick(input, output, sizes = [16, 32, 48, 64, 128, 256]) {
  try {
    const sizeArgs = sizes.map(size => `${size}x${size}`).join(' ');
    await exec(`convert "${input}" -resize "${sizeArgs}" "${output}"`);
    return true;
  } catch {
    return false;
  }
}

// Function to create multi-size PNG files using Sharp
async function createMultiSizePNG(input, sizes = [16, 32, 48, 64, 128, 256]) {
  const results = [];
  for (const size of sizes) {
    const outPath = input + `-${size}.png`;
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    results.push(outPath);
  }
  return results;
}

// POST /api/v1/icon/to-ico - Convert PNG to ICO
router.post('/to-ico', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    
    // Convert input to PNG if not already
    const pngPath = req.file.path + '.png';
    await sharp(req.file.path)
      .png()
      .toFile(pngPath);
    
    const outPath = pngPath + '.ico';
    const sizes = [16, 32, 48, 64, 128, 256].filter(s => {
      if (req.body.sizes) {
        return req.body.sizes.split(',').map(Number).includes(s);
      }
      return true;
    });
    
    // Try ImageMagick first, fall back to single size if not available
    const success = await createIcoWithImageMagick(pngPath, outPath, sizes);
    if (!success) {
      // Fall back to creating a single size ICO using Sharp
      await sharp(pngPath)
        .resize(32, 32)
        .toFile(outPath);
    }
    
    const buf = fs.readFileSync(outPath);
    cleanupFile(req.file.path);
    cleanupFile(pngPath);
    cleanupFile(outPath);
    
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Content-Disposition', 'attachment; filename="icon.ico"');
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/icon/favicon - Generate complete favicon set
router.post('/favicon', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    
    // Convert input to PNG
    const pngPath = req.file.path + '.png';
    await sharp(req.file.path)
      .png()
      .toFile(pngPath);
    
    // Create various sizes needed for different devices
    const sizes = [16, 32, 48, 64, 128, 144, 152, 192, 256];
    const pngFiles = await createMultiSizePNG(pngPath, sizes);
    
    // Create ICO file
    const icoPath = pngPath + '.ico';
    await createIcoWithImageMagick(pngPath, icoPath, [16, 32, 48]);
    
    // Create ZIP with all files
    const outDir = path.join(tmpDir, 'favicon-' + Date.now());
    fs.mkdirSync(outDir, { recursive: true });
    
    // Copy files to output directory
    fs.copyFileSync(icoPath, path.join(outDir, 'favicon.ico'));
    pngFiles.forEach(file => {
      const size = path.basename(file, '.png').split('-').pop();
      fs.copyFileSync(file, path.join(outDir, `favicon-${size}.png`));
    });
    
    // Create ZIP archive
    const outZip = path.join(tmpDir, 'favicons.zip');
    const zip = require('archiver')('zip');
    const output = fs.createWriteStream(outZip);
    
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      zip.pipe(output);
      zip.directory(outDir, false);
      zip.finalize();
    });
    
    // Clean up
    cleanupFile(req.file.path);
    cleanupFile(pngPath);
    cleanupFile(icoPath);
    pngFiles.forEach(f => cleanupFile(f));
    fs.rmSync(outDir, { recursive: true, force: true });
    
    const buf = fs.readFileSync(outZip);
    cleanupFile(outZip);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="favicons.zip"');
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/icon/convert - Convert between icon formats
router.post('/convert', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Icon file required' });
    
    const format = req.body.format || 'png';
    const size = parseInt(req.body.size || '32');
    
    if (!['png', 'ico'].includes(format)) {
      return res.status(400).json({ success: false, error: 'Unsupported format' });
    }
    
    // Convert to PNG first
    const pngPath = req.file.path + '.png';
    await sharp(req.file.path)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    
    if (format === 'ico') {
      const icoPath = pngPath + '.ico';
      const success = await createIcoWithImageMagick(pngPath, icoPath, [size]);
      if (success) {
        const buf = fs.readFileSync(icoPath);
        cleanupFile(req.file.path);
        cleanupFile(pngPath);
        cleanupFile(icoPath);
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.ico"');
        return res.send(buf);
      }
    }
    
    // If ICO creation failed or PNG was requested
    const buf = fs.readFileSync(pngPath);
    cleanupFile(req.file.path);
    cleanupFile(pngPath);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.png"');
    return res.send(buf);
  } catch (e) { next(e); }
});

export default router;