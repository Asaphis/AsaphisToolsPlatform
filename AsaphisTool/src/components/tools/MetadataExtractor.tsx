"use client";

import { useState } from "react";

export function MetadataExtractor() {
  const [report, setReport] = useState<string>("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const lines: string[] = [];
    lines.push(`Name: ${f.name}`);
    lines.push(`Type: ${f.type}`);
    lines.push(`Size: ${f.size} bytes`);
    try {
      const img = new Image();
      img.onload = () => {
        lines.push(`Dimensions: ${img.width} x ${img.height}`);
        setReport(lines.join('\n'));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => setReport(lines.join('\n'));
      img.src = URL.createObjectURL(f);
    } catch {
      setReport(lines.join('\n'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">📷 Image Metadata Extractor</h1>
        <p className="text-gray-600">View basic image metadata locally (filename, size, dimensions).</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <input type="file" accept="image/*" onChange={onFile} />
        <pre className="min-h-[120px] whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 border rounded p-3">{report}</pre>
      </div>
    </div>
  );
}
