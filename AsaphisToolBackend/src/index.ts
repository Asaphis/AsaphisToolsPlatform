import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import adsRouter from './routes/ads.js';
import toolsRouter from './routes/tools.js';
import categoriesRouter from './routes/categories.js';
import removeBgRouter from './routes/remove-bg.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'asaphistool-backend', time: new Date().toISOString() });
});

app.use('/ads', adsRouter);
app.use('/tools', toolsRouter);
app.use('/categories', categoriesRouter);
app.use('/api/remove-bg', removeBgRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ status: 'error', error: 'File size exceeds 10MB limit.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
