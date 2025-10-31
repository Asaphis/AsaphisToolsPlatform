import React from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  original: string;
  processed?: string;
  processing?: boolean;
}

export function ImagePreview({ original, processed, processing }: ImagePreviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Original</h3>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={original}
            alt="Original image"
            fill
            className="object-contain"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Processed</h3>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
          {processing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : processed ? (
            <Image
              src={processed}
              alt="Processed image"
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-500">Processing result will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}