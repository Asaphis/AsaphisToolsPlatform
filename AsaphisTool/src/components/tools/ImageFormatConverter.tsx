'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NextImage from 'next/image';

export function ImageFormatConverter() {
  const [images, setImages] = useState<{ id: string; src: string; name: string; outUrl: string; outName: string; }[]>([]);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  const [quality, setQuality] = useState(90);

  const convertFile = async (file: File) => {
    return new Promise<{ outUrl: string; outName: string }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D not supported'));
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);

          let mime = 'image/webp';
          if (format === 'jpeg') mime = 'image/jpeg';
          if (format === 'png') mime = 'image/png';

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to convert'));
            const url = URL.createObjectURL(blob);
            const base = file.name.replace(/\.[^.]+$/, '');
            const ext = format === 'jpeg' ? 'jpg' : format;
            resolve({ outUrl: url, outName: `${base}.${ext}` });
          }, mime, format === 'png' ? undefined : quality / 100);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (accepted: File[]) => {
    const outputs: any[] = [];
    for (const f of accepted) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const { outUrl, outName } = await convertFile(f);
        outputs.push({ id: `${Date.now()}-${Math.random()}`, src: URL.createObjectURL(f), name: f.name, outUrl, outName });
      } catch {}
    }
    setImages(prev => [...prev, ...outputs]);
  }, [format, quality]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const download = (item: any) => {
    const a = document.createElement('a');
    a.href = item.outUrl; a.download = item.outName; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const clearAll = () => {
    images.forEach(i => URL.revokeObjectURL(i.outUrl));
    setImages([]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🔄 Image Format Converter</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Convert images to JPEG, PNG, or WebP completely in your browser.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="webp">WebP</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality: {quality}%</label>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-full" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quality applies to JPEG/WebP</p>
          </div>
          <div className="flex items-end">
            <button onClick={clearAll} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Clear All</button>
          </div>
        </div>
      </div>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 dark:border-gray-600'}`}>
        <input {...getInputProps()} />
        <div className="text-6xl">🖼️</div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Drag & drop images or click to browse</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="p-4 border rounded-lg dark:border-gray-700">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded mb-3 overflow-hidden">
                <NextImage src={img.outUrl} alt={img.outName} fill className="object-contain" />
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{img.outName}</div>
              <button onClick={() => download(img)} className="mt-2 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
