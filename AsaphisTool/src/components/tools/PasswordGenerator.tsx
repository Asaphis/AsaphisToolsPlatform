'use client';

import { useState, useEffect } from 'react';
import { recordToolUsage } from '@/lib/analytics';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'red' });
  const [showPassword, setShowPassword] = useState(true);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';
    const ambiguous = '{}[]()/\\\'"`~,;.<>';

    let charset = '';
    if (settings.includeUppercase) charset += uppercase;
    if (settings.includeLowercase) charset += lowercase;
    if (settings.includeNumbers) charset += numbers;
    if (settings.includeSymbols) charset += symbols;

    if (settings.excludeSimilar) {
      charset = charset.split('').filter(char => !similar.includes(char)).join('');
    }
    if (settings.excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguous.includes(char)).join('');
    }

    if (charset === '') {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < settings.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(result);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['red', 'red', 'orange', 'yellow', 'green', 'green'];
    
    return {
      score,
      label: labels[score] || 'Very Weak',
      color: colors[score] || 'red'
    };
  };

  useEffect(() => {
    if (password) {
      setStrength(calculateStrength(password));
    }
  }, [password]);

  useEffect(() => {
    generatePassword();
  }, [settings, generatePassword]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    recordToolUsage('password-generator', { action: 'Copied', fileCount: 1 });
  };

  const getStrengthBarColor = () => {
    switch (strength.color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-red-500';
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Password Settings
          </h2>

          {/* Length Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Length: {settings.length}
            </label>
            <input
              type="range"
              min="4"
              max="128"
              value={settings.length}
              onChange={(e) => setSettings(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include Characters
            </h3>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.includeUppercase}
                onChange={() => toggleSetting('includeUppercase')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Uppercase letters (A-Z)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.includeLowercase}
                onChange={() => toggleSetting('includeLowercase')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Lowercase letters (a-z)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.includeNumbers}
                onChange={() => toggleSetting('includeNumbers')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Numbers (0-9)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.includeSymbols}
                onChange={() => toggleSetting('includeSymbols')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Symbols (!@#$%^&*)
              </span>
            </label>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Advanced Options
            </h3>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.excludeSimilar}
                onChange={() => toggleSetting('excludeSimilar')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Exclude similar characters (i, l, 1, L, o, 0, O)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.excludeAmbiguous}
                onChange={() => toggleSetting('excludeAmbiguous')}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Exclude ambiguous characters ({ }[ ]/\\'"`~,;.&lt;&gt;)
              </span>
            </label>
          </div>
        </div>

        {/* Generated Password Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Password
            </h2>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Password Display */}
          <div className="relative">
            <input
              type="text"
              value={showPassword ? password : '•'.repeat(password.length)}
              readOnly
              className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-lg break-all"
            />
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Copy
            </button>
          </div>

          {/* Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
                <span className={`font-medium ${
                  strength.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  strength.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  strength.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStrengthBarColor()} transition-all duration-300`}
                  style={{ width: `${(strength.score / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => { generatePassword(); recordToolUsage('password-generator', { action: 'Generated', fileCount: 1 }); }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Generate New Password
            </button>
          </div>

          {/* Password Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Password Security Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use at least 12 characters for good security</li>
              <li>• Never reuse passwords across multiple accounts</li>
              <li>• Consider using a password manager</li>
              <li>• Enable two-factor authentication when available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
