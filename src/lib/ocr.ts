/**
 * OCR.space API service
 * Documentation: https://ocr.space/ocrapi
 */

/**
 * Extract text from an image using OCR.space API
 * @param imageFile - The image file to extract text from
 * @returns The extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OCR.space API key is not set. Please add NEXT_PUBLIC_OCR_SPACE_API_KEY to your .env.local file."
      );
    }

    // Create FormData to send file
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("apikey", apiKey);
    formData.append("language", "eng"); // English language
    formData.append("isOverlayRequired", "false");
    formData.append("filetype", imageFile.type.split("/")[1]); // Extract file extension from MIME type
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // Use OCR Engine 2 for better accuracy

    // Call OCR.space API
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.ErrorMessage || "Failed to process image");
    }

    if (result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage || "OCR processing failed");
    }

    // Extract the parsed text from the response
    const parsedText = result.ParsedResults?.[0]?.ParsedText || "";
    return parsedText;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw error;
  }
}
