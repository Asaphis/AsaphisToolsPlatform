"use client";

import React, { useRef, useState } from 'react';
import { processFile } from '@/lib/fileProcessing';

interface Props {
  id: string;
  accept?: string;
  multiple?: boolean;
  files?: File[];
  onFilesSelected: (files: File[]) => void;
  maxSizeText?: string;
  label?: string;
  endpoint?: string;
  format?: string;
  clientOnly?: boolean;
}

export default function ToolInputCard({ 
  id, 
  accept = '*/*', 
  multiple = false, 
  files = [], 
  onFilesSelected, 
  maxSizeText = 'Maximum file size: 50MB', 
  label = 'Choose file',
  endpoint,
  format,
  clientOnly = false
}: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const list = e.target.files ? Array.from(e.target.files) : [];
    onFilesSelected(list);
  };

  const handleProcess = async () => {
    if (!files.length || !endpoint) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
  if (clientOnly) {
        // simulated client-side processing
        await clientProcess(files[0]);
      } else {
        await processFile({
          endpoint,
          file: files[0],
          format,
          onProgress: (p) => setProgress(p),
          onError: (err) => setError(err),
          onSuccess: () => {
            setProgress(100);
            // Clear after successful processing
            if (ref.current) ref.current.value = '';
            onFilesSelected([]);
          }
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // helper: small delay
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const clientProcess = async (file: File) => {
    try {
      setProgress(5);
      await delay(200);
      setProgress(20);

      // Image conversion (client-side via canvas) when possible
      if (file.type.startsWith('image/') && format) {
        const imgUrl = URL.createObjectURL(file);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imgUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(img, 0, 0);

        setProgress(50);
        await delay(300);

        const mime = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve as any, mime, 0.92));
        if (!blob) throw new Error('Failed to produce image');

        setProgress(80);
        await delay(200);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const base = file.name.replace(/\.[^.]+$/, '');
        a.download = `${base}.${format}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();

        // finish
        setProgress(100);
        if (ref.current) ref.current.value = '';
        onFilesSelected([]);
        return;
      }

      // Video -> audio simulation: provide download with renamed extension
      if (file.type.startsWith('video/') && format) {
        setProgress(60);
        await delay(300);
        // use original file blob for download but change name
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const base = file.name.replace(/\.[^.]+$/, '');
        a.download = `${base}.${format}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();

        setProgress(100);
        if (ref.current) ref.current.value = '';
        onFilesSelected([]);
        return;
      }

      // Default: just trigger download of the original file (simulate)
      setProgress(70);
      await delay(200);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();

      setProgress(100);
      if (ref.current) ref.current.value = '';
      onFilesSelected([]);
    } catch (err: any) {
      setError(err?.message || 'Client processing failed');
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
      <div className="text-gray-500 mb-3">Upload a file to convert</div>
      <div className="text-sm text-gray-400 mb-4">{maxSizeText}</div>

      <input id={id} ref={ref} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
      
      <div className="space-x-4">
        <label htmlFor={id} className="inline-flex items-center px-4 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
          {label}
        </label>

        {files.length > 0 && endpoint && (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${
              isProcessing 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 text-left">
          <strong>Selected:</strong>
          <ul className="list-disc ml-5 text-sm mt-2">
            {files.map((f, i) => (<li key={i}>{f.name} • {(f.size/1024|0)} KB</li>))}
          </ul>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
