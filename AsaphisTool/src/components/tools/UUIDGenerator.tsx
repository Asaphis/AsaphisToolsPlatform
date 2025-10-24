'use client';

import { useState } from 'react';

export function UUIDGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  const genV4 = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0'));
    return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
  };

  const generate = () => {
    const out: string[] = [];
    for (let i = 0; i < Math.min(Math.max(count, 1), 1000); i++) out.push(genV4());
    setUuids(out);
  };

  const copy = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  const download = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'uuids.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🆔 UUID Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate RFC4122 v4 UUIDs securely in your browser.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count</label>
            <input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} className="px-3 py-2 border rounded-lg dark:bg-gray-700 w-32" />
          </div>
          <button onClick={generate} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Generate</button>
          <button onClick={copy} disabled={!uuids.length} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Copy</button>
          <button onClick={download} disabled={!uuids.length} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Download</button>
        </div>
        {uuids.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 font-mono text-sm whitespace-pre-wrap break-all max-h-80 overflow-auto">
            {uuids.join('\n')}
          </div>
        )}
      </div>
    </div>
  );
}
