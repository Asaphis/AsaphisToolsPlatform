import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateAdmin);

// ==================== DASHBOARD ====================

// GET /api/v1/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get tools count
    const { count: toolsCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    // Get users count
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total usage/analytics
    const { count: analyticsCount } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true });

    // Get recent analytics
    const { data: recentActivity } = await supabase
      .from('analytics')
      .select('*, tools(name, slug)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get popular tools
    const { data: popularTools } = await supabase
      .from('tools')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalTools: toolsCount,
        totalUsers: usersCount,
        totalUsage: analyticsCount
      },
      recentActivity,
      popularTools
    });
  } catch (error) {
    next(error);
  }
});

// ==================== TOOLS MANAGEMENT ====================

// GET /api/v1/admin/tools - Get all tools (including inactive)
router.get('/tools', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

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

// POST /api/v1/admin/tools - Create new tool
router.post('/tools', [
  body('name').notEmpty(),
  body('slug').notEmpty(),
  body('description').notEmpty(),
  body('category').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const toolData = req.body;

    const { data, error } = await supabaseAdmin
      .from('tools')
      .insert([toolData])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.status(201).json({
      success: true,
      message: 'Tool created successfully',
      tool: data
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/tools/:id - Update tool
router.put('/tools/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Tool updated successfully',
      tool: data
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/admin/tools/:id - Delete tool
router.delete('/tools/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Tool deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== USERS MANAGEMENT ====================

// GET /api/v1/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      count: data.length,
      users: data
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/users/:id - Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAdmin, isActive } = req.body;

    const updates = {};
    if (isAdmin !== undefined) updates.is_admin = isAdmin;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: data
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw new ApiError(500, authError.message);

    // User profile will be deleted automatically due to CASCADE

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CATEGORIES MANAGEMENT ====================

// GET /api/v1/admin/categories - Get all categories
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      categories: data
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/categories - Create category
router.post('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([req.body])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: data
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/categories/:id - Update category
router.put('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: data
    });
  } catch (error) {
    next(error);
  }
});

// ==================== ANALYTICS ====================

// GET /api/v1/admin/analytics - Get detailed analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const { startDate, endDate, toolId, eventType } = req.query;

    let query = supabaseAdmin
      .from('analytics')
      .select('*, tools(name, slug), users(email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (toolId) {
      query = query.eq('tool_id', toolId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      count: data.length,
      analytics: data
    });
  } catch (error) {
    next(error);
  }
});

// ==================== ADS MANAGEMENT ====================

// GET /api/v1/admin/ads - Get all ads
router.get('/ads', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      ads: data
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/ads - Create ad
router.post('/ads', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ads')
      .insert([req.body])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad: data
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/ads/:id - Update ad
router.put('/ads/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('ads')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Ad updated successfully',
      ad: data
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/admin/ads/:id - Delete ad
router.delete('/ads/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== SETTINGS ====================

// GET /api/v1/admin/settings - Get all settings
router.get('/settings', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*');

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      settings: data
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/admin/settings/:key - Update setting
router.put('/settings/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting: data
    });
  } catch (error) {
    next(error);
  }
});

export default router;
