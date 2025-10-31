"use client";

import { useMemo, useState } from "react";

export function TimestampConverter() {
  const [unix, setUnix] = useState<string>(Math.floor(Date.now()/1000).toString());
  const [iso, setIso] = useState<string>(new Date().toISOString());

  const fromUnix = () => {
    const n = parseInt(unix, 10);
    if (isNaN(n)) return;
    const d = new Date(n * 1000);
    setIso(d.toISOString());
  };
  const fromISO = () => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return;
    setUnix(Math.floor(d.getTime()/1000).toString());
  };

  const pretty = useMemo(()=> {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleString();
  }, [iso]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">⏱️ Timestamp Converter</h1>
        <p className="text-gray-600">Convert between Unix epoch and ISO date.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unix (seconds)</label>
            <input value={unix} onChange={(e)=>setUnix(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            <button onClick={fromUnix} className="mt-2 px-3 py-2 bg-primary-600 text-white rounded">To ISO</button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISO 8601</label>
            <input value={iso} onChange={(e)=>setIso(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            <button onClick={fromISO} className="mt-2 px-3 py-2 bg-primary-600 text-white rounded">To Unix</button>
          </div>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">Local time: {pretty}</div>
      </div>
    </div>
  );
}
