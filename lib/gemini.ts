import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { parseGeminiProOutput, ParsedOutput } from "./parser";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Type guard: checks whether a Part has inlineData
 */
function isInlineDataPart(part: Part): part is Part & { inlineData: { data: string; mimeType: string } } {
  return typeof (part as { inlineData?: unknown }).inlineData === "object" && part.inlineData !== undefined;
}


export async function runGeminiPipeline(prompt: string, file?: File) {
  let inlinePart: Part | undefined;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    inlinePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type || "image/png",
      },
    };
  }

  // Step 1 — Reasoning with Pro
  const proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const proResult = await proModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the uploaded image and combine with prompt: "${prompt}".
                   Respond ONLY in this JSON format:
                   {
                     "refinedPrompt": "schematic prompt for image generation",
                     "explanation": "plain-language explanation",
                     "sources": ["optional source1", "source2"]
                   }`
          },
          ...(inlinePart ? [inlinePart] : []),
        ],
      },
    ],
  });

  const parsed: ParsedOutput = parseGeminiProOutput(proResult.response.text());

  // Step 2 — Image generation with Flash
  const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const flashResult = await flashModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: parsed.refinedPrompt }],
      },
    ],
  });

  const parts: Part[] = flashResult.response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(isInlineDataPart);

  let imageUrl = "";
  if (imagePart) {
    imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  return {
    imageUrl,
    explanation: parsed.explanation,
    sources: parsed.sources,
  };
}
