import express from 'express';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';

const exec = promisify(_exec);
const router = express.Router();

async function hasCmd(cmd) {
  try { await exec(cmd); return true; } catch { return false; }
}

// GET /api/v1/health/features
router.get('/features', async (req, res) => {
  const ffmpeg = await hasCmd('ffmpeg -version');
  const poppler = await hasCmd('pdftoppm -v');
  const potrace = await hasCmd('potrace -v');
  res.json({ success: true, features: { ffmpeg, poppler, potrace } });
});

export default router;