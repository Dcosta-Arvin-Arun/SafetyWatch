/**
 * Utility functions for handling images without external storage services
 */

/**
 * Convert a File object to a Base64 string
 * @param file The file to convert
 * @returns A promise that resolves with the Base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Process and optimize an image file for storage
 * @param file The image file to process
 * @param maxWidth Maximum width of the image in pixels
 * @param maxHeight Maximum height of the image in pixels
 * @param quality JPEG quality (0-1)
 * @returns A promise that resolves with the optimized Base64 image
 */
export async function optimizeImage(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Set canvas dimensions and draw the resized image
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64
      const base64 = canvas.toDataURL("image/jpeg", quality);
      resolve(base64);
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Load the image from the file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract a thumbnail from a base64 image
 * @param base64Image The base64 image to extract thumbnail from
 * @param size The size of the thumbnail
 * @param quality JPEG quality (0-1)
 * @returns A promise that resolves with the thumbnail as a Base64 string
 */
export async function createThumbnail(
  base64Image: string,
  size = 100,
  quality = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const minDimension = Math.min(img.width, img.height);

      // Calculate crop dimensions for a square thumbnail
      const startX = (img.width - minDimension) / 2;
      const startY = (img.height - minDimension) / 2;

      // Set canvas dimensions and draw the cropped image
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(
        img,
        startX,
        startY,
        minDimension,
        minDimension,
        0,
        0,
        size,
        size
      );

      // Convert to base64
      const thumbnailBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(thumbnailBase64);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = base64Image;
  });
}
