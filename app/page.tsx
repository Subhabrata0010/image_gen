"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, FileImage, Sparkles, ImageIcon, BookOpen, ExternalLink, RotateCcw } from "lucide-react";

// Simple loading spinner
const LoadingSpinner = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Schematic</h3>
          <p className="text-gray-600">Please wait while AI creates your diagram...</p>
        </div>
      </div>
    </div>
  );
};

// File dropzone component
interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File) => void;
  onRemoveFile: () => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ file, onFileChange, onRemoveFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  if (file) {
    return (
      <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileImage className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{file.name}</p>
              <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        dragActive 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
      <p className="text-lg font-medium text-gray-700 mb-2">
        Drop your image here, or 
        <label className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
          browse
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </p>
      <p className="text-sm text-gray-500">Supports PNG, JPG, GIF up to 10MB</p>
    </div>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleReset = () => {
    setPrompt("");
    setFile(null);
    setResult(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file) formData.append("file", file);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Failed to generate content. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LoadingSpinner loading={loading} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Schematic Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your ideas into detailed schematics and diagrams
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Describe what you want to create
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                placeholder="e.g., A circuit diagram for an LED flashlight with battery, switch, resistor..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Upload reference image (optional)
              </label>
              <FileDropzone 
                file={file} 
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                  isFormValid && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{loading ? 'Generating...' : 'Generate Schematic'}</span>
                </div>
              </button>
              
              {(prompt || file || result) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                  title="Reset form"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <X className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            ) : (
              <>
                {/* Generated Image */}
                {result.imageUrl && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Generated Schematic</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <img 
                        src={result.imageUrl} 
                        alt="Generated schematic" 
                        className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200" 
                      />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {result.explanation && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Detailed Explanation</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Reference Sources</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-3">
                        {result.sources.map((src: string, i: number) => (
                          <a 
                            key={i}
                            href={src} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                            <span className="text-blue-600 hover:text-blue-700 text-sm break-all">
                              {src}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Features Section */}
        {!result && !loading && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600 text-sm">Advanced AI creates detailed schematics from your descriptions</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Image Upload Support</h3>
              <p className="text-gray-600 text-sm">Upload reference images to enhance your schematic generation</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Explanations</h3>
              <p className="text-gray-600 text-sm">Get comprehensive explanations with reliable sources</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}