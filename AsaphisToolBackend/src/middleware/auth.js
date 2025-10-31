import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { ApiError } from './errorHandler.js';
import cookie from 'cookie';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // If no Authorization header, try cookie
    if (!token && req.headers.cookie) {
      const parsed = cookie.parse(req.headers.cookie || '');
      token = parsed['admin_token'] || parsed['token'];
    }

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    next(error);
  }
};

// Verify admin token
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Check cookie fallback
    if (!token && req.headers.cookie) {
      const parsed = cookie.parse(req.headers.cookie || '');
      token = parsed['admin_token'];
    }

    if (!token) {
      throw new ApiError(401, 'Admin token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    
    // Verify admin status from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('id', decoded.userId)
      .single();

    if (error || !user || !user.is_admin) {
      throw new ApiError(403, 'Admin access required');
    }

    req.admin = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid admin token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Admin token expired'));
    }
    next(error);
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
