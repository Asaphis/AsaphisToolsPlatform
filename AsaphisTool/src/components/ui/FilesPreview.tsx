import React from 'react';
import { File, X, FileText, Image, Video, Music, AlertCircle } from 'lucide-react';

interface FileItemProps {
  file: File;
  onRemove?: (file: File) => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.startsWith('application/pdf')) return FileText;
  return File;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const Icon = getFileIcon(file.type);
  const size = file.size / (1024 * 1024); // Convert to MB

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
      <Icon className="w-5 h-5 text-gray-500 mr-3" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {size.toFixed(2)} MB
        </p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(file)}
          className="ml-2 text-gray-400 hover:text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface FilesPreviewProps {
  files: File[];
  onRemove?: (file: File) => void;
  maxSize?: number;
  error?: string;
}

export function FilesPreview({ files, onRemove, maxSize = 50, error }: FilesPreviewProps) {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {files.map((file, index) => (
          <FileItem key={index} file={file} onRemove={onRemove} />
        ))}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {files.length} {files.length === 1 ? 'file' : 'files'} selected
        </span>
        <span className={`font-medium ${totalSize > maxSize ? 'text-red-500' : 'text-gray-900'}`}>
          {totalSize.toFixed(2)} MB {totalSize > maxSize && '(exceeds limit)'}
        </span>
      </div>

      {error && (
        <div className="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}