"""
Professional Background Removal Script
Uses advanced AI models with edge refinement for perfect results
"""
import sys
import os
import base64
import io
import json
from PIL import Image
import numpy as np

def refine_alpha_channel(image, feather_amount=2):
    """
    Refine alpha channel for smooth, professional edges
    """
    if image.mode != 'RGBA':
        return image
    
    # Extract alpha channel
    r, g, b, a = image.split()
    
    # Convert to numpy for processing
    alpha_np = np.array(a).astype(np.float32) / 255.0
    
    # Apply edge smoothing
    try:
        import cv2
        
        # Apply bilateral filter to preserve edges while smoothing
        alpha_np_8bit = (alpha_np * 255).astype(np.uint8)
        alpha_filtered = cv2.bilateralFilter(alpha_np_8bit, 9, 75, 75)
        alpha_np = alpha_filtered.astype(np.float32) / 255.0
        
        # Apply morphological operations to clean up mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_8bit = (alpha_np * 255).astype(np.uint8)
        
        # Close small holes
        alpha_8bit = cv2.morphologyEx(alpha_8bit, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        # Remove small noise
        alpha_8bit = cv2.morphologyEx(alpha_8bit, cv2.MORPH_OPEN, kernel, iterations=1)
        
        alpha_np = alpha_8bit.astype(np.float32) / 255.0
        
    except ImportError:
        # Fallback to scipy if cv2 not available
        try:
            from scipy.ndimage import gaussian_filter, binary_closing, binary_opening
            
            # Smooth alpha channel
            alpha_np = gaussian_filter(alpha_np, sigma=feather_amount)
            
            # Clean up binary mask
            binary_mask = alpha_np > 0.5
            binary_mask = binary_closing(binary_mask, iterations=2)
            binary_mask = binary_opening(binary_mask, iterations=1)
            
            # Blend cleaned mask with smoothed alpha
            alpha_np = alpha_np * 0.7 + binary_mask.astype(np.float32) * 0.3
            
        except ImportError:
            pass  # Use original alpha if no libraries available
    
    # Convert back to PIL Image
    alpha_refined = Image.fromarray((alpha_np * 255).astype(np.uint8), mode='L')
    
    # Merge channels back
    return Image.merge('RGBA', (r, g, b, alpha_refined))

def remove_background_rembg(image_path, output_path=None):
    """
    Remove background using rembg library (state-of-the-art)
    """
    try:
        from rembg import remove
        
        # Load image
        with open(image_path, 'rb') as f:
            input_data = f.read()
        
        # Remove background with high quality settings
        output_data = remove(
            input_data,
            alpha_matting=True,
            alpha_matting_foreground_threshold=270,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
            post_process_mask=True
        )
        
        # Load as PIL Image
        output_image = Image.open(io.BytesIO(output_data))
        
        # Apply additional refinement
        output_image = refine_alpha_channel(output_image, feather_amount=1)
        
        # Save or return base64
        if output_path:
            output_image.save(output_path, 'PNG', optimize=True)
            return output_path
        else:
            buffered = io.BytesIO()
            output_image.save(buffered, format='PNG', optimize=True)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return img_str
            
    except ImportError:
        raise ImportError("rembg library not installed. Install with: pip install rembg")

def remove_background_custom(image_path, output_path=None):
    """
    Fallback: Remove background using custom U2-Net implementation
    """
    # Import the existing remove_bg.py
    sys.path.insert(0, os.path.dirname(__file__))
    from remove_bg import remove_background as remove_bg_fallback
    
    return remove_bg_fallback(image_path, output_path)

def remove_background(image_path, output_path=None, method='auto'):
    """
    Main function to remove background with automatic method selection
    
    Args:
        image_path: Path to input image
        output_path: Optional path to save output
        method: 'auto', 'rembg', or 'custom'
    
    Returns:
        Path to output file or base64 string
    """
    # Auto-select best available method
    if method == 'auto':
        try:
            import rembg
            method = 'rembg'
        except ImportError:
            method = 'custom'
    
    if method == 'rembg':
        return remove_background_rembg(image_path, output_path)
    else:
        return remove_background_custom(image_path, output_path)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input image provided"}))
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    method = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    try:
        result = remove_background(input_path, output_path, method)
        if output_path:
            print(json.dumps({"status": "success", "path": result, "method": method}))
        else:
            print(json.dumps({"status": "success", "image": f"data:image/png;base64,{result}", "method": method}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
