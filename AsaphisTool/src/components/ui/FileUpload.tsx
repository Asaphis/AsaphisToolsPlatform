import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  uploading?: boolean;
  error?: string;
}

export function FileUpload({
  accept,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,
  uploading = false,
  error
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : `Drag 'n' drop ${maxFiles === 1 ? 'a file' : 'files'} here, or click to select`}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {maxFiles === 1
            ? 'Upload one file up to '
            : `Upload up to ${maxFiles} files, each up to `}
          {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}