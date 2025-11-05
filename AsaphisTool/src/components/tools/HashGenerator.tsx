'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Settings2, PenTool, Hash, CircleEqual } from 'lucide-react';

type HashAlg = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

async function hashText(alg: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(alg, enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashFile(alg: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', file: File) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest(alg, buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function HashGenerator() {
  const [alg, setAlg] = useState<HashAlg>('SHA-256');
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');

  const onHashText = async () => {
    const h = await hashText(alg, input);
    setHash(h);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const h = await hashFile(alg, f);
    setFileHash(h);
  };

  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-white flex items-center justify-center shadow-lg">
          <span className="text-3xl">🔐</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Hash Generator
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Compute SHA-1/256/384/512 for text and files locally in your browser.
        </p>
      </div>

      {/* Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Input & Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings2 className="mr-2 h-5 w-5" />
              Hash Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Algorithm</label>
                <select
                  value={alg}
                  onChange={(e)=> setAlg(e.target.value as HashAlg)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
                  <option value="SHA-1">SHA-1</option>
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-384">SHA-384</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PenTool className="mr-2 h-5 w-5" />
              Input Text
            </h2>
            <textarea
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              placeholder="Enter text to hash..."
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={onHashText}
              disabled={!input}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all",
                input ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Hash className="h-5 w-5" />
              Process
            </button>
          </div>
        </div>

        {/* Right column: Result */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CircleEqual className="mr-2 h-5 w-5" />
              Result Hash
            </h2>
            {hash && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-xs break-all">
                {hash}
                <div className="mt-2">
                  <button onClick={()=>copy(hash)} className="text-sky-600 hover:text-sky-700 dark:text-sky-400 text-xs">Copy</button>
                </div>
              </div>
            )}
          </div>

          {/* File hashing */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
            <input type="file" onChange={onFile} className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 dark:file:bg-gray-700 dark:hover:file:bg-gray-600" />
            {fileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileName}</p>}
            {fileHash && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-xs break-all">
                {fileHash}
                <div className="mt-2">
                  <button onClick={()=>copy(fileHash)} className="text-sky-600 hover:text-sky-700 dark:text-sky-400 text-xs">Copy</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
