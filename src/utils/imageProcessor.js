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
export async function processImage(imageFile, targetWidth, targetHeight, palette) {
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

          // Get image data and apply palette
          const imageData = lowResCtx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const closest = findClosestColor(data[i], data[i + 1], data[i + 2], palette);
            data[i] = closest.r;
            data[i + 1] = closest.g;
            data[i + 2] = closest.b;
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
