'use client';

import { useMemo, useState } from 'react';

function estimateEntropyBits(pwd: string) {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33; // approx symbols
  const unique = new Set(pwd).size;
  const lengthFactor = Math.max(1, Math.min(unique, pwd.length));
  const entropy = lengthFactor * Math.log2(Math.max(pool, 1));
  return Math.round(entropy);
}

function strengthLabel(bits: number) {
  if (bits < 28) return { label: 'Very Weak', color: 'red', score: 1 };
  if (bits < 36) return { label: 'Weak', color: 'orange', score: 2 };
  if (bits < 60) return { label: 'Reasonable', color: 'yellow', score: 3 };
  if (bits < 128) return { label: 'Strong', color: 'green', score: 4 };
  return { label: 'Very Strong', color: 'green', score: 5 };
}

export function PasswordStrengthChecker() {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);

  const bits = useMemo(()=> estimateEntropyBits(pwd), [pwd]);
  const meta = useMemo(()=> strengthLabel(bits), [bits]);

  const suggestions = useMemo(() => {
    const s: string[] = [];
    if (!/[a-z]/.test(pwd)) s.push('Add lowercase letters');
    if (!/[A-Z]/.test(pwd)) s.push('Add uppercase letters');
    if (!/[0-9]/.test(pwd)) s.push('Add digits');
    if (!/[^a-zA-Z0-9]/.test(pwd)) s.push('Add symbols');
    if (pwd.length < 12) s.push('Use at least 12 characters');
    if (/(.)\1{2,}/.test(pwd)) s.push('Avoid repeated characters');
    if (/(123|abc|qwe|password|letmein|admin)/i.test(pwd)) s.push('Avoid common patterns/words');
    return s;
  }, [pwd]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🛡️ Password Strength Checker</h1>
        <p className="text-gray-600 dark:text-gray-400">Check password strength and get suggestions to improve it.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <input type={show ? 'text' : 'password'} value={pwd} onChange={(e)=> setPwd(e.target.value)} placeholder="Enter password..." className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700" />
          <button onClick={()=> setShow(v=>!v)} className="px-3 py-2 text-sm bg-gray-600 text-white rounded">{show ? 'Hide' : 'Show'}</button>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Estimated Entropy</span>
            <span className="font-medium text-gray-900 dark:text-white">{bits} bits — {meta.label}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className={`h-2 rounded-full ${meta.color === 'red' ? 'bg-red-500' : meta.color === 'orange' ? 'bg-orange-500' : meta.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(meta.score/5)*100}%` }} />
          </div>
        </div>
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Suggestions</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              {suggestions.map((s, i)=> <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
