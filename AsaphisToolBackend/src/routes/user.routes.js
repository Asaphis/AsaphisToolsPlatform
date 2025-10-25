import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/v1/users/profile - Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/users/profile - Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { displayName, preferences } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (preferences !== undefined) updates.preferences = preferences;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: data
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/favorites - Get user favorites
router.get('/favorites', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*, tools(*)')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      favorites: data
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/users/favorites/:toolId - Add tool to favorites
router.post('/favorites/:toolId', async (req, res, next) => {
  try {
    const { toolId } = req.params;

    const { error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: req.user.userId,
        tool_id: toolId
      }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ApiError(400, 'Tool already in favorites');
      }
      throw new ApiError(500, error.message);
    }

    res.json({
      success: true,
      message: 'Tool added to favorites'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/users/favorites/:toolId - Remove tool from favorites
router.delete('/favorites/:toolId', async (req, res, next) => {
  try {
    const { toolId } = req.params;

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', req.user.userId)
      .eq('tool_id', toolId);

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      message: 'Tool removed from favorites'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/history - Get user tool usage history
router.get('/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase
      .from('user_history')
      .select('*, tools(*)')
      .eq('user_id', req.user.userId)
      .order('used_at', { ascending: false })
      .limit(limit);

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      history: data
    });
  } catch (error) {
    next(error);
  }
});

export default router;
