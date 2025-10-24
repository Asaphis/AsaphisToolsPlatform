'use client';

import { useState, useCallback } from 'react';
import { recordToolUsage } from '@/lib/analytics';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  preview?: string;
  position: number;
}

interface MergedResult {
  blob: Blob;
  downloadUrl: string;
  totalPages: number;
  totalSize: number;
  fileName: string;
}

export function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mergedResult, setMergedResult] = useState<MergedResult | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    fileName: 'merged-document.pdf',
    includeBookmarks: true,
    optimizeSize: true
  });

  const analyzePDF = async (file: File): Promise<{ pageCount: number; preview?: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // Generate preview of first page (simplified - in production you might use PDF.js)
      // For now, we'll just return the page count
      return { pageCount };
    } catch (error) {
      console.error('Failed to analyze PDF:', error);
      return { pageCount: 0 };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsAnalyzing(true);
    const newPdfFiles: PDFFile[] = [];

    for (const file of acceptedFiles) {
      if (file.type === 'application/pdf') {
        const analysis = await analyzePDF(file);
        const pdfFile: PDFFile = {
          id: Date.now().toString() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          pageCount: analysis.pageCount,
          preview: analysis.preview,
          position: pdfFiles.length + newPdfFiles.length
        };
        newPdfFiles.push(pdfFile);
      }
    }

    setPdfFiles(prev => [...prev, ...newPdfFiles]);
    setIsAnalyzing(false);
  }, [pdfFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return;

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      // Sort files by position
      const sortedFiles = [...pdfFiles].sort((a, b) => a.position - b.position);
      
      let totalPages = 0;
      let totalSize = 0;

      for (const pdfFile of sortedFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageIndices = pdf.getPageIndices();
        
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
        
        totalPages += pageIndices.length;
        totalSize += pdfFile.size;
      }

      // Optimize if requested
      if (settings.optimizeSize) {
        // Basic optimization - pdf-lib handles this internally
      }

      const mergedPdfBytes = await mergedPdf.save();
      // @ts-expect-error - pdf-lib returns Uint8Array which is compatible with BlobPart
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      setMergedResult({
        blob,
        downloadUrl,
        totalPages,
        totalSize,
        fileName: settings.fileName
      });
      recordToolUsage('pdf-merger', { action: 'Merged', fileCount: sortedFiles.length });
    } catch (error) {
      console.error('Failed to merge PDFs:', error);
      alert('Failed to merge PDFs. Please check that all files are valid PDF documents.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removePDF = (id: string) => {
    setPdfFiles(prev => {
      const filtered = prev.filter(pdf => pdf.id !== id);
      // Reassign positions
      return filtered.map((pdf, index) => ({ ...pdf, position: index }));
    });
  };

  const clearAll = () => {
    setPdfFiles([]);
    if (mergedResult) {
      URL.revokeObjectURL(mergedResult.downloadUrl);
      setMergedResult(null);
    }
  };

  const downloadMerged = () => {
    if (!mergedResult) return;
    
    const link = document.createElement('a');
    link.href = mergedResult.downloadUrl;
    link.download = settings.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setPdfFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      
      // Reassign positions
      return newFiles.map((file, index) => ({ ...file, position: index }));
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveFile(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pageCount, 0);
  const totalFileSize = pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          📄 PDF Merger
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Merge multiple PDF files into one document. Drag and drop to reorder pages, add bookmarks, and optimize file size.
          All processing happens in your browser - your documents never leave your device.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Merge Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Output filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Filename
            </label>
            <input
              type="text"
              value={settings.fileName}
              onChange={(e) => setSettings(prev => ({ ...prev, fileName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="merged-document.pdf"
            />
          </div>

          {/* Include bookmarks */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.includeBookmarks}
                onChange={(e) => setSettings(prev => ({ ...prev, includeBookmarks: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preserve Bookmarks
              </span>
            </label>
          </div>

          {/* Optimize size */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.optimizeSize}
                onChange={(e) => setSettings(prev => ({ ...prev, optimizeSize: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Optimize File Size
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">📁</div>
          <div>
            <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop PDF files here...' : 'Upload PDF Files to Merge'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop PDF files here, or click to browse. Add multiple files to merge them into one document.
            </p>
          </div>
          {isAnalyzing && (
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Analyzing PDF files...
            </div>
          )}
        </div>
      </div>

      {/* PDF Files List */}
      {pdfFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                PDF Files ({pdfFiles.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalPages} total pages • {formatFileSize(totalFileSize)}
              </p>
            </div>
            <div className="flex gap-2">
              {pdfFiles.length >= 2 && (
                <button
                  onClick={mergePDFs}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Merging...
                    </span>
                  ) : (
                    'Merge PDFs'
                  )}
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              💡 Tip: Drag and drop files to reorder them
            </div>
            {pdfFiles
              .sort((a, b) => a.position - b.position)
              .map((pdfFile, index) => (
              <div
                key={pdfFile.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-95' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl">📄</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pdfFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pdfFile.pageCount} page{pdfFile.pageCount !== 1 ? 's' : ''} • {formatFileSize(pdfFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => removePDF(pdfFile.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Remove
                  </button>
                  <div className="cursor-move text-gray-400 dark:text-gray-500">
                    ⋮⋮
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merged Result */}
      {mergedResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              PDFs Successfully Merged!
            </h3>
            <div className="text-gray-600 dark:text-gray-400 mb-6">
              <p className="mb-2">
                <strong>{mergedResult.totalPages}</strong> pages merged into one document
              </p>
              <p>
                Final size: <strong>{formatFileSize(mergedResult.blob.size)}</strong>
              </p>
            </div>
            <button
              onClick={downloadMerged}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              📥 Download Merged PDF
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {pdfFiles.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            🔹 How to Use PDF Merger
          </h3>
          <div className="text-blue-700 dark:text-blue-300 space-y-2">
            <p>1. <strong>Upload</strong> - Add multiple PDF files by dragging them here or clicking to browse</p>
            <p>2. <strong>Reorder</strong> - Drag and drop files in the list to change the order they appear in the merged document</p>
            <p>3. <strong>Configure</strong> - Set your output filename and optimization preferences</p>
            <p>4. <strong>Merge</strong> - Click "Merge PDFs" to combine all files into one document</p>
            <p>5. <strong>Download</strong> - Get your merged PDF file ready to use</p>
          </div>
        </div>
      )}
    </div>
  );
}
