import express from 'express';
import { supabase } from '../config/supabase.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/analytics/track - Track generic analytics event
router.post('/track', optionalAuth, async (req, res, next) => {
  try {
    const { toolId, eventType, eventData } = req.body;

    await supabase.from('analytics').insert([{
      tool_id: toolId || null,
      user_id: req.user?.userId || null,
      event_type: eventType,
      event_data: eventData || {},
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    }]);

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/popular - Get popular tools
router.get('/popular', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({
      success: true,
      tools: data
    });
  } catch (error) {
    next(error);
  }
});

export default router;
