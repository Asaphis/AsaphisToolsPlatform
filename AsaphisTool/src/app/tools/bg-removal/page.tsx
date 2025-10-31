"use client";

import React, { useRef, useState } from 'react';
import AdSlot from '@/components/ads/AdSlot';
import { Cloud, ArrowRight, Upload, Loader2, Download, Edit3 } from 'lucide-react';
import { getApiBase } from '@/lib/api';
import { advancedClientSegmentation } from '@/lib/segmentation';
import { PhotoEditor } from '@/components/tools/PhotoEditor';

enum State {
  INITIAL = 'initial',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  DONE = 'done',
}

type BgType =
  | 'transparent'
  | 'white'
  | 'office'
  | 'nature'
  | 'studio'
  | 'city'
  | 'blue-gradient'
  | 'abstract'
  | 'custom';

type BgOption = { id: BgType; name: string; preview?: string };

const BG_PREVIEWS: Record<Exclude<BgType, 'transparent' | 'white' | 'blue-gradient' | 'custom'>, string> = {
  office:
    "url('https://images.unsplash.com/photo-1507209696998-3c532be9b2b1?auto=format&fit=crop&w=600&q=60')",
  nature:
    "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60')",
  studio:
    "url('https://images.unsplash.com/photo-1520697222861-ea73b6eec8b2?auto=format&fit=crop&w=600&q=60')",
  city:
    "url('https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=600&q=60')",
  abstract:
    "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=60')",
};

