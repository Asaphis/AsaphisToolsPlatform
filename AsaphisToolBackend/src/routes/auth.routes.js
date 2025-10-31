import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiter for auth endpoints (protect against brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

// Validation middleware
const validateLogin = [
  body('email').isEmail().trim().toLowerCase(),
  body('password').isLength({ min: 6 })
];

const validateRegister = [
  body('email').isEmail().trim().toLowerCase(),
  body('password').isLength({ min: 8 }),
  body('displayName').optional().trim().isLength({ min: 2, max: 100 })
];

// POST /api/v1/auth/register - Register new user
// NOTE: This endpoint is limited — only allow when REGISTRATION_SECRET is provided and matches
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // Optional guard: require registration secret to enable public registration
    if (process.env.REGISTRATION_SECRET) {
      const provided = req.body?.registration_secret;
      if (!provided || provided !== process.env.REGISTRATION_SECRET) {
        return res.status(403).json({ success: false, message: 'Registration is disabled' });
      }
    }
    const { email, password, displayName } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw new ApiError(400, authError.message);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        display_name: displayName || null
      }]);

    if (profileError) throw new ApiError(500, 'Failed to create user profile');

    // Generate JWT token
    const token = jwt.sign(
      { userId: authData.user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: authData.user.id,
        email,
        displayName: displayName || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login - Login user
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Supabase signInWithPassword error:', authError);
        throw new ApiError(authError.status || 401, `Supabase auth error: ${authError.message}`);
      }
      throw new ApiError(401, 'Invalid credentials');
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user.is_active) {
      throw new ApiError(401, 'Account is not active');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/admin-login - Admin login
// Use rate limiter on admin login
router.post('/admin-login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Supabase signInWithPassword error:', authError);
        throw new ApiError(authError.status || 401, `Supabase auth error: ${authError.message}`);
      }
      throw new ApiError(401, 'Invalid credentials');
    }

    // Get user profile and verify admin status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user.is_admin) {
      throw new ApiError(403, 'Admin access required');
    }


    // Generate admin JWT token and set as HttpOnly cookie
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: true },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN }
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 1 day default, can be adjusted
    };

    res.cookie('admin_token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout - Clear admin session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out' });
});

export default router;

// GET /api/v1/auth/me - return admin/session info based on admin_token cookie
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (userError) return res.status(500).json({ success: false, message: 'Failed to load user' });
    if (!user || !user.is_admin) return res.status(403).json({ success: false, message: 'Admin access required' });

    res.json({ success: true, admin: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
