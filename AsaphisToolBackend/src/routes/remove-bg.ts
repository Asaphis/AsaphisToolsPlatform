import { Router, Request, Response } from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'input-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG and JPG are allowed.'));
    }
  }
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  let inputPath: string | undefined;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'No image file provided.' 
      });
    }

    inputPath = req.file.path;

    // Use custom U2-Net script with fixed thresholds
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'remove_bg.py');
    
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ 
        status: 'error', 
        error: 'Background removal script not found.' 
      });
    }
    
    // Check if Python is available
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    const result = await new Promise<string>((resolve, reject) => {
      const pythonProcess = spawn(pythonCmd, [scriptPath, inputPath]);
      
      let stdout = '';
      let stderr = '';
      
      // Set timeout of 60 seconds
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Background removal timed out after 60 seconds'));
      }, 60000);
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          console.error('Python script error:', stderr);
          // Provide helpful error message
          if (stderr.includes('ModuleNotFoundError')) {
            reject(new Error('Python dependencies not installed. Run: python setup_background_removal.py'));
          } else if (stderr.includes('Model file not found')) {
            reject(new Error('AI model not found. Run: python setup_background_removal.py'));
          } else {
            reject(new Error(`Background removal failed: ${stderr || 'Unknown error'}`));
          }
        } else {
          resolve(stdout);
        }
      });
      
      pythonProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start Python process: ${error.message}. Is Python installed?`));
      });
    });

    // Parse JSON response from Python script
    const parsedResult = JSON.parse(result);
    
    if (parsedResult.error) {
      return res.status(500).json({ 
        status: 'error', 
        error: parsedResult.error 
      });
    }

    // Return success with base64 image
    res.json({ 
      status: 'success', 
      image: parsedResult.image 
    });

  } catch (error: any) {
    console.error('Background removal error:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message || 'An unexpected error occurred.' 
    });
  } finally {
    // Clean up uploaded file
    if (inputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
});

export default router;
