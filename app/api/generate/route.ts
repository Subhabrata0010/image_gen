// /app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runGeminiPipeline } from "@/lib/gemini";

export const runtime = "nodejs"; // ensure Node runtime (safer for file handling)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt");
    const file = formData.get("file");

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // `file` can be null or a File
    const imageFile = file instanceof File ? file : undefined;

    const result = await runGeminiPipeline(prompt.trim(), imageFile);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    console.error("Gemini pipeline error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
