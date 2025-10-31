export type FetchWithAdminOptions = RequestInit;

import { getApiBase } from './api';

export default async function fetchWithAdmin(url: string, opts?: FetchWithAdminOptions) {
  // If a relative /api path is provided, prefix with the API base so requests go to the backend server
  const base = getApiBase();
  const fullUrl = /^https?:\/\//i.test(url) ? url : `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  const res = await fetch(fullUrl, { 
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers
    },
    ...opts
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      // preserve current path so user can be returned after login
      const next = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      window.location.href = `/login?next=${next}`;
    }
  }
  return res;
}
