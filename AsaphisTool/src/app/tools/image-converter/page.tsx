"use client";

import React, { useState } from 'react';
import ToolInputCard from '@/components/tools/ToolInputCard';
import { Card, CardContent } from '@/components/ui/card';
 // using native select for simpler client-only UI

export default function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState('png');

  const formats = [
    { value: 'png', label: 'PNG - Best for graphics with transparency' },
    { value: 'jpg', label: 'JPG - Best for photos and web images' },
    { value: 'webp', label: 'WebP - Modern format with good compression' },
    { value: 'gif', label: 'GIF - Best for simple animations' }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Format Converter</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Input</h2>
                <div className="space-y-4">
                  <div className="max-w-xs">
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                    <select id="format" value={format} onChange={(e) => setFormat(e.target.value)} className="w-full border rounded px-3 py-2">
                      {formats.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <ToolInputCard
                    id="image-upload"
                    accept="image/*"
                    files={files}
                    onFilesSelected={setFiles}
                    endpoint="/image/convert"
                    format={format}
                    clientOnly={true}
                    maxSizeText="Maximum file size: 50MB"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">How to use Image Format Converter</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Select the output format you want</li>
              <li>Click "Choose file" to select your image</li>
              <li>Once selected, click "Process" to convert</li>
              <li>When complete, your converted image will download automatically</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}