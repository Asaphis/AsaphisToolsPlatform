'use client';

import { Tool } from '@/types';
import {
  RemoteToolRunner,
  HashGenerator,
} from './index';

interface ToolPageContentProps {
  tool: Tool;
}

// Default tool interface for tools that don't have specific implementations yet
function DefaultToolInterface({ tool }: { tool: Tool }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 p-8 shadow-sm">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-violet-500 rounded-2xl flex items-center justify-center text-5xl text-white mx-auto mb-6 shadow-lg">
          {tool.icon}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
          {tool.name}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {tool.description}
        </p>
        
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Coming Soon!
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            This tool is currently under development. We&apos;re working hard to bring you the best {tool.name.toLowerCase()} experience. 
            Check back soon or subscribe to our newsletter for updates!
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-100">
            Request Early Access
          </button>
          <button className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-sky-100">
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
        return <RemoteToolRunner toolId={tool.id} />;
      case 'image-resizer':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'pdf-merger':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'pdf-splitter':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'image-format-converter':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'csv-to-json-converter':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'background-remover':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'word-counter':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'text-case-converter':
        return <DefaultToolInterface tool={tool} />;
      case 'json-formatter':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'url-encoder-decoder':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'base64-encoder-decoder':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'qr-code-generator':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'password-generator':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'uuid-generator':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'password-strength-checker':
        return <RemoteToolRunner toolId={tool.id} />;
      case 'lorem-ipsum-generator':
        return <DefaultToolInterface tool={tool} />;
      case 'youtube-thumbnail-downloader':
        return <RemoteToolRunner toolId={tool.id} />;
      // Video & Audio converters/encoders
      case 'video-to-mp3':
      case 'mp4-to-mp3':
      case 'mp3-to-ogg':
      case 'mp4-converter':
      case 'mov-to-mp4':
      case 'video-converter':
        return <RemoteToolRunner toolId={tool.id} />;
      // GIF & Video tools (backend)
      case 'video-to-gif':
      case 'mp4-to-gif':
      case 'webm-to-gif':
      case 'gif-to-mp4':
      case 'video-compressor':
      case 'mp3-compressor':
      case 'wav-compressor':
      case 'gif-compressor':
      case 'video-converter':
      case 'mp4-converter':
      case 'mov-to-mp4':
      case 'video-to-mp3':
      case 'mp4-to-mp3':
      case 'mp3-to-ogg':
        return <RemoteToolRunner toolId={tool.id} />;
      // PDF tools
      case 'pdf-to-jpg':
        return <RemoteToolRunner toolId={tool.id} />;
      default:
        // For tools without specific UI, use backend-connected runner if available
        return <RemoteToolRunner toolId={tool.id} />;
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
