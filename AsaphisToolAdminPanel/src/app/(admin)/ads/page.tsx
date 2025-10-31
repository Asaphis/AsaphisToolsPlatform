'use client';

import { useEffect, useState } from 'react';
import fetchWithAdmin from '@/lib/fetchWithAdmin';

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAdmin('/api/v1/admin/ads');
        if (res.ok) {
          const json = await res.json();
          setAds(json.ads || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Ads</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <p>Total: {ads.length}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Type</th>
                <th align="left">Placement</th>
                <th align="left">Status</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.name || a.provider}</td>
                  <td>{a.type || '-'}</td>
                  <td>{a.placement || a.slot_id || '-'}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
