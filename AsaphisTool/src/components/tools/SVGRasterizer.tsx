"use client";

import { useRef, useState } from "react";

export function SVGRasterizer() {
  const [svgText, setSvgText] = useState<string>("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='200' height='120' fill='tomato'/><text x='20' y='70' font-size='32' fill='white'>SVG</text></svg>");
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(480);
  const [format, setFormat] = useState<'png'|'jpeg'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outUrl, setOutUrl] = useState<string>("");

  const rasterize = async () => {
    const canvas = canvasRef.current!;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob((b)=> { if (b) setOutUrl(URL.createObjectURL(b)); }, mime, 0.92);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const download = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl; a.download = `rasterized.${format}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🖼️ SVG Rasterizer</h1>
        <p className="text-gray-600">Convert SVG to PNG/JPEG at custom dimensions.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Width</label>
            <input type="number" value={width} onChange={(e)=>setWidth(parseInt(e.target.value)||0)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">Height</label>
            <input type="number" value={height} onChange={(e)=>setHeight(parseInt(e.target.value)||0)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">Format</label>
            <select value={format} onChange={(e)=>setFormat(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
          <div className="flex items-end"><button onClick={rasterize} className="px-4 py-2 bg-primary-600 text-white rounded">Rasterize</button></div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SVG XML</label>
          <textarea value={svgText} onChange={(e)=>setSvgText(e.target.value)} className="w-full h-48 px-3 py-2 border rounded-lg dark:bg-gray-700 font-mono text-sm" />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        {outUrl && (
          <div className="space-y-2">
            <img src={outUrl} alt="output" className="max-w-full border rounded" />
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white rounded">Download</button>
          </div>
        )}
      </div>
    </div>
  );
}
