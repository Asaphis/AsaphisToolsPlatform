import express from 'express';
import { supabase } from '../config/supabase.js';
import { optionalAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/v1/tools - Get all tools
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, popular, premium, search } = req.query;

    let query = supabase
      .from('tools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (popular === 'true') {
      query = query.eq('popular', true);
    }

    if (premium !== undefined) {
      query = query.eq('premium', premium === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data, error } = await query;

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      count: data.length,
      tools: data
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tools/:slug - Get single tool by slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data: tool, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !tool) {
      throw new ApiError(404, 'Tool not found');
    }

    // Increment usage count
    await supabase
      .from('tools')
      .update({ usage_count: tool.usage_count + 1 })
      .eq('id', tool.id);

    // Track analytics
    if (req.user) {
      await supabase.from('analytics').insert([{
        tool_id: tool.id,
        user_id: req.user.userId,
        event_type: 'view'
      }]);
    }

    res.json({
      success: true,
      tool
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/tools/:slug/track - Track tool usage
router.post('/:slug/track', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { eventType, eventData } = req.body;

    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', slug)
      .single();

    if (toolError || !tool) {
      throw new ApiError(404, 'Tool not found');
    }

    // Track analytics
    const { error: analyticsError } = await supabase
      .from('analytics')
      .insert([{
        tool_id: tool.id,
        user_id: req.user?.userId || null,
        event_type: eventType || 'usage',
        event_data: eventData || {},
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }]);

    if (analyticsError) {
      console.error('Analytics error:', analyticsError);
    }

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
