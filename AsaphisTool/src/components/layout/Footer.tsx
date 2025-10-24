'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Category = { id: string; name: string };

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const url = base.startsWith('http') ? `${base}/categories` : '/api/categories';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const list = (json.categories || []).map((c: any) => ({ id: c.slug || c.id, name: c.name }));
        if (!cancelled) setCategories(list);
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const footerLinks = {
    Tools: categories.slice(0, 4).map(cat => ({
      name: `${cat.name} Tools`,
      href: `/category/${cat.id}`
    })),
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' }
    ],
    Resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'API Documentation', href: '/api-docs' },
      { name: 'Status', href: '/status' },
      { name: 'Changelog', href: '/changelog' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'DMCA', href: '/dmca' }
    ]
  };

  const socialLinks: any[] = [];

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-lg">
                A
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                AsaPhisTool
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-md">
              Free online tools and utilities for productivity and creativity. 
              Compress images, edit PDFs, generate QR codes, and much more - 
              all for free, fast, and secure.
            </p>
            <div className="flex space-x-6" />
          </div>

          {/* Links */}
          <div className="mt-12 grid grid-cols-1 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                Tools
              </h3>
              <ul role="list" className="mt-4 space-y-4">
                {footerLinks.Tools.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Made with ❤️ for productivity
            </p>
          </div>
          <p className="mt-8 text-xs text-gray-500 dark:text-gray-400 md:mt-0 md:order-1">
            &copy; {currentYear} AsaPhisTool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
