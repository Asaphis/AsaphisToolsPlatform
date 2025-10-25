'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'Do I need to create an account to use AsaPhisTool?',
          a: 'No! All our tools are completely free to use without registration. Simply visit the tool you need and start using it immediately.'
        },
        {
          q: 'Is AsaPhisTool really free?',
          a: 'Yes, AsaPhisTool is 100% free to use. We don\'t charge for any of our tools, and there are no hidden fees or premium tiers.'
        },
        {
          q: 'How do you make money if everything is free?',
          a: 'We may display non-intrusive ads and accept donations from users who want to support the project. Your support helps us keep the lights on and add new features!'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      questions: [
        {
          q: 'Are my files secure?',
          a: 'Absolutely! Most of our tools process files entirely in your browser using client-side JavaScript. This means your files never leave your device and we have no way to access them.'
        },
        {
          q: 'Do you store my files?',
          a: 'No. For client-side tools (most of our tools), files are processed locally in your browser. For tools that require server processing, files are immediately deleted after processing.'
        },
        {
          q: 'Can I use AsaPhisTool for sensitive documents?',
          a: 'Yes! Since most tools process files entirely in your browser, you can safely use them for sensitive documents. Always check if a tool uses "Client-Side Processing" in its description.'
        }
      ]
    },
    {
      category: 'Tool Usage',
      questions: [
        {
          q: 'Why isn\'t my file processing?',
          a: 'Common issues: 1) Check file format is supported, 2) Ensure file isn\'t corrupted, 3) Try a smaller file size, 4) Clear browser cache and try again, 5) Try a different browser.'
        },
        {
          q: 'What file formats are supported?',
          a: 'Each tool supports different formats. Generally: Images (JPEG, PNG, WebP, GIF), PDFs, Text files, JSON, CSV. Check the specific tool page for exact format support.'
        },
        {
          q: 'Is there a file size limit?',
          a: 'For client-side tools, the limit depends on your device\'s memory. Generally, files up to 100MB work well. Larger files may process slower or fail on low-memory devices.'
        },
        {
          q: 'Can I process multiple files at once?',
          a: 'Yes! Most of our tools support batch processing. Simply select or drag multiple files at once.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'Which browsers are supported?',
          a: 'AsaPhisTool works on all modern browsers: Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version for best performance.'
        },
        {
          q: 'Can I use AsaPhisTool offline?',
          a: 'Yes! AsaPhisTool is a Progressive Web App (PWA). You can install it on your device and use many tools offline. Look for the "Install" prompt in your browser.'
        },
        {
          q: 'Does AsaPhisTool work on mobile?',
          a: 'Absolutely! All our tools are mobile-responsive and work great on smartphones and tablets.'
        },
        {
          q: 'Why is processing slow?',
          a: 'Processing speed depends on your device\'s CPU and memory. Factors: file size, device specs, browser performance. Try closing other tabs or using a desktop for large files.'
        }
      ]
    },
    {
      category: 'Features',
      questions: [
        {
          q: 'Can I suggest a new tool?',
          a: 'Yes! We love hearing suggestions. Please use our Contact form to share your ideas. We\'re constantly adding new tools based on user feedback.'
        },
        {
          q: 'How do I report a bug?',
          a: 'Please use our Contact page to report bugs. Include: 1) Tool name, 2) What you were trying to do, 3) What happened, 4) Your browser and OS. Screenshots help too!'
        },
        {
          q: 'Will you add video editing tools?',
          a: 'We\'re exploring video tools! However, video processing is resource-intensive. We\'re researching ways to do it efficiently in the browser.'
        }
      ]
    },
    {
      category: 'Specific Tools',
      questions: [
        {
          q: 'How does the Image Compressor work?',
          a: 'Our Image Compressor uses browser Canvas API to resize and compress images. You can adjust quality, dimensions, and output format. All processing happens locally.'
        },
        {
          q: 'Can the PDF Merger handle large PDFs?',
          a: 'Yes, but very large PDFs (100+ pages or 50+ MB) may be slow on low-memory devices. The tool uses pdf-lib library for client-side merging.'
        },
        {
          q: 'Is the Password Generator secure?',
          a: 'Yes! It uses the browser\'s Crypto API (crypto.getRandomValues()) which provides cryptographically strong random values. Generated passwords are never sent or stored anywhere.'
        }
      ]
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions and learn how to use our tools effectively
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a href="/contact" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📧 Contact Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get help from our team</p>
          </a>
          <a href="/about" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">ℹ️ About Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Learn about our mission</p>
          </a>
          <a href="/" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛠️ Browse Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Explore all our tools</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}". Try a different search term.
            </div>
          ) : (
            filteredFAQs.map((category, catIndex) => (
              <div key={catIndex} className="mb-8 last:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openFAQ === globalIndex;
                    
                    return (
                      <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : globalIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white pr-4">
                            {faq.q}
                          </span>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-8 text-center">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Still need help?
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-6">
            Can't find what you're looking for? Our team is here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
