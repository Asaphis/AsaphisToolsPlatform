import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import potrace from 'potrace';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';

const exec = promisify(_exec);
const router = express.Router();

async function ensure7z() {
  try {
    await exec('7z -h');
    return true;
  } catch {
    return false;
  }
}

async function zipDirectory(dirPath, outZipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(dirPath, false);
    archive.finalize();
  });
}

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

// POST /api/v1/convert/archive - Zip files (create zip from uploaded files)
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

// POST /api/v1/convert/archive/extract - Extract any supported archive and return a ZIP of contents
router.post('/archive/extract', upload.single('archive'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'archive required' });
    const has7z = await ensure7z();
    if (!has7z) return res.status(503).json({ success: false, error: '7-Zip not available on server' });

    const outDir = req.file.path + '_extracted';
    await exec(`7z x "${req.file.path}" -o"${outDir}" -y`);

    const outZip = req.file.path + '_extracted.zip';
    await zipDirectory(outDir, outZip);

    const buf = fs.readFileSync(outZip);
    cleanupFile(req.file.path);
    fs.rmSync(outDir, { recursive: true, force: true });
    cleanupFile(outZip);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="extracted.zip"');
    return res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

// POST /api/v1/convert/archive/convert - Convert archive to another format (zip|7z|tar|tar.gz)
router.post('/archive/convert', upload.single('archive'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'archive required' });
    const target = (req.body.target || 'zip').toLowerCase();
    const allowed = ['zip','7z','tar','tar.gz'];
    if (!allowed.includes(target)) return res.status(400).json({ success: false, error: `Unsupported target. Allowed: ${allowed.join(', ')}` });

    const has7z = await ensure7z();
    if (!has7z && target !== 'zip') return res.status(503).json({ success: false, error: '7-Zip not available for non-zip formats' });

    const workDir = req.file.path + '_work';
    await exec(`7z x "${req.file.path}" -o"${workDir}" -y`);

    let outPath;
    if (target === 'zip') {
      outPath = req.file.path + '.zip';
      await zipDirectory(workDir, outPath);
    } else if (target === '7z') {
      outPath = req.file.path + '.7z';
      await exec(`7z a -t7z "${outPath}" "*"`, { cwd: workDir });
    } else if (target === 'tar') {
      outPath = req.file.path + '.tar';
      await exec(`tar -cf "${outPath}" -C "${workDir}" .`);
    } else if (target === 'tar.gz') {
      outPath = req.file.path + '.tar.gz';
      await exec(`tar -czf "${outPath}" -C "${workDir}" .`);
    }

    const buf = fs.readFileSync(outPath);
    cleanupFile(req.file.path);
    fs.rmSync(workDir, { recursive: true, force: true });
    cleanupFile(outPath);

    const contentType = target === '7z' ? 'application/x-7z-compressed' : (target.startsWith('tar') ? 'application/x-tar' : 'application/zip');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="converted.${target}"`);
    return res.send(buf);
  } catch (e) { if (req.file) cleanupFile(req.file.path); next(e); }
});

export default router;
