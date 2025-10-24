import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });

    const allowed = (process.env.ALLOWED_ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const email = (data.user.email || '').toLowerCase();
    const role = (data.user.app_metadata as any)?.role;
    if (allowed.length && !allowed.includes(email) && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    (req as any).user = data.user;
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Auth error' });
  }
}
