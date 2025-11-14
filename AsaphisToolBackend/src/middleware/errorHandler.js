import fs from 'fs';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Main error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Cleanup any uploaded files on error
  if (req.file) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.error('Failed to cleanup file:', e);
    }
  }
  if (req.files) {
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Failed to cleanup file:', e);
      }
    });
  }

  // Handle specific error types
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.name === 'MulterError')) {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024;
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return res.status(413).json({
      success: false,
      error: `File too large. Maximum allowed size is ${maxMb}MB`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle ENOENT (file not found) errors
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'File not found or was already processed',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle command execution errors (e.g., missing system dependencies)
  if (err.code === 'ENOENT' && err.path && /^(ffmpeg|convert|soffice|gs|ebook-convert)/.test(err.path)) {
    return res.status(503).json({
      success: false,
      error: `Required system tool not found: ${err.path}. Please ensure all dependencies are installed.`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

