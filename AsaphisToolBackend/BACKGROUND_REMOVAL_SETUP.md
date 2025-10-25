# Background Removal Setup Guide

Your backend now includes AI-powered background removal using the U²-Net model!

## 🧠 How It Works

The backend uses:
- **U²-Net (U-squared Net)** - Deep learning model for salient object detection
- **PyTorch** - Deep learning framework
- **Python** - Runs the AI model
- **Express** - Node.js handles the API requests

## 📋 Prerequisites

1. **Python 3.8+** installed on your system
2. **Node.js** (already installed)
3. **U²-Net model file** (already included: `python/u2net.pth`)

## 🛠️ Installation Steps

### 1. Install Python Dependencies

Open a terminal and navigate to the backend:

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
```

Install Python packages:

```bash
pip install -r python/requirements.txt
```

Or install individually:

```bash
pip install torch torchvision pillow numpy
```

### 2. Verify Python Installation

Test Python is accessible:

```bash
python --version
```

Should show Python 3.8 or higher.

### 3. Test Background Removal

You can test the Python script directly:

```bash
python python/remove_bg.py "path/to/input.jpg" "path/to/output.png"
```

### 4. Start the Backend Server

```bash
npm run dev
```

The background removal endpoint will be available at:
```
POST http://localhost:4000/api/v1/files/remove-background
```

## 📡 API Endpoint

### Remove Background

**Endpoint:** `POST /api/v1/files/remove-background`

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:4000/api/v1/files/remove-background', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// data.image contains base64 encoded transparent PNG
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Background removed successfully"
}
```

## 🔌 Frontend Integration

### Update Frontend Environment

In your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Frontend Code Example

```javascript
// In your background remover tool component
async function removeBackground(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/remove-background`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    
    if (data.success) {
      // data.image contains the transparent PNG as base64
      // Display it or allow download
      return data.image;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Background removal failed:', error);
    throw error;
  }
}
```

## 📁 File Structure

```
AsaphisToolBackend/
├── python/
│   ├── remove_bg.py         # Main background removal script
│   ├── u2net.py             # U2-Net model architecture
│   ├── u2net.pth            # Pre-trained model weights (~176 MB)
│   └── requirements.txt     # Python dependencies
├── uploads/                 # Temporary file storage
└── src/routes/file.routes.js  # API endpoint
```

## 🎯 Model Information

- **Model:** U²-Net (U2NETP - lightweight version)
- **Size:** ~176 MB
- **Input:** Any image (JPEG, PNG, WebP)
- **Output:** PNG with transparent background
- **Processing Time:** 2-5 seconds per image (CPU)
- **Quality:** High-quality results for portraits and objects

## ⚡ Performance

### First Request
- ~5-10 seconds (model loading + processing)

### Subsequent Requests
- ~2-3 seconds (model cached in memory)

### Optimization Options
1. **GPU Acceleration** - Install CUDA-enabled PyTorch for faster processing
2. **Batch Processing** - Process multiple images at once
3. **Model Caching** - Keep Python process alive (implemented)

## 🐛 Troubleshooting

### "Python not found"
- Install Python 3.8+
- Add Python to PATH
- Restart terminal after installation

### "No module named 'torch'"
- Install Python dependencies: `pip install -r python/requirements.txt`

### "Model file not found"
- Verify `python/u2net.pth` exists (should be ~176 MB)
- If missing, download from U²-Net repository

### "Background removal failed"
- Check Python version: `python --version`
- Check if packages installed: `pip list`
- Check server logs for detailed error

### Slow Processing
- First image always takes longer (model loading)
- Consider GPU acceleration for production
- Reduce image size before uploading

## 🔒 Security Notes

- Files are automatically deleted after processing
- Only image files are accepted
- 10MB file size limit (configurable in .env)
- Processing happens locally (no external API calls)

## 🚀 Production Deployment

### Option 1: Deploy Python with Node.js
- Include Python runtime in deployment
- Install dependencies during build
- Works on Railway, Render, AWS, etc.

### Option 2: Separate Python Service
- Deploy Python as separate microservice
- Node.js calls Python service via HTTP
- Better scalability

### Option 3: Serverless
- Use AWS Lambda with Python layer
- Slower cold starts but cost-effective
- Good for low-traffic apps

## 📊 System Requirements

### Development
- **CPU:** Any modern processor
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 500MB for model and dependencies
- **Python:** 3.8 or higher

### Production
- **CPU:** 2+ cores recommended
- **RAM:** 4GB minimum (8GB for better performance)
- **GPU:** Optional but significantly faster
- **Storage:** 1GB minimum

## 💡 Tips

1. **Optimize Images** - Resize large images before processing
2. **Cache Results** - Store processed images to avoid reprocessing
3. **Queue System** - Use Bull/BullMQ for high traffic
4. **CDN Storage** - Store results in S3/Cloudinary for scalability
5. **Monitor Memory** - Python process can use significant RAM

## 🎨 Frontend Integration Examples

### React Component
```jsx
import { useState } from 'react';

function BackgroundRemover() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveBackground = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/remove-background`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      setImage(data.image);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleRemoveBackground(e.target.files[0])}
        accept="image/*"
      />
      {loading && <p>Processing...</p>}
      {image && <img src={image} alt="Result" />}
    </div>
  );
}
```

## 🔄 Alternative Models

If you want to try different models:

1. **U²-Net** (Current) - Best quality, slower
2. **MODNet** - Faster, portrait-focused
3. **BackgroundMattingV2** - High quality, requires GPU
4. **RMBG** - Lightweight, fast

To switch models, update `python/remove_bg.py` and the model file.

## ✅ Testing

Test the endpoint with curl:

```bash
curl -X POST http://localhost:4000/api/v1/files/remove-background \
  -F "image=@path/to/your/image.jpg" \
  > result.json
```

Or use Postman:
1. Set method to POST
2. URL: `http://localhost:4000/api/v1/files/remove-background`
3. Body > form-data
4. Key: `image`, Type: File
5. Select your image file
6. Send request

## 🎉 You're Ready!

Your backend now has AI-powered background removal! Just:

1. Install Python dependencies
2. Start the backend server
3. Call the API from your frontend
4. Watch the magic happen! ✨

---

**Need Help?**
- Check Python installation: `python --version`
- Check packages: `pip list`
- View server logs for detailed errors
- Test Python script directly first

**Performance Issues?**
- Enable GPU acceleration
- Reduce image sizes
- Use image caching
- Consider cloud GPU services
