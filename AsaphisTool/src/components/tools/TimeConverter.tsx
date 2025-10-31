"use client";

import { useMemo, useState } from "react";

const zones = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Africa/Lagos",
] as const;

type Zone = typeof zones[number];

function formatInZone(date: Date, timeZone: Zone) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(date);
}

export function TimeConverter() {
  const [fromZone, setFromZone] = useState<Zone>('UTC');
  const [toZone, setToZone] = useState<Zone>('America/New_York');
  const [localStr, setLocalStr] = useState<string>(new Date().toISOString().slice(0,19)); // YYYY-MM-DDTHH:mm:ss

  const converted = useMemo(()=>{
    // interpret localStr as time in fromZone
    const base = new Date(localStr.replace('T',' ') + 'Z'); // treat as UTC base
    // Offset between target zone and UTC is via toLocaleString render
    const displayFrom = formatInZone(base, fromZone);
    const displayTo = formatInZone(base, toZone);
    return { displayFrom, displayTo };
  }, [localStr, fromZone, toZone]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🕐 Time Zone Converter</h1>
        <p className="text-gray-600">Convert date/time between common time zones.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">From Zone</label>
            <select value={fromZone} onChange={(e)=>setFromZone(e.target.value as Zone)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              {zones.map(z=> <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">To Zone</label>
            <select value={toZone} onChange={(e)=>setToZone(e.target.value as Zone)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              {zones.map(z=> <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Date/Time (YYYY-MM-DDTHH:mm:ss)</label>
            <input value={localStr} onChange={(e)=>setLocalStr(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>In <strong>{fromZone}</strong>: {converted.displayFrom}</div>
          <div>In <strong>{toZone}</strong>: {converted.displayTo}</div>
        </div>
      </div>
    </div>
  );
}
