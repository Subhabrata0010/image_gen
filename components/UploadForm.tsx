"use client";
import { useState } from "react";
import ResultView from "./ResultView";

export default function UploadForm() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imageUrl: string; explanation: string; sources: string[] } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (file) formData.append("file", file);

    const res = await fetch("/api/generate", { method: "POST", body: formData });
    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full border rounded p-2"
          placeholder="Describe your circuit (e.g., Bridge rectifier)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Generate
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <ResultView
          imageUrl={result.imageUrl}
          explanation={result.explanation}
          sources={result.sources}
        />
      )}
    </div>
  );
}
