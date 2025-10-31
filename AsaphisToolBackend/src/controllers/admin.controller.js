import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Get total tools count
    const { count: toolsCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact' });

    // Get active ads count
    const { count: activeAdsCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Get today's revenue
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRevenue } = await supabase
      .from('revenue')
      .select('amount')
      .gte('created_at', today);

    const totalRevenue = todayRevenue?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    res.json({
      users: usersCount,
      tools: toolsCount,
      activeAds: activeAdsCount,
      todayRevenue: totalRevenue,
      status: 'success'
    });
  } catch (error) {
    throw new ApiError(500, 'Error fetching dashboard statistics');
  }
};

export const getTools = async (req, res) => {
  try {
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ tools, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching tools');
  }
};

export const createTool = async (req, res) => {
  const { name, description, category, icon, slug } = req.body;

  try {
    const { data, error } = await supabase
      .from('tools')
      .insert([{ name, description, category, icon, slug }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ tool: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error creating tool');
  }
};

export const updateTool = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ tool: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error updating tool');
  }
};

export const deleteTool = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Tool deleted successfully' });
  } catch (error) {
    throw new ApiError(500, 'Error deleting tool');
  }
};

// Ads Management
export const getAds = async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ ads, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching ads');
  }
};

export const createAd = async (req, res) => {
  const { name, type, placement, content, status } = req.body;

  try {
    const { data, error } = await supabase
      .from('ads')
      .insert([{ name, type, placement, content, status }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ad: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error creating ad');
  }
};

export const updateAd = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ ad: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error updating ad');
  }
};

export const deleteAd = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Ad deleted successfully' });
  } catch (error) {
    throw new ApiError(500, 'Error deleting ad');
  }
};

export const getAdPerformance = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ad_performance')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    res.json({ performance: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching ad performance');
  }
};

// Analytics
export const getUsageAnalytics = async (req, res) => {
  const { period = '7d' } = req.query;

  try {
    // Get usage data for the specified period
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ analytics: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching usage analytics');
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('revenue')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    res.json({ revenue: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching revenue analytics');
  }
};

// Settings
export const getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) throw error;

    res.json({ settings: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error fetching settings');
  }
};

export const updateSettings = async (req, res) => {
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', 1) // Assuming there's only one settings record
      .select()
      .single();

    if (error) throw error;

    res.json({ settings: data, status: 'success' });
  } catch (error) {
    throw new ApiError(500, 'Error updating settings');
  }
};