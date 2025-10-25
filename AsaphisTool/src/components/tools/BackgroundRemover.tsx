'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Loader2, ImagePlus } from 'lucide-react';
import { getApiBase } from '@/lib/api';
import { advancedClientSegmentation } from '@/lib/segmentation';

interface BackgroundOption {
  id: string;
  label: string;
  style: string;
  icon?: React.ReactNode;
}

export function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBg, setSelectedBg] = useState('transparent');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

// Handle background removal with backend API or client-side fallback
  const handleRemoveBackground = async () => {
    if (!image || !fileInputRef.current?.files?.[0]) return;

    setLoading(true);
    setProcessedImage(null);
    setError(null);

    const runClientSide = async () => {
      try {
        // Draw uploaded image to canvas
        const file = fileInputRef.current!.files![0];
        const imgEl = new Image();
        imgEl.crossOrigin = 'anonymous';
        const dataUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          imgEl.onload = () => resolve();
          imgEl.onerror = () => reject(new Error('Failed to load image'));
          imgEl.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width;
        canvas.height = imgEl.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(imgEl, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Compute foreground mask in-browser
        const mask = await advancedClientSegmentation(imgData, { tolerance: 28 });

        // Compose transparent PNG using mask as alpha
        const outData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < canvas.width * canvas.height; i++) {
          outData.data[i * 4] = imgData.data[i * 4];
          outData.data[i * 4 + 1] = imgData.data[i * 4 + 1];
          outData.data[i * 4 + 2] = imgData.data[i * 4 + 2];
          outData.data[i * 4 + 3] = mask[i];
        }
        ctx.putImageData(outData, 0, 0);
        const outPng = canvas.toDataURL('image/png');
        setProcessedImage(outPng);
      } catch (e: any) {
        setError(e?.message || 'Client-side processing failed');
      }
    };

    try {
      const file = fileInputRef.current.files[0];
      const apiBase = getApiBase();

      if (apiBase && apiBase.startsWith('http')) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${apiBase}/files/remove-background`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.image) {
            setProcessedImage(result.image);
          } else if (result.error) {
            // Fallback to client-side if backend returns error
            await runClientSide();
          }
        } else {
          // Fallback to client-side if server error
          await runClientSide();
        }
      } else {
        // No backend configured -> client-side processing
        await runClientSide();
      }
    } catch (err: any) {
      console.error('Background removal failed:', err);
      await runClientSide();
    } finally {
      setLoading(false);
    }
  };

  // Handle custom background upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedBg(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download image with selected background
  const handleDownload = () => {
    if (!processedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background
      if (selectedBg === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBg === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#9333ea');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBg.startsWith('data:image')) {
        // Custom background image
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          downloadCanvas(canvas);
        };
        bgImg.src = selectedBg;
        return;
      }

      // Draw transparent image on top
      ctx.drawImage(img, 0, 0);
      downloadCanvas(canvas);
    };
    img.src = processedImage;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `background-removed-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  const backgroundOptions: BackgroundOption[] = [
    {
      id: 'transparent',
      label: 'Transparent',
      style: "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2710%27><rect width=%275%27 height=%275%27 fill=%27%23ccc%27/><rect x=%275%27 y=%275%27 width=%275%27 height=%275%27 fill=%27%23ccc%27/></svg>')]",
    },
    { id: 'white', label: 'White', style: 'bg-white' },
    {
      id: 'gradient',
      label: 'Gradient',
      style: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
      id: 'abstract',
      label: 'Abstract',
      style:
        "bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80')] bg-cover",
    },
    {
      id: 'custom',
      label: 'Upload BG',
      style: 'bg-gray-100 dark:bg-gray-700',
      icon: <ImagePlus size={18} className="text-gray-600 dark:text-gray-300" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-10 px-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
        {/* LEFT SECTION */}
        <div className="flex flex-col space-y-5 md:w-1/2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-white flex items-center justify-center shadow-lg text-2xl">✂️</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Background Remover
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Instantly remove or replace backgrounds — free, fast, and AI-powered ✨
          </p>

          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md cursor-pointer transition-all duration-300 w-fit">
            <Upload size={20} />
            Upload a photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {image && !processedImage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleRemoveBackground}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold w-fit shadow-md transition-all"
            >
              {loading ? 'Processing...' : 'Remove Background'}
            </motion.button>
          )}

          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline text-sm"
          >
            ▶ Watch how it works
          </a>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 relative min-h-[400px] flex items-center justify-center">
          {!image && (
            <p className="text-gray-400 dark:text-gray-500 text-lg text-center">
              Upload an image to start removing the background
            </p>
          )}

          {image && (
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              <div
                className={`absolute inset-0 bg-[size:20px_20px] bg-[position:0_0,10px_10px] bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] ${
                  selectedBg !== 'transparent' && processedImage ? 'hidden' : ''
                }`}
              />
              {selectedBg === 'white' && processedImage && (
                <div className="absolute inset-0 bg-white" />
              )}
              {selectedBg === 'gradient' && processedImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
              )}
              {selectedBg === 'abstract' && processedImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
              )}
              {selectedBg.startsWith('data:image') && processedImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedBg})` }}
                />
              )}
              <motion.img
                src={processedImage || image}
                alt="Preview"
                className="relative w-full h-auto object-contain rounded-2xl z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 rounded-2xl z-20">
              <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Processing image…
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BACKGROUND OPTIONS */}
      {processedImage && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Choose Background:
          </h3>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {backgroundOptions.map((bg) => (
              <button
                key={bg.id}
                onClick={() => {
                  if (bg.id === 'custom') {
                    customBgInputRef.current?.click();
                  } else {
                    setSelectedBg(bg.id);
                  }
                }}
                className={`w-16 h-16 rounded-xl border-2 ${
                  selectedBg === bg.id
                    ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 scale-105'
                    : 'border-gray-200 dark:border-gray-600'
                } transition-all duration-300 flex items-center justify-center ${
                  bg.style
                } shadow-md hover:scale-105`}
              >
                {bg.icon ? bg.icon : null}
              </button>
            ))}
          </div>
          <input
            ref={customBgInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomBgUpload}
            className="hidden"
          />
        </div>
      )}

      {/* DOWNLOAD BUTTON */}
      {processedImage && (
        <div className="mt-8 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md"
          >
            <Download size={20} />
            Download PNG
          </motion.button>

          <button
            onClick={() => {
              setImage(null);
              setProcessedImage(null);
              setError(null);
              setSelectedBg('transparent');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl font-medium shadow-sm"
          >
            Upload New Photo
          </button>
        </div>
      )}
    </div>
  );
}
