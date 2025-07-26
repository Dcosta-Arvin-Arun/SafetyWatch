/**
 * Convert a File to a data URL for preview purposes
 * This is a client-side utility function that doesn't require server interaction
 * @param file - The file to convert to a data URL
 * @returns A Promise that resolves with the data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
