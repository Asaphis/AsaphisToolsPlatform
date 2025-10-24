'use client';

import { useState, useEffect } from 'react';
import { recordToolUsage } from '@/lib/analytics';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  path?: string;
}

export function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [mode, setMode] = useState<'format' | 'minify' | 'validate'>('format');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const validateJSON = (jsonString: string): ValidationResult => {
    if (!jsonString.trim()) {
      return { isValid: true };
    }

    try {
      JSON.parse(jsonString);
      return { isValid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Extract line and column information from the error message
      const match = errorMessage.match(/position (\d+)/);
      let path = '';
      if (match) {
        const position = parseInt(match[1]);
        const lines = jsonString.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        path = `Line ${lineNumber}, Column ${columnNumber}`;
      }

      return {
        isValid: false,
        error: errorMessage,
        path
      };
    }
  };

  const formatJSON = (jsonString: string, indentSize: number, shouldSortKeys: boolean): string => {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (shouldSortKeys) {
        const sortObject = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(sortObject);
          } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
              .sort()
              .reduce((sorted: any, key) => {
                sorted[key] = sortObject(obj[key]);
                return sorted;
              }, {});
          }
          return obj;
        };
        
        return JSON.stringify(sortObject(parsed), null, indentSize);
      }
      
      return JSON.stringify(parsed, null, indentSize);
    } catch (error) {
      throw error;
    }
  };

  const minifyJSON = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error) {
      throw error;
    }
  };

  const processJSON = () => {
    const validation = validateJSON(input);
    setValidationResult(validation);

    if (!validation.isValid) {
      setOutput('');
      return;
    }

    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let result = '';
      
      switch (mode) {
        case 'format':
          result = formatJSON(input, indent, sortKeys);
          break;
        case 'minify':
          result = minifyJSON(input);
          break;
        case 'validate':
          result = input; // Keep original for validation mode
          break;
      }
      
      setOutput(result);
      recordToolUsage('json-formatter', { action: mode === 'minify' ? 'Minified' : mode === 'format' ? 'Formatted' : 'Validated', fileCount: 1 });
    } catch (error) {
      // Error is already handled by validateJSON
      setOutput('');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setValidationResult({ isValid: true });
  };

  const loadSample = () => {
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "swimming", "coding"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001",
        "country": "USA"
      },
      "isActive": true,
      "balance": 1250.75,
      "lastLogin": "2024-01-15T10:30:00Z"
    };
    setInput(JSON.stringify(sampleJSON, null, 2));
  };

  const addLineNumbers = (text: string) => {
    return text.split('\n').map((line, index) => {
      const lineNumber = (index + 1).toString().padStart(3, ' ');
      return `${lineNumber} | ${line}`;
    }).join('\n');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      processJSON();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [input, mode, indent, sortKeys, processJSON]);

  const getLineCount = (text: string) => text.split('\n').length;
  const getCharCount = (text: string) => text.length;
  const getByteSize = (text: string) => new Blob([text]).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          { } JSON Formatter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Format, validate, and minify JSON data with syntax highlighting and error detection.
          Perfect for developers and API testing.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            {/* Mode Selection */}
            <div className="flex items-center space-x-2">
              {[{ id: 'format', label: 'Format', icon: '🎨' }, { id: 'minify', label: 'Minify', icon: '📦' }, { id: 'validate', label: 'Validate', icon: '✅' }].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id as any)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    mode === option.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={loadSample}
              className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              📝 Load Sample
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Settings */}
        {mode === 'format' && (
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <label className="text-gray-700 dark:text-gray-300">Indent:</label>
              <select
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Tabs</option>
              </select>
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Sort keys alphabetically</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Show line numbers</span>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input JSON</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Lines: {getLineCount(input)}</span>
              <span>•</span>
              <span>Chars: {getCharCount(input)}</span>
              <span>•</span>
              <span>Size: {getByteSize(input)} bytes</span>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className={`w-full h-96 px-4 py-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationResult.isValid
                  ? 'border-gray-300 dark:border-gray-600'
                  : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {input && (
              <button
                onClick={() => copyToClipboard(input)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded shadow-sm"
                title="Copy input"
              >
                📋
              </button>
            )}
          </div>

          {/* Validation Status */}
          <div className="space-y-2">
            {!validationResult.isValid && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 text-lg flex-shrink-0">❌</span>
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-200">Invalid JSON</p>
                    <p className="text-red-700 dark:text-red-300 mt-1">{validationResult.error}</p>
                    {validationResult.path && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {validationResult.path}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {validationResult.isValid && input.trim() && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-lg">✅</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Valid JSON</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Output ({mode === 'format' ? 'Formatted' : mode === 'minify' ? 'Minified' : 'Validated'})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Lines: {getLineCount(output)}</span>
              <span>•</span>
              <span>Chars: {getCharCount(output)}</span>
              <span>•</span>
              <span>Size: {getByteSize(output)} bytes</span>
              {input && output && (
                <>
                  <span>•</span>
                  <span className={mode === 'minify' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                    {mode === 'minify' 
                      ? `${((1 - getByteSize(output) / getByteSize(input)) * 100).toFixed(1)}% smaller`
                      : `${((getByteSize(output) / getByteSize(input) - 1) * 100).toFixed(1)}% larger`
                    }
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={showLineNumbers && output ? addLineNumbers(output) : output}
              readOnly
              placeholder={validationResult.isValid ? "Output will appear here..." : "Fix JSON errors to see output"}
              className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {output && (
              <button
                onClick={() => copyToClipboard(output)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-700 rounded shadow-sm"
                title="Copy output"
              >
                📋
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          🔧 JSON Tool Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>Format & Beautify:</strong>
            <p>Pretty-print JSON with customizable indentation and key sorting.</p>
          </div>
          <div>
            <strong>Minify & Compress:</strong>
            <p>Remove whitespace and reduce file size for production use.</p>
          </div>
          <div>
            <strong>Validate & Debug:</strong>
            <p>Real-time validation with detailed error messages and line numbers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
