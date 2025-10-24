import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../index.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list ads (active only)
router.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ads: data || [] });
});

// Admin: create/update/delete
const AdSchema = z.object({
  id: z.string().optional(),
  provider: z.enum(['adsense', 'ad_manager', 'direct']),
  slotId: z.string().nullable().optional(),
  sizes: z.array(z.tuple([z.number(), z.number()])).optional(),
  html: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  clickUrl: z.string().nullable().optional(),
  status: z.enum(['active', 'paused']).default('active'),
  priority: z.number().int().default(0)
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = AdSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data, error } = await supabaseAdmin.from('ads').insert(parsed.data).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const parsed = AdSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data, error } = await supabaseAdmin
    .from('ads')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from('ads').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
