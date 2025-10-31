import React, { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  src: string;
  type?: string;
  className?: string;
}

export function VideoPreview({ src, type = 'video/mp4', className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${className}`}>
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        <source src={src} type={type} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}