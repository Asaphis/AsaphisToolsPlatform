"use client";

import { useEffect, useState } from "react";
import fetchWithAdmin from "@/lib/fetchWithAdmin";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAdmin("/api/v1/admin/users");
        if (res.ok) {
          const json = await res.json();
          setUsers(json.users || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Users</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Email</th>
              <th align="left">Display Name</th>
              <th align="left">Admin</th>
              <th align="left">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.display_name}</td>
                <td>{u.is_admin ? 'Yes' : 'No'}</td>
                <td>{u.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
