import { getApiBase } from './api';

export interface ProcessingOptions {
  endpoint: string;
  file: File;
  format?: string;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: any) => void;
}

export async function processFile({
  endpoint,
  file,
  format,
  onProgress,
  onError,
  onSuccess
}: ProcessingOptions) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (format) {
      formData.append('format', format);
    }

    const base = getApiBase();
    const response = await fetch(`${base}${endpoint}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errorMessage = 'Failed to process file';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    // Check if response is JSON or blob
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.blob();
      // Create download URL
      const url = window.URL.createObjectURL(result);
      
      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Set filename from Content-Disposition header or fallback
      const disposition = response.headers.get('content-disposition');
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition || '');
      const filename = matches && matches[1] ? matches[1].replace(/['"]/g, '') : 
        `processed-${file.name}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

    onSuccess?.(result);
  } catch (error) {
    onError?.(error instanceof Error ? error.message : 'Failed to process file');
  }
}