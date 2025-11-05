import React from 'react';
import { Tool } from '@/types';
import { FileUpload } from './FileUpload';
import { Settings } from 'lucide-react';

interface ToolPageLayoutProps {
  tool: Tool;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  uploading?: boolean;
  error?: string;
  result?: React.ReactNode;
  settings?: React.ReactNode;
  children?: React.ReactNode;
}

export function ToolPageLayout({
  tool,
  accept,
  maxFiles = 1,
  maxSize,
  onUpload,
  uploading = false,
  error,
  result,
  settings,
  children
}: ToolPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
          <p className="text-gray-600">{tool.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {settings && (
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center mb-4">
                <Settings className="mr-2" />
                <h3 className="text-lg font-semibold">Settings</h3>
              </div>
              {settings}
            </div>
          )}

          <FileUpload
            accept={accept}
            maxFiles={maxFiles}
            maxSize={maxSize}
            onUpload={onUpload}
            uploading={uploading}
            error={error}
          />

          {children}

          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Result</h3>
              <div className="border rounded-lg p-4">
                {result}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How to use {tool.name}</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload your file using the drag and drop area or browse button</li>
            {settings && <li>Adjust the settings according to your needs</li>}
            <li>Wait for the processing to complete</li>
            <li>Download your processed file</li>
          </ol>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Fast and efficient processing</li>
            <li>Support for multiple file formats</li>
            <li>Free to use</li>
            <li>No registration required</li>
            <li>Secure and private</li>
          </ul>
        </div>
      </div>
    </div>
  );
}