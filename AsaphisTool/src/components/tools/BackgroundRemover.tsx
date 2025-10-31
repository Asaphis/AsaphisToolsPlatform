'use client';

import React from 'react';

export function BackgroundRemover() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Background Remover</h2>
      <p className="text-sm text-gray-600 mb-4">Upload an image to remove its background. This tool uses AI segmentation to create a transparent PNG.</p>
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input type="file" accept="image/*" className="mx-auto" />
        <div className="text-xs text-gray-500 mt-2">Max file size: 50MB</div>
      </div>
    </div>
  );
}
