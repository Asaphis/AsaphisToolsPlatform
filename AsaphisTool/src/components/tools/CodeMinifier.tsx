"use client";

import { useState } from "react";

function minifyJS(src: string) {
  // very naive: strip // and /* */ comments and extra whitespace
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
function minifyCSS(src: string) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([:;{},>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
function minifyHTML(src: string) {
  return src
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function CodeMinifier() {
  const [type, setType] = useState<'js'|'css'|'html'>("js");
  const [input, setInput] = useState<string>("function test() {\n  // Example\n  console.log('hello');\n}\n");
  const [output, setOutput] = useState<string>("");

  const run = () => {
    try {
      const out = type === 'js' ? minifyJS(input) : type === 'css' ? minifyCSS(input) : minifyHTML(input);
      setOutput(out);
    } catch (e: any) {
      setOutput(`Error: ${e?.message || 'Failed'}`);
    }
  };

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🗜️ Code Minifier</h1>
        <p className="text-gray-600">Minify HTML, CSS, and JS completely in your browser.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={(e)=>setType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="js">JavaScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} className="w-full h-80 px-3 py-2 border rounded-lg dark:bg-gray-700" />
          <textarea readOnly value={output} className="w-full h-80 px-3 py-2 border rounded-lg dark:bg-gray-900 font-mono text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={run} className="px-4 py-2 bg-primary-600 text-white rounded">Minify</button>
          <button onClick={copy} disabled={!output} className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50">Copy</button>
        </div>
      </div>
    </div>
  );
}
