/**
 * Guided Filter - Edge-preserving smoothing
 * Based on "Guided Image Filtering" by He et al.
 * Smooths the mask while preserving edges in the guidance image
 */
export function guidedFilter(
  guide: Uint8ClampedArray,
  input: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  eps: number = 0.01
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(width * height);
  
  // Convert to grayscale guide
  const guideGray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    guideGray[i] = (guide[idx] + guide[idx + 1] + guide[idx + 2]) / (3 * 255);
  }
  
  // Convert input to float
  const inputFloat = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    inputFloat[i] = input[i] / 255;
  }
  
  // Box filter helper
  const boxFilter = (data: Float32Array): Float32Array => {
    const result = new Float32Array(width * height);
    const temp = new Float32Array(width * height);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          sum += data[y * width + nx];
          count++;
        }
        temp[y * width + x] = sum / count;
      }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          sum += temp[ny * width + x];
          count++;
        }
        result[y * width + x] = sum / count;
      }
    }
    
    return result;
  };
  
  // Compute statistics
  const meanI = boxFilter(guideGray);
  const meanP = boxFilter(inputFloat);
  
  const corrI = new Float32Array(width * height);
  const corrIP = new Float32Array(width * height);
  
  for (let i = 0; i < width * height; i++) {
    corrI[i] = guideGray[i] * guideGray[i];
    corrIP[i] = guideGray[i] * inputFloat[i];
  }
  
  const meanII = boxFilter(corrI);
  const meanIP = boxFilter(corrIP);
  
  // Compute coefficients a and b
  const a = new Float32Array(width * height);
  const b = new Float32Array(width * height);
  
  for (let i = 0; i < width * height; i++) {
    const varI = meanII[i] - meanI[i] * meanI[i];
    const covIP = meanIP[i] - meanI[i] * meanP[i];
    a[i] = covIP / (varI + eps);
    b[i] = meanP[i] - a[i] * meanI[i];
  }
  
  // Average coefficients
  const meanA = boxFilter(a);
  const meanB = boxFilter(b);
  
  // Apply filter
  for (let i = 0; i < width * height; i++) {
    const val = meanA[i] * guideGray[i] + meanB[i];
    output[i] = Math.round(Math.max(0, Math.min(1, val)) * 255);
  }
  
  return output;
}

/**
 * Bilateral Filter - Edge-preserving smoothing based on spatial and color distance
 */
export function bilateralFilter(
  data: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  spatialSigma: number = 5,
  rangeSigma: number = 0.1
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(width * height);
  const radius = Math.ceil(spatialSigma * 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = y * width + x;
      const centerDataIdx = centerIdx * 4;
      const centerR = data[centerDataIdx] / 255;
      const centerG = data[centerDataIdx + 1] / 255;
      const centerB = data[centerDataIdx + 2] / 255;
      
      let sumWeight = 0;
      let sumValue = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            const nDataIdx = nIdx * 4;
            const nR = data[nDataIdx] / 255;
            const nG = data[nDataIdx + 1] / 255;
            const nB = data[nDataIdx + 2] / 255;
            
            // Spatial weight
            const spatialDist = Math.sqrt(dx * dx + dy * dy);
            const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma));
            
            // Color range weight
            const colorDist = Math.sqrt(
              (centerR - nR) ** 2 + (centerG - nG) ** 2 + (centerB - nB) ** 2
            );
            const rangeWeight = Math.exp(-(colorDist * colorDist) / (2 * rangeSigma * rangeSigma));
            
            const weight = spatialWeight * rangeWeight;
            sumWeight += weight;
            sumValue += weight * mask[nIdx];
          }
        }
      }
      
      output[centerIdx] = Math.round(sumValue / sumWeight);
    }
  }
  
  return output;
}

/**
 * Advanced alpha matting refinement using closed-form solution
 * Refines alpha channel in uncertain regions
 */
