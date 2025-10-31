"use client";

import React, { useMemo, useState } from 'react';
import ToolInputCard from '@/components/tools/ToolInputCard';
import { Card, CardContent } from '@/components/ui/card';

export default function TransparentMakerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const file = files[0] || null;
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Make Background Transparent (UI Preview)</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            <ToolInputCard
              id="transparent-upload"
              accept="image/*"
              files={files}
              onFilesSelected={setFiles}
              endpoint="/image/make-transparent"
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
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <p className="text-sm text-gray-500 mb-3">This preview simulates a transparent background by showing the image over a checkerboard.</p>
            {previewUrl ? (
              <div className="rounded-md overflow-hidden bg-white border">
                <img src={previewUrl} alt="preview" className="w-full h-64 object-contain" />
              </div>
            ) : (
              <div className="text-sm text-gray-400">No image selected</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}