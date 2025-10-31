import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
        <div style={{ display: 'inline-block', background: '#2563eb', padding: 18, borderRadius: 12 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#2563eb" />
            <path d="M8 12l2 2 6-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontSize: 40, margin: '18px 0 6px', fontFamily: 'Georgia, serif' }}>AsaphisTool</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>Powerful online tools platform with comprehensive admin management</p>

        <div>
          <a href="/login" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: 8, textDecoration: 'none' }}>
            Access Admin Panel
          </a>
        </div>

        <p style={{ color: '#9ca3af', marginTop: 18 }}>Demo credentials: any email/password combination</p>
      </div>
    </div>
  );
}
