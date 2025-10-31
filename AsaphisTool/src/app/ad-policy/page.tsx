'use client';

import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function AdPolicy() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Advertising Policy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          How we maintain a balance between free tools and sustainable operations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold ml-3">Our Ad Standards</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <span className="ml-3">Non-intrusive ad placements</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <span className="ml-3">Relevant to our users</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <span className="ml-3">Safe and verified advertisers</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <span className="ml-3">Transparent advertising labels</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-2xl font-semibold ml-3">What We Don't Allow</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-1" />
              <span className="ml-3">Pop-ups or intrusive overlays</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-1" />
              <span className="ml-3">Auto-playing video or audio ads</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-1" />
              <span className="ml-3">Deceptive or misleading content</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-1" />
              <span className="ml-3">Malicious or harmful ads</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-semibold mb-6">Our Advertising Partners</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Google AdSense</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We partner with Google AdSense to display relevant ads. These ads are automatically 
              selected based on your interests and browsing history.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Direct Advertisers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We work with selected companies to display direct advertisements. These partnerships 
              are carefully vetted to ensure they provide value to our users.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Have Feedback About Our Ads?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We're always looking to improve. If you have concerns about any advertisements on our platform, 
          please let us know.
        </p>
        <button 
          onClick={() => window.location.href = '/contact'}
          className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
}