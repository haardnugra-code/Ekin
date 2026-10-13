/**
 * Utility for image compression and file upload processing
 * Scales down large photos from mobile cameras to lightweight JPEG Data URLs (~100-250KB)
 * Prevents localStorage QuotaExceededError and browser memory lag.
 */

import { ChangeEvent } from 'react';

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    // If SVG or tiny image, read directly as data URL
    if (file.type === 'image/svg+xml' || file.size < 50 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to uncompressed reader if image rendering fails
        resolve(event.target?.result as string || '');
      };
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);

          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string || '');
          return;
        }

        // Draw and compress to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convenience helper for file input onChange handler
 */
export async function processFileInput(
  e: ChangeEvent<HTMLInputElement>,
  onSuccess: (dataUrl: string, file: File) => void,
  onError?: (error: any) => void
): Promise<void> {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
    onSuccess(compressed, file);
  } catch (err) {
    console.error('Error compressing image:', err);
    if (onError) onError(err);
  } finally {
    // Reset file input so selecting the same file again triggers onChange
    e.target.value = '';
  }
}
