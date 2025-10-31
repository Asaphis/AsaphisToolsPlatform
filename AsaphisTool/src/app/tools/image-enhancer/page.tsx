"use client";

import React, { useMemo, useState } from 'react';
import ToolInputCard from '@/components/tools/ToolInputCard';
import { Card, CardContent } from '@/components/ui/card';

export default function ImageEnhancerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Enhancer (UI Preview)</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            <ToolInputCard
              id="image-upload"
              accept="image/*"
              files={files}
              onFilesSelected={setFiles}
              endpoint="/image/enhance"
              maxSizeText="Maximum file size: 50MB"
              clientOnly={true}
            />

            {file && (
              <div className="mt-4 text-sm text-gray-600">Selected: {file.name} • {(file.size/1024|0)} KB</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">How to use Image Enhancer</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Click "Choose file" to select your image</li>
              <li>Once selected, click "Process" to simulate enhancement</li>
              <li>When complete, the enhanced image will download automatically</li>
            </ol>

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">Live preview (simulated enhancement):</div>
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-64 object-contain rounded-md border" style={{ filter: 'contrast(1.08) saturate(1.05)'}} />
              ) : (
                <div className="text-sm text-gray-400">No image selected</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}