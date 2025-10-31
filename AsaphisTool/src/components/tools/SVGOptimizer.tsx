"use client";

import { useState } from "react";

export function SVGOptimizer() {
  const [input, setInput] = useState<string>("<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><title>Title</title><desc>Desc</desc><!-- comment --><circle cx='50' cy='50' r='40' stroke='green' fill='yellow' /></svg>");
  const [output, setOutput] = useState<string>("");

  const optimize = () => {
    let s = input;
    // Remove comments
    s = s.replace(/<!--([\s\S]*?)-->/g, "");
    // Remove <metadata>, <desc>, <title>
    s = s.replace(/<\/(?:metadata|desc|title)>/g, "");
    s = s.replace(/<(?:metadata|desc|title)[^>]*>/g, "");
    // Collapse whitespace
    s = s.replace(/>\s+</g, "><");
    s = s.replace(/\s{2,}/g, " ");
    // Trim redundant spaces inside tags
    s = s.replace(/\s*(\/>)/g, "$1").replace(/\s*>/g, ">");
    setOutput(s.trim());
  };

  const download = () => {
    const blob = new Blob([output || input], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'optimized.svg'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🧩 SVG Optimizer</h1>
        <p className="text-gray-600">Remove metadata and whitespace from SVGs locally.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3">Input SVG</h3>
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} className="w-full h-80 px-3 py-2 border rounded-lg dark:bg-gray-700 font-mono text-sm" />
          <div className="mt-3">
            <button onClick={optimize} className="px-4 py-2 bg-primary-600 text-white rounded">Optimize</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3">Output</h3>
          <textarea readOnly value={output} className="w-full h-80 px-3 py-2 border rounded-lg dark:bg-gray-900 font-mono text-sm" />
          <div className="mt-3">
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white rounded">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}
