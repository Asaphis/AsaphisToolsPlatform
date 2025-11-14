'use client';

import { Tool } from '@/types';
import {
  RemoteToolRunner,
  HashGenerator,
  Base64EncoderDecoder,
  URLEncoderDecoder,
  JSONFormatter,
  QRCodeGenerator,
  PasswordGenerator,
  UUIDGenerator,
  PasswordStrengthChecker,
  CSVToJSONConverter,
  WordCounter,
  YoutubeThumbnailDownloader,
  ImageCompressor,
  ImageResizer,
  ImageFormatConverter,
  PDFMerger,
  PDFSplitter,
  PDFToJPG,
  TextCaseConverter,
  LoremIpsumGenerator,
  RegexTester,
  JWTDecoder,
  MarkdownPreview,
  CodeMinifier,
  SVGOptimizer,
  SVGRasterizer,
  TimestampConverter,
  UnitConverter,
  TimeConverter,
  ColorPickerTool,
  EXIFViewer,
  MetadataExtractor,
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
        
        <div className="bg-gradient-to-br from-sky-50 to-violet-50 dark:from-sky-900/10 dark:to-violet-900/10 border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white shadow">
              <span className="text-xl">ℹ️</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Tool temporarily unavailable</h3>
          <p className="text-foreground/80">This tool is not available right now. Please try again later or use one of the other tools on AsaPhisTool.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="w-full sm:w-auto inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-100">
            Request Early Access
          </button>
          <button className="w-full sm:w-auto inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-sky-100">
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
      // Client-only tools
      case 'image-compressor':
        return <ImageCompressor />;
      case 'image-resizer':
        return <ImageResizer />;
      case 'image-format-converter':
        return <ImageFormatConverter />;
      case 'pdf-merger':
        return <PDFMerger />;
      case 'pdf-splitter':
        return <PDFSplitter />;
      case 'pdf-to-jpg':
        return <PDFToJPG />;
      case 'csv-to-json-converter':
      case 'csv-to-json':
        return <CSVToJSONConverter />;
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
      case 'qr-generator':
        return <QRCodeGenerator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'uuid-generator':
        return <UUIDGenerator />;
      case 'hash-generator':
      case 'hash-calculator':
        return <HashGenerator />;
      case 'password-strength-checker':
        return <PasswordStrengthChecker />;
      case 'lorem-ipsum-generator':
        return <LoremIpsumGenerator />;
      case 'youtube-thumbnail-downloader':
        return <YoutubeThumbnailDownloader />;

      // Newly added client-only tool routes
      case 'regex-tester':
        return <RegexTester />;
      case 'jwt-decoder':
        return <JWTDecoder />;
      case 'markdown-preview':
        return <MarkdownPreview />;
      case 'code-minifier':
        return <CodeMinifier />;
      case 'svg-optimizer':
        return <SVGOptimizer />;
      case 'svg-rasterizer':
        return <SVGRasterizer />;
      case 'timestamp-converter':
        return <TimestampConverter />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'time-converter':
        return <TimeConverter />;
      case 'color-picker':
        return <ColorPickerTool />;
      case 'exif-viewer':
        return <EXIFViewer />;
      case 'metadata-extractor':
        return <MetadataExtractor />;

      // Video & Audio converters/encoders (backend or wasm)
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
      default:
        // For tools without a bespoke UI, fall back to backend-connected runner
        return <RemoteToolRunner toolId={tool.id} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tool Interface */}
      {renderTool()}

      {/* How to Use Section */}
      <div className="bg-card rounded-xl border border-border p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">How to use {tool.name}</h2>
        <div className="prose dark:prose-invert max-w-none text-foreground/80">
          <ol className="list-decimal list-inside space-y-3">
            <li>Upload your file or enter your text in the input area above</li>
            <li>Adjust any settings or options as needed</li>
            <li>Click the process button to apply the tool</li>
            <li>Download the result or copy the output</li>
          </ol>

          <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">💡 Pro Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm">
              <li>All processing happens in your browser - your files never leave your device</li>
              <li>Bookmark this page for quick access to the {tool.name}</li>
              <li>Share this tool with friends who might find it useful</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card rounded-xl border border-border p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6 text-foreground/80">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Is it safe to use this tool?</h3>
            <p>Yes, absolutely! All processing is done locally in your browser. Your files and data never leave your device, ensuring complete privacy and security.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Do I need to create an account?</h3>
            <p>No registration required! You can use all tools immediately without creating an account or providing any personal information.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Is this tool really free?</h3>
            <p>Yes, this tool is completely free to use. We may display ads to support the service, but the core functionality will always remain free.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
