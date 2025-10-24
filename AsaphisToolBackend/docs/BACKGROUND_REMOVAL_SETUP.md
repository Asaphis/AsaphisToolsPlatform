# Professional Background Removal Setup

## Overview

The background removal feature now uses **state-of-the-art AI models** with professional edge refinement for perfect results.

## Features

✨ **Advanced AI Models**
- Uses U2-Net and rembg for accurate segmentation
- Automatically detects and preserves subjects
- Professional edge refinement

🎯 **Perfect Edge Detection**
- Bilateral filtering for smooth edges
- Morphological operations to clean masks
- Alpha matting for transparent backgrounds
- Feathered edges for natural blending

🚀 **Multiple Methods**
- **Method 1 (Recommended)**: `rembg` - State-of-the-art, fastest, most accurate
- **Method 2 (Fallback)**: Custom U2-Net - Works offline, good quality

## Installation

### Option 1: Install rembg (Recommended)

For the **best quality** background removal:

```bash
cd AsaphisToolBackend
pip install -r requirements.txt
```

This will install:
- `rembg` - Professional background removal library
- `opencv-python` - Image processing
- `scipy` - Scientific computing for refinement
- All PyTorch dependencies

### Option 2: Install without GPU support

If you don't have a GPU or want lighter installation:

```bash
pip install torch torchvision Pillow numpy opencv-python scipy
pip install rembg
```

### Option 3: Minimal Installation (Fallback only)

If you only want the custom U2-Net implementation:

```bash
pip install torch torchvision Pillow numpy opencv-python scipy
```

**Note**: You'll need to download the U2-Net model file:
- Download from: https://github.com/xuebinqin/U-2-Net/releases/download/1.0/u2net.pth
- Place in: `AsaphisToolBackend/models/u2net.pth`

## Usage

### Using the Professional Script (remove_bg_pro.py)

```python
# Auto-select best method
python scripts/remove_bg_pro.py input.jpg output.png

# Force rembg (best quality)
python scripts/remove_bg_pro.py input.jpg output.png rembg

# Force custom U2-Net (offline)
python scripts/remove_bg_pro.py input.jpg output.png custom
```

### Using the Enhanced Custom Script (remove_bg.py)

```python
python scripts/remove_bg.py input.jpg output.png
```

## How It Works

### 1. Image Processing
- Loads image at high resolution (640x640 for custom, original for rembg)
- Normalizes and preprocesses for AI model

### 2. AI Segmentation
- **rembg method**: Uses advanced models (u2net, u2netp, silueta, isnet-general)
- **Custom method**: Uses U2-Net with improved post-processing

### 3. Mask Refinement
- **Trimap generation**: Separates definite foreground, uncertain, and background
- **Edge smoothing**: Bilateral filtering preserves sharp edges while smoothing
- **Morphological operations**: Removes noise, fills holes
- **Alpha matting**: Creates smooth transparency

### 4. Final Output
- Applies refined mask as alpha channel
- Gaussian smoothing for natural edges
- Outputs high-quality PNG with transparency

## Comparison

| Feature | rembg (Pro) | Custom U2-Net | Previous |
|---------|-------------|---------------|----------|
| **Accuracy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Edge Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Detail Preservation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Subject Detection** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## Improvements Over Previous Version

1. **Higher Resolution Processing**: 640x640 instead of 320x320
2. **Trimap Generation**: Better foreground/background separation
3. **Edge Refinement**: Professional smooth edges
4. **Alpha Matting**: Natural transparency blending
5. **Multiple Methods**: Automatic fallback for best results

## Troubleshooting

### Issue: Parts of subject being removed

**Solution**: The new version includes:
- Better threshold values (0.15 low, 0.85 high)
- Morphological closing to fill small holes
- Edge-preserving bilateral filtering

### Issue: Rough edges

**Solution**: Now includes:
- Gaussian smoothing on alpha channel
- Bilateral filtering for edge preservation
- Feathering with configurable amount

### Issue: Background not fully removed

**Solution**: Enhanced trimap generation ensures:
- Proper foreground detection
- Uncertain region handling
- Clean background removal

## Performance Tips

1. **Use GPU** if available (much faster)
2. **Use rembg** for best quality (recommended)
3. **Pre-resize large images** to ~2000px max dimension
4. **Use JPG for input** (faster loading)
5. **Save as PNG** for transparency

## API Integration

The backend API automatically uses the best available method:

```bash
POST /api/remove-background
Content-Type: multipart/form-data

{
  "image": <file>,
  "method": "auto"  // or "rembg", "custom"
}
```

Response:
```json
{
  "status": "success",
  "image": "data:image/png;base64,...",
  "method": "rembg"
}
```

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Test with sample images
3. Adjust threshold values if needed (in code)
4. Monitor performance and quality
5. Consider GPU acceleration for production

## Credits

- **rembg**: https://github.com/danielgatis/rembg
- **U2-Net**: https://github.com/xuebinqin/U-2-Net
- Edge refinement algorithms: Custom implementation with OpenCV and SciPy
