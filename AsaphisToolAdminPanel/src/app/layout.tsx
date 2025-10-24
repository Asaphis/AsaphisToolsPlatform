export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 980, margin: '20px auto', padding: 16 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>AsaPhis Admin</h1>
            <nav style={{ display: 'flex', gap: 12 }}>
              <a href="/">Dashboard</a>
              <a href="/ads">Ads</a>
              <a href="/tools">Tools</a>
              <a href="/categories">Categories</a>
            </nav>
          </header>
          <hr />
          <main style={{ marginTop: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
