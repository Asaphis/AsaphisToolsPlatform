# Background Removal API - Setup Guide

This backend includes a local AI-powered background removal API using U²-Net, with no external API dependencies.

## 📁 Folder Structure

```
backend/
├── models/
│   └── u2net.pth           # Pretrained U²-Net model (download required)
├── scripts/
│   └── remove_bg.py        # Python inference script
├── routes/
│   └── remove-bg.ts        # Express API route
├── uploads/                # Temporary upload directory (auto-created)
├── requirements.txt        # Python dependencies
└── package.json
```

## 🔧 Setup Instructions

### 1. Install Node.js Dependencies

```bash
npm install
```

This installs:
- `multer` - For handling multipart/form-data file uploads
- `@types/multer` - TypeScript types for multer

### 2. Install Python Dependencies

You need Python 3.8+ installed on your system.

```bash
# Windows
python -m pip install -r requirements.txt

# macOS/Linux
pip3 install -r requirements.txt
```

This installs:
- `torch` - PyTorch deep learning framework
- `torchvision` - Vision utilities for PyTorch
- `Pillow` - Image processing library
- `numpy` - Numerical computing library

### 3. Download the U²-Net Model

Download the pretrained U²-Net model weights:

**Option A: Direct Download**
1. Visit: https://github.com/xuebinqin/U-2-Net
2. Download `u2net.pth` (~176 MB)
3. Place it in the `models/` directory

**Option B: Using wget/curl**

```bash
# Using wget (Linux/macOS)
wget -P models/ https://github.com/xuebinqin/U-2-Net/releases/download/v1.0/u2net.pth

# Using curl (macOS/Windows)
curl -L -o models/u2net.pth https://github.com/xuebinqin/U-2-Net/releases/download/v1.0/u2net.pth
```

**Option C: Using Python Script**

```python
import urllib.request
import os

url = "https://github.com/xuebinqin/U-2-Net/releases/download/v1.0/u2net.pth"
os.makedirs("models", exist_ok=True)
urllib.request.urlretrieve(url, "models/u2net.pth")
print("Model downloaded successfully!")
```

### 4. Verify Python Installation

Test that Python can run the background removal script:

```bash
# Windows
python scripts/remove_bg.py

# macOS/Linux
python3 scripts/remove_bg.py
```

You should see an error about missing input (which is expected):
```json
{"error": "No input image provided"}
```

## 🚀 Usage

### Start the Server

```bash
npm run dev
```

The API will be available at: `http://localhost:4000`

### API Endpoint

**POST** `/api/remove-bg`

**Request Format:** `multipart/form-data`

**Parameters:**
- `image` (file) - Image file (PNG or JPG, max 10MB)

**Response Format:** JSON

```json
{
  "status": "success",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Example Usage

**JavaScript/Fetch:**

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:4000/api/remove-bg', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.status === 'success') {
  // Use result.image as src for <img> tag
  document.getElementById('output').src = result.image;
}
```

**cURL:**

```bash
curl -X POST http://localhost:4000/api/remove-bg \
  -F "image=@/path/to/your/image.jpg"
```

**Postman:**
1. Method: POST
2. URL: `http://localhost:4000/api/remove-bg`
3. Body: form-data
4. Key: `image` (type: File)
5. Value: Select your image file

## ⚙️ How It Works

1. **File Upload:** Client uploads image via multipart/form-data
2. **Multer:** Saves file temporarily to `uploads/` directory
3. **Python Script:** Node.js spawns Python process running `remove_bg.py`
4. **U²-Net Inference:** Python loads model and processes image
5. **Response:** Returns transparent PNG as base64 string
6. **Cleanup:** Uploaded file is automatically deleted

## 🔍 Error Handling

The API includes comprehensive error handling:

- **Invalid file type:** Returns 400 with error message
- **File too large:** Returns 400 (>10MB limit)
- **Missing file:** Returns 400
- **Model not found:** Returns 500 with instructions
- **Python error:** Returns 500 with error details

## 🧪 Testing

Test with a sample image:

```bash
# Create a test image or use an existing one
curl -X POST http://localhost:4000/api/remove-bg \
  -F "image=@test-image.jpg" \
  -o response.json
```

## 🔄 Alternative Models

The system is designed to be modular. To use a different model (e.g., MODNet, RVM):

1. Update `scripts/remove_bg.py` with new model architecture
2. Download new model weights to `models/`
3. Update `requirements.txt` if needed
4. No changes needed to Express route!

## 🐛 Troubleshooting

**Python not found:**
- Ensure Python 3.8+ is installed and in PATH
- Try changing `pythonCmd` in `remove-bg.ts` to full Python path

**Model loading error:**
- Verify `u2net.pth` exists in `models/` directory
- Check file size (~176 MB for U²-Net)

**Out of memory:**
- Reduce input image size before uploading
- Use CPU-only PyTorch if GPU memory is limited

**Slow inference:**
- First request loads model (5-10 seconds)
- Subsequent requests are faster (model stays in memory)
- Consider GPU acceleration by installing CUDA-enabled PyTorch

## 📊 Performance

- **Model Load Time:** ~5-10 seconds (first request only)
- **Inference Time:** ~1-3 seconds per image (CPU)
- **Inference Time:** ~0.3-0.5 seconds per image (GPU)
- **Model Size:** ~176 MB

## 🔒 Security Considerations

- File size limited to 10MB
- Only PNG/JPG files accepted
- Uploaded files deleted after processing
- Temporary uploads stored in `uploads/` directory

## 📝 License

U²-Net is released under Apache License 2.0. See: https://github.com/xuebinqin/U-2-Net
