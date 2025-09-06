import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import removeMd from "remove-markdown";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

import OpenAI from "openai";
const a4fClient = new OpenAI({
  apiKey: process.env.A4F_API_KEY!,
  baseURL: "https://api.a4f.co/v1",
});

export interface ProResponse {
  refinedPrompt: string;
  explanation: string;
  sources: string[];
}

function hasInlineData(
  part: unknown
): part is { inlineData: { data: string; mimeType: string } } {
  if (!part || typeof part !== "object") return false;
  const maybe = part as { inlineData?: { data?: unknown; mimeType?: unknown } };
  return (
    !!maybe.inlineData &&
    typeof maybe.inlineData.data === "string" &&
    typeof maybe.inlineData.mimeType === "string"
  );
}

export async function runGeminiPipeline(
  prompt: string,
  file?: File
): Promise<{ imageUrl: string; explanation: string; sources: string[] }> {
  let imageUri: string | undefined;
  let uploadedMime: string | undefined;

  if (file) {
    const uploaded = await ai.files.upload({ file });
    imageUri = uploaded.uri;
    uploadedMime = uploaded.mimeType;
  }

  const pro = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      createUserContent([
        `Analyze the uploaded image (if provided) and combine it with this prompt:\n"${prompt}".\n\nRespond ONLY in JSON with exactly these fields:\n{\n  "refinedPrompt": "schematic/diagram prompt suitable for Flash Image Preview",\n  "explanation": "step-by-step explanation and theory",\n  "sources": ["https://...", "https://..."]\n}\n- "sources" must be reliable web/YouTube URLs.\n- No extra commentary outside JSON.`,
        ...(imageUri && uploadedMime
          ? [createPartFromUri(imageUri, uploadedMime)]
          : []),
      ]),
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedPrompt: { type: Type.STRING },
          explanation: { type: Type.STRING },
          sources: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        propertyOrdering: ["refinedPrompt", "explanation", "sources"],
      },
    },
  });

  let parsed: ProResponse;
  try {
    parsed = JSON.parse(pro.text!) as ProResponse;
  } catch {
    throw new Error("Gemini Pro did not return valid JSON.");
  }

  let imageUrl = "";

  try {
    const response = await a4fClient.images.generate({
      model: "provider-4/imagen-4",
      prompt: parsed.refinedPrompt = removeMd(parsed.refinedPrompt || "").trim(),
      n: 1,
      size: "1024x1024",
    });

    imageUrl = response.data?.[0]?.url || "";
    
  } catch (err: any) {
    console.error("image generation failed:", err.message || err);
  }

  return {
    imageUrl,
    explanation: removeMd(parsed.explanation || "").trim(),
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
  };
}
