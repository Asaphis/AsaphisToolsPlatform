"""
Setup script for background removal
Installs dependencies and downloads the U2-Net model
"""
import os
import sys
import urllib.request
import subprocess

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing Python dependencies...")
    
    packages = [
        "torch",
        "torchvision", 
        "Pillow",
        "numpy",
        "opencv-python",
        "scipy"
    ]
    
    try:
        for package in packages:
            print(f"  Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--quiet"])
        print("✅ All dependencies installed!\n")
        return True
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def download_model():
    """Download U2-Net model file"""
    print("🤖 Downloading U2-Net model...")
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    model_path = os.path.join(model_dir, 'u2net.pth')
    
    # Create models directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)
    
    # Check if model already exists
    if os.path.exists(model_path):
        print(f"✅ Model already exists at {model_path}\n")
        return True
    
    # Download model
    model_url = "https://github.com/xuebinqin/U-2-Net/releases/download/1.0/u2net.pth"
    
    try:
        print(f"  Downloading from {model_url}")
        print("  This may take a few minutes (176 MB)...")
        
        def progress_hook(count, block_size, total_size):
            percent = int(count * block_size * 100 / total_size)
            sys.stdout.write(f"\r  Progress: {percent}%")
            sys.stdout.flush()
        
        urllib.request.urlretrieve(model_url, model_path, progress_hook)
        print("\n✅ Model downloaded successfully!\n")
        return True
    except Exception as e:
        print(f"\n❌ Error downloading model: {e}")
        print("\nPlease download manually from:")
        print(f"  {model_url}")
        print(f"And place it at: {model_path}\n")
        return False

def install_rembg_optional():
    """Optionally install rembg for best quality"""
    print("🌟 Optional: Install rembg for professional quality?")
    print("  This provides the best results but requires more disk space.")
    response = input("  Install rembg? (y/n): ").lower()
    
    if response == 'y':
        try:
            print("  Installing rembg...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg"])
            print("✅ rembg installed! You can now use remove_bg_pro.py\n")
            return True
        except Exception as e:
            print(f"❌ Error installing rembg: {e}\n")
            return False
    else:
        print("  Skipping rembg installation.\n")
        return False

def main():
    print("=" * 60)
    print("  AsaPhisTool Background Removal Setup")
    print("=" * 60)
    print()
    
    # Step 1: Install dependencies
    if not install_dependencies():
        print("⚠️  Warning: Some dependencies failed to install.")
        print("   Background removal may not work correctly.\n")
    
    # Step 2: Download model
    if not download_model():
        print("⚠️  Warning: Model file not downloaded.")
        print("   Background removal will not work without the model.\n")
        return False
    
    # Step 3: Optional rembg installation
    install_rembg_optional()
    
    print("=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print()
    print("You can now use background removal:")
    print("  python scripts/remove_bg.py input.jpg output.png")
    print()
    if os.path.exists(os.path.join(os.path.dirname(__file__), 'scripts', 'remove_bg_pro.py')):
        print("For best quality (if rembg installed):")
        print("  python scripts/remove_bg_pro.py input.jpg output.png")
        print()
    
    return True

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
