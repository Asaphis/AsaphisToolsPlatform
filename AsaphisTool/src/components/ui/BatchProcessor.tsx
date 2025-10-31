'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

interface BatchProcessorProps {
  acceptedFileTypes: string[];
  maxFiles?: number;
  onProcess: (file: File) => Promise<any>;
  processingText?: string;
  makeDownload?: (result: any, fileName: string) => void; // optional custom downloader
}

export function BatchProcessor({ 
  acceptedFileTypes, 
  maxFiles = 100,
  onProcess,
  processingText = "Processing",
  makeDownload,
}: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const abortController = useRef<AbortController | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = acceptedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    setCompletedCount(0);
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    multiple: true
  });

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setCompletedCount(0);
    abortController.current = new AbortController();

    const concurrentLimit = 3; // Process 3 files at once
    let processed = 0;

    const processFile = async (batchFile: BatchFile) => {
      if (abortController.current?.signal.aborted) return;

      setFiles(prev => prev.map(f => 
        f.id === batchFile.id 
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === batchFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 200);

        const result = await onProcess(batchFile.file);
        clearInterval(progressInterval);

        setFiles(prev => prev.map(f => 
          f.id === batchFile.id 
            ? { ...f, status: 'completed', progress: 100, result }
            : f
        ));

        setCompletedCount(prev => prev + 1);
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === batchFile.id 
            ? { ...f, status: 'error', error: (error as Error).message }
            : f
        ));
      }
    };

    // Process files in batches with concurrency limit
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    while (processed < pendingFiles.length && !abortController.current?.signal.aborted) {
      const batch = pendingFiles.slice(processed, processed + concurrentLimit);
      await Promise.all(batch.map(processFile));
      processed += batch.length;
    }

    setIsProcessing(false);
  };

  const cancelProcessing = () => {
    abortController.current?.abort();
    setIsProcessing(false);
    setFiles(prev => prev.map(f => 
      f.status === 'processing' 
        ? { ...f, status: 'pending', progress: 0 }
        : f
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setCompletedCount(0);
  };

  const downloadResults = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result);
    if (completedFiles.length === 0) return;

    completedFiles.forEach(({ file, result }, idx) => {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const fileName = `${baseName}-processed-${idx + 1}.txt`;
      if (makeDownload) {
        makeDownload(result, fileName);
      } else {
        // Default: download JSON representation
        const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 dark:bg-gray-600';
      case 'processing': return 'bg-blue-200 dark:bg-blue-600';
      case 'completed': return 'bg-green-200 dark:bg-green-600';
      case 'error': return 'bg-red-200 dark:bg-red-600';
      default: return 'bg-gray-200 dark:bg-gray-600';
    }
  };

  const totalFiles = files.length;
  const overallProgress = totalFiles > 0 ? (completedCount / totalFiles) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50/20'
            : 'border-border hover:border-primary-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">📁</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Support for {acceptedFileTypes.join(', ')} files
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Maximum {maxFiles} files • Unlimited file size
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Files ({files.length})
            </h3>
            <div className="flex items-center space-x-3">
              {!isProcessing ? (
                <>
                  <button
                    onClick={processFiles}
                    disabled={files.length === 0}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Process All Files
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/90"
                  >
                    Clear All
                  </button>
                </>
              ) : (
                <button
                  onClick={cancelProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Processing
                </button>
              )}
            </div>
          </div>

          {/* Overall Progress */}
          {isProcessing && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-foreground/70 mb-2">
                <span>{processingText}...</span>
                <span>{completedCount}/{totalFiles} completed</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Individual Files */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((batchFile) => (
              <div
                key={batchFile.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(batchFile.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {batchFile.file.name}
                    </p>
                    <p className="text-xs text-foreground/70">
                      {(batchFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {batchFile.status === 'processing' && (
                  <div className="w-24 mx-4">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${batchFile.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {batchFile.status === 'completed' && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                  {batchFile.status === 'error' && (
                    <span className="text-red-600 text-sm">✗</span>
                  )}
                  <button
                    onClick={() => removeFile(batchFile.id)}
                    className="text-foreground/60 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Download Results */}
          {completedCount > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={downloadResults}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Download {completedCount} Processed File{completedCount !== 1 ? 's' : ''} as ZIP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
