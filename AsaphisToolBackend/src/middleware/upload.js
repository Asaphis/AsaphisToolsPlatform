import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ApiError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Supported file types
const SUPPORTED_MIME_TYPES = {
  // Image formats
  'image/jpeg': ['jpg', 'jpeg', 'jfif'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'image/heif': ['heif'],
  'image/svg+xml': ['svg'],
  'image/bmp': ['bmp'],
  'image/tiff': ['tiff', 'tif'],
  'image/apng': ['apng'],
  'image/avif': ['avif'],
  'image/x-icon': ['ico'],

  // Video formats
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/x-msvideo': ['avi'],
  'video/webm': ['webm'],
  'video/x-matroska': ['mkv'],
  'video/x-flv': ['flv'],
  'video/3gpp': ['3gp'],
  'video/x-ms-wmv': ['wmv'],

  // Audio formats
  'audio/mpeg': ['mp3'],
  'audio/ogg': ['ogg'],
  'audio/wav': ['wav'],
  'audio/aac': ['aac'],
  'audio/webm': ['weba'],
  'audio/flac': ['flac'],
  'audio/x-m4a': ['m4a'],

  // Document formats
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/epub+zip': ['epub'],
  'application/vnd.oasis.opendocument.text': ['odt'],
};

// File filter
const fileFilter = (req, file, cb) => {
  // Get the endpoint being accessed
  const endpoint = req.path.toLowerCase();

  // Determine allowed types based on the endpoint
  let allowedTypes = [];

  if (endpoint.includes('image')) {
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/svg+xml'];
  } else if (endpoint.includes('video')) {
    allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
  } else if (endpoint.includes('audio')) {
    allowedTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/webm'];
  } else if (endpoint.includes('pdf')) {
    allowedTypes = ['application/pdf'];
  } else if (endpoint.includes('convert')) {
    // For conversion endpoints, allow all supported types
    allowedTypes = Object.keys(SUPPORTED_MIME_TYPES);
  } else {
    // Default: allow only basic document types
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed for this operation`), false);
  }
};

// Configure file size limits based on file type
function getFileSizeLimit(mimetype) {
  const VIDEO_SIZE = 500 * 1024 * 1024;    // 500MB for videos
  const IMAGE_SIZE = 25 * 1024 * 1024;     // 25MB for images
  const DOCUMENT_SIZE = 100 * 1024 * 1024;  // 100MB for documents
  const DEFAULT_SIZE = 50 * 1024 * 1024;    // 50MB default

  if (mimetype.startsWith('video/')) {
    return VIDEO_SIZE;
  } else if (mimetype.startsWith('image/')) {
    return IMAGE_SIZE;
  } else if (
    mimetype === 'application/pdf' ||
    mimetype.includes('document') ||
    mimetype.includes('sheet')
  ) {
    return DOCUMENT_SIZE;
  }
  return DEFAULT_SIZE;
}

// Create multer instance with dynamic file size limits
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024 // 500MB absolute maximum
  }
});

// Create file type specific upload middleware
const createUploadMiddleware = (allowedTypes) => {
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
      }
    },
    limits: {
      fileSize: (req, file) => getFileSizeLimit(file.mimetype)
    }
  });
};

// Export specialized upload middleware for different file types
export const imageUpload = createUploadMiddleware([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 
  'image/heic', 'image/heif', 'image/svg+xml'
]);

export const videoUpload = createUploadMiddleware([
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'
]);

export const audioUpload = createUploadMiddleware([
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/webm'
]);

export const pdfUpload = createUploadMiddleware(['application/pdf']);

// Cleanup utility to delete uploaded files
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};
