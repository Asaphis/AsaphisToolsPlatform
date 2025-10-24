import { getApiBase } from '@/lib/api';

async function fetchAds() {
  const res = await fetch(`${getApiBase()}/ads`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ads');
  return res.json();
}

export default async function AdsPage() {
  const { ads } = await fetchAds();
  return (
    <div>
      <h2>Ads</h2>
      <p>Total: {ads.length}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Provider</th>
            <th align="left">Status</th>
            <th align="left">Priority</th>
            <th align="left">Slot</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((a: any) => (
            <tr key={a.id}>
              <td>{a.provider}</td>
              <td>{a.status}</td>
              <td>{a.priority}</td>
              <td>{a.slot_id || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
