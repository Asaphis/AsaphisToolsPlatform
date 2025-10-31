import express from 'express';
import sharp from 'sharp';
import { upload, cleanupFile } from '../middleware/upload.js';
import { ApiError } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/files/compress-image - Compress image
router.post('/compress-image', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    const quality = parseInt(req.body.quality) || 80;
    const outputFormat = req.body.format || 'jpeg';

    const processedImage = await sharp(req.file.path)
      [outputFormat]({ quality })
      .toBuffer();

    // Clean up uploaded file
    cleanupFile(req.file.path);

    // Send compressed image as base64
    const base64Image = `data:image/${outputFormat};base64,${processedImage.toString('base64')}`;

    res.json({
      success: true,
      image: base64Image,
      originalSize: req.file.size,
      compressedSize: processedImage.length,
      compressionRatio: ((1 - processedImage.length / req.file.size) * 100).toFixed(2)
    });
  } catch (error) {
    if (req.file) cleanupFile(req.file.path);
    next(error);
  }
});

// POST /api/v1/files/resize-image - Resize image
router.post('/resize-image', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);
    const fit = req.body.fit || 'cover'; // cover, contain, fill, inside, outside

    let sharpInstance = sharp(req.file.path);

    if (width && height) {
      sharpInstance = sharpInstance.resize(width, height, { fit });
    } else if (width) {
      sharpInstance = sharpInstance.resize(width);
    } else if (height) {
      sharpInstance = sharpInstance.resize(null, height);
    }

    const processedImage = await sharpInstance.toBuffer();

    // Clean up uploaded file
    cleanupFile(req.file.path);

    // Send resized image as base64
    const base64Image = `data:${req.file.mimetype};base64,${processedImage.toString('base64')}`;

    res.json({
      success: true,
      image: base64Image,
      dimensions: { width, height },
      size: processedImage.length
    });
  } catch (error) {
    if (req.file) cleanupFile(req.file.path);
    next(error);
  }
});

// POST /api/v1/files/convert-image - Convert image format
router.post('/convert-image', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    const targetFormat = req.body.format || 'png'; // jpeg, png, webp, gif
    const quality = parseInt(req.body.quality) || 90;

    const processedImage = await sharp(req.file.path)
      .toFormat(targetFormat, { quality })
      .toBuffer();

    // Clean up uploaded file
    cleanupFile(req.file.path);

    // Send converted image as base64
    const base64Image = `data:image/${targetFormat};base64,${processedImage.toString('base64')}`;

    res.json({
      success: true,
      image: base64Image,
      format: targetFormat,
      size: processedImage.length
    });
  } catch (error) {
    if (req.file) cleanupFile(req.file.path);
    next(error);
  }
});

// POST /api/v1/files/remove-background - Remove image background using U2-Net
router.post('/remove-background', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);
    const { fileURLToPath } = await import('url');
    const path = await import('path');
    const { dirname } = path;
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = path.join(__dirname, '../..');
    
    const inputPath = path.resolve(req.file.path);
    const outputPath = path.join(projectRoot, 'uploads', `bg-removed-${Date.now()}.png`);
    const pythonScript = path.join(projectRoot, 'python', 'remove_bg.py');
    
    // Check if Python script exists
    const fs = await import('fs');
    if (!fs.existsSync(pythonScript)) {
      throw new ApiError(500, 'Background removal service not configured. Python script not found.');
    }

    const command = `python "${pythonScript}" "${inputPath}" "${outputPath}"`;
    
    console.log('Executing command:', command);
    
    try {
      const { stdout, stderr } = await execPromise(command);
      console.log('Python stdout:', stdout);
      if (stderr) console.error('Python stderr:', stderr);
      
      // Check if output file was created
      if (!fs.existsSync(outputPath)) {
        console.error('Output file not created at:', outputPath);
        throw new Error('Background removal failed - output file not created');
      }
      
      // Read the processed image
      const processedImage = fs.readFileSync(outputPath);
      console.log('Processed image size:', processedImage.length, 'bytes');
      const base64Image = `data:image/png;base64,${processedImage.toString('base64')}`;
      console.log('Base64 image length:', base64Image.length);
      
      // Clean up files
      cleanupFile(req.file.path);
      cleanupFile(outputPath);
      
      res.json({
        success: true,
        image: base64Image,
        message: 'Background removed successfully'
      });
    } catch (execError) {
      console.error('Python execution error:', execError);
      console.error('Error details:', execError.message);
      if (execError.stderr) console.error('Error stderr:', execError.stderr);
      throw new ApiError(500, `Background removal failed: ${execError.message}`);
    }
  } catch (error) {
    if (req.file) cleanupFile(req.file.path);
    next(error);
  }
});

export default router;