export function refineAlphaMatting(
  image: Uint8ClampedArray,
  trimap: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const alpha = new Uint8ClampedArray(width * height);
  
  // Copy known values from trimap
  for (let i = 0; i < width * height; i++) {
    if (trimap[i] === 255) {
      alpha[i] = 255; // Known foreground
    } else if (trimap[i] === 0) {
      alpha[i] = 0; // Known background
    } else {
      // Unknown - needs solving
      alpha[i] = 128;
    }
  }
  
  // Refine unknown regions using local color distribution
  const windowRadius = 3;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      if (trimap[idx] > 0 && trimap[idx] < 255) {
        // Unknown region - estimate alpha
        let fgSum = 0, bgSum = 0;
        let fgCount = 0, bgCount = 0;
        const centerDataIdx = idx * 4;
        const centerR = image[centerDataIdx];
        const centerG = image[centerDataIdx + 1];
        const centerB = image[centerDataIdx + 2];
        
        // Sample from nearby known regions
        for (let dy = -windowRadius; dy <= windowRadius; dy++) {
          for (let dx = -windowRadius; dx <= windowRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              const nDataIdx = nIdx * 4;
              
              if (trimap[nIdx] === 255) {
                // Known foreground
                const dist = Math.sqrt(
                  (image[nDataIdx] - centerR) ** 2 +
                  (image[nDataIdx + 1] - centerG) ** 2 +
                  (image[nDataIdx + 2] - centerB) ** 2
                );
                const weight = 1 / (1 + dist);
                fgSum += weight;
                fgCount++;
              } else if (trimap[nIdx] === 0) {
                // Known background
                const dist = Math.sqrt(
                  (image[nDataIdx] - centerR) ** 2 +
                  (image[nDataIdx + 1] - centerG) ** 2 +
                  (image[nDataIdx + 2] - centerB) ** 2
                );
                const weight = 1 / (1 + dist);
                bgSum += weight;
                bgCount++;
              }
            }
          }
        }
        
        // Estimate alpha based on similarity to fg/bg
        if (fgSum + bgSum > 0) {
          const alphaValue = fgSum / (fgSum + bgSum);
          alpha[idx] = Math.round(alphaValue * 255);
        }
      }
    }
  }
  
  return alpha;
}

/**
 * Advanced color correction and defringing
 * Removes color spill and halos from semi-transparent edges
 */
export function advancedDefringe(
  data: Uint8ClampedArray,
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number = 0.8
): void {
  const temp = new Uint8ClampedArray(data.length);
  temp.set(data);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const a = alpha[idx];
      
      // Process semi-transparent edges
      if (a > 10 && a < 245) {
        const dataIdx = idx * 4;
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;
        let totalAlpha = 0;
        
        // Sample from nearby opaque foreground pixels
        const radius = 4;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              const nAlpha = alpha[nIdx];
              
              // Weight by opacity and distance
              if (nAlpha > 200) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const weight = Math.exp(-dist / 2) * (nAlpha / 255);
                
                const nDataIdx = nIdx * 4;
                sumR += temp[nDataIdx] * weight;
                sumG += temp[nDataIdx + 1] * weight;
                sumB += temp[nDataIdx + 2] * weight;
                totalAlpha += weight;
                count++;
              }
            }
          }
        }
        
        if (totalAlpha > 0 && count > 0) {
          const avgR = sumR / totalAlpha;
          const avgG = sumG / totalAlpha;
          const avgB = sumB / totalAlpha;
          
          // Blend with nearby opaque colors based on strength
          const blend = strength * (1 - a / 255);
          data[dataIdx] = Math.round(temp[dataIdx] * (1 - blend) + avgR * blend);
          data[dataIdx + 1] = Math.round(temp[dataIdx + 1] * (1 - blend) + avgG * blend);
          data[dataIdx + 2] = Math.round(temp[dataIdx + 2] * (1 - blend) + avgB * blend);
        }
      }
    }
  }
}

/**
 * Edge antialiasing for smooth transparent output
 */
export function applyAntialiasing(
  alpha: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(width * height);
  
  // Apply a subtle gaussian blur to edge regions
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const a = alpha[idx];
      
      // Only apply to edge regions
      if (a > 5 && a < 250) {
        let sum = 0;
        let weight = 0;
        
        // 3x3 gaussian kernel
        const kernel = [
          [1, 2, 1],
          [2, 4, 2],
          [1, 2, 1]
        ];
        const kernelSum = 16;
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const nx = x + kx - 1;
            const ny = y + ky - 1;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              const w = kernel[ky][kx];
              sum += alpha[nIdx] * w;
              weight += w;
            }
          }
        }
        
        output[idx] = Math.round(sum / weight);
      } else {
        output[idx] = a;
      }
    }
  }
  
  return output;
}
