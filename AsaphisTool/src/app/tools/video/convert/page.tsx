'use client';

import React, { useState } from 'react';
import { ToolPageLayout } from '@/components/ui/ToolPageLayout';
import { Select } from '@/components/ui/select';
import { tools } from '@/data/tools';
import { getApiBase } from '@/lib/api';

const acceptedFiles = {
  'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv']
};

const formats = [
  { label: 'MP4', value: 'mp4' },
  { label: 'WebM', value: 'webm' },
  { label: 'AVI', value: 'avi' },
  { label: 'MOV', value: 'mov' }
];

export default function VideoConverter() {
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<string>();

  const tool = tools.find(t => t.id === 'video-converter')!;

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);
      setError(undefined);
      setResult(undefined);

      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('format', format);
      formData.append('quality', quality);

      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/video/convert`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to convert video');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert video');
    } finally {
      setUploading(false);
    }
  };

  const settings = (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Output Format
        </label>
        <Select
          value={format}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value)}
          options={formats}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality
        </label>
        <Select
          value={quality}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuality(e.target.value)}
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' }
          ]}
        />
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      tool={tool}
      accept={acceptedFiles}
      onUpload={handleUpload}
      uploading={uploading}
      error={error}
      settings={settings}
      result={result && (
        <div className="mt-4">
          <p className="text-green-600 mb-4">Video converted successfully!</p>
          <a
            href={result}
            download={`converted.${format}`}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Download Converted Video
          </a>
        </div>
      )}
    />
  );
}