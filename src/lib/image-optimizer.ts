/**
 * Image optimization utility for web uploads
 * Resizes and compresses images client-side before uploading
 */

interface OptimizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: OptimizeOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'webp',
};

/**
 * Optimizes an image file for web upload
 * - Resizes if larger than maxWidth/maxHeight
 * - Compresses with specified quality
 * - Converts to WebP (or specified format) for better compression
 */
export async function optimizeImage(
    file: File,
    options: OptimizeOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Skip if not an image
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Skip SVG as it's already optimized
    if (file.type === 'image/svg+xml') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;
            const maxWidth = opts.maxWidth || 1200;
            const maxHeight = opts.maxHeight || 1200;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }

            // Use high-quality image scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            const mimeType = opts.format === 'webp'
                ? 'image/webp'
                : opts.format === 'jpeg'
                    ? 'image/jpeg'
                    : 'image/png';

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    // Generate new filename with proper extension
                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const extension = opts.format === 'webp' ? '.webp'
                        : opts.format === 'jpeg' ? '.jpg' : '.png';
                    const newFileName = baseName + extension;

                    const optimizedFile = new File([blob], newFileName, {
                        type: mimeType,
                        lastModified: Date.now(),
                    });

                    console.log(`[Image Optimizer] Compressed: ${file.name} (${formatBytes(file.size)}) → ${newFileName} (${formatBytes(blob.size)})`);

                    resolve(optimizedFile);
                },
                mimeType,
                opts.quality
            );
        };

        img.onerror = () => {
            console.error('[Image Optimizer] Failed to load image');
            resolve(file); // Return original on error
        };

        img.src = URL.createObjectURL(file);
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default optimizeImage;
