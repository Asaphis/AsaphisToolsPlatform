import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const exec = promisify(_exec);
const router = express.Router();

function buildOutName(inputPath, suffix, ext) {
  const base = path.basename(inputPath, path.extname(inputPath));
  return `${base}${suffix ? '-' + suffix : ''}.${ext}`;
}

async function ensureFFmpeg() {
  try { await exec('ffmpeg -version'); } catch {
    throw new Error('ffmpeg not found on server. Please install ffmpeg and ensure it is in PATH.');
  }
}

// POST /api/v1/video/convert  (generic convert to target format)
router.post('/convert', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'video file required' });
    const format = (req.body.format || 'mp4').toLowerCase();
    const outName = buildOutName(req.file.path, 'converted', format);
    const cmd = `ffmpeg -y -i "${req.file.path}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -movflags faststart "${outName}"`;
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/video/trim  (start, duration in seconds)
router.post('/trim', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'video file required' });
    const start = parseFloat(req.body.start || '0');
    const duration = parseFloat(req.body.duration || '5');
    const outName = buildOutName(req.file.path, 'trim', 'mp4');
    const cmd = `ffmpeg -y -ss ${start} -i "${req.file.path}" -t ${duration} -c copy "${outName}"`;
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/video/crop  (w,h,x,y)
router.post('/crop', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'video file required' });
    const w = parseInt(req.body.w || '480');
    const h = parseInt(req.body.h || '480');
    const x = parseInt(req.body.x || '0');
    const y = parseInt(req.body.y || '0');
    const outName = buildOutName(req.file.path, 'crop', 'mp4');
    const cmd = `ffmpeg -y -i "${req.file.path}" -filter:v "crop=${w}:${h}:${x}:${y}" -c:a copy "${outName}"`;
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/gif/make  (from images or video)
router.post('/gif/make', upload.array('files[]', 50), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, error: 'files required' });
    // If one file and it is a video, create gif from video; else from images
    const first = req.files[0];
    const outName = buildOutName(first.path, 'animated', 'gif');
    if (first.mimetype.startsWith('video/')) {
      const cmd = `ffmpeg -y -i "${first.path}" -vf "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outName}"`;
      await exec(cmd);
    } else {
      // list inputs from images: assume order of files
      const listFile = first.path + '.txt';
      const content = req.files.map(f => `file '${f.path.replace(/'/g, "'\\''")}'`).join('\n');
      fs.writeFileSync(listFile, content);
      const cmd = `ffmpeg -y -f concat -safe 0 -i "${listFile}" -vf "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outName}"`;
      await exec(cmd);
      fs.unlinkSync(listFile);
    }
    const buf = fs.readFileSync(outName);
    req.files.forEach(f => cleanupFile(f.path));
    cleanupFile(outName);
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

export default router;