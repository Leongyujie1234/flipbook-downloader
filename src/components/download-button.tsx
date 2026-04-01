"use client";

import { useState, useCallback } from "react";
import { generatePdfFromImages, downloadPdf, safeFilename } from "@/lib/pdf-generator";

interface DownloadButtonProps {
  title: string;
  pageUrls: string[];
  fromPage: number;
  toPage: number;
  disabled?: boolean;
}

interface ProgressState {
  phase: "idle" | "downloading" | "generating" | "done" | "error";
  current: number;
  total: number;
  error?: string;
}

export default function DownloadButton({
  title,
  pageUrls,
  fromPage,
  toPage,
  disabled,
}: DownloadButtonProps) {
  const [progress, setProgress] = useState<ProgressState>({ phase: "idle", current: 0, total: 0 });

  const handleDownload = useCallback(async () => {
    const startIdx = fromPage - 1;
    const endIdx = toPage;
    const urls = pageUrls.slice(startIdx, endIdx);
    const total = urls.length;

    setProgress({ phase: "downloading", current: 0, total });

    const CONCURRENCY = 5;
    const MAX_RETRIES = 3;
    const buffers: (ArrayBuffer | null)[] = new Array(total).fill(null);
    let completed = 0;

    async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<ArrayBuffer | null> {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const resp = await fetch(proxyUrl);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          return await resp.arrayBuffer();
        } catch (err) {
          if (attempt === retries - 1) {
            console.error(`Failed to fetch ${url} after ${retries} attempts:`, err);
            return null;
          }
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
      return null;
    }

    try {
      // Process in batches
      for (let i = 0; i < urls.length; i += CONCURRENCY) {
        const batch = urls.slice(i, i + CONCURRENCY);
        const results = await Promise.all(
          batch.map((url, j) =>
            fetchWithRetry(url).then((buf) => {
              buffers[i + j] = buf;
              completed++;
              setProgress((prev) => ({ ...prev, current: completed }));
            })
          )
        );
      }

      // Filter out failed pages
      const validBuffers = buffers.filter((b): b is ArrayBuffer => b !== null);
      if (validBuffers.length === 0) {
        setProgress({ phase: "error", current: 0, total, error: "All pages failed to download" });
        return;
      }

      setProgress({ phase: "generating", current: validBuffers.length, total });

      const pdfBytes = await generatePdfFromImages(validBuffers, {
        title,
        onProgress: (current, totalGen) => {
          setProgress((prev) => ({ ...prev, current: total - validBuffers.length + current }));
        },
      });

      const filename = safeFilename(title);
      downloadPdf(pdfBytes, filename);

      setProgress({ phase: "done", current: total, total });

      // Reset after 3s
      setTimeout(() => {
        setProgress({ phase: "idle", current: 0, total: 0 });
      }, 3000);
    } catch (err) {
      setProgress({
        phase: "error",
        current: 0,
        total,
        error: err instanceof Error ? err.message : "Download failed",
      });
    }
  }, [title, pageUrls, fromPage, toPage]);

  const isDownloading = progress.phase === "downloading" || progress.phase === "generating";
  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      <button
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        className="w-full py-3 px-6 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
      >
        {progress.phase === "downloading" && (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Downloading pages... {progress.current}/{progress.total}
          </>
        )}
        {progress.phase === "generating" && (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating PDF...
          </>
        )}
        {progress.phase === "done" && "Download Complete!"}
        {progress.phase === "error" && "Download Failed - Retry"}
        {progress.phase === "idle" && `Download PDF (${toPage - fromPage + 1} pages)`}
      </button>

      {isDownloading && (
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {progress.phase === "error" && progress.error && (
        <p className="text-sm text-red-500 dark:text-red-400">{progress.error}</p>
      )}
    </div>
  );
}
