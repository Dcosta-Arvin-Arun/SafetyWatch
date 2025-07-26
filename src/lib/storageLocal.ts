import { optimizeImage, createThumbnail } from "./imageUtils";

/**
 * Upload and process an image for storage in Firestore
 * @param file The image file to process
 * @returns An object with the base64 data and thumbnail
 */
export async function uploadImage(file: File) {
  try {
    // Check file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are supported");
    }

    // Generate a unique ID for the image
    const imageId = `img_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    // Optimize the image (resize and compress)
    const optimizedImageBase64 = await optimizeImage(file, 1200, 900, 0.8);

    // Create a thumbnail for preview
    const thumbnailBase64 = await createThumbnail(
      optimizedImageBase64,
      200,
      0.6
    );

    return {
      url: optimizedImageBase64, // The full-size optimized image as base64
      publicId: imageId, // A unique identifier
      thumbnail: thumbnailBase64, // A smaller thumbnail version
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

/**
 * Calculate the approximate size of a base64 string in bytes
 * @param base64String The base64 string
 * @returns Size in bytes
 */
export function estimateBase64Size(base64String: string): number {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.split(",")[1] || base64String;

  // Calculate size: each Base64 digit represents 6 bits, so 4 digits = 3 bytes
  return Math.floor((base64Data.length * 3) / 4);
}

/**
 * Check if the total size of images is within Firestore's document size limit
 * @param images Array of base64 image data
 * @returns True if within limits, false otherwise
 */
export function checkImagesSize(
  images: { url: string; thumbnail: string }[]
): boolean {
  // Firestore has a 1MB (1,048,576 bytes) document size limit
  const MAX_DOCUMENT_SIZE = 1000000; // Using slightly less than 1MB to be safe

  let totalSize = 0;
  for (const image of images) {
    // Count both the full image and thumbnail
    totalSize += estimateBase64Size(image.url);
    totalSize += estimateBase64Size(image.thumbnail);
  }

  return totalSize <= MAX_DOCUMENT_SIZE;
}
