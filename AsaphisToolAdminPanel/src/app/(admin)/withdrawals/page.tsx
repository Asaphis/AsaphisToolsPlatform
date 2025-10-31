"use client";

import { useEffect, useState } from 'react';
import fetchWithAdmin from '@/lib/fetchWithAdmin';

type Withdrawal = {
  id: string;
  user_id?: string | null;
  amount: number;
  currency: string;
  method?: string | null;
  status: string;
  created_at: string;
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWithAdmin('/api/v1/payments/withdrawals');
        if (!res.ok) throw new Error('Failed to load withdrawals');
        const json = await res.json();
        setWithdrawals(json.withdrawals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Withdrawals</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          {withdrawals.length === 0 ? (
            <p className="text-gray-600">No withdrawal requests.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 uppercase">
                  <th className="py-2">ID</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Currency</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-t">
                    <td className="py-2 text-sm">{w.id}</td>
                    <td className="py-2 text-sm">{w.user_id}</td>
                    <td className="py-2 text-sm">{w.amount}</td>
                    <td className="py-2 text-sm">{w.currency}</td>
                    <td className="py-2 text-sm">{w.method}</td>
                    <td className="py-2 text-sm">{w.status}</td>
                    <td className="py-2 text-sm">{new Date(w.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
