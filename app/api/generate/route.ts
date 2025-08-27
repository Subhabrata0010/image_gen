import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, } from "@google/generative-ai";
import { parseGeminiProOutput } from "@/lib/parser";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const file = formData.get("file") as File | null;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Convert image if provided
    let inlinePart: any = {};
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      inlinePart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type || "image/png",
        },
      };
    }

    const proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const proResult = await proModel.generateContent([
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
                   }`,
          },
          inlinePart,
        ].filter(Boolean),
      },
    ]);

    if (!proResult.response) {
      return NextResponse.json(
        { error: "No response from Pro", raw: proResult },
        { status: 500 }
      );
    }

    const parsed = parseGeminiProOutput(proResult.response.text());

    // STEP 2 — Call Gemini 2.5 Flash for image
    const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const flashResult = await flashModel.generateContent([
      {
        role: "user",
        parts: [{ text: parsed.refinedPrompt }],
      },
    ]);

    const parts = flashResult.response?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);

    let imageUrl = "";
    if (imagePart?.inlineData) {
      imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image generated", raw: flashResult },
        { status: 500 }
      );
    }
    return NextResponse.json({
      imageUrl,
      explanation: parsed.explanation,
      sources: parsed.sources,
    });
  } catch (err: unknown) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
