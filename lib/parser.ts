export interface ParsedOutput {
  refinedPrompt: string;
  explanation: string;
  sources: string[];
}

export function parseGeminiProOutput(raw: string): ParsedOutput {
  try {
    const parsed = JSON.parse(raw);
    return {
      refinedPrompt: typeof parsed.refinedPrompt === "string" ? parsed.refinedPrompt : "Draw a simple schematic diagram.",
      explanation: typeof parsed.explanation === "string" ? parsed.explanation : "No explanation provided.",
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    };
  } catch {
    return {
      refinedPrompt: raw,
      explanation: raw,
      sources: [],
    };
  }
}
