'use client';

import { useState, useEffect } from 'react';

interface SmartSuggestion {
  id: string;
  type: 'optimization' | 'workflow' | 'alternative' | 'enhancement';
  title: string;
  description: string;
  confidence: number; // 0-100
  action: {
    type: 'apply_settings' | 'suggest_tool' | 'create_workflow' | 'optimize';
    data: any;
  };
  icon: string;
  category: string;
  estimated_improvement: string;
}

interface FileAnalysis {
  fileName: string;
  fileSize: number;
  fileType: string;
  dimensions?: { width: number; height: number };
  quality?: number;
  metadata?: Record<string, any>;
}

interface SmartSuggestionsProps {
  files: File[];
  currentTool: string;
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
}

export function SmartSuggestions({ files, currentTool, onApplySuggestion }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Analyze files and generate smart suggestions
  const analyzeFiles = async (filesToAnalyze: File[]) => {
    if (filesToAnalyze.length === 0) return;

    setIsAnalyzing(true);
    const analysis: FileAnalysis[] = [];
    const newSuggestions: SmartSuggestion[] = [];

    for (const file of filesToAnalyze) {
      try {
        // Basic file analysis
        const fileAnalysis: FileAnalysis = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || getFileTypeFromName(file.name)
        };

        // For images, get dimensions
        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file);
          fileAnalysis.dimensions = dimensions;
        }

        analysis.push(fileAnalysis);

        // Generate suggestions based on file analysis
        const fileSuggestions = generateSuggestionsForFile(fileAnalysis, currentTool);
        newSuggestions.push(...fileSuggestions);

      } catch (error) {
        console.error('Error analyzing file:', file.name, error);
      }
    }

    // Generate cross-file suggestions
    const crossFileSuggestions = generateCrossFileSuggestions(analysis, currentTool);
    newSuggestions.push(...crossFileSuggestions);

    setFileAnalysis(analysis);
    setSuggestions(newSuggestions.sort((a, b) => b.confidence - a.confidence));
    setIsAnalyzing(false);
  };

  // Generate suggestions for individual files
  const generateSuggestionsForFile = (analysis: FileAnalysis, tool: string): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    // Image-specific suggestions
    if (analysis.fileType.startsWith('image/')) {
      // Large file size suggestion
      if (analysis.fileSize > 5 * 1024 * 1024) { // 5MB
        suggestions.push({
          id: `compress-${analysis.fileName}`,
          type: 'optimization',
          title: 'High Compression Recommended',
          description: `File is ${(analysis.fileSize / 1024 / 1024).toFixed(1)}MB. Compressing could reduce size by 70-80% with minimal quality loss.`,
          confidence: 95,
          action: {
            type: 'apply_settings',
            data: { tool: 'image-compressor', quality: 70, progressive: true }
          },
          icon: '🗜️',
          category: 'size-optimization',
          estimated_improvement: '70-80% size reduction'
        });
      }

      // Large dimensions suggestion
      if (analysis.dimensions && (analysis.dimensions.width > 4000 || analysis.dimensions.height > 4000)) {
        suggestions.push({
          id: `resize-${analysis.fileName}`,
          type: 'optimization',
          title: 'Resize for Web Usage',
          description: `Image is ${analysis.dimensions.width}x${analysis.dimensions.height}. Most web usage doesn't need this resolution.`,
          confidence: 88,
          action: {
            type: 'apply_settings',
            data: { tool: 'image-resizer', maxWidth: 1920, maxHeight: 1080, maintainAspectRatio: true }
          },
          icon: '📏',
          category: 'dimension-optimization',
          estimated_improvement: '90% smaller file size'
        });
      }

      // Format conversion suggestion
      if (analysis.fileType === 'image/png' && analysis.fileSize > 1024 * 1024) {
        suggestions.push({
          id: `convert-${analysis.fileName}`,
          type: 'alternative',
          title: 'Convert to WebP',
          description: 'WebP format offers 25-35% better compression than PNG while maintaining quality.',
          confidence: 82,
          action: {
            type: 'suggest_tool',
            data: { tool: 'image-format-converter', format: 'webp' }
          },
          icon: '🔄',
          category: 'format-optimization',
          estimated_improvement: '25-35% size reduction'
        });
      }
    }

    // PDF-specific suggestions
    if (analysis.fileType === 'application/pdf') {
      if (analysis.fileSize > 10 * 1024 * 1024) { // 10MB
        suggestions.push({
          id: `pdf-compress-${analysis.fileName}`,
          type: 'optimization',
          title: 'PDF Too Large for Email',
          description: 'Most email providers limit attachments to 25MB. This PDF could be compressed.',
          confidence: 90,
          action: {
            type: 'suggest_tool',
            data: { tool: 'pdf-compressor', quality: 'medium' }
          },
          icon: '📄',
          category: 'pdf-optimization',
          estimated_improvement: '50-70% size reduction'
        });
      }
    }

    return suggestions;
  };

  // Generate suggestions that apply to multiple files
  const generateCrossFileSuggestions = (analyses: FileAnalysis[], tool: string): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    // Batch processing suggestion
    if (analyses.length > 3) {
      const imageFiles = analyses.filter(a => a.fileType.startsWith('image/'));
      const pdfFiles = analyses.filter(a => a.fileType === 'application/pdf');

      if (imageFiles.length > 1) {
        suggestions.push({
          id: 'batch-image-workflow',
          type: 'workflow',
          title: 'Batch Image Optimization',
          description: `Process all ${imageFiles.length} images with a single workflow: compress → resize → convert format.`,
          confidence: 85,
          action: {
            type: 'create_workflow',
            data: {
              name: 'Batch Image Processing',
              steps: ['image-compressor', 'image-resizer', 'image-format-converter']
            }
          },
          icon: '⚡',
          category: 'batch-processing',
          estimated_improvement: 'Process all files in one click'
        });
      }

      if (pdfFiles.length > 1) {
        suggestions.push({
          id: 'merge-pdfs',
          type: 'workflow',
          title: 'Merge PDF Documents',
          description: `Combine all ${pdfFiles.length} PDFs into a single document, then compress if needed.`,
          confidence: 78,
          action: {
            type: 'suggest_tool',
            data: { tool: 'pdf-merger' }
          },
          icon: '📄',
          category: 'document-management',
          estimated_improvement: 'Single organized document'
        });
      }
    }

    // Mixed file types suggestion
    const fileTypes = Array.from(new Set(analyses.map(a => a.fileType)));
    if (fileTypes.length > 2) {
      suggestions.push({
        id: 'multi-format-workflow',
        type: 'workflow',
        title: 'Multi-Format Processing',
        description: 'Create separate workflows for different file types to optimize each format appropriately.',
        confidence: 72,
        action: {
          type: 'create_workflow',
          data: { multiFormat: true }
        },
        icon: '🔀',
        category: 'workflow-optimization',
        estimated_improvement: 'Tailored optimization per format'
      });
    }

    return suggestions;
  };

  // Helper functions
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
      'webp': 'image/webp', 'pdf': 'application/pdf', 'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 75) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return '⚡';
      case 'workflow': return '🔄';
      case 'alternative': return '💡';
      case 'enhancement': return '✨';
      default: return '🔧';
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      analyzeFiles(files);
    }
  }, [files, currentTool]);

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Upload files to see smart suggestions
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            🧠 Smart Suggestions
            {isAnalyzing && (
              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                Analyzing...
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered recommendations based on your files
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {/* File Analysis Summary */}
      {fileAnalysis.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            File Analysis Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Files:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {fileAnalysis.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Size:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {(fileAnalysis.reduce((sum, f) => sum + f.fileSize, 0) / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">File Types:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {Array.from(new Set(fileAnalysis.map(f => f.fileType.split('/')[0]))).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Suggestions:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {suggestions.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions
            .filter(s => showAdvanced || s.confidence >= 75)
            .map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                        {suggestion.type}
                      </span>
                      <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>💡 {suggestion.estimated_improvement}</span>
                      <span>📂 {suggestion.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Apply
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAnalyzing && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">🤖</div>
            <p>No suggestions available for current files</p>
            <p className="text-sm mt-1">Try uploading different file types or sizes</p>
          </div>
        )
      )}

      {/* Learning Section */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            🎓 Did You Know?
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>• Our AI analyzes your files in real-time to provide personalized suggestions</p>
            <p>• High-confidence suggestions (90%+) are usually the most effective</p>
            <p>• Workflow suggestions can save you time by automating repetitive tasks</p>
          </div>
        </div>
      )}
    </div>
  );
}
