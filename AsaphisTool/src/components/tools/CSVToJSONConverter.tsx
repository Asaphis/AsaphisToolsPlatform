'use client';

import { useState, useCallback } from 'react';

function parseCSV(text: string, delimiter = ',') {
  const rows: string[][] = [];
  let cur = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) { row.push(cur); cur = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur.length || row.length) { row.push(cur); rows.push(row); row = []; cur = ''; }
    } else { cur += ch; }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length && !(r.length === 1 && r[0] === ''));
}

export function CSVToJSONConverter() {
  const [csv, setCsv] = useState('');
  const [json, setJson] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const convert = useCallback(() => {
    const rows = parseCSV(csv, delimiter);
    if (rows.length === 0) { setJson(''); return; }
    let obj: any[] = [];
    if (hasHeader) {
      const header = rows[0].map(h => h.trim());
      obj = rows.slice(1).map(r => Object.fromEntries(header.map((h, idx) => [h || `col${idx+1}`, r[idx] ?? ''])));
    } else {
      obj = rows.map((r) => r);
    }
    setJson(JSON.stringify(obj, null, 2));
  }, [csv, hasHeader, delimiter]);

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">📊 CSV to JSON Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">Convert CSV text into structured JSON in your browser.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
            <span className="text-sm text-gray-700 dark:text-gray-300">First row is header</span>
          </label>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Delimiter</label>
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value=",">Comma ,</option>
              <option value=";">Semicolon ;</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe |</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={convert} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Convert</button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="Paste CSV here..." className="w-full h-64 px-3 py-2 border rounded-lg dark:bg-gray-700" />
          <textarea value={json} readOnly placeholder="JSON output..." className="w-full h-64 px-3 py-2 border rounded-lg dark:bg-gray-800 font-mono text-sm" />
        </div>
        <div>
          <button onClick={download} disabled={!json} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Download JSON</button>
        </div>
      </div>
    </div>
  );
}
