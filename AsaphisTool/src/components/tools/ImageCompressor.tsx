'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NextImage from 'next/image';
import { recordToolUsage } from '@/lib/analytics';

interface CompressedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  savings: number;
  downloadUrl: string;
}

export function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'auto' as 'auto' | 'jpeg' | 'png' | 'webp',
    progressive: true,
  });

  const compressImage = async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;

          if (width > settings.maxWidth) {
            width = settings.maxWidth;
            height = width / aspectRatio;
          }
          if (height > settings.maxHeight) {
            height = settings.maxHeight;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          // Apply image smoothing
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Determine output format
            let outputFormat = 'image/jpeg';
            if (settings.format === 'png') outputFormat = 'image/png';
            else if (settings.format === 'webp') outputFormat = 'image/webp';
            else if (settings.format === 'auto') {
              // Use WebP if supported, otherwise JPEG
              outputFormat = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'image/webp' : 'image/jpeg';
            }

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const originalSize = file.size;
                  const compressedSize = blob.size;
                  const savings = ((originalSize - compressedSize) / originalSize) * 100;

                  resolve({
                    id: Date.now().toString() + Math.random(),
                    originalFile: file,
                    originalSize,
                    compressedBlob: blob,
                    compressedSize,
                    savings: Math.max(0, savings),
                    downloadUrl: URL.createObjectURL(blob)
                  });
                } else {
                  reject(new Error('Failed to compress image'));
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
    const processedImages: CompressedImage[] = [];

    for (const file of acceptedFiles) {
      try {
        const compressed = await compressImage(file);
        processedImages.push(compressed);
      } catch (error) {
        console.error('Failed to compress image:', file.name, error);
      }
    }

    setImages(prev => [...prev, ...processedImages]);
    // Analytics: count files and size saved
    const sizeSavedBytes = processedImages.reduce((s, i) => s + (i.originalSize - i.compressedSize), 0);
    recordToolUsage('image-compressor', { action: 'Compressed', fileCount: processedImages.length, sizeSavedBytes });
    setIsProcessing(false);
  }, [settings, compressImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const downloadImage = (image: CompressedImage) => {
    const link = document.createElement('a');
    link.href = image.downloadUrl;
    link.download = `compressed-${image.originalFile.name.split('.')[0]}.${settings.format === 'auto' ? 'webp' : settings.format}`;
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
      // Clean up blob URLs
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

  const totalSavings = images.reduce((total, img) => total + (img.originalSize - img.compressedSize), 0);
  const avgSavings = images.length > 0 ? images.reduce((total, img) => total + img.savings, 0) / images.length : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🗜️ Image Compressor
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Reduce image file sizes while maintaining quality. Supports JPEG, PNG, WebP, and other formats.
          All processing happens in your browser - your images never leave your device.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compression Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Max Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Width (px)
            </label>
            <input
              type="number"
              value={settings.maxWidth}
              onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Max Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Height (px)
            </label>
            <input
              type="number"
              value={settings.maxHeight}
              onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Format
            </label>
            <select
              value={settings.format}
              onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="auto">Auto (WebP/JPEG)</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">🖼️</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Supports JPEG, PNG, WebP, GIF, BMP formats
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {isProcessing ? 'Processing images...' : 'Multiple files supported'}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {images.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compressed Images ({images.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total saved: {formatFileSize(totalSavings)} • Average: {avgSavings.toFixed(1)}% reduction
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download All
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                  <NextImage
                    src={image.downloadUrl}
                    alt={image.originalFile.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {image.originalFile.name}
                  </h4>
                  
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Original: {formatFileSize(image.originalSize)}</span>
                    <span>Compressed: {formatFileSize(image.compressedSize)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      image.savings > 50 ? 'text-green-600 dark:text-green-400' :
                      image.savings > 25 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {image.savings.toFixed(1)}% saved
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadImage(image)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          🔒 Privacy & Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>100% Client-Side Processing</strong>
            <p>Your images are processed entirely in your browser and never leave your device.</p>
          </div>
          <div>
            <strong>No Data Collection</strong>
            <p>We don't store, view, or have access to your images or any processed data.</p>
          </div>
          <div>
            <strong>Instant Results</strong>
            <p>No uploads, no waiting. Processing happens instantly on your device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
