// Predefined 8-color palettes
export const PALETTES = {
  'CGA': [
    '#000000', '#0000AA', '#00AA00', '#00AAAA',
    '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA'
  ],
  'Commodore 64': [
    '#000000', '#FFFFFF', '#880000', '#AAFFEE',
    '#CC44CC', '#00CC55', '#0000AA', '#EEEE77'
  ],
  'ZX Spectrum': [
    '#000000', '#0000D7', '#D70000', '#D700D7',
    '#00D700', '#00D7D7', '#D7D700', '#D7D7D7'
  ],
  'Apple II': [
    '#000000', '#D03060', '#0080FF', '#FFFFFF',
    '#00C000', '#808080', '#F06000', '#FFC080'
  ],
  'Gameboy': [
    '#0F380F', '#306230', '#8BAC0F', '#9BBC0F',
    '#8BAC0F', '#306230', '#0F380F', '#000000'
  ],
  'Pico-8': [
    '#000000', '#1D2B53', '#7E2553', '#008751',
    '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8'
  ],
  'Default': [
    '#F5F5DC', '#D4A574', '#C19A6B', '#8B4513',
    '#654321', '#4A3C31', '#6B8E9E', '#B0C4DE'
  ],
  'Midnight': [
    '#FFB6C1', '#FF69B4', '#C71585', '#8B008B',
    '#4B0082', '#2F1B3C', '#1A0F26', '#000000'
  ],
  'Ammo': [
    '#002200', '#004400', '#5F7F5F', '#7F9F7F',
    '#9FBF7F', '#BFDF5F', '#DFFF7F', '#FFFFBF'
  ],
  'Ancient': [
    '#F5DEB3', '#D2B48C', '#BC8F8F', '#8B7355',
    '#FFF8DC', '#FFE4B5', '#FF8C00', '#CD853F',
  ],
  'Autumn': [
    '#FFFACD', '#FFD700', '#FFA500', '#FF8C00',
    '#FF6347', '#8B4513', '#654321', '#2F4F2F'
  ],
  'Breakfast': [
    '#FFFACD', '#F0E68C', '#DEB887', '#FF8C69',
    '#CD8162', '#A0522D', '#6B4423', '#3E2723'
  ],
  'Dream': [
    '#6495ED', '#7B68EE', '#9370DB', '#BA55D3',
    '#DA70D6', '#DDA0DD', '#E6C3E6', '#FAF0E6'
  ],
  'Inferno': [
    '#FFFF99', '#FFCC66', '#FF9966', '#CC3333',
    '#991133', '#660033', '#330066', '#000033'
  ],
  'Grayscale': [
    '#000000', '#242424', '#484848', '#6D6D6D',
    '#919191', '#B6B6B6', '#DADADA', '#FFFFFF'
  ],
  'Cyanotype': [
    '#001219', '#005F73', '#0A9396', '#94D2BD',
    '#E9D8A6', '#EE9B00', '#CA6702', '#BB3E03'
  ]
};

// Calculate color distance using simple Euclidean distance in RGB space
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// K-means color quantization to extract dominant colors
function kmeansQuantize(imageData, k = 8, maxIterations = 10) {
  const pixels = [];
  const data = imageData.data;

  // Sample pixels (use every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2]
    });
  }

  // Initialize centroids with random pixels
  let centroids = [];
  const usedIndices = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      centroids.push({ ...pixels[idx] });
    }
  }

  // K-means iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closestCluster = 0;

      for (let i = 0; i < k; i++) {
        const dist = colorDistance(
          pixel.r, pixel.g, pixel.b,
          centroids[i].r, centroids[i].g, centroids[i].b
        );
        if (dist < minDist) {
          minDist = dist;
          closestCluster = i;
        }
      }

      clusters[closestCluster].push(pixel);
    }

    // Update centroids
    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const avgR = clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length;
      const avgG = clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length;
      const avgB = clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length;

      if (Math.abs(centroids[i].r - avgR) > 1 ||
          Math.abs(centroids[i].g - avgG) > 1 ||
          Math.abs(centroids[i].b - avgB) > 1) {
        changed = true;
      }

      centroids[i] = { r: avgR, g: avgG, b: avgB };
    }

    if (!changed) break;
  }

  // Sort by brightness for better palette display
  centroids.sort((a, b) => {
    const brightnessA = (a.r + a.g + a.b) / 3;
    const brightnessB = (b.r + b.g + b.b) / 3;
    return brightnessA - brightnessB;
  });

  return centroids.map(c => rgbToHex(c.r, c.g, c.b));
}

// Generate palette from image
export async function generatePaletteFromImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create a smaller canvas for analysis (faster)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          // Scale down for faster processing
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const palette = kmeansQuantize(imageData, 8);

          resolve(palette);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

