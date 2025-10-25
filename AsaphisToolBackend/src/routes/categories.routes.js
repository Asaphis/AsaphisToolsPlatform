import express from 'express';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/v1/categories - Get all categories
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new ApiError(500, error.message);

    res.json({
      success: true,
      count: data.length,
      categories: data
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/categories/:slug - Get category with tools
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      throw new ApiError(404, 'Category not found');
    }

    // Get tools in this category
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('*')
      .eq('category', slug)
      .eq('is_active', true)
      .order('name');

    if (toolsError) throw new ApiError(500, toolsError.message);

    res.json({
      success: true,
      category,
      tools,
      toolCount: tools.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
