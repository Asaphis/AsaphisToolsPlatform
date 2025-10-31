"use client";

import React, { useState, useMemo } from 'react';
import ToolInputCard from '@/components/tools/ToolInputCard';
import { Card, CardContent } from '@/components/ui/card';

export default function BackgroundBlurPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState({ intensity: 50, radius: 20 });

  const file = files[0] || null;
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Background Blur (UI Preview)</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            <ToolInputCard
              id="bg-blur-upload"
              accept="image/*"
              files={files}
              onFilesSelected={setFiles}
              endpoint="/image/blur-background"
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
            <h2 className="text-lg font-semibold mb-4">Preview & Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Blur Radius: {settings.radius}px</label>
                <input type="range" min={0} max={100} value={settings.radius} onChange={(e) => setSettings(s => ({ ...s, radius: parseInt(e.target.value) }))} className="w-full" />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Intensity: {settings.intensity}%</label>
                <input type="range" min={0} max={100} value={settings.intensity} onChange={(e) => setSettings(s => ({ ...s, intensity: parseInt(e.target.value) }))} className="w-full" />
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-500 mb-2">Live preview (simulated):</div>
                {previewUrl ? (
                  <div className="w-full h-64 overflow-hidden rounded-md bg-white flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        filter: `blur(${settings.radius}px) saturate(${1 + settings.intensity / 100})`
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No image selected</div>
                )}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">Note: This is a client-side UI preview only. The actual background-aware blur requires a backend/image model. The Process button will simulate producing a downloadable file.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}