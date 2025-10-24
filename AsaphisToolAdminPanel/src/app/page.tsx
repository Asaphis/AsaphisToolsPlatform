import Link from 'next/link';

export default async function Page() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to the admin panel.</p>
      <ul>
        <li><Link href="/ads">Manage Ads</Link></li>
        <li><Link href="/tools">Manage Tools</Link></li>
        <li><Link href="/categories">Manage Categories</Link></li>
      </ul>
    </div>
  );
}
