"use client";

import { useState } from "react";

interface UrlInputProps {
  onBookInfo: (info: {
    title: string;
    totalPages: number;
    pageUrls: string[];
    platform: string;
    id1: string;
    id2: string;
  }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function UrlInput({ onBookInfo, onError, disabled }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    if (!url.trim()) {
      onError("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/book-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        onError(data.error || "Failed to fetch book info");
        return;
      }

      onBookInfo(data);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Flipbook URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && handleFetch()}
          placeholder="https://anyflip.com/abcde/fghij or https://fliphtml5.com/abcde/fghij"
          disabled={disabled || loading}
          className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
        />
        <button
          onClick={handleFetch}
          disabled={disabled || loading}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching...
            </span>
          ) : (
            "Fetch"
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Supports AnyFlip and FlipHTML5 URLs
      </p>
    </div>
  );
}
