"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Part,
  InlineDataPart,
} from "@google/generative-ai";

const API_KEY = "AIzaSyAujTXEikSfbt7HpKUy6iypWepPvWJXUgE"; // Your API key
const MODEL_NAME = "gemini-1.5-flash-latest";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Helper function to convert File to GenerativePart
async function fileToGenerativePart(file: File): Promise<InlineDataPart> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const parts = reader.result.split(",");
        if (parts.length === 2) {
          resolve(parts[1]);
        } else if (parts.length === 1 && !reader.result.startsWith("data:")) {
          resolve(parts[0]);
        } else {
          reject(
            new Error(
              "Unexpected Data URL format. Expected 'data:[<mediatype>];base64,<data>' or just '<data>'. Received: " +
                reader.result.substring(0, 100) +
                "..."
            )
          );
        }
      } else {
        reject(new Error("FileReader did not return a string."));
      }
    };
    reader.onerror = (errorEvent) => {
      // Changed to errorEvent to avoid conflict with error in outer scope
      reject(
        new Error(
          `FileReader error: ${
            errorEvent ? errorEvent.toString() : "Unknown error"
          }`
        )
      );
    };
    reader.readAsDataURL(file);
  });

  try {
    const data = await base64EncodedDataPromise;
    const mimeType = file.type || "application/octet-stream";
    if (!file.type) {
      console.warn(
        `File type (mimeType) was missing for the uploaded file. Using fallback: ${mimeType}`
      );
    }
    return {
      inlineData: { data, mimeType },
    };
  } catch (error) {
    console.error("Error converting file to generative part:", error);
    // Ensure a value is returned or an error is re-thrown to satisfy the Promise<InlineDataPart> return type
    throw new Error(
      `Failed to convert file to generative part: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

interface ExtractedDetails {
  TITLE: string;
  DESCRIPTION: string;
  TYPE:
    | "theft"
    | "burglary"
    | "assault"
    | "fraud"
    | "vandalism"
    | "suspicious-activity"
    | "other";
}

export async function extractDetailsFromImage(
  imageFile: File
): Promise<ExtractedDetails | null> {
  if (!imageFile) {
    console.error("No image file provided to extractDetailsFromImage.");
    return null;
  }

  const generationConfig = {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    const imagePart: InlineDataPart = await fileToGenerativePart(imageFile);
    const promptTextPart: Part = {
      text: `Analyze the provided image and extract the following details for a crime report.
The output MUST be a valid JSON object with the following keys: "TITLE", "DESCRIPTION", "TYPE".

- TITLE: A concise title for the crime report based on the image.
- DESCRIPTION: A detailed description of the incident depicted or suggested by the image.
- TYPE: Classify the crime into one of the following categories: "theft", "burglary", "assault", "fraud", "vandalism", "suspicious-activity", "other". Choose the most appropriate type.

Example JSON output:
{
  "TITLE": "Vandalism on Park Bench",
  "DESCRIPTION": "A park bench that has been spray-painted with graffiti. The incident likely occurred at night.",
  "TYPE": "vandalism"
}

Provide only the JSON object in your response.
Image:`,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [imagePart, promptTextPart] }], // Ensure parts is an array of Part
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    console.log("Gemini Raw Response:", responseText);

    let jsonString = "";
    // Try to extract JSON from markdown code blocks or directly
    const markdownJsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (markdownJsonMatch && markdownJsonMatch[1]) {
      jsonString = markdownJsonMatch[1].trim();
    } else {
      // If not in a ```json block, try to find the first '{' and last '}'
      const firstBrace = responseText.indexOf("{");
      const lastBrace = responseText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = responseText.substring(firstBrace, lastBrace + 1).trim();
      } else {
        // If no clear JSON structure is found, use the raw text and hope for the best (or let it fail parsing)
        jsonString = responseText.trim();
      }
    }

    console.log("Attempting to parse JSON string:", jsonString);

    try {
      const parsedDetails: ExtractedDetails = JSON.parse(jsonString);
      const validTypes = [
        "theft",
        "burglary",
        "assault",
        "fraud",
        "vandalism",
        "suspicious-activity",
        "other",
      ];
      if (!validTypes.includes(parsedDetails.TYPE)) {
        console.warn(
          `Invalid crime type received: ${parsedDetails.TYPE}. Defaulting to 'other'.`
        );
        parsedDetails.TYPE = "other";
      }
      return parsedDetails;
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini response:", parseError);
      console.error("Gemini response text that failed to parse:", responseText);

      const titleMatch = responseText.match(/"TITLE"\s*:\s*"(.*?)"/i);
      const descriptionMatch = responseText.match(
        /"DESCRIPTION"\s*:\s*"(.*?)"/i
      );
      const typeMatch = responseText.match(/"TYPE"\s*:\s*"(.*?)"/i);

      if (
        titleMatch &&
        titleMatch[1] &&
        descriptionMatch &&
        descriptionMatch[1] &&
        typeMatch &&
        typeMatch[1]
      ) {
        const validTypes = [
          "theft",
          "burglary",
          "assault",
          "fraud",
          "vandalism",
          "suspicious-activity",
          "other",
        ];
        let extractedType =
          typeMatch[1].toLowerCase() as ExtractedDetails["TYPE"];
        if (!validTypes.includes(extractedType)) {
          extractedType = "other";
        }
        return {
          TITLE: titleMatch[1],
          DESCRIPTION: descriptionMatch[1],
          TYPE: extractedType,
        };
      }
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API or processing image:", error);
    return null;
  }
}
