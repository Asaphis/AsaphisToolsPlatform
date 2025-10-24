"""
Script to download the U²-Net pretrained model.
Run this after installing Python dependencies.
"""

import urllib.request
import os
import sys

def download_model():
    url = "https://github.com/xuebinqin/U-2-Net/releases/download/v1.0/u2net.pth"
    
    # Get models directory path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    output_path = os.path.join(models_dir, 'u2net.pth')
    
    # Check if already downloaded
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        if file_size > 170_000_000:  # ~176 MB
            print(f"✓ Model already exists at: {output_path}")
            print(f"  File size: {file_size / 1_000_000:.1f} MB")
            return True
        else:
            print(f"⚠ Existing model file seems incomplete. Re-downloading...")
    
    print(f"Downloading U²-Net model from GitHub...")
    print(f"URL: {url}")
    print(f"Destination: {output_path}")
    print(f"Size: ~176 MB (this may take a few minutes)\n")
    
    def report_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(100, (downloaded / total_size) * 100)
        mb_downloaded = downloaded / 1_000_000
        mb_total = total_size / 1_000_000
        
        # Progress bar
        bar_length = 40
        filled = int(bar_length * percent / 100)
        bar = '=' * filled + '-' * (bar_length - filled)
        
        sys.stdout.write(f'\r[{bar}] {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)')
        sys.stdout.flush()
    
    try:
        urllib.request.urlretrieve(url, output_path, reporthook=report_progress)
        print("\n\n✓ Model downloaded successfully!")
        print(f"  Location: {output_path}")
        print(f"  Size: {os.path.getsize(output_path) / 1_000_000:.1f} MB")
        return True
    except Exception as e:
        print(f"\n\n✗ Error downloading model: {e}")
        if os.path.exists(output_path):
            os.remove(output_path)
        return False

if __name__ == '__main__':
    success = download_model()
    sys.exit(0 if success else 1)
