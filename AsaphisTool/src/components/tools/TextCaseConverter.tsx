'use client';

import { useState } from 'react';
import { recordToolUsage } from '@/lib/analytics';

type CaseType = 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'alternating' | 'inverse';

interface ConversionResult {
  type: string;
  name: string;
  result: string;
  description: string;
}

export function TextCaseConverter() {
  const [inputText, setInputText] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType>('uppercase');
  const [outputText, setOutputText] = useState('');
  const [allResults, setAllResults] = useState<ConversionResult[]>([]);
  const [showAllResults, setShowAllResults] = useState(false);

  const caseConverters = {
    uppercase: {
      name: 'UPPERCASE',
      description: 'Convert all letters to uppercase',
      convert: (text: string) => text.toUpperCase()
    },
    lowercase: {
      name: 'lowercase',
      description: 'Convert all letters to lowercase',
      convert: (text: string) => text.toLowerCase()
    },
    title: {
      name: 'Title Case',
      description: 'Capitalize the first letter of each word',
      convert: (text: string) => text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
    },
    sentence: {
      name: 'Sentence case',
      description: 'Capitalize only the first letter of each sentence',
      convert: (text: string) => text.toLowerCase().replace(/(^\w|[.!?]\s*\w)/g, char => char.toUpperCase())
    },
    camel: {
      name: 'camelCase',
      description: 'First word lowercase, subsequent words capitalized, no spaces',
      convert: (text: string) => text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    },
    pascal: {
      name: 'PascalCase',
      description: 'All words capitalized, no spaces',
      convert: (text: string) => text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^./, char => char.toUpperCase())
    },
    snake: {
      name: 'snake_case',
      description: 'All lowercase with underscores between words',
      convert: (text: string) => text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
    },
    kebab: {
      name: 'kebab-case',
      description: 'All lowercase with hyphens between words',
      convert: (text: string) => text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    },
    alternating: {
      name: 'aLtErNaTiNg CaSe',
      description: 'Alternating uppercase and lowercase letters',
      convert: (text: string) => text
        .split('')
        .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
        .join('')
    },
    inverse: {
      name: 'iNVERSE cASE',
      description: 'Swap the case of each letter',
      convert: (text: string) => text
        .split('')
        .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
        .join('')
    }
  };

  const convertText = () => {
    if (!inputText.trim()) return;

    const converter = caseConverters[selectedCase];
    const result = converter.convert(inputText);
    setOutputText(result);
    recordToolUsage('text-case-converter', { action: `Convert:${selectedCase}`, fileCount: 1 });
  };

  const convertToAllCases = () => {
    if (!inputText.trim()) return;

    const results: ConversionResult[] = [];
    Object.entries(caseConverters).forEach(([type, converter]) => {
      const result = converter.convert(inputText);
      results.push({
        type,
        name: converter.name,
        result,
        description: converter.description
      });
    });

    setAllResults(results);
    setShowAllResults(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setAllResults([]);
    setShowAllResults(false);
  };

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const exampleTexts = [
    "Hello World! This is a sample text.",
    "the quick brown fox jumps over the lazy dog",
    "JavaScript is an awesome programming language",
    "convert this text to different cases easily",
    "MAKE YOUR TEXT LOOK EXACTLY HOW YOU WANT IT"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Aa Text Case Converter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert text to uppercase, lowercase, title case, camelCase, snake_case, and more. Perfect for developers, writers, and content creators.
          All processing happens in your browser - your text never leaves your device.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Object.entries(caseConverters).map(([key, converter]) => (
            <button
              key={key}
              onClick={() => setSelectedCase(key as CaseType)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedCase === key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-sm">{converter.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {converter.description}
              </div>
            </button>
          ))}
        </div>

        {/* Example Buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Examples:
          </label>
          <div className="flex flex-wrap gap-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setInputText(example)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📝 Input Text
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getCharacterCount(inputText)} chars • {getWordCount(inputText)} words
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={convertText}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Convert to {caseConverters[selectedCase].name}
            </button>
            <button
              onClick={convertToAllCases}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Convert to All Cases
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ✨ Converted Text ({caseConverters[selectedCase].name})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getCharacterCount(outputText)} chars
            </div>
          </div>
          
          <textarea
            value={outputText}
            readOnly
            placeholder="Converted text will appear here..."
            className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => copyToClipboard(outputText)}
              disabled={!outputText}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📋 Copy Result
            </button>
            <button
              onClick={() => setInputText(outputText)}
              disabled={!outputText}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⬅️ Use as Input
            </button>
          </div>
        </div>
      </div>

      {/* All Results */}
      {showAllResults && allResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔄 All Case Conversions
            </h3>
            <button
              onClick={() => setShowAllResults(false)}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Hide Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allResults.map((result) => (
              <div
                key={result.type}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {result.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.description}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.result)}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    title="Copy this result"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border mt-2">
                  <div className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                    {result.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          💡 Case Conversion Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">For Writers & Content</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• <strong>Title Case</strong>: Headlines and book titles</li>
              <li>• <strong>Sentence case</strong>: Natural reading flow</li>
              <li>• <strong>UPPERCASE</strong>: Emphasis and attention</li>
              <li>• <strong>lowercase</strong>: Casual, modern style</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">For Developers & Code</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• <strong>camelCase</strong>: JavaScript variables</li>
              <li>• <strong>PascalCase</strong>: Class names, React components</li>
              <li>• <strong>snake_case</strong>: Python, database fields</li>
              <li>• <strong>kebab-case</strong>: URLs, CSS classes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
