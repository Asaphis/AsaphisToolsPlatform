'use client';

import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import NextImage from 'next/image';
import { recordToolUsage } from '@/lib/analytics';

interface ThumbnailQuality {
  name: string;
  url: string;
  width: number;
  height: number;
}

export function YoutubeThumbnailDownloader() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [thumbnails, setThumbnails] = useState<ThumbnailQuality[]>([]);
  const [error, setError] = useState('');

  const extractVideoId = (input: string): string | null => {
    // Clean input
    input = input.trim();

    // Pattern 1: youtu.be/VIDEO_ID
    const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const shortMatch = input.match(shortPattern);
    if (shortMatch) return shortMatch[1];

    // Pattern 2: youtube.com/watch?v=VIDEO_ID
    const watchPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const watchMatch = input.match(watchPattern);
    if (watchMatch) return watchMatch[1];

    // Pattern 3: youtube.com/embed/VIDEO_ID
    const embedPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = input.match(embedPattern);
    if (embedMatch) return embedMatch[1];

    // Pattern 4: youtube.com/v/VIDEO_ID
    const vPattern = /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/;
    const vMatch = input.match(vPattern);
    if (vMatch) return vMatch[1];

    // Pattern 5: Just the video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    return null;
  };

  const fetchThumbnails = () => {
    setError('');
    setThumbnails([]);
    
    const extractedId = extractVideoId(url);
    
    if (!extractedId) {
      setError('Invalid YouTube URL or video ID. Please enter a valid YouTube video URL.');
      return;
    }

    setVideoId(extractedId);

    const thumbnailQualities: ThumbnailQuality[] = [
      {
        name: 'Maximum Resolution',
        url: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
        width: 1280,
        height: 720
      },
      {
        name: 'Standard Definition',
        url: `https://img.youtube.com/vi/${extractedId}/sddefault.jpg`,
        width: 640,
        height: 480
      },
      {
        name: 'High Quality',
        url: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        width: 480,
        height: 360
      },
      {
        name: 'Medium Quality',
        url: `https://img.youtube.com/vi/${extractedId}/mqdefault.jpg`,
        width: 320,
        height: 180
      },
      {
        name: 'Default',
        url: `https://img.youtube.com/vi/${extractedId}/default.jpg`,
        width: 120,
        height: 90
      }
    ];

    setThumbnails(thumbnailQualities);
    recordToolUsage('youtube-thumbnail-downloader', { action: 'Fetched' });
  };

  const downloadThumbnail = async (thumbnail: ThumbnailQuality) => {
    try {
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `youtube-${videoId}-${thumbnail.name.toLowerCase().replace(/ /g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🖼️ YouTube Thumbnail Downloader
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Download YouTube video thumbnails in all available resolutions. Works with any YouTube video URL or ID.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enter YouTube Video URL or ID
        </h3>
        
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchThumbnails()}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={fetchThumbnails}
            disabled={!url.trim()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Get Thumbnails
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
            <li>https://youtu.be/VIDEO_ID</li>
            <li>https://www.youtube.com/embed/VIDEO_ID</li>
            <li>Just the video ID (11 characters)</li>
          </ul>
        </div>
      </div>

      {/* Thumbnails Grid */}
      {thumbnails.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Thumbnails
            </h3>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Watch Video</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative bg-gray-100 dark:bg-gray-700" style={{ paddingBottom: '56.25%' }}>
                  <NextImage
                    src={thumbnail.url}
                    alt={thumbnail.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {thumbnail.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {thumbnail.width} × {thumbnail.height} px
                  </p>
                  <button
                    onClick={() => downloadThumbnail(thumbnail)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 How It Works
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            YouTube stores multiple thumbnail versions for each video. This tool retrieves all available thumbnail sizes directly from YouTube's image servers.
          </p>
          <p>
            <strong>Note:</strong> The Maximum Resolution thumbnail (1280×720) may not be available for older or lower-quality videos. In that case, you'll see a placeholder image.
          </p>
          <p>
            All thumbnails are fetched directly from YouTube's servers. Your privacy is protected - no data is stored or sent to any third party.
          </p>
        </div>
      </div>
    </div>
  );
}
