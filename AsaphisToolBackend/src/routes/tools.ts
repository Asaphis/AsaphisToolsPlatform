import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../index.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list tools
router.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tools')
    .select('*')
    .eq('status', 'published')
    .order('priority', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tools: data || [] });
});

const ToolSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  icon: z.string().optional(),
  status: z.enum(['draft', 'published']).default('published'),
  priority: z.number().int().default(0)
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = ToolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data, error } = await supabaseAdmin.from('tools').insert(parsed.data).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const parsed = ToolSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data, error } = await supabaseAdmin
    .from('tools')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from('tools').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
