/**
 * Image processing utilities for client-side image compression
 * Scales photos to max 1200px width/height and compresses to lightweight JPEG data URIs (~50-80KB)
 */

export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan berkas gambar yang valid.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat elemen gambar.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Gagal menginisialisasi canvas untuk kompresi.'));
        }

        // Draw and export as compressed JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export async function compressMultipleImages(
  files: FileList | File[],
  maxDimension = 1200,
  quality = 0.8
): Promise<string[]> {
  const fileArray = Array.from(files);
  const results: string[] = [];

  for (const file of fileArray) {
    try {
      const compressed = await compressImage(file, maxDimension, quality);
      results.push(compressed);
    } catch (err) {
      console.warn(`Gagal mengompresi gambar ${file.name}:`, err);
    }
  }

  return results;
}
