'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NextImage from 'next/image';
import { recordToolUsage } from '@/lib/analytics';
import { cn } from "@/lib/utils";
import { Download, Lock, Settings2, Upload, Image as ImageIcon, CircleEqual, Trash2 } from 'lucide-react';

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
  
  // Analytics tracking
  const onUse = useCallback(() => {
    if (images.length > 0) {
      const sizeSavedBytes = images.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0);
      recordToolUsage('image-compressor', {
        action: 'Viewed results',
        fileCount: images.length,
        sizeSavedBytes,
      });
    }
  }, [images]);

  const compressImage = async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imgEl = new window.Image();

      imgEl.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = imgEl.width;
          let height = imgEl.height;
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
            ctx.drawImage(imgEl, 0, 0, width, height);

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

      imgEl.onerror = () => reject(new Error('Failed to load image'));
      imgEl.src = URL.createObjectURL(file);
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
      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Image Compressor
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Optimize your images by reducing their file size while maintaining quality. Supports JPEG, PNG, WebP, and other formats.
          All processing happens in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Settings & Input */}
        <div className="lg:col-span-8 space-y-6">
          {/* Settings */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings2 className="mr-2 h-5 w-5" />
              Compression Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quality: {settings.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Max Width */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  value={settings.maxWidth}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              {/* Max Height */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  value={settings.maxHeight}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
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
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Images
            </h2>
            
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                isDragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {isDragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Supports JPEG, PNG, WebP, GIF, BMP formats
                  </p>
                  {isProcessing && (
                    <p className="text-sm text-blue-600 mt-2">Processing images...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Results & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {images.length > 0 ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <CircleEqual className="mr-2 h-5 w-5" />
                    Compression Results
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Total saved: {formatFileSize(totalSavings)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Average reduction: {avgSavings.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {images.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={downloadAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download All
                      </button>
                      <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-4">
                      {images.map((image) => (
                        <div key={image.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="relative aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <NextImage
                              src={image.downloadUrl}
                              alt={image.originalFile.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {image.originalFile.name}
                            </h4>
                            
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Original: {formatFileSize(image.originalSize)}</span>
                              <span>Compressed: {formatFileSize(image.compressedSize)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-sm font-medium",
                                image.savings > 50 ? "text-green-600" :
                                image.savings > 25 ? "text-yellow-600" :
                                "text-gray-600"
                              )}>
                                {image.savings.toFixed(1)}% saved
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => downloadImage(image)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => removeImage(image.id)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Privacy & Security
            </h2>
            <div className="space-y-4">
              <div>
                <strong className="block text-blue-800 mb-1">Client-Side Processing</strong>
                <p className="text-sm text-blue-700">Your images are processed entirely in your browser.</p>
              </div>
              <div>
                <strong className="block text-blue-800 mb-1">Data Security</strong>
                <p className="text-sm text-blue-700">Files never leave your device. No data collection or storage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
