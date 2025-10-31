'use client';

import { Coins, Heart, Square, Lightbulb } from 'lucide-react';

export default function HowItsFree() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          How We Keep AsaPhisTool Free
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Our mission is to provide powerful tools accessible to everyone, forever free
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Square className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold ml-3">Advertising Support</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            We partner with trusted advertisers and use services like Google AdSense to display 
            relevant, high-quality ads. This helps cover our server costs and development expenses 
            while keeping all tools free for you.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h2 className="text-2xl font-semibold ml-3">Community Support</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Our community can support us through voluntary donations. These contributions help us 
            improve existing tools and develop new ones. Every donation, big or small, makes a difference.
          </p>
        </div>
      </div>

      <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Our Commitment to You</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <Lightbulb className="h-6 w-6 text-primary mt-1" />
            <div className="ml-4">
              <h3 className="font-semibold mb-2">Always Free Core Features</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All essential features will always remain free. We believe in providing value first.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Coins className="h-6 w-6 text-primary mt-1" />
            <div className="ml-4">
              <h3 className="font-semibold mb-2">Transparent Revenue Model</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're open about how we sustain our platform through ethical advertising and voluntary support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Support Our Mission</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          If you find our tools valuable, consider supporting us. You can do this by:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-4 mb-8">
          <li className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">1</span>
            <span>Whitelisting us in your ad blocker</span>
          </li>
          <li className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">2</span>
            <span>Making a donation to support development</span>
          </li>
          <li className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">3</span>
            <span>Sharing our platform with others</span>
          </li>
        </ul>
        <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
          Support AsaPhisTool
        </button>
      </div>
    </div>
  );
}