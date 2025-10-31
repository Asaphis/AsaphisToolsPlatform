import express from 'express';
import sharp from 'sharp';
import { upload, cleanupFile } from '../middleware/upload.js';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import { PDFDocument } from 'pdf-lib';

const exec = promisify(_exec);
const router = express.Router();

// Utility function for image compression
async function compressImage(inputBuffer, options = {}) {
  const { quality = 75, format = 'jpg' } = options;
  
  const plugins = [
    imageminMozjpeg({ quality }),
    imageminPngquant({
      quality: [quality / 100, Math.min((quality + 10) / 100, 1)]
    })
  ];

  return imagemin.buffer(inputBuffer, {
    plugins: format === 'png' ? [plugins[1]] : [plugins[0]]
  });
}

// Check if Python script exists
const pythonScriptPath = path.join(process.cwd(), 'python', 'remove_bg.py');
const pythonExists = await fs.access(pythonScriptPath).then(() => true).catch(() => false);
if (!pythonExists) {
  console.warn('Warning: remove_bg.py not found at', pythonScriptPath);
}

// POST /api/v1/image/remove-background
router.post('/remove-background', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image required' });
    }

    if (!pythonExists) {
      return res.status(500).json({ success: false, error: 'Background removal service not available' });
    }

    const outputPath = req.file.path + '_nobg.png';
    await exec(`python "${pythonScriptPath}" "${req.file.path}" "${outputPath}"`);

    const outputBuffer = await fs.readFile(outputPath);
    await fs.unlink(outputPath);
    cleanupFile(req.file.path);

    res.setHeader('Content-Type', 'image/png');
    res.send(outputBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/image/compress
router.post('/compress', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image required' });
    }

    const quality = parseInt(req.body.quality || '75');
    const format = req.body.format || 'jpg';

    if (quality < 1 || quality > 100) {
      return res.status(400).json({ success: false, error: 'Quality must be between 1 and 100' });
    }

    const inputBuffer = await fs.readFile(req.file.path);
    const compressedBuffer = await compressImage(inputBuffer, { quality, format });
    
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', format === 'png' ? 'image/png' : 'image/jpeg');
    res.send(compressedBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/image/resize
router.post('/resize', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image required' });
    }

    const width = parseInt(req.body.width || '0');
    const height = parseInt(req.body.height || '0');
    const fit = req.body.fit || 'contain';

    if (width <= 0 && height <= 0) {
      return res.status(400).json({ success: false, error: 'Width or height must be specified' });
    }

    const resizedBuffer = await sharp(req.file.path)
      .resize({
        width: width || null,
        height: height || null,
        fit,
        withoutEnlargement: true
      })
      .toBuffer();

    cleanupFile(req.file.path);

    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(resizedBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/image/convert
router.post('/convert', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image required' });
    }

    const format = req.body.format?.toLowerCase();
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];

    if (!format || !allowedFormats.includes(format)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}` 
      });
    }

    const quality = parseInt(req.body.quality || '100');
    const image = sharp(req.file.path);
    
    // Convert to target format
    const convertedBuffer = await image[format]({ quality }).toBuffer();
    
    cleanupFile(req.file.path);

    res.setHeader('Content-Type', `image/${format}`);
    res.send(convertedBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

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
    const height = meta.height ? Math.round(meta.height * factor) : undefined;
    
    // Use Lanczos3 for better quality upscaling
    const buf = await sharp(req.file.path)
      .resize({
        width,
        height,
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false
      })
      .toBuffer();
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



// POST /api/v1/image/heic-convert - Convert HEIC to JPG/PNG
router.post('/heic-convert', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const format = req.body.format || 'jpeg';
    const quality = Math.max(1, Math.min(100, parseInt(req.body.quality || '90')));
    
    if (!['jpeg', 'jpg', 'png'].includes(format.toLowerCase())) {
      throw new Error('Format must be jpeg or png');
    }
    
    let pipeline = sharp(req.file.path);
    if (format === 'png') {
      pipeline = pipeline.png({ quality });
    } else {
      pipeline = pipeline.jpeg({ quality });
    }
    
    const buf = await pipeline.toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', `image/${format}`);
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});


// POST /api/v1/image/remove-metadata - Remove EXIF and other metadata
router.post('/remove-metadata', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    
    // Remove all metadata while preserving image data
    const buf = await sharp(req.file.path)
      .withMetadata(false)
      .toBuffer();
      
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { 
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/image/create-gif - Create GIF from multiple images
router.post('/create-gif', upload.array('images', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least 2 images are required'
      });
    }

    const delay = parseInt(req.body.delay || '100');
    const frames = [];
    
    // Process each image
    for (const file of req.files) {
      const frame = await sharp(file.path)
        .resize(800, 800, { fit: 'inside' })
        .toBuffer();
      frames.push(frame);
      cleanupFile(file.path);
    }

    // Create animated GIF
    const buf = await sharp(frames[0], {
      animated: true,
      pages: frames.length
    })
    .gif({
      delay,
      loop: 0,
    })
    .toBuffer();

    res.setHeader('Content-Type', 'image/gif');
    res.send(buf);
  } catch (e) {
    if (req.files) {
      req.files.forEach(file => cleanupFile(file.path));
    }
    next(e);
  }
});

export default router;

// POST /api/v1/image/ai-upscale - AI upscale (fallback to sharp resize if no model available)
router.post('/ai-upscale', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const factor = Math.max(2, Math.min(8, parseInt(req.body.factor || '2')));
    // In the absence of an AI model, use sharp lanczos3 resize as a fallback
    const meta = await sharp(req.file.path).metadata();
    const width = meta.width ? Math.round(meta.width * factor) : undefined;
    const height = meta.height ? Math.round(meta.height * factor) : undefined;
    const buf = await sharp(req.file.path)
      .resize({ width, height, kernel: sharp.kernel.lanczos3, withoutEnlargement: false })
      .toBuffer();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', req.file.mimetype || 'image/png');
    res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/ai-enlarge - Image Enlarger (alias to ai-upscale)
router.post('/ai-enlarge', upload.single('image'), async (req, res, next) => {
  // Simple proxy to ai-upscale implementation
  req.url = '/ai-upscale';
  return router.handle(req, res, next);
});

// POST /api/v1/image/gif-to-apng - Convert GIF to APNG using ffmpeg
router.post('/gif-to-apng', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const input = req.file.path;
    const outPath = input + '.apng';
    try {
      await exec(`ffmpeg -y -i "${input}" -plays 0 "${outPath}"`);
      const buf = await fs.readFile(outPath);
      cleanupFile(input);
      cleanupFile(outPath);
      res.setHeader('Content-Type', 'image/apng');
      return res.send(buf);
    } catch (e) {
      cleanupFile(input);
      throw new Error('ffmpeg is required for GIF->APNG conversion');
    }
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/apng-to-gif - Convert APNG to GIF using ffmpeg
router.post('/apng-to-gif', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const input = req.file.path;
    const outPath = input + '.gif';
    try {
      await exec(`ffmpeg -y -i "${input}" "${outPath}"`);
      const buf = await fs.readFile(outPath);
      cleanupFile(input);
      cleanupFile(outPath);
      res.setHeader('Content-Type', 'image/gif');
      return res.send(buf);
    } catch (e) {
      cleanupFile(input);
      throw new Error('ffmpeg is required for APNG->GIF conversion');
    }
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/image/heic-to-pdf - Convert HEIC to PDF
router.post('/heic-to-pdf', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'image required' });
    const format = (req.body.format || 'pdf').toLowerCase();
    if (format !== 'pdf') return res.status(400).json({ success: false, error: 'Only pdf output supported' });

    // Convert HEIC to JPEG buffer via sharp
    const imageBuffer = await sharp(req.file.path).jpeg({ quality: 95 }).toBuffer();

    // Embed into PDF
    const pdfDoc = await PDFDocument.create();
    const img = await pdfDoc.embedJpg(imageBuffer);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    const out = await pdfDoc.save();

    cleanupFile(req.file.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});