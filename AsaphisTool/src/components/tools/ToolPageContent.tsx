'use client';

import { Tool } from '@/types';
import { WordCounter } from './WordCounter';
import { PasswordGenerator } from './PasswordGenerator';
import {
  ImageCompressor,
  PDFMerger,
  PDFSplitter,
  ImageFormatConverter,
  CSVToJSONConverter,
  BackgroundRemover,
  QRCodeGenerator,
  JSONFormatter,
  URLEncoderDecoder,
  Base64EncoderDecoder,
  TextCaseConverter,
  ImageResizer,
  UUIDGenerator,
  HashGenerator,
  PasswordStrengthChecker,
} from './index';

interface ToolPageContentProps {
  tool: Tool;
}

// Default tool interface for tools that don't have specific implementations yet
function DefaultToolInterface({ tool }: { tool: Tool }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center text-6xl mx-auto mb-6">
          {tool.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {tool.name}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {tool.description}
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Coming Soon!
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            This tool is currently under development. We're working hard to bring you the best {tool.name.toLowerCase()} experience. 
            Check back soon or subscribe to our newsletter for updates!
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Request Early Access
          </button>
          <button className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Get Notified
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToolPageContent({ tool }: ToolPageContentProps) {
  // Route to specific tool components based on tool ID
  const renderTool = () => {
    switch (tool.id) {
      case 'image-compressor':
        return <ImageCompressor />;
      case 'image-resizer':
        return <ImageResizer />;
      case 'pdf-merger':
        return <PDFMerger />;
      case 'pdf-splitter':
        return <PDFSplitter />;
      case 'image-format-converter':
        return <ImageFormatConverter />;
      case 'csv-to-json-converter':
        return <CSVToJSONConverter />;
      case 'background-remover':
        return <BackgroundRemover />;
      case 'word-counter':
        return <WordCounter />;
      case 'text-case-converter':
        return <TextCaseConverter />;
      case 'json-formatter':
        return <JSONFormatter />;
      case 'url-encoder-decoder':
        return <URLEncoderDecoder />;
      case 'base64-encoder-decoder':
        return <Base64EncoderDecoder />;
      case 'qr-code-generator':
        return <QRCodeGenerator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'uuid-generator':
        return <UUIDGenerator />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'password-strength-checker':
        return <PasswordStrengthChecker />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tool Interface */}
      {renderTool()}

      {/* How to Use Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          How to use {tool.name}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400">
            <li>Upload your file or enter your text in the input area above</li>
            <li>Adjust any settings or options as needed</li>
            <li>Click the process button to apply the tool</li>
            <li>Download the result or copy the output</li>
          </ol>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Pro Tips
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
              <li>All processing happens in your browser - your files never leave your device</li>
              <li>Bookmark this page for quick access to the {tool.name}</li>
              <li>Share this tool with friends who might find it useful</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Is it safe to use this tool?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, absolutely! All processing is done locally in your browser. Your files and data never 
              leave your device, ensuring complete privacy and security.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Do I need to create an account?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No registration required! You can use all tools immediately without creating an account 
              or providing any personal information.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Is this tool really free?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, this tool is completely free to use. We may display ads to support the service, 
              but the core functionality will always remain free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
