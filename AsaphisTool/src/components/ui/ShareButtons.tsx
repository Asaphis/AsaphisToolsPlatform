'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareButtons = [
    {
      name: 'Twitter',
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-foreground/80">Share:</span>

      <div className="flex items-center space-x-2">
        {shareButtons.map((button) => (
          <button
            key={button.name}
            onClick={() => openShare(button.url)}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium transition-colors ${button.color}`}
            title={`Share on ${button.name}`}
          >
            {button.icon}
          </button>
        ))}

        <button
          onClick={copyToClipboard}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground hover:bg-muted/90 transition-colors"
          title="Copy link"
        >
          {copied ? '✓' : '🔗'}
        </button>
      </div>

      {copied && <span className="text-sm text-green-600 animate-fade-in">Copied!</span>}
    </div>
  );
}
