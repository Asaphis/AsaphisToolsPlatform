"use client";

import { useEffect, useState } from "react";
import fetchWithAdmin from "@/lib/fetchWithAdmin";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAdmin('/api/v1/admin/settings');
        if (res.ok) {
          const json = await res.json();
          setSettings(json.settings || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Settings</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div>
          <ul>
            {settings.map((s: any) => (
              <li key={s.key}>
                <strong>{s.key}</strong>: <pre style={{ display: 'inline' }}>{JSON.stringify(s.value)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
