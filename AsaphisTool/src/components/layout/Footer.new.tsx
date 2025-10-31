'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

type Category = { id: string; name: string };

export function FooterNew() {
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

  const popularTools = [
  { name: 'Remove Background', href: '/tools/bg-removal' },
    { name: 'Image Enhancer', href: '/tools/image-enhancer' },
    { name: 'AI Text Generator', href: '/tools/ai-text-generator' },
    { name: 'Voice Synthesizer', href: '/tools/voice-synthesizer' },
    { name: 'Code Generator', href: '/tools/code-generator' },
  ];

  const footerLinks = {
    'Popular Tools': [
  { name: 'Remove Background', href: '/tools/bg-removal' },
      { name: 'Image Enhancer', href: '/tools/image-enhancer' },
      { name: 'AI Text Generator', href: '/tools/ai-text-generator' },
      { name: 'Voice Synthesizer', href: '/tools/voice-synthesizer' },
      { name: 'Code Generator', href: '/tools/code-generator' },
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'How It\'s Free', href: '/how-its-free' },
      { name: 'Ad Policy', href: '/ad-policy' },
      { name: 'Contact Support', href: '/contact' },
      { name: 'Report Issues', href: '/report' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Advertise With Us', href: '/advertise' },
      { name: 'Partnerships', href: '/partnerships' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
    'Help': [
      { name: 'Documentation', href: '/help/docs' },
      { name: 'FAQs', href: '/help/faqs' },
      { name: 'Tutorials', href: '/help/tutorials' },
      { name: 'API Guide', href: '/help/api' },
      { name: 'Community Support', href: '/help/community' },
    ],
    'Categories': [
      { name: 'Image Tools', href: '/category/image' },
      { name: 'Video Tools', href: '/category/video' },
      { name: 'PDF Tools', href: '/category/pdf' },
      { name: 'Text Tools', href: '/category/text' },
      { name: 'Developer Tools', href: '/category/developer' },
      { name: 'AI Tools', href: '/category/ai' },
      { name: 'Security Tools', href: '/category/security' },
      { name: 'Converters', href: '/category/converter' },
      { name: 'Generators', href: '/category/generator' }
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/asaphistool', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/Asaphis', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/asaphistool', icon: Linkedin },
    { name: 'Email', href: '/contact', icon: Mail },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/AsaphistoolLogo.png" 
                alt="AsaPhisTool Logo" 
                width={32} 
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                AsaPhisTool
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs">
              Free online tools for everyone. Compress images, merge PDFs, generate QR codes, and more - all in your browser.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={item.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Link Sections */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} AsaPhis. All rights reserved.
            </p>
            <p className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              Made with ❤️ for productivity • 100% Browser-Based • Privacy First
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
