"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (file) formData.append("file", file);

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate
        </button>
      </form>

      {loading && <p>Generating...</p>}

      {result && (
        <div className="space-y-4">
          {result.imageUrl && (
            <img src={result.imageUrl} alt="Generated schematic" className="rounded shadow" />
          )}
          <div>
            <h2 className="font-bold text-lg">Explanation</h2>
            <p>{result.explanation}</p>
          </div>
          <div>
            <h2 className="font-bold text-lg">Sources</h2>
            <ul className="list-disc list-inside">
              {result.sources?.map((src: string, i: number) => (
                <li key={i}>
                  <a href={src} target="_blank" className="text-blue-600 underline">
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
