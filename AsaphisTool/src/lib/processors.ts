import { PDFDocument } from 'pdf-lib';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'auto';

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}

export async function compressImageFile(file: File, opts: { quality?: number; maxWidth?: number; maxHeight?: number; format?: ImageFormat } = {}) {
  const quality = Math.min(Math.max(opts.quality ?? 0.8, 0.1), 1);
  const maxWidth = opts.maxWidth ?? 1920;
  const maxHeight = opts.maxHeight ?? 1080;
  const format = opts.format ?? 'auto';

  const img = await loadImageFromFile(file);
  let width = img.width;
  let height = img.height;
  const aspect = width / height;
  if (width > maxWidth) { width = maxWidth; height = Math.round(width / aspect); }
  if (height > maxHeight) { height = maxHeight; width = Math.round(height * aspect); }

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let mime = 'image/jpeg';
  if (format === 'png') mime = 'image/png';
  else if (format === 'webp') mime = 'image/webp';
  else if (format === 'auto') {
    mime = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to encode image')), mime, quality);
  });
  const base = file.name.replace(/\.[^.]+$/, '');
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  return { blob, name: `${base}-compressed.${ext}` };
}

export async function resizeImageFile(file: File, opts: { width: number; height: number; maintainAspectRatio?: boolean; mode?: 'fit' | 'fill' | 'stretch' }) {
  const img = await loadImageFromFile(file);
  const targetW = opts.width; const targetH = opts.height;
  const maintain = opts.maintainAspectRatio ?? true;
  const mode = opts.mode ?? 'fit';

  let finalW = targetW; let finalH = targetH; let drawX = 0; let drawY = 0; let drawW = targetW; let drawH = targetH;
  const aspect = img.width / img.height;
  if (maintain) {
    if (mode === 'fit') {
      if (targetW / targetH > aspect) { finalW = Math.round(targetH * aspect); finalH = targetH; }
      else { finalW = targetW; finalH = Math.round(targetW / aspect); }
      drawW = finalW; drawH = finalH;
    } else if (mode === 'fill') {
      finalW = targetW; finalH = targetH;
      if (targetW / targetH > aspect) { drawH = targetH; drawW = Math.round(targetH * aspect); drawX = Math.round((targetW - drawW) / 2); }
      else { drawW = targetW; drawH = Math.round(targetW / aspect); drawY = Math.round((targetH - drawH) / 2); }
    } else {
      // stretch
      finalW = targetW; finalH = targetH; drawW = targetW; drawH = targetH;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = finalW; canvas.height = finalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, finalW, finalH);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to encode image')), 'image/jpeg', 0.9);
  });
  const base = file.name.replace(/\.[^.]+$/, '');
  return { blob, name: `${base}-${finalW}x${finalH}.jpg` };
}

export async function mergePdfFiles(files: File[], outName = 'merged.pdf') {
  const merged = await PDFDocument.create();
  for (const f of files) {
    const arr = await f.arrayBuffer();
    const pdf = await PDFDocument.load(arr);
    const pageIdx = pdf.getPageIndices();
    const pages = await merged.copyPages(pdf, pageIdx);
    pages.forEach(p => merged.addPage(p));
  }
  const bytes = await merged.save();
  // @ts-expect-error Uint8Array compatible
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return { blob, name: outName };
}
