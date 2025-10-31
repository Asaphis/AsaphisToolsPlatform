"use client";

import { useMemo, useState } from "react";

// Minimal markdown -> HTML (very basic)
function mdToHtml(md: string) {
  let out = md;
  out = out.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  out = out.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  out = out.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  out = out.replace(/\[(.*?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  out = out.replace(/\n\n/g, '<br/><br/>' );
  return out;
}

export function MarkdownPreview() {
  const [input, setInput] = useState<string>("# Markdown\n\n**Bold**, *italic*, `code`, and a [link](https://example.com).");
  const html = useMemo(()=> mdToHtml(input), [input]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">📝 Markdown Preview</h1>
        <p className="text-gray-600">Live render markdown in your browser.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3">Input</h3>
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} className="w-full h-96 px-3 py-2 border rounded-lg dark:bg-gray-700" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
