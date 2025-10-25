"use client";

import { useState } from "react";

export function PDFToJPG() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    setImages([]);
    try {
      const arrayBuf = await file.arrayBuffer();
      const pdfjsLib: any = await import('pdfjs-dist');
      // Use CDN worker to avoid bundling issues on server
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const out: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        out.push(canvas.toDataURL('image/jpeg', 0.92));
      }
      setImages(out);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const download = (dataUrl: string, idx: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${file?.name.replace(/\.[^.]+$/, '')}-page-${idx + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={run} disabled={!file||processing} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
        {processing?"Converting...":"Convert PDF → JPG"}
      </button>
      {!!images.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((src, i) => (
            <div key={i} className="border rounded p-2 bg-white dark:bg-gray-800">
              <img src={src} alt={`Page ${i+1}`} className="w-full h-auto" />
              <button onClick={()=>download(src,i)} className="mt-2 px-3 py-1 bg-gray-900 text-white rounded">Download JPG</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
