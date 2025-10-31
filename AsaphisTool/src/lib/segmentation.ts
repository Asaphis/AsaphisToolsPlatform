// NOTE: Avoid importing 'onnxruntime-web' at build time to prevent ESM bundling issues.
// The AI segmentation helpers are stubbed until an ONNX model is explicitly enabled.

let isLoading = false;

/**
 * Load the segmentation model (stub). Replace with ONNX load to enable AI.
 */
export async function loadSegmentationModel(): Promise<any> {
  if (isLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }
  isLoading = true;
  try {
    console.log('AI model loading skipped - using advanced client-side segmentation');
    return null;
  } finally {
    isLoading = false;
  }
}

/**
 * Preprocess image for model input (stub). Returns shape info only.
 */
export function preprocessImage(imageData: ImageData, _targetSize: number = 512): {
  tensor: any;
  originalWidth: number;
  originalHeight: number;
} {
  const { width, height } = imageData;
  return { tensor: null, originalWidth: width, originalHeight: height };
}

/**
 * Run inference on the image (stub). Throws until AI is enabled.
 */
export async function runSegmentation(
  _imageData: ImageData,
  _session: any
): Promise<Uint8ClampedArray> {
  throw new Error('AI segmentation is not enabled. Use advancedClientSegmentation fallback.');
}

/**
 * Advanced client-side segmentation fallback
 * Uses sophisticated algorithms when AI model is not available
 */
export async function advancedClientSegmentation(
  imageData: ImageData,
  options: {
    tolerance?: number;
    edgePreservation?: number;
  } = {}
): Promise<Uint8ClampedArray> {
  const { width, height, data } = imageData;
  const tolerance = options.tolerance ?? 30;
  
  // Advanced client-side background segmentation implementation
  const mask = new Uint8ClampedArray(width * height);
  
  // Sample background from borders
  const borderSamples: [number, number, number][] = [];
  const samplePoints = 20;
  
  for (let i = 0; i < samplePoints; i++) {
    const x = Math.floor((i / samplePoints) * width);
    const topIdx = x * 4;
    const bottomIdx = ((height - 1) * width + x) * 4;
    borderSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
    borderSamples.push([data[bottomIdx], data[bottomIdx + 1], data[bottomIdx + 2]]);
  }
  
  for (let i = 0; i < samplePoints; i++) {
    const y = Math.floor((i / samplePoints) * height);
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + width - 1) * 4;
    borderSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
    borderSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
  }
  
  // Classify each pixel
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    let minDist = Infinity;
    for (const [br, bg, bb] of borderSamples) {
      const dist = Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2);
      minDist = Math.min(minDist, dist);
    }
    
    // Map distance to alpha
    const normalizedDist = minDist / Math.sqrt(3 * 255 * 255);
    if (normalizedDist * 100 < tolerance) {
      mask[i] = 0; // Background
    } else {
      mask[i] = 255; // Foreground
    }
  }
  
  return mask;
}
