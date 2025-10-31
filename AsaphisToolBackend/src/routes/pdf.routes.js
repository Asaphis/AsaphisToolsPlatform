import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, degrees, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import sharp from 'sharp';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '../../uploads');
const exec = promisify(_exec);

// Utility function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Utility function to ensure Ghostscript is installed
async function ensureGhostscript() {
  try {
    await exec('gs --version');
  } catch {
    throw new Error('Ghostscript not found. Please install Ghostscript.');
  }
}

// Utility function to convert PDF page to image
async function pdfPageToImage(pdfPath, pageNum, dpi = 300) {
  const outputPath = `${pdfPath}_page_${pageNum}.png`;
  await exec(`gs -dQUIET -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r${dpi} -dFirstPage=${pageNum} -dLastPage=${pageNum} -sOutputFile=${outputPath} ${pdfPath}`);
  return outputPath;
}

// Utility function to compress PDF using Ghostscript
async function compressPDF(inputPath, outputPath, quality = 'screen') {
  const qualitySettings = {
    screen: '-dPDFSETTINGS=/screen',    // Lower quality, smaller size (72 dpi)
    ebook: '-dPDFSETTINGS=/ebook',      // Better quality, good size (150 dpi)
    printer: '-dPDFSETTINGS=/printer',  // High quality (300 dpi)
    prepress: '-dPDFSETTINGS=/prepress' // Maximum quality (300 dpi, color preserving)
  };

  await exec(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH ${qualitySettings[quality]} -sOutputFile="${outputPath}" "${inputPath}"`);
}

// POST /api/v1/pdf/compress - Compress PDF file
router.post('/compress', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    await ensureGhostscript();
    
    const quality = req.body.quality || 'screen';
    const outputPath = `${req.file.path}_compressed.pdf`;
    
    await compressPDF(req.file.path, outputPath, quality);
    
    const compressedPDF = await fs.promises.readFile(outputPath);
    cleanupFile(req.file.path);
    cleanupFile(outputPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(compressedPDF);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/merge - merge multiple PDFs
router.post('/merge', upload.array('files', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 PDF files required' });
    }

    const mergedPdf = await PDFDocument.create();
    
    for (const file of req.files) {
      const pdfBytes = await fs.promises.readFile(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    
    // Cleanup uploaded files
    req.files.forEach(f => cleanupFile(f.path));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    return res.send(Buffer.from(mergedPdfBytes));
    req.files.forEach(file => cleanupFile(file.path));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(mergedPdfBytes);
  } catch (e) {
    if (req.files) {
      req.files.forEach(file => cleanupFile(file.path));
    }
    next(e);
  }
});

// POST /api/v1/pdf/extract-pages - Extract specific pages
router.post('/extract-pages', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    let pageRanges = req.body.pages;
    if (!pageRanges) {
      return res.status(400).json({ success: false, error: 'Page ranges required' });
    }

    // Parse page ranges (e.g., "1,3-5,7")
    const pageNumbers = new Set();
    pageRanges.split(',').forEach(range => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n));
        for (let i = start; i <= end; i++) {
          pageNumbers.add(i - 1); // Convert to 0-based index
        }
      } else {
        pageNumbers.add(parseInt(range) - 1);
      }
    });

    const pagesArray = Array.from(pageNumbers).sort((a, b) => a - b);
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Create new PDF with selected pages
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, pagesArray);
    pages.forEach(page => newPdf.addPage(page));
    
    const newPdfBytes = await newPdf.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="extracted_pages.pdf"');
    res.send(newPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/rotate - Rotate PDF pages
router.post('/rotate', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const angle = parseInt(req.body.angle || '90');
    const pages = req.body.pages;
    
    if (pages) {
      // Rotate specific pages
      const pageNumbers = pages.split(',').map(n => parseInt(n) - 1);
      pageNumbers.forEach(pageNum => {
        if (pageNum >= 0 && pageNum < pdfDoc.getPageCount()) {
          const page = pdfDoc.getPage(pageNum);
          page.setRotation(degrees(angle));
        }
      });
    } else {
      // Rotate all pages
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        page.setRotation(degrees(angle));
      }
    }
    
    const rotatedPdfBytes = await pdfDoc.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(rotatedPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/protect - Add password protection to PDF
router.post('/protect', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Encrypt the PDF
    await pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false
      }
    });
    
    const encryptedPdfBytes = await pdfDoc.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');
    res.send(encryptedPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/crop - Crop PDF pages
router.post('/crop', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const { top, right, bottom, left } = req.body;
    if (!top || !right || !bottom || !left) {
      return res.status(400).json({ success: false, error: 'Crop margins required (top, right, bottom, left)' });
    }

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Apply crop to each page
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Set crop box
      page.setCropBox(
        left,
        bottom,
        width - (left + right),
        height - (top + bottom)
      );
    }
    
    const croppedPdfBytes = await pdfDoc.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cropped.pdf"');
    res.send(croppedPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/organize - Reorder pages in PDF
router.post('/organize', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const pageOrder = req.body.order;
    if (!pageOrder) {
      return res.status(400).json({ success: false, error: 'Page order required' });
    }

    const orderArray = pageOrder.split(',').map(n => parseInt(n) - 1); // Convert to 0-based indices
    
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Create new PDF with reordered pages
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, orderArray);
    pages.forEach(page => newPdf.addPage(page));
    
    const reorderedPdfBytes = await newPdf.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reordered.pdf"');
    res.send(reorderedPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/remove-pages - Delete specific pages from PDF
router.post('/remove-pages', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const pagesToRemove = req.body.pages;
    if (!pagesToRemove) {
      return res.status(400).json({ success: false, error: 'Pages to remove required' });
    }

    const removeArray = pagesToRemove.split(',').map(n => parseInt(n) - 1);
    const removeSet = new Set(removeArray);
    
    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Create new PDF without specified pages
    const newPdf = await PDFDocument.create();
    const indices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i)
      .filter(i => !removeSet.has(i));
    
    const pages = await newPdf.copyPages(pdfDoc, indices);
    pages.forEach(page => newPdf.addPage(page));
    
    const modifiedPdfBytes = await newPdf.save();
    cleanupFile(req.file.path);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="modified.pdf"');
    res.send(modifiedPdfBytes);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

export default router;

// POST /api/v1/pdf/split - Split PDF into individual pages
router.post('/split', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    
    const outputPath = req.file.path + '_split';
    await fs.promises.mkdir(outputPath, { recursive: true });
    
    // Split into individual PDFs
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);
      
      const pagePdfBytes = await newPdf.save();
      await fs.promises.writeFile(
        path.join(outputPath, `page_${i + 1}.pdf`),
        pagePdfBytes
      );
    }

    // Create ZIP file containing all split PDFs
    const archiver = require('archiver');
    const zipPath = req.file.path + '_split.zip';
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory(outputPath, false);
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    const zipBuffer = await fs.promises.readFile(zipPath);
    
    // Cleanup
    cleanupFile(req.file.path);
    await fs.promises.rm(outputPath, { recursive: true });
    cleanupFile(zipPath);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="split_pages.zip"');
    res.send(zipBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/pdf/to-images - Convert PDF pages to images
router.post('/to-images', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file required' });
    }

    await ensureGhostscript();

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    const dpi = parseInt(req.body.dpi || '300');
    const format = (req.body.format || 'jpeg').toLowerCase();
    
    const outputDir = req.file.path + '_images';
    await fs.promises.mkdir(outputDir, { recursive: true });
    
    // Convert each page to image
    for (let i = 1; i <= pageCount; i++) {
      const pngPath = await pdfPageToImage(req.file.path, i, dpi);
      
      // Convert to requested format if not PNG
      if (format !== 'png') {
        const imageBuffer = await sharp(pngPath)
          [format]({ quality: 90 })
          .toBuffer();
        await fs.promises.writeFile(
          path.join(outputDir, `page_${i}.${format}`),
          imageBuffer
        );
        cleanupFile(pngPath);
      } else {
        await fs.promises.rename(
          pngPath,
          path.join(outputDir, `page_${i}.png`)
        );
      }
    }

    // Create ZIP with all images
    const archiver = require('archiver');
    const zipPath = req.file.path + '_images.zip';
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory(outputDir, false);
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    const zipBuffer = await fs.promises.readFile(zipPath);
    
    // Cleanup
    cleanupFile(req.file.path);
    await fs.promises.rm(outputDir, { recursive: true });
    cleanupFile(zipPath);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="pdf_images.zip"');
    res.send(zipBuffer);
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});




// POST /api/v1/pdf/unlock - remove password protection
router.post('/unlock', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });
    if (!req.body.password) return res.status(400).json({ success: false, error: 'Current password required' });
    
    const bytes = fs.readFileSync(req.file.path);
    const pdf = await PDFDocument.load(bytes, { password: req.body.password });
    
    // Save without password
    const out = await pdf.save();
    
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="unlocked.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) { next(e); }
});


// POST /api/v1/pdf/extract-images - extract images from PDF
router.post('/extract-images', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });
    
    const outDir = path.join(tmpDir, 'pdf-images-' + Date.now());
    fs.mkdirSync(outDir, { recursive: true });
    
    // Use pdfimages (from poppler-utils) to extract images if available
    try {
      const cmd = `pdfimages -all "${req.file.path}" "${path.join(outDir, 'img')}"`;
      await exec(cmd);
      
      // Create ZIP archive of extracted images
      const outZip = path.join(tmpDir, 'images.zip');
      const zip = require('archiver')('zip');
      const output = fs.createWriteStream(outZip);
      
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
        zip.pipe(output);
        zip.directory(outDir, false);
        zip.finalize();
      });
      
      const buf = fs.readFileSync(outZip);
      cleanupFile(req.file.path);
      fs.rmSync(outDir, { recursive: true, force: true });
      cleanupFile(outZip);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');
      return res.send(buf);
    } catch(error) {
      // If pdfimages is not available, return an error
      fs.rmSync(outDir, { recursive: true, force: true });
      throw new Error('PDF image extraction requires poppler-utils to be installed');
    }
  } catch (e) { next(e); }
});



// POST /api/v1/pdf/flatten - Flatten form fields (make non-editable)
router.post('/flatten', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const bytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(bytes);

    try {
      const form = pdfDoc.getForm();
      if (form) form.flatten();
    } catch (e) {
      // Not all PDFs have forms; ignore
    }

    const out = await pdfDoc.save();
    cleanupFile(req.file.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="flattened.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/pdf/resize - Resize PDF pages by rasterizing each page and rebuilding
router.post('/resize', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'PDF file required' });

    // target width/height in pixels (or provide scale)
    const targetWidth = parseInt(req.body.width || '0');
    const targetHeight = parseInt(req.body.height || '0');
    const scale = parseFloat(req.body.scale || '0');
    const dpi = parseInt(req.body.dpi || '150');

    if (!targetWidth && !targetHeight && !scale) {
      return res.status(400).json({ success: false, error: 'width/height or scale required' });
    }

    await ensureGhostscript();

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    const outputDir = req.file.path + '_resized';
    await fs.promises.mkdir(outputDir, { recursive: true });

    const images = [];
    for (let i = 1; i <= pageCount; i++) {
      const pngPath = await pdfPageToImage(req.file.path, i, dpi);
      // compute resize dimensions
      let img = sharp(pngPath);
      const meta = await img.metadata();
      let w = meta.width || 0;
      let h = meta.height || 0;
      if (scale && scale > 0) {
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      } else {
        if (targetWidth && targetHeight) {
          w = targetWidth; h = targetHeight;
        } else if (targetWidth) {
          w = targetWidth; h = Math.round((meta.height || 1) * (targetWidth / (meta.width || 1)));
        } else if (targetHeight) {
          h = targetHeight; w = Math.round((meta.width || 1) * (targetHeight / (meta.height || 1)));
        }
      }
      const outBuffer = await img.resize(w, h, { fit: 'contain' }).png().toBuffer();
      const outPath = path.join(outputDir, `page_${i}.png`);
      await fs.promises.writeFile(outPath, outBuffer);
      images.push(outPath);
      cleanupFile(pngPath);
    }

    // Build new PDF from images
    const outPdf = await PDFDocument.create();
    for (const imgPath of images) {
      const imgBytes = await fs.promises.readFile(imgPath);
      const imgObj = await outPdf.embedPng(imgBytes);
      const page = outPdf.addPage([imgObj.width, imgObj.height]);
      page.drawImage(imgObj, { x: 0, y: 0, width: imgObj.width, height: imgObj.height });
    }

    const out = await outPdf.save();
    // cleanup
    cleanupFile(req.file.path);
    for (const p of images) await fs.promises.rm(p, { force: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resized.pdf"');
    return res.send(Buffer.from(out));
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});