export default function BgRemovalPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customBgRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<State>(State.INITIAL);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedBg, setSelectedBg] = useState<BgType>('transparent');
  // Image transformation controls
  const [fgX, setFgX] = useState<number>(0); // horizontal offset from center
  const [fgOffset, setFgOffset] = useState<number>(0); // vertical offset from bottom
  const [rotation, setRotation] = useState<number>(0); // degrees
  const [fgScale, setFgScale] = useState<number>(80); // scale as percentage (80% default for better fill)
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({ horizontal: false, vertical: false });
  const [effects, setEffects] = useState<{
    brightness: number; // 0-200, 100 is normal
    contrast: number; // 0-200, 100 is normal
    saturation: number; // 0-200, 100 is normal
    blur: number; // 0-10px
  }>({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
  
  // Zoom controls for preview
  const [previewZoom, setPreviewZoom] = useState<number>(100); // zoom percentage
  
  // Drag handling
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number; startX: number; startY: number; startRotation?: number }>({ x: 0, y: 0, startX: 0, startY: 0 });
  const [error, setError] = useState<string | null>(null);
  
  // Photo Editor states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  // Background options with default scale presets per type
  const bgOptions: (BgOption & { defaultScale?: number })[] = [
    { id: 'transparent', name: 'Transparent', defaultScale: 0.35 },
    { id: 'white', name: 'White', defaultScale: 0.35 },
    { id: 'office', name: 'Office', preview: BG_PREVIEWS.office, defaultScale: 0.3 },
    { id: 'nature', name: 'Nature', preview: BG_PREVIEWS.nature, defaultScale: 0.25 },
    { id: 'studio', name: 'Studio', preview: BG_PREVIEWS.studio, defaultScale: 0.4 },
    { id: 'city', name: 'City', preview: BG_PREVIEWS.city, defaultScale: 0.3 },
    { id: 'blue-gradient', name: 'Blue Gradient', defaultScale: 0.35 },
    { id: 'abstract', name: 'Abstract', preview: BG_PREVIEWS.abstract, defaultScale: 0.35 },
    { id: 'custom', name: 'Upload Custom' },
  ];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('handleFile: file selected', file.name, file.size);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadedFile(file);
    setProcessedUrl(null);
    setSelectedBg('transparent');
    setError(null);
    setState(State.UPLOADED);
  };

  const runClientSide = async (file: File): Promise<string | null> => {
    try {
      const imgEl = new Image();
      imgEl.crossOrigin = 'anonymous';
      const objUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = () => reject(new Error('Failed to load image'));
        imgEl.src = objUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = imgEl.width; canvas.height = imgEl.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(imgEl, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const mask = await advancedClientSegmentation(imgData, { tolerance: 28 });

      const out = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < canvas.width * canvas.height; i++) {
        out.data[i * 4] = imgData.data[i * 4];
        out.data[i * 4 + 1] = imgData.data[i * 4 + 1];
        out.data[i * 4 + 2] = imgData.data[i * 4 + 2];
        out.data[i * 4 + 3] = mask[i];
      }
      ctx.putImageData(out, 0, 0);
      return canvas.toDataURL('image/png');
    } catch (e: any) {
      setError(e?.message || 'Client-side processing failed');
      return null;
    }
  };

  const removeBg = async () => {
    const file = uploadedFile || fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please choose an image first');
      return;
    }
    console.log('removeBg: starting removal for', file.name);
    setError(null);
    setState(State.PROCESSING);

    try {
      const apiBase = getApiBase();
      if (apiBase && apiBase.startsWith('http')) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch(`${apiBase}/files/remove-background`, { method: 'POST', body: fd });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.image) {
            setProcessedUrl(json.image);
          } else {
            const out = await runClientSide(file);
            if (out) setProcessedUrl(out);
          }
        } else {
          const out = await runClientSide(file);
          if (out) setProcessedUrl(out);
        }
      } else {
        const out = await runClientSide(file);
        if (out) setProcessedUrl(out);
      }
      setState(State.DONE);
    } catch (e) {
      const out = await runClientSide(file);
      if (out) {
        setProcessedUrl(out);
        setState(State.DONE);
      } else {
        setState(State.UPLOADED);
      }
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedBg('custom');
      setCustomBg(String(ev.target?.result || ''));
    };
    reader.readAsDataURL(file);
  };

  // Handle drag interactions for foreground positioning
  const handleDragStart = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    setIsDragging(true);
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    dragStart.current = {
      x: point.clientX,
      y: point.clientY,
      startX: fgX,
      startY: fgOffset,
    };
  };

  const handleDragMove = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const container = e.currentTarget.parentElement;
    if (!container) return;

    const point = 'touches' in e ? e.touches[0] : e;
    const rect = container.getBoundingClientRect();
    
    // Calculate movement as percentage of container size
    const deltaX = (point.clientX - dragStart.current.x) / rect.width * 100;
    const deltaY = (point.clientY - dragStart.current.y) / rect.height * 100;

    // Update position with constraints
    const newX = Math.max(-30, Math.min(30, dragStart.current.startX + deltaX));
    const newY = Math.max(-30, Math.min(30, dragStart.current.startY + deltaY));

    setFgX(newX);
    setFgOffset(newY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const [customBg, setCustomBg] = useState<string>('');

  // Helper to load and optionally resize an image while maintaining aspect ratio
  const loadImage = async (src: string, maxSize = 2048) => new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => {
      // Check if resizing is needed (if either dimension exceeds maxSize)
      if (i.width > maxSize || i.height > maxSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(i); // fallback to original if canvas not supported
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        let newWidth = i.width;
        let newHeight = i.height;
        if (i.width > i.height) {
          newWidth = maxSize;
          newHeight = Math.round(i.height * (maxSize / i.width));
        } else {
          newHeight = maxSize;
          newWidth = Math.round(i.width * (maxSize / i.height));
        }

        // Create resized version
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(i, 0, 0, newWidth, newHeight);

        // Convert to new image
        const resized = new Image();
        resized.onload = () => resolve(resized);
        resized.onerror = (e) => reject(new Error('Failed to create resized image'));
        resized.src = canvas.toDataURL('image/jpeg', 0.92);
      } else {
        resolve(i);
      }
    };
    i.onerror = (e) => reject(new Error('Failed to load image ' + src));
    i.src = src;
  });

  const download = async () => {
    if (!processedUrl) return;

    try {
      // Use edited image if available, otherwise use original processed image
      const imageToDownload = editedImageUrl || processedUrl;
      const fg = await loadImage(imageToDownload);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Determine which background to use
      let backgroundImageUrl = null;
      if (customBg) {
        backgroundImageUrl = customBg;
      } else {
        const isImageBg = (id: BgType) => ['office', 'nature', 'studio', 'city', 'abstract'].includes(id);
        if (isImageBg(selectedBg)) {
          const preview = (BG_PREVIEWS as any)[selectedBg];
          const urlMatch = String(preview).match(/url\(['"]?(.*?)['"]?\)/);
          backgroundImageUrl = urlMatch ? urlMatch[1] : String(preview);
        }
      }

      if (backgroundImageUrl) {
        const bg = await loadImage(backgroundImageUrl);

        // use background natural size
        canvas.width = bg.width;
        canvas.height = bg.height;

        // draw background to cover canvas
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // scale foreground based on fgScale setting
        const scaleFactor = fgScale / 100; // Use the fgScale state
        const targetFgW = Math.floor(canvas.width * 0.35 * scaleFactor);
        const targetFgH = Math.floor(targetFgW * (fg.height / fg.width));
        const x = Math.floor((canvas.width - targetFgW) / 2) + fgX * 2;
        const baseY = Math.floor(canvas.height - targetFgH - Math.max(8, Math.floor(canvas.height * 0.04)));
        const y = baseY + fgOffset * 2;
        const xWithOffset = x;

        // draw foreground with transforms (rotation, flip) and filters (brightness/contrast/etc.)
        ctx.save();
        // move origin to center of where we want to draw
        const cx = xWithOffset + targetFgW / 2;
        const cy = y + targetFgH / 2;
        ctx.translate(cx, cy);
        if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        // apply filters
        try {
          ctx.filter = `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px)`;
        } catch (e) {
          // some environments may not support ctx.filter
        }
        ctx.drawImage(fg, -targetFgW / 2, -targetFgH / 2, targetFgW, targetFgH);
        ctx.restore();
      } else {
        // non-image backgrounds: create a slightly larger canvas so subject sits naturally
        canvas.width = Math.max(fg.width, Math.floor(fg.width * 1.4));
        canvas.height = Math.max(fg.height, Math.floor(fg.height * 1.4));

        // background fill
        if (selectedBg === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedBg === 'blue-gradient') {
          const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          g.addColorStop(0, '#3b82f6');
          g.addColorStop(1, '#6366f1');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // For non-image backgrounds, handle solid colors
          const bgType = selectedBg as BgType;
          if (bgType === 'white' && !customBg) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (bgType === 'blue-gradient' && !customBg) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#6366f1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          // For transparent, don't fill anything (keep transparent)
        }

        // foreground scaled and placed bottom-center using fgScale
        const scaleFactor = fgScale / 100; // Use the fgScale state
        const targetFgW = Math.floor(canvas.width * 0.35 * scaleFactor);
        const targetFgH = Math.floor(targetFgW * (fg.height / fg.width));
        const x = Math.floor((canvas.width - targetFgW) / 2) + fgX * 2;
        const baseY = Math.floor(canvas.height - targetFgH - Math.max(8, Math.floor(canvas.height * 0.04)));
        const y = baseY + fgOffset * 2;
        const xWithOffset = x;

        // draw foreground with transforms (rotation, flip) and filters
        ctx.save();
        const cx = xWithOffset + targetFgW / 2;
        const cy = y + targetFgH / 2;
        ctx.translate(cx, cy);
        if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        try {
          ctx.filter = `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px)`;
        } catch (e) {}
        ctx.drawImage(fg, -targetFgW / 2, -targetFgH / 2, targetFgW, targetFgH);
        ctx.restore();
      }

      // save
      saveCanvas(canvas);
    } catch (err: any) {
      console.error('Download composition failed', err);
      setError('Failed to prepare download');
    }
  };

  const saveCanvas = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bg-removed-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Compute preview background style for the processed preview area
  const getPreviewBgStyle = (): React.CSSProperties => {
    if (customBg) {
      return { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (selectedBg === 'transparent') {
      // keep checkerboard via CSS class on container
      return {};
    }
    if (selectedBg === 'white') {
      return { backgroundColor: '#ffffff' };
    }
    if (selectedBg === 'blue-gradient') {
      return { background: 'linear-gradient(90deg,#3b82f6,#6366f1)' };
    }
    // other previews (office, nature, studio, city, abstract)
    const preview = (BG_PREVIEWS as any)[selectedBg];
    if (preview) {
      // BG_PREVIEWS entries are `url('...')` strings; strip url(...) wrapper
      const urlMatch = String(preview).match(/url\(['"]?(.*?)['"]?\)/);
      const url = urlMatch ? urlMatch[1] : String(preview);
      return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  // Build CSS filter string from effects state
  const getFilterString = () => {
    const { brightness, contrast, saturation, blur } = effects;
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
  };

  // preview foreground style: place the processed foreground properly
  const getPreviewFgStyle = (): React.CSSProperties => {
    const scaleX = flip.horizontal ? -1 : 1;
    const scaleY = flip.vertical ? -1 : 1;
    
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) translate(${fgX * 2}px, ${fgOffset * 2}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      width: `${fgScale}%`,
      height: 'auto',
      maxWidth: '95%',
      maxHeight: '95%',
      objectFit: 'contain',
      cursor: 'move',
      userSelect: 'none',
      touchAction: 'none',
      filter: getFilterString(),
      transformOrigin: 'center',
      transition: 'all 0.2s ease',
    } as React.CSSProperties;
  };

  return (
    <>
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        .bg-removal-container {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }
      `}</style>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-removal-container">
      <div className="mb-2">
        <h1 className="text-4xl font-extrabold">Background remover</h1>
        <p className="text-gray-600">Instantly erase backgrounds from photos, free</p>
      </div>

      {/* Top Dashed panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Upload Panel */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white dark:bg-gray-800">
          {!previewUrl ? (
            <div className="h-[360px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Upload a photo</h3>
              <p className="text-sm text-gray-500 mb-4">Drag and drop or click to upload</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Choose File</button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
              <p className="mt-4 text-xs text-gray-500">Supports JPG, PNG, WEBP • Max 10MB</p>
            </div>
          ) : (
            <div className="p-3">
              <div className="h-[320px] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={previewUrl} alt="preview" className="max-h-full max-w-full object-contain" />
              </div>
              <button onClick={removeBg} disabled={state===State.PROCESSING} className={`w-full mt-4 py-3 rounded-lg text-white font-medium ${state===State.PROCESSING ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}> {state===State.PROCESSING ? 'Processing...' : 'Remove Background'} </button>
            </div>
          )}
        </div>

        {/* Preview/Result Panel */}
        <div className="border-2 border-gray-200 rounded-xl bg-white dark:bg-gray-800 relative shadow-lg">
          <div className="h-[360px] flex items-center justify-center relative overflow-hidden">
            {state === State.INITIAL && (
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-gray-400" />
                </div>
                <div className="font-medium">Preview will appear here</div>
                <div className="text-sm">Upload an image to get started</div>
              </div>
            )}
            {state === State.UPLOADED && (
              <div className="text-center text-gray-500 p-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <div>Click "Remove Background" to process</div>
              </div>
            )}
            {state === State.PROCESSING && (
              <div className="text-center text-gray-600">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Processing...
              </div>
            )}
            {state === State.DONE && processedUrl && (
              <div className="w-full h-full p-3">
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden relative"
                  style={{
                    ...getPreviewBgStyle(),
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {/* If transparent selected, show checkerboard via CSS background; otherwise style provides preview background */}
                  {selectedBg === 'transparent' && (
                    <div className="absolute inset-0 bg-[size:20px_20px] bg-[position:0_0,10px_10px] bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] rounded-lg pointer-events-none" />
                  )}
                  <img 
                    src={processedUrl}
                    alt="result"
                    style={getPreviewFgStyle()}
                    className="relative"
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                    draggable={false}
                  />
                </div>
              </div>
            )}
          </div>
          {state === State.PROCESSING && (
            <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Edit Controls and Options */}
      {state === State.DONE && processedUrl && (
        <div className="mt-5 space-y-4">
          {/* Image Controls Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adjust Result</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Subject Size</strong> changes the actual image size in your download. 
                <strong>Preview Zoom</strong> only zooms the view for easier editing.
              </p>
            </div>
            
            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📏 Subject Size (affects actual image size)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={fgScale}
                  onChange={(e) => setFgScale(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((fgScale - 20) / (150 - 20)) * 100}%, #e5e7eb ${((fgScale - 20) / (150 - 20)) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <span className="text-sm font-medium text-gray-600 w-12">{fgScale}%</span>
              </div>
            </div>
            
            {/* Position Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={fgX}
                  onChange={(e) => setFgX(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={fgOffset}
                  onChange={(e) => setFgOffset(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Preview Zoom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Preview Zoom (view only, doesn't affect final image)
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 25))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                >−</button>
                <span className="text-sm font-medium text-gray-600 w-16 text-center">{previewZoom}%</span>
                <button 
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                >+</button>
                <button 
                  onClick={() => setPreviewZoom(100)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium ml-2"
                >Reset</button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Edit Image Button */}
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Edit3 className="w-5 h-5" /> Advanced Editor
            </button>
            
            {/* Download Button */}
            <button onClick={download} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Info row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">💡</span>
            <div className="font-semibold">Watch how it works</div>
          </div>
          <p className="text-gray-600 text-sm">Best results for clear portraits and products with distinct edges. Upload high-quality images for optimal background removal.</p>
        </div>
        <div className="space-y-3">
          {[
            { name: 'AI Image Enhancer', href: '/tools/image-enhancer' },
            { name: 'Background Blur', href: '/tools/background-blur' },
            { name: 'Transparent Maker', href: '/tools/transparent-maker' },
            { name: 'Image Resizer', href: '/tools/image-resizer' },
          ].map((t) => (
            <a key={t.name} href={t.href} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">
              <span>{t.name}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </a>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      )}

      {/* Ad slots (placeholders) */}
      <div className="mt-8"><AdSlot slot="inContent" /></div>
      
      {/* Photo Editor Modal */}
      {processedUrl && (
        <PhotoEditor
          imageUrl={editedImageUrl || processedUrl}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(editedImage) => {
            setEditedImageUrl(editedImage);
            setIsEditorOpen(false);
          }}
        />
      )}
    </div>
    </>
  );
}
