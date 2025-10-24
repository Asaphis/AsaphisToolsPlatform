"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export function PDFSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("1-1");
  const [status, setStatus] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setStatus("");
  };

  const parseRanges = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (/^\d+$/.test(part)) {
          const p = Math.min(Math.max(parseInt(part, 10), 1), max);
          pages.add(p - 1);
        } else if (/^\d+-\d+$/.test(part)) {
          const [a, b] = part.split("-").map((n) => parseInt(n, 10));
          const start = Math.min(a, b);
          const end = Math.max(a, b);
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= max) pages.add(i - 1);
          }
        }
      });
    return Array.from(pages).sort((x, y) => x - y);
  };

  const split = async () => {
    if (!file) return;
    setStatus("Processing...");
    try {
      const srcBytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(srcBytes);
      const pageCount = srcPdf.getPageCount();
      const indices = parseRanges(ranges, pageCount);
      if (indices.length === 0) {
        setStatus("No valid page ranges");
        return;
      }

      const out = await PDFDocument.create();
      const copied = await out.copyPages(srcPdf, indices);
      copied.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      // @ts-expect-error Uint8Array compat
      const blob = new Blob([outBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const base = file.name.replace(/\.[^.]+$/, "");
      a.href = url;
      a.download = `${base}-split.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Done");
    } catch (e: any) {
      setStatus(e?.message || "Failed to split PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">✂️ PDF Splitter</h1>
        <p className="text-gray-600 dark:text-gray-400">Extract specific pages or ranges into a new PDF, fully in your browser.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF File</label>
          <input type="file" accept="application/pdf" onChange={handleFile} className="block w-full text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Ranges</label>
          <input
            type="text"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
            placeholder="e.g., 1-3,5,7-9"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use comma-separated pages or ranges (1-based).</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={split} disabled={!file} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">Split PDF</button>
          {status && <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>}
        </div>
      </div>
    </div>
  );
}
