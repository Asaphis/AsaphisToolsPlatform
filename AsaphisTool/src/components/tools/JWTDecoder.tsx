"use client";

import { useMemo, useState } from "react";

function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  try { return atob(s + pad); } catch { return ""; }
}

export function JWTDecoder() {
  const [token, setToken] = useState<string>("");

  const parts = useMemo(()=> token.split("."), [token]);
  const headerStr = parts[0] ? b64urlDecode(parts[0]) : "";
  const payloadStr = parts[1] ? b64urlDecode(parts[1]) : "";
  const signatureB64 = parts[2] || "";

  const header = useMemo(()=> {
    try { return headerStr ? JSON.stringify(JSON.parse(headerStr), null, 2) : ""; } catch { return headerStr; }
  }, [headerStr]);
  const payload = useMemo(()=> {
    try { return payloadStr ? JSON.stringify(JSON.parse(payloadStr), null, 2) : ""; } catch { return payloadStr; }
  }, [payloadStr]);

  const isJWT = parts.length === 3;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🔑 JWT Decoder</h1>
        <p className="text-gray-600">Decode JWT header and payload locally (no signature verification).</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <label className="block text-sm font-medium mb-1">Token</label>
        <textarea value={token} onChange={(e)=>setToken(e.target.value)} placeholder="eyJhbGciOi..." className="w-full h-32 px-3 py-2 border rounded-lg dark:bg-gray-700" />

        {!isJWT && token && (
          <div className="text-sm text-red-600">Invalid JWT format. Expected three dot-separated parts.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1">Header</div>
            <pre className="min-h-[120px] whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 border rounded p-3">{header || ""}</pre>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">Payload</div>
            <pre className="min-h-[120px] whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 border rounded p-3">{payload || ""}</pre>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Signature (base64url)</div>
          <div className="text-xs break-all bg-gray-50 dark:bg-gray-900 border rounded p-2">{signatureB64}</div>
        </div>
      </div>
    </div>
  );
}
