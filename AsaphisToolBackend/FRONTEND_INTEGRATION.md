# Frontend Integration Guide

How to connect your Next.js frontend to the background removal API.

## Step 1: Update Frontend Environment

In your frontend folder: `C:\Users\husse\AsaphisToolsPlatform\AsaphisTool`

Edit or create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Step 2: Update Background Remover Component

Find your background remover tool component (likely in `src/components/tools/` or `src/app/tools/background-remover/`).

### Replace the API call with:

```javascript
async function removeBackground(imageFile) {
  try {
    // Show loading state
    setLoading(true);
    setError(null);

    // Create form data
    const formData = new FormData();
    formData.append('image', imageFile);

    // Call backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/remove-background`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (data.success) {
      // Success! data.image contains base64 PNG
      setProcessedImage(data.image);
      setSuccess(true);
    } else {
      throw new Error(data.error || 'Background removal failed');
    }
  } catch (error) {
    console.error('Background removal error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

## Step 3: Complete Component Example

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setProcessedImage('');
      setError('');
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/remove-background`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        setProcessedImage(data.image);
      } else {
        throw new Error(data.error || 'Failed to remove background');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Background removal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Background Remover</h1>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm border rounded-lg cursor-pointer"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Original Image</h3>
          <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Remove Background Button */}
      {selectedFile && !processedImage && (
        <button
          onClick={handleRemoveBackground}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Processing...' : 'Remove Background'}
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            🤖 AI is removing the background... This may take 5-10 seconds.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Result */}
      {processedImage && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Result (Transparent Background)</h3>
          <div className="relative w-full h-64 border rounded-lg overflow-hidden" 
               style={{ 
                 backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                 backgroundSize: '20px 20px',
                 backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
               }}>
            <Image
              src={processedImage}
              alt="Result"
              fill
              className="object-contain"
            />
          </div>
          
          <button
            onClick={handleDownload}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Download PNG
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
        <h4 className="font-semibold mb-2">How to use:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Upload an image (JPEG, PNG, WebP)</li>
          <li>Click "Remove Background"</li>
          <li>Wait 5-10 seconds for AI processing</li>
          <li>Download your transparent PNG</li>
        </ol>
      </div>
    </div>
  );
}
```

## Step 4: Test It!

1. **Start the backend:**
   ```bash
   cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd C:\Users\husse\AsaphisToolsPlatform\AsaphisTool
   npm run dev
   ```

3. **Test the tool:**
   - Navigate to your background remover tool
   - Upload an image
   - Click "Remove Background"
   - Wait for processing
   - Download the result!

## API Response Format

```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "Background removed successfully"
}
```

## Error Handling

```javascript
// Handle different error cases
try {
  const response = await fetch(/* ... */);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Background removal failed');
  }

  // Success!
  setProcessedImage(data.image);

} catch (error) {
  // Show user-friendly error message
  if (error.message.includes('Python')) {
    setError('Backend not configured. Please contact support.');
  } else if (error.message.includes('fetch')) {
    setError('Cannot connect to server. Please check if backend is running.');
  } else {
    setError(error.message);
  }
}
```

## Loading States

Show progress to users:

```javascript
const [loadingStage, setLoadingStage] = useState('');

// Update stages
setLoadingStage('Uploading image...');
// ... upload
setLoadingStage('AI is analyzing...');
// ... processing
setLoadingStage('Removing background...');
// ... waiting
setLoadingStage('Almost done...');
// ... complete
setLoadingStage('');
```

## Background Color Options

Let users choose background colors:

```javascript
const [bgColor, setBgColor] = useState('transparent');

// After getting the result, compose with background
const applyBackground = (imageBase64, color) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageBase64;
  });
};
```

## Complete Flow

```
User Action          Frontend                    Backend                 Python
─────────────────────────────────────────────────────────────────────────────────
1. Upload Image  →   Select file
2. Click Remove  →   Send FormData           →   Receive upload
                                              →   Save to /uploads
                                              →   Call Python script  →   Load model
                                                                      →   Process image
                                              ←   Read result PNG     ←   Save output
                 ←   Receive base64
3. Display       ←   Show image
4. Download      →   Create download link
```

## Tips

1. **Add file size validation** before upload:
   ```javascript
   if (file.size > 10 * 1024 * 1024) {
     alert('File too large. Max 10MB.');
     return;
   }
   ```

2. **Add image type validation**:
   ```javascript
   const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
   if (!validTypes.includes(file.type)) {
     alert('Please upload JPEG, PNG, or WebP');
     return;
   }
   ```

3. **Show processing time**:
   ```javascript
   const startTime = Date.now();
   // ... process
   const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
   console.log(`Processed in ${elapsed}s`);
   ```

4. **Cache results** to avoid reprocessing:
   ```javascript
   const cache = new Map();
   const cacheKey = file.name + file.size;
   
   if (cache.has(cacheKey)) {
     return cache.get(cacheKey);
   }
   ```

## 🎉 You're Ready!

Your frontend is now connected to the AI background removal backend!

Users can:
- ✅ Upload images
- ✅ Remove backgrounds with AI
- ✅ Download transparent PNGs
- ✅ See real-time progress

---

**Need help?** Check:
- Backend logs for errors
- Browser console for frontend errors
- Network tab to see API requests
- `BACKGROUND_REMOVAL_SETUP.md` for backend issues
