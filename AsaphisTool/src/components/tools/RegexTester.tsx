"use client";

import { useMemo, useState } from "react";

export function RegexTester() {
  const [pattern, setPattern] = useState<string>("\\b[a-zA-Z]+\\b");
  const [flags, setFlags] = useState<string>("g");
  const [input, setInput] = useState<string>("Hello world! 123 abc DEF");

  const { matches, errorMessage } = useMemo(() => {
    const found: RegExpExecArray[] = [];
    try {
      const re = new RegExp(pattern, flags);
      if (input.length) {
        if (flags.includes("g")) {
          let m: RegExpExecArray | null;
          while ((m = re.exec(input)) !== null) found.push(m);
        } else {
          const m = re.exec(input);
          if (m) found.push(m);
        }
      }
      return { matches: found, errorMessage: "" };
    } catch (e: any) {
      return { matches: [], errorMessage: e?.message || "Invalid regex" };
    }
  }, [pattern, flags, input]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🧪 Regex Tester</h1>
        <p className="text-gray-600">Test JavaScript regular expressions with live matches and groups.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pattern</label>
            <input value={pattern} onChange={(e)=>setPattern(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="e.g. \\d+" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flags</label>
            <input value={flags} onChange={(e)=>setFlags(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder="gimuy" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Test Input</label>
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} className="w-full h-40 px-3 py-2 border rounded-lg dark:bg-gray-700" />
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <div>
          <h3 className="text-sm font-semibold mb-2">Matches ({matches.length})</h3>
          <div className="space-y-2 text-sm">
            {matches.map((m, i)=> (
              <div key={i} className="p-2 border rounded dark:border-gray-700">
                <div><strong>Match {i+1}:</strong> {m[0]} (index {m.index})</div>
                {m.length>1 && (
                  <div className="mt-1">
                    <div className="font-medium">Groups:</div>
                    <ul className="list-disc list-inside">
                      {m.slice(1).map((g, gi)=> <li key={gi}>${gi+1}: {g ?? "<empty>"}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {!matches.length && <div className="text-gray-500">No matches</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