// Apply adjustments to pixel
function applyAdjustments(r, g, b, adjustments) {
  // Apply exposure (-10 to +10, maps to -50 to +50)
  const exposureAmount = adjustments.exposure * 5;
  r += exposureAmount;
  g += exposureAmount;
  b += exposureAmount;

  // Apply contrast (-10 to +10)
  const contrastFactor = (adjustments.contrast + 10) / 10;
  r = ((r - 128) * contrastFactor) + 128;
  g = ((g - 128) * contrastFactor) + 128;
  b = ((b - 128) * contrastFactor) + 128;

  // Apply chrominance (saturation) (-10 to +10)
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const saturationFactor = (adjustments.chrominance + 10) / 10;
  r = gray + (r - gray) * saturationFactor;
  g = gray + (g - gray) * saturationFactor;
  b = gray + (b - gray) * saturationFactor;

  // Clamp values
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return { r, g, b };
}

// Floyd-Steinberg dithering
function applyDithering(imageData, width, height, palette, ditherAmount) {
  if (ditherAmount === 0) return;

  const data = imageData.data;
  const strength = Math.abs(ditherAmount) / 10; // 0 to 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const oldR = data[idx];
      const oldG = data[idx + 1];
      const oldB = data[idx + 2];

      const closest = findClosestColor(oldR, oldG, oldB, palette);
      data[idx] = closest.r;
      data[idx + 1] = closest.g;
      data[idx + 2] = closest.b;

      // Calculate error
      const errR = (oldR - closest.r) * strength;
      const errG = (oldG - closest.g) * strength;
      const errB = (oldB - closest.b) * strength;

      // Distribute error to neighboring pixels
      const distributeError = (dx, dy, factor) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = (ny * width + nx) * 4;
          data[nidx] = Math.max(0, Math.min(255, data[nidx] + errR * factor));
          data[nidx + 1] = Math.max(0, Math.min(255, data[nidx + 1] + errG * factor));
          data[nidx + 2] = Math.max(0, Math.min(255, data[nidx + 2] + errB * factor));
        }
      };

      distributeError(1, 0, 7/16);
      distributeError(-1, 1, 3/16);
      distributeError(0, 1, 5/16);
      distributeError(1, 1, 1/16);
    }
  }
}

// Find closest color in palette
function findClosestColor(r, g, b, palette) {
  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const hexColor of palette) {
    const rgb = hexToRgb(hexColor);
    const distance = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = hexColor;
    }
  }

  return hexToRgb(closestColor);
}

// Process image: resize and apply palette
export async function processImage(imageFile, targetWidth, targetHeight, palette, adjustments = { exposure: 0, contrast: 0, chrominance: 0, dithering: 0 }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create canvas for low-res version
          const lowResCanvas = document.createElement('canvas');
          const lowResCtx = lowResCanvas.getContext('2d', { willReadFrequently: true });

          // Calculate dimensions maintaining aspect ratio
          let width = targetWidth;
          let height = targetHeight;
          const aspectRatio = img.width / img.height;

          if (aspectRatio > width / height) {
            height = Math.round(width / aspectRatio);
          } else {
            width = Math.round(height * aspectRatio);
          }

          lowResCanvas.width = width;
          lowResCanvas.height = height;

          // Draw resized image
          lowResCtx.drawImage(img, 0, 0, width, height);

          // Get image data and apply adjustments
          const imageData = lowResCtx.getImageData(0, 0, width, height);
          const data = imageData.data;

          // Apply color adjustments first
          for (let i = 0; i < data.length; i += 4) {
            const adjusted = applyAdjustments(data[i], data[i + 1], data[i + 2], adjustments);
            data[i] = adjusted.r;
            data[i + 1] = adjusted.g;
            data[i + 2] = adjusted.b;
          }

          // Apply dithering if enabled, otherwise apply palette directly
          if (adjustments.dithering !== 0) {
            applyDithering(imageData, width, height, palette, adjustments.dithering);
          } else {
            for (let i = 0; i < data.length; i += 4) {
              const closest = findClosestColor(data[i], data[i + 1], data[i + 2], palette);
              data[i] = closest.r;
              data[i + 1] = closest.g;
              data[i + 2] = closest.b;
            }
          }

          lowResCtx.putImageData(imageData, 0, 0);

          // Create high-res canvas (8x upscaled) with nearest-neighbor
          const highResCanvas = document.createElement('canvas');
          const highResCtx = highResCanvas.getContext('2d');

          highResCanvas.width = width * 8;
          highResCanvas.height = height * 8;

          // Disable image smoothing for crisp pixels
          highResCtx.imageSmoothingEnabled = false;
          highResCtx.drawImage(lowResCanvas, 0, 0, width * 8, height * 8);

          resolve({
            canvas: highResCanvas,
            lowResCanvas: lowResCanvas,
            width: width * 8,
            height: height * 8,
            originalWidth: width,
            originalHeight: height
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

// Export image as PNG
export function exportImage(canvas, filename = 'lowreslove-image.png') {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
