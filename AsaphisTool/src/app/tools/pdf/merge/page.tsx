'use client';

import React, { useState } from 'react';
import { ToolPageLayout } from '@/components/ui/ToolPageLayout';
import { FilesPreview } from '@/components/ui/FilesPreview';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { tools } from '@/data/tools';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const acceptedFiles = {
  'application/pdf': ['.pdf']
};

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<string>();

  const tool = tools.find(t => t.id === 'pdf-merger')!;

  const handleUpload = async (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (file: File) => {
    setFiles(prev => prev.filter(f => f !== file));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
  };

  const handleMerge = async () => {
    try {
      if (files.length < 2) {
        throw new Error('Please select at least 2 PDF files');
      }

      setUploading(true);
      setError(undefined);
      setProgress(0);
      setResult(undefined);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files[]', file);
      });

      const response = await fetch('/api/v1/pdf/merge', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ToolPageLayout
      tool={tool}
      accept={acceptedFiles}
      maxFiles={20}
      onUpload={handleUpload}
      uploading={uploading}
      error={error}
      result={
        <div className="space-y-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="pdf-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {files.map((file, index) => (
                    <Draggable
                      key={file.name}
                      draggableId={file.name}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <FilesPreview
                            files={[file]}
                            onRemove={handleRemove}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {files.length >= 2 && !uploading && !result && (
            <button
              onClick={handleMerge}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Merge {files.length} PDFs
            </button>
          )}

          {uploading && (
            <ProgressBar
              progress={progress}
              status="Merging PDFs..."
            />
          )}

          {result && (
            <div className="text-center">
              <p className="text-green-600 mb-4">PDFs merged successfully!</p>
              <a
                href={result}
                download="merged.pdf"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download Merged PDF
              </a>
            </div>
          )}
        </div>
      }
    />
  );
}