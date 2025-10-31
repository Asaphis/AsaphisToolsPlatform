import express from 'express';
import { upload, cleanupFile } from '../middleware/upload.js';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { ApiError } from '../middleware/errorHandler.js';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

const exec = promisify(_exec);
const router = express.Router();

// Initialize ffmpeg paths
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function buildOutName(inputPath, suffix, ext) {
  const base = path.basename(inputPath, path.extname(inputPath));
  return `${base}${suffix ? '-' + suffix : ''}.${ext}`;
}

async function ensureFFmpeg() {
  try { await exec('ffmpeg -version'); } catch {
    // Throw a 503 ApiError so the global error handler returns a clear JSON response
    throw new ApiError(503, 'ffmpeg not found on server. Please install ffmpeg and ensure it is in PATH.');
  }
}

// Utility function for video to GIF conversion
async function videoToGif(inputPath, outputPath, options = {}) {
  const {
    fps = 10,
    width = 480,
    quality = 75
  } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .fps(fps)
      .size(`${width}x?`)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// POST /api/v1/video/to-mp3 - Extract audio from video as MP3
router.post('/to-mp3', upload.single('video'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });

    const outputPath = req.file.path + '.mp3';
    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .toFormat('mp3')
        .audioBitrate('192k')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const audioStream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    
    audioStream.pipe(res);
    audioStream.on('end', () => {
      cleanupFile(req.file.path);
      cleanupFile(outputPath);
    });
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/video/to-gif - Convert video to GIF
router.post('/to-gif', upload.single('video'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });

    const fps = parseInt(req.body.fps || '10');
    const width = parseInt(req.body.width || '480');
    const quality = parseInt(req.body.quality || '75');

    const outputPath = req.file.path + '.gif';
    await videoToGif(req.file.path, outputPath, { fps, width, quality });

    const gifStream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', 'attachment; filename="output.gif"');
    
    gifStream.pipe(res);
    gifStream.on('end', () => {
      cleanupFile(req.file.path);
      cleanupFile(outputPath);
    });
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/video/compress - Compress video
router.post('/compress', upload.single('video'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });

    const quality = parseInt(req.body.quality || '23'); // 23 is a good default CRF value
    const outputPath = req.file.path + '-compressed.mp4';

    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .videoCodec('libx264')
        .videoBitrate('1000k')
        .audioCodec('aac')
        .audioBitrate('128k')
        .outputOptions([`-crf ${quality}`])
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const videoStream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.mp4"');
    
    videoStream.pipe(res);
    videoStream.on('end', () => {
      cleanupFile(req.file.path);
      cleanupFile(outputPath);
    });
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
});

// POST /api/v1/video/convert  (generic convert to target format)
router.post('/convert', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'video file required' });
    
    // Ensure format is a string and has a default value
    const format = String(req.body.format || 'mp4').toLowerCase();
    const quality = parseInt(req.body.quality || '23');
    
    const allowedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported format. Allowed formats: ${allowedFormats.join(', ')}`
      });
    }

    const outputPath = req.file.path + '.' + format;
    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${quality}`])
        .toFormat(format)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const videoStream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', `video/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="output.${format}"`);
    
    videoStream.pipe(res);
    videoStream.on('end', () => {
      cleanupFile(req.file.path);
      cleanupFile(outputPath);
    });
  } catch (e) {
    if (req.file) cleanupFile(req.file.path);
    next(e);
  }
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


// POST /api/v1/video/extract-audio
router.post('/extract-audio', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'video file required' });
    
    const format = (req.body.format || 'mp3').toLowerCase();
    const quality = req.body.quality || '192k';
    const outName = buildOutName(req.file.path, 'audio', format);
    
    let cmd;
    switch(format) {
      case 'mp3':
        cmd = `ffmpeg -y -i "${req.file.path}" -vn -ar 44100 -ac 2 -b:a ${quality} "${outName}"`;
        break;
      case 'ogg':
        cmd = `ffmpeg -y -i "${req.file.path}" -vn -c:a libvorbis -q:a 4 "${outName}"`;
        break;
      case 'wav':
        cmd = `ffmpeg -y -i "${req.file.path}" -vn -acodec pcm_s16le -ar 44100 -ac 2 "${outName}"`;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unsupported audio format' });
    }
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    const contentTypes = {
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'wav': 'audio/wav'
    };
    
    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/audio/compress
router.post('/audio/compress', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'audio file required' });
    
    const quality = req.body.quality || 'medium';
    const format = path.extname(req.file.originalname).slice(1).toLowerCase() || 'mp3';
    const outName = buildOutName(req.file.path, 'compressed', format);
    
    let bitrate;
    switch(quality) {
      case 'low': bitrate = '96k'; break;
      case 'medium': bitrate = '128k'; break;
      case 'high': bitrate = '192k'; break;
      default: bitrate = '128k';
    }
    
    let cmd;
    switch(format) {
      case 'mp3':
        cmd = `ffmpeg -y -i "${req.file.path}" -ar 44100 -ac 2 -b:a ${bitrate} "${outName}"`;
        break;
      case 'ogg':
        cmd = `ffmpeg -y -i "${req.file.path}" -c:a libvorbis -q:a 4 "${outName}"`;
        break;
      case 'wav':
        cmd = `ffmpeg -y -i "${req.file.path}" -acodec pcm_s16le -ar 44100 -ac 2 "${outName}"`;
        break;
      default:
        cmd = `ffmpeg -y -i "${req.file.path}" -ar 44100 -ac 2 -b:a ${bitrate} "${outName}"`;
    }
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    const contentTypes = {
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'wav': 'audio/wav'
    };
    
    res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

// POST /api/v1/gif/compress
router.post('/gif/compress', upload.single('file'), async (req, res, next) => {
  try {
    await ensureFFmpeg();
    if (!req.file) return res.status(400).json({ success: false, error: 'GIF file required' });
    
    const width = parseInt(req.body.width || '480');
    const fps = parseInt(req.body.fps || '10');
    const colors = parseInt(req.body.colors || '128');
    
    const outName = buildOutName(req.file.path, 'compressed', 'gif');
    const cmd = `ffmpeg -y -i "${req.file.path}" -vf "fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "${outName}"`;
    
    await exec(cmd);
    const buf = fs.readFileSync(outName);
    cleanupFile(req.file.path);
    cleanupFile(outName);
    
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outName)}"`);
    return res.send(buf);
  } catch (e) { next(e); }
});

export default router;