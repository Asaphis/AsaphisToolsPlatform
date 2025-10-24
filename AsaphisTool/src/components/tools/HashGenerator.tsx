'use client';

import { useState } from 'react';

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
  const [alg, setAlg] = useState<'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🔐 Hash Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">Compute SHA-1/256/384/512 for text and files locally in your browser.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Algorithm</label>
            <select value={alg} onChange={(e)=> setAlg(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text</label>
            <textarea value={input} onChange={(e)=> setInput(e.target.value)} placeholder="Enter text..." className="w-full h-32 px-3 py-2 border rounded-lg dark:bg-gray-700" />
            <button onClick={onHashText} disabled={!input} className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">Hash Text</button>
            {hash && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 font-mono text-xs break-all">
                {hash}
                <div className="mt-2"><button onClick={()=>copy(hash)} className="text-primary-600 dark:text-primary-400 text-xs">Copy</button></div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
            <input type="file" onChange={onFile} className="block w-full text-sm" />
            {fileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fileName}</p>}
            {fileHash && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 font-mono text-xs break-all">
                {fileHash}
                <div className="mt-2"><button onClick={()=>copy(fileHash)} className="text-primary-600 dark:text-primary-400 text-xs">Copy</button></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
