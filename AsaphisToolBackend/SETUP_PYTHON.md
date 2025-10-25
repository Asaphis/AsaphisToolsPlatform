# Quick Python Setup for Background Removal

## 1. Install Python (if not already installed)

Download from: https://www.python.org/downloads/

Or use Windows Store: Search for "Python 3.12"

**Important:** Check "Add Python to PATH" during installation!

## 2. Verify Python Installation

```bash
python --version
```

Should show: Python 3.8 or higher

## 3. Install Required Packages

Navigate to backend directory:

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
```

Install packages:

```bash
pip install -r python/requirements.txt
```

This installs:
- PyTorch (deep learning framework)
- Torchvision (computer vision library)
- Pillow (image processing)
- NumPy (numerical computing)

## 4. Verify Installation

Test if packages are installed:

```bash
python -c "import torch; print('PyTorch:', torch.__version__)"
python -c "import PIL; print('Pillow:', PIL.__version__)"
python -c "import numpy; print('NumPy:', numpy.__version__)"
```

## 5. Test Background Removal

Test the Python script directly:

```bash
python python/remove_bg.py "path/to/test/image.jpg" "output.png"
```

## 6. Start Backend Server

```bash
npm run dev
```

## ✅ Done!

Your backend now supports background removal at:
```
POST http://localhost:4000/api/v1/files/remove-background
```

## 🐛 Common Issues

### "python: command not found"
- Python not in PATH
- Try `python3` instead of `python`
- Reinstall Python and check "Add to PATH"

### "pip: command not found"
- Try `python -m pip install -r python/requirements.txt`
- Or `python3 -m pip install -r python/requirements.txt`

### "No matching distribution found for torch"
- Your Python version might be too old
- Upgrade to Python 3.8 or higher

### Installation takes forever
- PyTorch is a large package (~1-2 GB)
- First install can take 10-15 minutes
- Be patient!

## 💾 Disk Space

Make sure you have at least:
- **2 GB** for Python packages
- **200 MB** for U²-Net model (already included)

## 🚀 GPU Acceleration (Optional)

For faster processing, install CUDA-enabled PyTorch:

1. Check if you have NVIDIA GPU
2. Install CUDA Toolkit
3. Install GPU version of PyTorch:

```bash
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

This can make background removal **10x faster**!

## 📝 Next Steps

1. Start backend: `npm run dev`
2. Test with Postman or your frontend
3. Check `BACKGROUND_REMOVAL_SETUP.md` for detailed docs
