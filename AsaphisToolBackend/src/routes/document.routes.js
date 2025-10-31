import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const exec = promisify(_exec);
const router = express.Router();

// Check if LibreOffice is installed
async function ensureLibreOffice() {
  try {
    await exec('soffice --version');
  } catch {
    throw new Error('LibreOffice not found. Please install LibreOffice and ensure it is in PATH.');
  }
}

// Check if Calibre is installed
async function ensureCalibre() {
  try {
    await exec('ebook-convert --version');
  } catch {
    throw new Error('Calibre not found. Please install Calibre and ensure ebook-convert is in PATH.');
  }
}

// POST /api/v1/document/to-pdf - Convert documents to PDF
router.post('/to-pdf', upload.single('file'), async (req, res, next) => {
  try {
    await ensureLibreOffice();
    if (!req.file) return res.status(400).json({ success: false, error: 'File required' });
    
    const outName = path.join(path.dirname(req.file.path), path.basename(req.file.path, path.extname(req.file.path)) + '.pdf');
    const cmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(outName)}" "${req.file.path}"`;
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/document/from-pdf - Convert PDF to other formats
router.post('/from-pdf', upload.single('file'), async (req, res, next) => {
  try {
    await ensureLibreOffice();
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });
    
    const format = req.body.format || 'docx';
    const supportedFormats = ['docx', 'doc', 'odt', 'rtf', 'txt'];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ success: false, error: 'Unsupported output format' });
    }
    
    const outName = path.join(path.dirname(req.file.path), path.basename(req.file.path, path.extname(req.file.path)) + '.' + format);
    const cmd = `soffice --headless --convert-to ${format} --outdir "${path.dirname(outName)}" "${req.file.path}"`;
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    const mimeTypes = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'odt': 'application/vnd.oasis.opendocument.text',
      'rtf': 'application/rtf',
      'txt': 'text/plain'
    };
    
    res.setHeader('Content-Type', mimeTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/document/ebook-convert - Convert between ebook formats
router.post('/ebook-convert', upload.single('file'), async (req, res, next) => {
  try {
    await ensureCalibre();
    if (!req.file) return res.status(400).json({ success: false, error: 'Ebook file required' });
    
    const format = req.body.format || 'epub';
    const supportedFormats = ['epub', 'mobi', 'azw3', 'fb2', 'htmlz', 'lit', 'lrf', 'pdb', 'pdf', 'pml', 'rb', 'snb', 'tcr', 'txt'];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ success: false, error: 'Unsupported output format' });
    }
    
    const outName = path.join(path.dirname(req.file.path), path.basename(req.file.path, path.extname(req.file.path)) + '.' + format);
    const cmd = `ebook-convert "${req.file.path}" "${outName}"`;
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    const mimeTypes = {
      'epub': 'application/epub+zip',
      'mobi': 'application/x-mobipocket-ebook',
      'pdf': 'application/pdf',
      'txt': 'text/plain'
    };
    
    res.setHeader('Content-Type', mimeTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/document/images-to-pdf - Convert images to PDF
router.post('/images-to-pdf', upload.array('files[]', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Image files required' });
    }
    
    const pdfDoc = await PDFDocument.create();
    
    for (const file of req.files) {
      const imageBytes = fs.readFileSync(file.path);
      let image;
      
      // Embed image based on type
      if (file.mimetype === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.mimetype === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        continue; // Skip unsupported formats
      }
      
      const page = pdfDoc.addPage([612, 792]); // US Letter size
      const { width, height } = page.getSize();
      const scale = Math.min(width / image.width, height / image.height);
      
      page.drawImage(image, {
        x: (width - image.width * scale) / 2,
        y: (height - image.height * scale) / 2,
        width: image.width * scale,
        height: image.height * scale
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    req.files.forEach(f => cleanupFile(f.path));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="images.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (e) { next(e); }
});

export default router;