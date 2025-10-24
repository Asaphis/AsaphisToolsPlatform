'use client';

import { useState, useCallback } from 'react';
import { recordToolUsage } from '@/lib/analytics';
import { useDropzone } from 'react-dropzone';

type ProcessMode = 'text' | 'file';

interface FileResult {
  name: string;
  size: number;
  type: string;
  base64: string;
  dataUrl: string;
}

export function Base64EncoderDecoder() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [processMode, setProcessMode] = useState<ProcessMode>('text');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Text encoding/decoding functions
  const encodeText = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error('Failed to encode text to Base64');
    }
  };

  const decodeText = (base64: string): string => {
    try {
      // Clean the input - remove whitespace and check if it's valid Base64
      const cleanBase64 = base64.replace(/\s/g, '');
      
      // Basic Base64 validation
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        throw new Error('Invalid Base64 format');
      }
      
      return decodeURIComponent(escape(atob(cleanBase64)));
    } catch (error) {
      throw new Error('Failed to decode Base64 text');
    }
  };

  // File processing
  const processFile = async (file: File): Promise<FileResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data URL prefix
          
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64Data,
            dataUrl: result
          });
        } catch (error) {
          reject(new Error(`Failed to process file: ${file.name}`));
        }
      };
      
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (mode !== 'encode' || processMode !== 'file') return;
    
    setIsProcessing(true);
    const results: FileResult[] = [];
    
    for (const file of acceptedFiles) {
      try {
        const result = await processFile(file);
        results.push(result);
      } catch (error) {
        console.error('Failed to process file:', file.name, error);
      }
    }
    
    setFileResults(prev => [...prev, ...results]);
    setIsProcessing(false);
  }, [mode, processMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: mode !== 'encode' || processMode !== 'file'
  });

  const processText = () => {
    if (!inputText.trim()) return;
    
    try {
      if (mode === 'encode') {
        const encoded = encodeText(inputText);
        setOutputText(encoded);
        recordToolUsage('base64-encoder-decoder', { action: 'Encoded', fileCount: 1 });
      } else {
        const decoded = decodeText(inputText);
        setOutputText(decoded);
        recordToolUsage('base64-encoder-decoder', { action: 'Decoded', fileCount: 1 });
      }
    } catch (error) {
      setOutputText(`Error: ${error instanceof Error ? error.message : 'Processing failed'}`);
    }
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

  const downloadFile = (result: FileResult) => {
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBase64AsText = (base64: string, filename: string) => {
    const blob = new Blob([base64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setFileResults([]);
  };

  const swapInputOutput = () => {
    if (processMode === 'text') {
      const temp = inputText;
      setInputText(outputText);
      setOutputText(temp);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exampleTexts = {
    encode: [
      'Hello, World!',
      'Base64 encoding example',
      'Special characters: ñáéíóú @#$%^&*()',
      'Multi-line\ntext\nexample',
      'JavaScript is awesome! 🚀'
    ],
    decode: [
      'SGVsbG8sIFdvcmxkIQ==',
      'QmFzZTY0IGVuY29kaW5nIGV4YW1wbGU=',
      'U3BlY2lhbCBjaGFyYWN0ZXJzOiDDscOhw6nDrcOzw7ogQCMkJV4mKigp',
      'TXVsdGktbGluZQp0ZXh0CmV4YW1wbGU=',
      'SmF2YVNjcmlwdCBpcyBhd2Vzb21lISA8c2ltaWxlPvCfmoA8L3NtaWxlPg=='
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🔐 Base64 Encoder/Decoder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Encode text and files to Base64 or decode Base64 strings back to original format. Perfect for data transmission, embedding files, and web development.
          All processing happens in your browser - your data never leaves your device.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Processing Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          {/* Process Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Input Type
            </label>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setProcessMode('text')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  processMode === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                📝 Text
              </button>
              <button
                onClick={() => setProcessMode('file')}
                disabled={mode === 'decode'}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  processMode === 'file' && mode === 'encode'
                    ? 'bg-primary-600 text-white'
                    : mode === 'decode'
                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                📁 File
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {processMode === 'text' && (
            <button
              onClick={swapInputOutput}
              disabled={!inputText && !outputText}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Swap input and output"
            >
              ⇄ Swap
            </button>
          )}
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Text Processing */}
      {processMode === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? '📝 Text to Encode' : '🔓 Base64 to Decode'}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} characters
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
              className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
            />
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={processText}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}
              </button>
            </div>

            {/* Example Buttons */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Examples:
              </label>
              <div className="flex flex-wrap gap-2">
                {exampleTexts[mode].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(example)}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Example {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? '🔒 Base64 Result' : '📝 Decoded Text'}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {outputText.length} characters
              </div>
            </div>
            
            <textarea
              value={outputText}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-40 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none font-mono text-sm"
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
                onClick={() => downloadBase64AsText(outputText, `${mode}-result.txt`)}
                disabled={!outputText}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                💾 Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Processing */}
      {processMode === 'file' && mode === 'encode' && (
        <div>
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop files here...' : 'Upload Files to Encode'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag and drop any files here, or click to browse. All file types supported.
                </p>
              </div>
              {isProcessing && (
                <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Processing files...
                </div>
              )}
            </div>
          </div>

          {/* File Results */}
          {fileResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📁 Encoded Files ({fileResults.length})
                </h3>
                <button
                  onClick={() => setFileResults([])}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {fileResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {result.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(result.size)} • {result.type || 'Unknown type'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(result.base64)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Copy Base64
                        </button>
                        <button
                          onClick={() => downloadBase64AsText(result.base64, `${result.name}.base64.txt`)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Download Base64
                        </button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all max-h-20 overflow-y-auto">
                        {result.base64.substring(0, 200)}
                        {result.base64.length > 200 && '...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Examples */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Base64 Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Common Applications</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Embedding images in CSS/HTML</li>
              <li>• API data transmission</li>
              <li>• Email attachments encoding</li>
              <li>• Configuration file storage</li>
              <li>• URL-safe data encoding</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Features</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• UTF-8 text encoding/decoding</li>
              <li>• Any file type support</li>
              <li>• Batch file processing</li>
              <li>• Data URL generation</li>
              <li>• Copy & download results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
