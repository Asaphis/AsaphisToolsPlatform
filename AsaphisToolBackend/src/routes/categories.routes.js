import express from 'express';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// If Supabase client isn't configured, attach fallback categories from a local JSON file
router.use((req, res, next) => {
  if (!supabase) {
    try {
      const dataPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/categories.json');
      const raw = fs.readFileSync(dataPath, 'utf-8');
      req.fallbackCategories = JSON.parse(raw).categories || [];
    } catch (err) {
      // If fallback file is missing, proceed with empty list
      req.fallbackCategories = [];
    }
  }
  next();
});

// GET /api/v1/categories - Get all categories
router.get('/', async (req, res, next) => {
  try {
    // If fallback categories are attached (no database), return them
    if (req.fallbackCategories) {
      return res.json({ success: true, count: req.fallbackCategories.length, categories: req.fallbackCategories });
    }

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
