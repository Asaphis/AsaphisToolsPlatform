import { ApiError } from './errorHandler.js';

const mimeTypes = {
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/svg+xml'
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ],
  audio: [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/webm'
  ],
  pdf: [
    'application/pdf'
  ],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'text/plain'
  ]
};

export const validateFileType = (types) => (req, res, next) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new ApiError(400, 'No file uploaded'));
  }

  const allowedTypes = types.flatMap(type => mimeTypes[type] || []);
  if (!allowedTypes.includes(file.mimetype)) {
    return next(
      new ApiError(
        415,
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      )
    );
  }

  next();
};

export const validateFileSize = (maxSizeMB) => (req, res, next) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  const file = req.file || (req.files && req.files[0]);
  
  if (file && file.size > maxBytes) {
    return next(
      new ApiError(
        413,
        `File too large. Maximum size allowed is ${maxSizeMB}MB`
      )
    );
  }
  
  next();
};