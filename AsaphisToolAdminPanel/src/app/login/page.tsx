'use client';

import { useState } from 'react';
import { getApiBase } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiBase = getApiBase();
      const loginUrl = `${apiBase.replace(/\/$/, '')}/api/v1/auth/admin-login`;
      const res = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.message || 'Login failed');
        setLoading(false);
        return;
      }

      const json = await res.json();
      const token = json.token;
      if (json && json.success) {
        // Server set HttpOnly cookie for admin session; redirect to next or root
        const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/';
        // guard against open redirect: only allow internal paths
        try {
          const u = new URL(next, window.location.origin);
            if (u.origin === window.location.origin) {
                const dest = u.pathname + u.search + u.hash;
              window.location.href = dest;
          } else {
              window.location.href = '/';
          }
        } catch (e) {
            window.location.href = '/';
        }
      } else {
        setError(json?.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: 760, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 12, background: '#2563eb', margin: '0 auto' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" fill="#2563eb" />
              <path d="M7 13l3-3 7 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, margin: '16px 0 6px', color: '#0f172a' }}>AsaphisTool</h1>
          <div style={{ color: '#6b7280', marginBottom: 6 }}>Admin Panel Access</div>
        </div>

        <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
            {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}

            <form onSubmit={submit}>
              <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 8 }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e6e9ef', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8l9 6 9-6" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#E5E7EB" strokeWidth="0" fill="none" />
                </svg>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@asaphistool.com"
                  autoComplete="email"
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }}
                />
              </div>

              <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 8 }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e6e9ef', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15v2" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="4" y="10" width="16" height="10" rx="2" stroke="#E5E7EB" strokeWidth="0" fill="none" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                  <input type="checkbox" style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 14 }}>Remember me</span>
                </label>
                <a href="#" style={{ color: '#2563eb', fontSize: 14, textDecoration: 'none' }}>Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#fff', padding: '12px 14px', borderRadius: 10, border: 'none', fontSize: 16, fontWeight: 600 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: 18 }}>Secure admin access for AsaphisTool platform management</p>
        </div>
      </div>
    </div>
  );
}
