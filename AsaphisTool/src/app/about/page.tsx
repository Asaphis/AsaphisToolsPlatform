import { Metadata } from 'next';
import { CheckCircle, Zap, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - AsaPhisTool',
  description: 'Learn about AsaPhisTool and our mission to provide free, fast, and secure online tools for everyone.',
};

export default function AboutPage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Most tools process data entirely in your browser. Your files never leave your device.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'No uploads, no waiting. Instant processing powered by modern browser technologies.',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Always Free',
      description: 'Access all tools without registration, subscriptions, or hidden fees.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'No Registration',
      description: 'Start using tools immediately. No sign-ups, no accounts, no hassle.',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const stats = [
    { value: '30+', label: 'Free Tools' },
    { value: '100%', label: 'Browser-Based' },
    { value: '0', label: 'Data Collected' },
    { value: '∞', label: 'Usage Limit' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            About AsaPhisTool
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We believe powerful tools should be accessible to everyone, everywhere. 
            That's why we created AsaPhisTool - a free, fast, and secure platform 
            for all your online tool needs.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            In an era where online privacy is increasingly important and software subscriptions 
            are becoming the norm, we wanted to create something different. AsaPhisTool was born 
            from a simple idea: provide powerful, professional-grade tools that are completely free, 
            respect user privacy, and work instantly in your browser.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Whether you're a designer compressing images, a developer formatting JSON, or a student 
            working on a PDF, we believe you shouldn't have to compromise on privacy, pay subscription 
            fees, or wait for uploads to complete. Our tools process your data locally whenever possible, 
            ensuring your files remain private and results are instant.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          What Makes Us Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className={`flex justify-center mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 dark:bg-primary-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Built with Modern Technology
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            AsaPhisTool leverages cutting-edge web technologies to deliver desktop-level 
            performance right in your browser:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <span><strong>Client-Side Processing:</strong> Your files are processed locally using modern browser APIs</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <span><strong>Progressive Web App:</strong> Install on your device and use offline</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <span><strong>Zero-Knowledge Architecture:</strong> We can't access your data because it never reaches our servers</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <span><strong>Open Standards:</strong> Built on web standards that work across all modern browsers</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🔒 Privacy
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your data is yours. We process files locally whenever possible and never 
              store or analyze your content. No tracking, no profiling, no surprises.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🌍 Accessibility
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Professional tools shouldn't be locked behind paywalls. We're committed to 
              keeping our tools free and accessible to everyone, everywhere.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Simplicity
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Great tools should be easy to use. No complicated interfaces, no lengthy 
              tutorials - just upload, process, and download. It's that simple.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Thousands of Users Worldwide
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Start using our free tools today. No registration required, no credit card needed.
          </p>
          <a
            href="/"
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Explore All Tools
          </a>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Have questions, suggestions, or feedback? We'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
