"use client";

import { useState } from "react";

// Minimal EXIF/header viewer: shows basic file info and attempts to locate EXIF APP1 marker
export function EXIFViewer() {
  const [info, setInfo] = useState<string>("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const parts: string[] = [];
    parts.push(`Name: ${f.name}`); parts.push(`Type: ${f.type}`); parts.push(`Size: ${f.size} bytes`);
    try {
      const buf = await f.arrayBuffer(); const view = new DataView(buf);
      // JPEG: look for 0xFFE1 APP1 (Exif)
      let exifFound = false;
      for (let i=0;i<Math.min(view.byteLength-1, 4096);i++){
        const marker = view.getUint16(i);
        if (marker === 0xFFE1) { exifFound = true; parts.push(`EXIF APP1 marker found at offset ${i}`); break; }
      }
      if (!exifFound) parts.push('No EXIF APP1 marker detected (or non-JPEG).');
    } catch {}
    setInfo(parts.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">📷 EXIF Viewer</h1>
        <p className="text-gray-600">View basic image metadata; EXIF detection best-effort (no upload).</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <input type="file" accept="image/*" onChange={onFile} />
        <pre className="min-h-[140px] whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 border rounded p-3">{info}</pre>
      </div>
    </div>
  );
}
