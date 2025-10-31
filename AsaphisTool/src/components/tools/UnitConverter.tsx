"use client";

import { useMemo, useState } from "react";

const categories = {
  length: {
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254 },
    label: "Length"
  },
  weight: {
    units: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.0283495231 },
    label: "Weight"
  },
  temperature: {
    units: { C: 1, F: 1, K: 1 },
    label: "Temperature"
  }
} as const;

type CatKey = keyof typeof categories;

function convertTemperature(val: number, from: string, to: string) {
  let c = val;
  if (from === 'F') c = (val - 32) * 5/9;
  else if (from === 'K') c = val - 273.15;
  if (to === 'C') return c;
  if (to === 'F') return (c * 9/5) + 32;
  if (to === 'K') return c + 273.15;
  return c;
}

export function UnitConverter() {
  const [cat, setCat] = useState<CatKey>('length');
  const [from, setFrom] = useState<string>('m');
  const [to, setTo] = useState<string>('km');
  const [value, setValue] = useState<string>('1');

  const result = useMemo(()=>{
    const v = parseFloat(value);
    if (isNaN(v)) return '';
    if (cat === 'temperature') return String(convertTemperature(v, from, to));
    const table = (categories as any)[cat].units as Record<string, number>;
    const base = v * table[from];
    return String(base / table[to]);
  }, [cat, from, to, value]);

  const unitOptions = Object.keys((categories as any)[cat].units);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">📐 Unit Converter</h1>
        <p className="text-gray-600">Convert length, weight, and temperature.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select value={cat} onChange={(e)=>{ const c=e.target.value as CatKey; setCat(c); const units=Object.keys((categories as any)[c].units); setFrom(units[0]); setTo(units[1]||units[0]); }} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              <option value="length">Length</option>
              <option value="weight">Weight</option>
              <option value="temperature">Temperature</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">From</label>
            <select value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              {unitOptions.map(u=> <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <select value={to} onChange={(e)=>setTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
              {unitOptions.map(u=> <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Value</label>
            <input value={value} onChange={(e)=>setValue(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
          </div>
        </div>
        <div className="text-sm">Result: <strong>{result}</strong> {to}</div>
      </div>
    </div>
  );
}
