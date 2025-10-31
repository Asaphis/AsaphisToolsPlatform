'use client';

import React, { useState } from 'react';
import { ToolPageLayout } from '@/components/ui/ToolPageLayout';
import { ImagePreview } from '@/components/ui/ImagePreview';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Select } from '@/components/ui/select';
import { tools } from '@/data/tools';
import { Slider } from '@/components/ui/slider';

const acceptedFiles = {
  'image/*': ['.jpg', '.jpeg', '.png', '.webp']
};

export default function ImageCompressor() {
  const [format, setFormat] = useState('jpg');
  const [quality, setQuality] = useState(80);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [originalUrl, setOriginalUrl] = useState<string>();
  const [processedUrl, setProcessedUrl] = useState<string>();
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);

  const tool = tools.find(t => t.id === 'image-compressor')!;

  const handleUpload = async (files: File[]) => {
    try {
      const file = files[0];
      setUploading(true);
      setError(undefined);
      setProgress(0);
      setOriginalUrl(URL.createObjectURL(file));
      setOriginalSize(file.size);
      setProcessedUrl(undefined);
      setProcessedSize(0);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('format', format);
      formData.append('quality', quality.toString());

      const response = await fetch('/api/v1/image/compress', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to compress image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessedSize(blob.size);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress image');
    } finally {
      setUploading(false);
    }
  };

  const settings = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Output Format
        </label>
        <Select
          value={format}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value)}
          options={[
            { label: 'JPEG', value: 'jpg' },
            { label: 'PNG', value: 'png' },
            { label: 'WebP', value: 'webp' }
          ]}
          disabled={uploading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality ({quality}%)
        </label>
        <Slider
          min={1}
          max={100}
          value={quality}
          onChange={setQuality}
          disabled={uploading}
        />
      </div>
    </div>
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <ToolPageLayout
      tool={tool}
      accept={acceptedFiles}
      onUpload={handleUpload}
      uploading={uploading}
      error={error}
      settings={settings}
      result={
        <>
          {(originalUrl || processedUrl) && (
            <ImagePreview
              original={originalUrl!}
              processed={processedUrl}
              processing={uploading}
            />
          )}
          
          {uploading && (
            <ProgressBar
              progress={progress}
              status="Compressing image..."
            />
          )}

          {processedUrl && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Original Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatBytes(originalSize)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Compressed Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatBytes(processedSize)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Size Reduction</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Math.round((1 - processedSize / originalSize) * 100)}% smaller
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <a
                  href={processedUrl}
                  download={`compressed.${format}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download Compressed Image
                </a>
              </div>
            </div>
          )}
        </>
      }
    />
  );
}