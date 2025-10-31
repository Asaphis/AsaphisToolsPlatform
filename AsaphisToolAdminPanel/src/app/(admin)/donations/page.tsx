"use client";

import { useEffect, useState } from "react";
import fetchWithAdmin from "@/lib/fetchWithAdmin";

type Donation = {
  id: string;
  amount: number;
  currency: string;
  payment_method?: string | null;
  status: string;
  created_at: string;
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWithAdmin("/api/v1/payments/donations");
        if (!res.ok) throw new Error("Failed to load donations");
        const json = await res.json();
        setDonations(json.donations || []);
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
      <h1 className="text-2xl font-bold mb-4">Donations</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          {donations.length === 0 ? (
            <p className="text-gray-600">No donations yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 uppercase">
                  <th className="py-2">ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Currency</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2 text-sm">{d.id}</td>
                    <td className="py-2 text-sm">{d.amount}</td>
                    <td className="py-2 text-sm">{d.currency}</td>
                    <td className="py-2 text-sm">{d.payment_method}</td>
                    <td className="py-2 text-sm">{d.status}</td>
                    <td className="py-2 text-sm">{new Date(d.created_at).toLocaleString()}</td>
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
