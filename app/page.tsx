"use client";
import { useState } from "react";
import ResultView from "@/components/ResultView";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    imageUrl: string;
    explanation: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    setResult(data);
  }

  return (
    <main className="bg-transparent">
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="min-h-screen flex flex-col items-center p-6">
          <form onSubmit={handleSubmit} className="space-x-2 mb-6">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your circuit..."
              className="border px-3 py-2 rounded bg-gray-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Generate
            </button>
          </form>

          {result && (
            <ResultView
              imageUrl={result.imageUrl}
              explanation={result.explanation}
            />
          )}
        </div>
      </section>
    </main>
  );
}
