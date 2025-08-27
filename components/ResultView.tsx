"use client";

import Image from "next/image";

export default function ResultView({
  imageUrl,
  explanation,
  sources,
}: {
  imageUrl: string;
  explanation: string;
  sources: string[];
}) {
  return (
    <div className="mt-6 p-4 rounded shadow bg-white space-y-4">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Generated schematic"
          className="rounded border mb-4 w-full"
        />
      )}
      <div>
        <h3 className="text-lg font-bold mb-2">Explanation</h3>
        <p className="text-gray-700 whitespace-pre-line">{explanation}</p>
      </div>

      {sources && sources.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mt-4">Sources</h3>
          <ul className="list-disc list-inside text-blue-600">
            {sources.map((src, i) => (
              <li key={i}>
                <a href={src} target="_blank" rel="noopener noreferrer">
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
