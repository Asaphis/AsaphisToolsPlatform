'use client';

import { useState, useCallback } from 'react';
import { recordToolUsage } from '@/lib/analytics';
import { useDropzone } from 'react-dropzone';
import NextImage from 'next/image';

interface ResizedImage {
  id: string;
  originalFile: File;
  originalDimensions: { width: number; height: number };
  resizedBlob: Blob;
  newDimensions: { width: number; height: number };
  downloadUrl: string;
}

interface ResizeSettings {
  method: 'percentage' | 'pixels' | 'preset';
  width: number;
  height: number;
  percentage: number;
  preset: string;
  maintainAspectRatio: boolean;
  resizeMode: 'stretch' | 'fit' | 'fill' | 'crop';
  quality: number;
  format: 'auto' | 'jpeg' | 'png' | 'webp';
}

const PRESET_DIMENSIONS = {
  'social-media': {
    'Instagram Square': { width: 1080, height: 1080 },
    'Instagram Story': { width: 1080, height: 1920 },
    'Facebook Cover': { width: 1200, height: 630 },
    'Twitter Header': { width: 1500, height: 500 },
    'YouTube Thumbnail': { width: 1280, height: 720 },
    'LinkedIn Post': { width: 1200, height: 627 },
  },
  'web': {
    'Website Banner': { width: 1920, height: 600 },
    'Blog Featured': { width: 1200, height: 630 },
    'Profile Picture': { width: 400, height: 400 },
    'Logo': { width: 500, height: 500 },
    'Icon': { width: 256, height: 256 },
  },
  'print': {
    'A4 (300 DPI)': { width: 2480, height: 3508 },
    'Letter (300 DPI)': { width: 2550, height: 3300 },
    'Business Card': { width: 1050, height: 600 },
    'Poster A3': { width: 3508, height: 4961 },
  },
  'mobile': {
    'iPhone 15 Wallpaper': { width: 1179, height: 2556 },
    'Android Wallpaper': { width: 1080, height: 1920 },
    'iPad Wallpaper': { width: 2048, height: 2732 },
    'Mobile Banner': { width: 320, height: 100 },
  }
};

