'use client';

import { useState } from 'react';
import { recordToolUsage } from '@/lib/analytics';

interface EncodingResult {
  original: string;
  encoded: string;
  encodingType: string;
  length: number;
}

type EncodingType = 'url' | 'url-component' | 'html' | 'base64' | 'hex' | 'unicode';

export function URLEncoderDecoder() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodingType, setEncodingType] = useState<EncodingType>('url');
  const [results, setResults] = useState<EncodingResult[]>([]);
  const [showBatchResults, setShowBatchResults] = useState(false);

  const encodingFunctions = {
    url: {
      encode: (text: string) => encodeURI(text),
      decode: (text: string) => decodeURI(text),
      name: 'URL Encoding',
      description: 'Encode/decode full URLs (preserves :/?#[]@!$&\'()*+,;= characters)'
    },
    'url-component': {
      encode: (text: string) => encodeURIComponent(text),
      decode: (text: string) => decodeURIComponent(text),
      name: 'URL Component Encoding',
      description: 'Encode/decode URL components (encodes all special characters)'
    },
    html: {
      encode: (text: string) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/ /g, '&nbsp;'),
      decode: (text: string) => text
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&'),
      name: 'HTML Entity Encoding',
      description: 'Encode/decode HTML entities and special characters'
    },
    base64: {
      encode: (text: string) => btoa(unescape(encodeURIComponent(text))),
      decode: (text: string) => decodeURIComponent(escape(atob(text))),
      name: 'Base64 Encoding',
      description: 'Encode/decode text using Base64 encoding'
    },
    hex: {
      encode: (text: string) => Array.from(new TextEncoder().encode(text))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(''),
      decode: (text: string) => new TextDecoder().decode(
        new Uint8Array(text.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
      ),
      name: 'Hexadecimal Encoding',
      description: 'Encode/decode text as hexadecimal values'
    },
    unicode: {
      encode: (text: string) => text
        .split('')
        .map(char => {
          const code = char.charCodeAt(0);
          return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
        })
        .join(''),
      decode: (text: string) => text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      ),
      name: 'Unicode Escape Encoding',
      description: 'Encode/decode Unicode escape sequences'
    }
  };

  const processText = () => {
    if (!inputText.trim()) return;

    try {
      const func = encodingFunctions[encodingType];
      const result = mode === 'encode' ? func.encode(inputText) : func.decode(inputText);
      setOutputText(result);
      recordToolUsage('url-encoder-decoder', { action: mode === 'encode' ? 'Encoded' : 'Decoded', fileCount: 1 });
    } catch (error) {
      setOutputText(`Error: ${error instanceof Error ? error.message : 'Invalid input for decoding'}`);
    }
  };

  const processAllEncodings = () => {
    if (!inputText.trim()) return;

    const newResults: EncodingResult[] = [];
    
    Object.entries(encodingFunctions).forEach(([type, func]) => {
      try {
        const result = mode === 'encode' ? func.encode(inputText) : func.decode(inputText);
        newResults.push({
          original: inputText,
          encoded: result,
          encodingType: func.name,
          length: result.length
        });
      } catch (error) {
        newResults.push({
          original: inputText,
          encoded: `Error: ${error instanceof Error ? error.message : 'Invalid input'}`,
          encodingType: func.name,
          length: 0
        });
      }
    });

    setResults(newResults);
    setShowBatchResults(true);
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

  const swapInputOutput = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setResults([]);
    setShowBatchResults(false);
  };

  const exampleTexts = {
    url: 'https://example.com/path with spaces?param=value&other=test',
    'url-component': 'Hello World! @#$%^&*()',
    html: '<script>alert("Hello World!");</script>',
    base64: 'Hello World! This is a test message.',
    hex: 'Hello World! 🌍',
    unicode: 'Hello World! 🚀 Special chars: áéíóú'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🔗 URL Encoder/Decoder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Encode and decode text using various encoding schemes. Support for URLs, HTML entities, Base64, Hex, and more.
          All processing happens in your browser - your data never leaves your device.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Operation Mode
            </label>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setMode('encode')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                🔒 Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                🔓 Decode
              </button>
            </div>
          </div>

          {/* Encoding Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Encoding Type
            </label>
            <select
              value={encodingType}
              onChange={(e) => setEncodingType(e.target.value as EncodingType)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(encodingFunctions).map(([key, func]) => (
                <option key={key} value={key}>
                  {func.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button
                onClick={swapInputOutput}
                disabled={!inputText && !outputText}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Swap input and output"
              >
                ⇄
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>{encodingFunctions[encodingType].name}:</strong> {encodingFunctions[encodingType].description}
          </p>
        </div>

        {/* Example Button */}
        <button
          onClick={() => setInputText(exampleTexts[encodingType])}
          className="mb-4 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm"
        >
          📝 Load Example Text
        </button>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'encode' ? '📝 Text to Encode' : '🔓 Text to Decode'}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {inputText.length} characters
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter text to ${mode}...`}
            className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={processText}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}
            </button>
            <button
              onClick={processAllEncodings}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔄 All Types
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'encode' ? '🔒 Encoded Result' : '📝 Decoded Result'}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {outputText.length} characters
            </div>
          </div>
          
          <textarea
            value={outputText}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => copyToClipboard(outputText)}
              disabled={!outputText}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📋 Copy
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

      {/* Batch Results */}
      {showBatchResults && results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔄 All Encoding Types Results
            </h3>
            <button
              onClick={() => setShowBatchResults(false)}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Hide
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {result.encodingType}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(result.encoded)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {result.length} chars
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
                    {result.encoded}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Examples */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Common Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">URL Encoding</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Encode URLs with special characters</li>
              <li>• Prepare URLs for HTTP requests</li>
              <li>• Handle international characters in URLs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">HTML Entity Encoding</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Safely display HTML in web pages</li>
              <li>• Prevent XSS attacks</li>
              <li>• Encode special HTML characters</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Base64 Encoding</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Encode binary data as text</li>
              <li>• Email attachments</li>
              <li>• Data URLs for images</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Unicode Escaping</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Handle international characters</li>
              <li>• JSON string encoding</li>
              <li>• JavaScript string literals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