export function ImageResizer() {
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ResizeSettings>({
    method: 'pixels',
    width: 1920,
    height: 1080,
    percentage: 50,
    preset: '',
    maintainAspectRatio: true,
    resizeMode: 'fit',
    quality: 90,
    format: 'auto'
  });
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('social-media');

  const resizeImage = async (file: File): Promise<ResizedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;
          
          let targetWidth = settings.width;
          let targetHeight = settings.height;

          // Calculate dimensions based on method
          if (settings.method === 'percentage') {
            targetWidth = Math.round(originalWidth * (settings.percentage / 100));
            targetHeight = Math.round(originalHeight * (settings.percentage / 100));
          } else if (settings.method === 'preset' && settings.preset) {
            const presetDims = Object.values(PRESET_DIMENSIONS)
              .flat()
              .find(p => Object.keys(p)[0] === settings.preset);
            if (presetDims) {
              const dims = Object.values(presetDims)[0];
              targetWidth = dims.width;
              targetHeight = dims.height;
            }
          }

          // Handle aspect ratio maintenance and resize modes
          let finalWidth = targetWidth;
          let finalHeight = targetHeight;
          let drawX = 0;
          let drawY = 0;
          let drawWidth = targetWidth;
          let drawHeight = targetHeight;

          if (settings.maintainAspectRatio && settings.method !== 'percentage') {
            const aspectRatio = originalWidth / originalHeight;
            
            switch (settings.resizeMode) {
              case 'fit':
                if (targetWidth / targetHeight > aspectRatio) {
                  finalWidth = Math.round(targetHeight * aspectRatio);
                  finalHeight = targetHeight;
                } else {
                  finalWidth = targetWidth;
                  finalHeight = Math.round(targetWidth / aspectRatio);
                }
                drawWidth = finalWidth;
                drawHeight = finalHeight;
                break;
                
              case 'fill':
                finalWidth = targetWidth;
                finalHeight = targetHeight;
                if (targetWidth / targetHeight > aspectRatio) {
                  drawHeight = targetHeight;
                  drawWidth = Math.round(targetHeight * aspectRatio);
                  drawX = Math.round((targetWidth - drawWidth) / 2);
                } else {
                  drawWidth = targetWidth;
                  drawHeight = Math.round(targetWidth / aspectRatio);
                  drawY = Math.round((targetHeight - drawHeight) / 2);
                }
                break;
                
              case 'crop':
                finalWidth = targetWidth;
                finalHeight = targetHeight;
                const scale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
                drawWidth = targetWidth;
                drawHeight = targetHeight;
                break;
                
              case 'stretch':
              default:
                // Keep target dimensions, stretch image
                break;
            }
          }

          canvas.width = finalWidth;
          canvas.height = finalHeight;

          if (ctx) {
            // Clear canvas with white background for JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, finalWidth, finalHeight);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            if (settings.resizeMode === 'crop') {
              // For crop mode, we need to scale and position the image
              const scale = Math.max(finalWidth / originalWidth, finalHeight / originalHeight);
              const scaledWidth = originalWidth * scale;
              const scaledHeight = originalHeight * scale;
              const offsetX = (finalWidth - scaledWidth) / 2;
              const offsetY = (finalHeight - scaledHeight) / 2;
              
              ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            } else {
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }

            // Determine output format
            let outputFormat = 'image/jpeg';
            let extension = 'jpg';
            
            if (settings.format === 'png') {
              outputFormat = 'image/png';
              extension = 'png';
            } else if (settings.format === 'webp') {
              outputFormat = 'image/webp';
              extension = 'webp';
            } else if (settings.format === 'auto') {
              // Use original format or WebP if supported
              if (file.type === 'image/png') {
                outputFormat = 'image/png';
                extension = 'png';
              } else if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
                outputFormat = 'image/webp';
                extension = 'webp';
              }
            }

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({
                    id: Date.now().toString() + Math.random(),
                    originalFile: file,
                    originalDimensions: { width: originalWidth, height: originalHeight },
                    resizedBlob: blob,
                    newDimensions: { width: finalWidth, height: finalHeight },
                    downloadUrl: URL.createObjectURL(blob)
                  });
                } else {
                  reject(new Error('Failed to resize image'));
                }
              },
              outputFormat,
              settings.quality / 100
            );
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const processedImages: ResizedImage[] = [];

    for (const file of acceptedFiles) {
      try {
        const resized = await resizeImage(file);
        processedImages.push(resized);
      } catch (error) {
        console.error('Failed to resize image:', file.name, error);
      }
    }

    setImages(prev => [...prev, ...processedImages]);
    recordToolUsage('image-resizer', { action: 'Resized', fileCount: processedImages.length });
    setIsProcessing(false);
  }, [settings, resizeImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const downloadImage = (image: ResizedImage) => {
    const link = document.createElement('a');
    link.href = image.downloadUrl;
    const extension = settings.format === 'auto' ? 'jpg' : settings.format;
    link.download = `resized-${image.originalFile.name.split('.')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach(image => downloadImage(image));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.downloadUrl);
      }
      return updated;
    });
  };

  const clearAll = () => {
    images.forEach(image => URL.revokeObjectURL(image.downloadUrl));
    setImages([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const applyPreset = (presetName: string, dimensions: { width: number; height: number }) => {
    setSettings(prev => ({
      ...prev,
      method: 'preset',
      preset: presetName,
      width: dimensions.width,
      height: dimensions.height
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          📏 Image Resizer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Resize images to any dimension with advanced options. Perfect for social media, websites, and print.
          All processing happens in your browser - your images never leave your device.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Resize Settings</h3>
        
        {/* Resize Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Resize Method
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'pixels', label: '📏 Custom Pixels', desc: 'Set exact width and height' },
              { value: 'percentage', label: '📊 Percentage', desc: 'Resize by percentage' },
              { value: 'preset', label: '⭐ Presets', desc: 'Popular dimensions' }
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setSettings(prev => ({ ...prev, method: method.value as ResizeSettings['method'] }))}
                className={`px-4 py-3 rounded-lg border text-left transition-colors ${
                  settings.method === method.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-sm">{method.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{method.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific controls */}
        {settings.method === 'pixels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Width (pixels)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={settings.width}
                onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (pixels)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={settings.height}
                onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {settings.method === 'percentage' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resize Percentage: {settings.percentage}%
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={settings.percentage}
              onChange={(e) => setSettings(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10%</span>
              <span>100%</span>
              <span>500%</span>
            </div>
          </div>
        )}

        {settings.method === 'preset' && (
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preset Category
              </label>
              <select
                value={selectedPresetCategory}
                onChange={(e) => setSelectedPresetCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="social-media">📱 Social Media</option>
                <option value="web">🌐 Web & Digital</option>
                <option value="print">🖨️ Print</option>
                <option value="mobile">📱 Mobile Devices</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(PRESET_DIMENSIONS[selectedPresetCategory as keyof typeof PRESET_DIMENSIONS] || {}).map(([name, dimensions]) => {
                const typedDimensions = dimensions as { width: number; height: number };
                return (
                  <button
                    key={name}
                    onClick={() => applyPreset(name, typedDimensions)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      settings.preset === name
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {typedDimensions.width} × {typedDimensions.height}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Aspect Ratio */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.maintainAspectRatio}
                onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maintain Aspect Ratio
              </span>
            </label>
          </div>

          {/* Resize Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resize Mode
            </label>
            <select
              value={settings.resizeMode}
              onChange={(e) => setSettings(prev => ({ ...prev, resizeMode: e.target.value as ResizeSettings['resizeMode'] }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="fit">Fit (letterbox)</option>
              <option value="fill">Fill (center crop)</option>
              <option value="crop">Crop (scale to fill)</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality: {settings.quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Format
            </label>
            <select
              value={settings.format}
              onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as ResizeSettings['format'] }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="auto">Auto</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">🖼️</div>
          <div>
            <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop images here...' : 'Upload Images to Resize'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop images here, or click to browse. Supports JPEG, PNG, WebP, GIF, and more.
            </p>
          </div>
          {isProcessing && (
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Processing images...
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {images.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resized Images ({images.length})
            </h3>
            <div className="flex gap-2">
              {images.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Download All
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <NextImage
                    src={image.downloadUrl}
                    alt="Resized preview"
                    width={64}
                    height={64}
                    className="object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {image.originalFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {image.originalDimensions.width} × {image.originalDimensions.height} → {' '}
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {image.newDimensions.width} × {image.newDimensions.height}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(image.originalFile.size)} → {formatFileSize(image.resizedBlob.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadImage(image)}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
